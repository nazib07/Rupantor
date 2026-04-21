import { 
  collection, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  orderBy, 
  limit, 
  serverTimestamp,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase';
import { db_local } from '../db';
import { Unit, HistoryItem, CategoryType, Category, VisibleCategoriesSettings } from '../types';

const UNITS_COLLECTION = 'units';
const CATEGORIES_COLLECTION = 'categories';
// const HISTORY_COLLECTION = 'history'; // We're using local SQLite-like DB now

export const checkInternetConnection = (): boolean => {
  return navigator.onLine;
};

export const fetchCurrencyRates = async (): Promise<{ units: Unit[], lastUpdated: number }> => {
  console.log('Fetching currency rates from API...');
  if (!checkInternetConnection()) {
    throw new Error('No internet connection');
  }

  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (!response.ok) throw new Error(`API returned ${response.status}: ${response.statusText}`);
    const data = await response.json();
    
    if (!data || !data.rates) {
      throw new Error('Invalid API response format');
    }

    console.log(`Successfully fetched ${Object.keys(data.rates).length} currencies`);
    
    const currencyNamesBn: Record<string, string> = {
      USD: 'মার্কিন ডলার',
      EUR: 'ইউরো',
      GBP: 'ব্রিটিশ পাউন্ড',
      BDT: 'বাংলাদেশি টাকা',
      INR: 'ভারতীয় রুপি',
      JPY: 'জাপানি ইয়েন',
      CAD: 'কানাডিয়ান ডলার',
      AUD: 'অস্ট্রেলিয়ান ডলার',
      CNY: 'চীনা ইউয়ান',
      SAR: 'সৌদি রিয়াল',
      AED: 'সংযুক্ত আরব আমিরাত দিরহাম',
    };
    
    const units: Unit[] = Object.entries(data.rates).map(([code, rate]) => ({
      id: code,
      nameEn: code,
      nameBn: currencyNamesBn[code] || code,
      symbol: code,
      multiplier: 1 / (rate as number), // Convert to base unit (USD)
      categoryId: 'Currency',
      isBase: code === 'USD'
    }));
    
    return { units, lastUpdated: Date.now() };
  } catch (error) {
    console.error('Error fetching currency rates:', error);
    throw error;
  }
};

export const fetchCategories = async (): Promise<Category[]> => {
  const q = query(collection(db, CATEGORIES_COLLECTION), orderBy('order', 'asc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
};

export const fetchUnitsByCategory = async (categoryId: string, categoryNameEn?: string): Promise<{ units: Unit[], lastUpdated?: number }> => {
  const name = categoryNameEn?.toLowerCase() || '';
  const id = categoryId?.toLowerCase() || '';
  const isCurrency = id === 'currency' || name === 'currency' || name.includes('currency') || id.includes('currency');
                    
  if (isCurrency) {
    console.log('Currency category detected, fetching from API...');
    try {
      const result = await fetchCurrencyRates();
      if (result.units && result.units.length > 0) return result;
    } catch (error) {
      console.error('Failed to fetch currency rates, falling back to Firestore units', error);
    }
  }
  
  const q = query(collection(db, UNITS_COLLECTION), where('categoryId', '==', categoryId));
  const querySnapshot = await getDocs(q);
  const units = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Unit));
  return { units };
};

// Admin Functions
export const addCategory = async (category: Omit<Category, 'id'>) => {
  return await addDoc(collection(db, CATEGORIES_COLLECTION), category);
};

export const updateCategory = async (id: string, category: Partial<Category>) => {
  const docRef = doc(db, CATEGORIES_COLLECTION, id);
  await updateDoc(docRef, category);
};

export const deleteCategory = async (id: string) => {
  await deleteDoc(doc(db, CATEGORIES_COLLECTION, id));
};

export const addUnit = async (unit: Omit<Unit, 'id'>) => {
  return await addDoc(collection(db, UNITS_COLLECTION), unit);
};

export const updateUnit = async (id: string, unit: Partial<Unit>) => {
  const docRef = doc(db, UNITS_COLLECTION, id);
  await updateDoc(docRef, unit);
};

export const deleteUnit = async (id: string) => {
  await deleteDoc(doc(db, UNITS_COLLECTION, id));
};

export const clearAllCategoriesAndUnits = async () => {
  const categoriesSnapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
  const unitsSnapshot = await getDocs(collection(db, UNITS_COLLECTION));
  
  const deletePromises = [
    ...categoriesSnapshot.docs.map(d => deleteDoc(doc(db, CATEGORIES_COLLECTION, d.id))),
    ...unitsSnapshot.docs.map(d => deleteDoc(doc(db, UNITS_COLLECTION, d.id)))
  ];
  
  await Promise.all(deletePromises);
};

export const saveHistory = async (historyItem: Omit<HistoryItem, 'id' | 'timestamp'> & { deviceId: string }) => {
  try {
    await db_local.history.add({
      ...historyItem,
      timestamp: new Date()
    } as HistoryItem);
    console.log('History saved to local database');
  } catch (error) {
    console.error('Failed to save history locally', error);
  }
};

export const deleteHistoryItem = async (id: string) => {
  try {
    const numericId = parseInt(id);
    if (!isNaN(numericId)) {
      await db_local.history.delete(numericId);
    } else {
      await db_local.history.delete(id as any);
    }
  } catch (error) {
    console.error('Failed to delete history item', error);
  }
};

export const clearHistory = async () => {
  try {
    await db_local.history.clear();
  } catch (error) {
    console.error('Failed to clear history', error);
  }
};

export const convert = (value: number, from: Unit, to: Unit): number => {
  if (from.categoryId === 'Temperature') {
    // Special case for temperature
    let baseValue = value;
    if (from.nameEn === 'Fahrenheit' || from.id === 'f') baseValue = (value - 32) * 5 / 9;
    if (from.nameEn === 'Kelvin' || from.id === 'k') baseValue = value - 273.15;
    
    if (to.nameEn === 'Fahrenheit' || to.id === 'f') return (baseValue * 9 / 5) + 32;
    if (to.nameEn === 'Kelvin' || to.id === 'k') return baseValue + 273.15;
    return baseValue;
  }
  
  // Standard conversion: Input -> Base -> Output
  const baseValue = value * from.multiplier;
  return baseValue / to.multiplier;
};

// UI Settings (stored locally via Dexie)
export const getVisibleCategories = async (deviceId: string): Promise<string[] | null> => {
  try {
    const row = await db_local.settings.get(deviceId);
    return row?.visibleCategories ?? null;
  } catch (error) {
    console.error('Failed to get visible categories', error);
    return null;
  }
};

export const saveVisibleCategories = async (deviceId: string, visibleCategories: string[]): Promise<void> => {
  try {
    const payload: VisibleCategoriesSettings = {
      deviceId,
      visibleCategories,
      updatedAt: new Date(),
    };
    await db_local.settings.put(payload);
  } catch (error) {
    console.error('Failed to save visible categories', error);
  }
};
