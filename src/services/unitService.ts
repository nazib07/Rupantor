import { 
  collection, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  orderBy, 
  limit, 
  serverTimestamp,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Unit, HistoryItem, CategoryType } from '../types';

const UNITS_COLLECTION = 'units';
const HISTORY_COLLECTION = 'history';

export const checkInternetConnection = (): boolean => {
  return navigator.onLine;
};

export const fetchCurrencyRates = async (): Promise<Unit[]> => {
  if (!checkInternetConnection()) {
    throw new Error('No internet connection');
  }

  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (!response.ok) throw new Error('Failed to fetch currency rates');
    const data = await response.json();
    
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
    
    const currencies: Unit[] = Object.entries(data.rates).map(([code, rate]) => ({
      id: code,
      name: code,
      nameBn: currencyNamesBn[code] || code,
      symbol: code,
      multiplier: 1 / (rate as number), // Convert to base unit (USD)
      category: 'Currency'
    }));
    
    return currencies;
  } catch (error) {
    console.error('Error fetching currency rates:', error);
    throw error;
  }
};

export const fetchUnitsByCategory = async (category: CategoryType): Promise<Unit[]> => {
  if (category === 'Currency') {
    return await fetchCurrencyRates();
  }
  const q = query(collection(db, UNITS_COLLECTION), where('category', '==', category));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Unit));
};

export const saveHistory = async (historyItem: Omit<HistoryItem, 'id' | 'timestamp'> & { deviceId: string }) => {
  await addDoc(collection(db, HISTORY_COLLECTION), {
    ...historyItem,
    timestamp: serverTimestamp(),
  });
};

export const subscribeToHistory = (deviceId: string, callback: (items: HistoryItem[]) => void) => {
  if (!deviceId) return () => {};

  const q = query(
    collection(db, HISTORY_COLLECTION),
    where('deviceId', '==', deviceId),
    orderBy('timestamp', 'desc'),
    limit(20)
  );

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HistoryItem));
    callback(items);
  });
};

// Default units to seed if Firestore is empty
export const DEFAULT_UNITS: Record<string, Unit[]> = {
  Length: [
    { id: 'm', name: 'Meter', nameBn: 'মিটার', symbol: 'm', multiplier: 1, category: 'Length', isBase: true },
    { id: 'km', name: 'Kilometer', nameBn: 'কিলোমিটার', symbol: 'km', multiplier: 1000, category: 'Length' },
    { id: 'cm', name: 'Centimeter', nameBn: 'সেন্টিমিটার', symbol: 'cm', multiplier: 0.01, category: 'Length' },
    { id: 'mm', name: 'Millimeter', nameBn: 'মিলিমিটার', symbol: 'mm', multiplier: 0.001, category: 'Length' },
    { id: 'in', name: 'Inch', nameBn: 'ইঞ্চি', symbol: 'in', multiplier: 0.0254, category: 'Length' },
    { id: 'ft', name: 'Foot', nameBn: 'ফুট', symbol: 'ft', multiplier: 0.3048, category: 'Length' },
  ],
  Weight: [
    { id: 'kg', name: 'Kilogram', nameBn: 'কিলোগ্রাম', symbol: 'kg', multiplier: 1, category: 'Weight', isBase: true },
    { id: 'g', name: 'Gram', nameBn: 'গ্রাম', symbol: 'g', multiplier: 0.001, category: 'Weight' },
    { id: 'lb', name: 'Pound', nameBn: 'পাউন্ড', symbol: 'lb', multiplier: 0.453592, category: 'Weight' },
    { id: 'oz', name: 'Ounce', nameBn: 'আউন্স', symbol: 'oz', multiplier: 0.0283495, category: 'Weight' },
  ],
  Temperature: [
    { id: 'c', name: 'Celsius', nameBn: 'সেলসিয়াস', symbol: '°C', multiplier: 1, category: 'Temperature', isBase: true },
    { id: 'f', name: 'Fahrenheit', nameBn: 'ফারেনহাইট', symbol: '°F', multiplier: 1, category: 'Temperature' },
    { id: 'k', name: 'Kelvin', nameBn: 'কেলভিন', symbol: 'K', multiplier: 1, category: 'Temperature' },
  ],
  Area: [
    { id: 'm2', name: 'Square Meter', nameBn: 'বর্গ মিটার', symbol: 'm²', multiplier: 1, category: 'Area', isBase: true },
    { id: 'km2', name: 'Square Kilometer', nameBn: 'বর্গ কিলোমিটার', symbol: 'km²', multiplier: 1000000, category: 'Area' },
    { id: 'ft2', name: 'Square Foot', nameBn: 'বর্গ ফুট', symbol: 'ft²', multiplier: 0.092903, category: 'Area' },
  ],
  Volume: [
    { id: 'l', name: 'Liter', nameBn: 'লিটার', symbol: 'L', multiplier: 1, category: 'Volume', isBase: true },
    { id: 'ml', name: 'Milliliter', nameBn: 'মিলিমিটার', symbol: 'mL', multiplier: 0.001, category: 'Volume' },
    { id: 'm3', name: 'Cubic Meter', nameBn: 'ঘন মিটার', symbol: 'm³', multiplier: 1000, category: 'Volume' },
  ],
  Time: [
    { id: 's', name: 'Second', nameBn: 'সেকেন্ড', symbol: 's', multiplier: 1, category: 'Time', isBase: true },
    { id: 'min', name: 'Minute', nameBn: 'মিনিট', symbol: 'min', multiplier: 60, category: 'Time' },
    { id: 'h', name: 'Hour', nameBn: 'ঘণ্টা', symbol: 'h', multiplier: 3600, category: 'Time' },
    { id: 'd', name: 'Day', nameBn: 'দিন', symbol: 'd', multiplier: 86400, category: 'Time' },
  ],
  Speed: [
    { id: 'ms', name: 'Meter/Second', nameBn: 'মিটার/সেকেন্ড', symbol: 'm/s', multiplier: 1, category: 'Speed', isBase: true },
    { id: 'kmh', name: 'Kilometer/Hour', nameBn: 'কিলোমিটার/ঘণ্টা', symbol: 'km/h', multiplier: 0.277778, category: 'Speed' },
    { id: 'mph', name: 'Mile/Hour', nameBn: 'মাইল/ঘণ্টা', symbol: 'mph', multiplier: 0.44704, category: 'Speed' },
  ],
  'Digital Storage': [
    { id: 'b', name: 'Byte', nameBn: 'বাইট', symbol: 'B', multiplier: 1, category: 'Digital Storage', isBase: true },
    { id: 'kb', name: 'Kilobyte', nameBn: 'কিলোবাইট', symbol: 'KB', multiplier: 1024, category: 'Digital Storage' },
    { id: 'mb', name: 'Megabyte', nameBn: 'মেগাবাইট', symbol: 'MB', multiplier: 1024 * 1024, category: 'Digital Storage' },
    { id: 'gb', name: 'Gigabyte', nameBn: 'গিগাবাইট', symbol: 'GB', multiplier: 1024 * 1024 * 1024, category: 'Digital Storage' },
  ],
  Currency: [
    { id: 'USD', name: 'US Dollar', nameBn: 'মার্কিন ডলার', symbol: '$', multiplier: 1, category: 'Currency', isBase: true },
    { id: 'EUR', name: 'Euro', nameBn: 'ইউরো', symbol: '€', multiplier: 1.08, category: 'Currency' },
    { id: 'GBP', name: 'British Pound', nameBn: 'ব্রিটিশ পাউন্ড', symbol: '£', multiplier: 1.27, category: 'Currency' },
    { id: 'BDT', name: 'Bangladeshi Taka', nameBn: 'বাংলাদেশি টাকা', symbol: '৳', multiplier: 0.0091, category: 'Currency' },
  ],
};

export const convert = (value: number, from: Unit, to: Unit): number => {
  if (from.category === 'Temperature') {
    // Special case for temperature
    let baseValue = value;
    if (from.id === 'f') baseValue = (value - 32) * 5 / 9;
    if (from.id === 'k') baseValue = value - 273.15;
    
    if (to.id === 'f') return (baseValue * 9 / 5) + 32;
    if (to.id === 'k') return baseValue + 273.15;
    return baseValue;
  }
  
  // Standard conversion: Input -> Base -> Output
  const baseValue = value * from.multiplier;
  return baseValue / to.multiplier;
};
