import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react';
import SplashScreen from './components/SplashScreen';
import HomeScreen from './components/HomeScreen';
import ConversionScreen from './components/ConversionScreen';
import HistoryScreen from './components/HistoryScreen';
import SettingsScreen from './components/SettingsScreen';
import AdminScreen from './components/AdminScreen';
import ImageConverterScreen from './components/ImageConverterScreen';
import { Category, Language, Theme, Unit } from './types';
import { fetchCategories, getVisibleCategories, saveVisibleCategories } from './services/unitService';
import { App as CapApp } from '@capacitor/app';

type Screen = 'splash' | 'home' | 'conversion' | 'history' | 'settings' | 'admin' | 'image-converter';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [initialUnits, setInitialUnits] = useState<{ from?: Unit; to?: Unit }>({});
  const [language, setLanguage] = useState<Language>('bn');
  const [theme, setTheme] = useState<Theme>('light');
  const [deviceId, setDeviceId] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [visibleCategories, setVisibleCategories] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const CURRENCY_CATEGORY: Category = {
    id: 'currency',
    nameEn: 'Currency',
    nameBn: 'মুদ্রা',
    iconName: 'Coins',
    order: -1
  };

  const IMAGE_CONVERTER_CATEGORY: Category = {
    id: 'image-converter',
    nameEn: 'Image Converter',
    nameBn: 'ছবি রূপান্তর',
    iconName: 'Image',
    order: -0.5
  };

  useEffect(() => {
    if (window.location.pathname === '/admin') {
      setCurrentScreen('admin');
    }
  }, []);

  const loadCategories = async () => {
    try {
      const fetchedCats = await fetchCategories();
      // Filter out any Firestore category named "Currency" to avoid duplicates
      const filteredCats = fetchedCats.filter(c => c.nameEn.toLowerCase() !== 'currency' && c.id !== 'currency' && c.id !== 'image-converter');
      setCategories(filteredCats);
      
      // Initialize visible categories
      const allPossibleIds = [CURRENCY_CATEGORY.id, IMAGE_CONVERTER_CATEGORY.id, ...filteredCats.map(c => c.id)];

      // Load saved selection from local Dexie DB
      const savedIds = deviceId ? await getVisibleCategories(deviceId) : null;
      if (savedIds !== null) {
        // Keep only saved IDs that still exist in latest fetched categories.
        // Do not auto-add categories that user previously disabled.
        const validSavedIds = savedIds.filter((id: string) => allPossibleIds.includes(id));
        setVisibleCategories(validSavedIds);
      } else {
        // First-time users: show all categories by default, then persist.
        setVisibleCategories(allPossibleIds);
        if (deviceId) {
          await saveVisibleCategories(deviceId, allPossibleIds);
        }
      }
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  useEffect(() => {
    let id = localStorage.getItem('rupantor_device_id');
    if (!id) {
      id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('rupantor_device_id', id);
    }
    setDeviceId(id);

    const savedLanguage = localStorage.getItem('rupantor_language') as Language;
    const savedTheme = localStorage.getItem('rupantor_theme') as Theme;

    if (savedLanguage) setLanguage(savedLanguage);
    if (savedTheme) setTheme(savedTheme || 'light');
  }, []);

  useEffect(() => {
    // Only persist when we have a deviceId and a non-empty selection.
    if (!deviceId || visibleCategories.length === 0) return;
    saveVisibleCategories(deviceId, visibleCategories).catch((e) => {
      console.error('Failed to save visible categories', e);
    });
  }, [visibleCategories, deviceId]);

  useEffect(() => {
    // Load categories only after deviceId is available (needed for settings lookup).
    if (!deviceId) return;
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId]);

  useEffect(() => {
    console.log('Theme changed to:', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('rupantor_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('rupantor_language', language);
    document.documentElement.lang = language;
  }, [language]);

  // Handle Internet Connectivity
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle Android Hardware Back Button via Capacitor
  useEffect(() => {
    const handleCapacitorBackButton = () => {
      console.log('Android back button pressed, current screen:', currentScreen);
      if (currentScreen !== 'home' && currentScreen !== 'splash') {
        handleBack();
      } else {
        // If on home, exit the app
        CapApp.exitApp();
      }
    };

    const listener = CapApp.addListener('backButton', handleCapacitorBackButton);

    return () => {
      listener.then(l => l.remove());
    };
  }, [currentScreen]);

  // Update Status Bar Color for Android
  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const color = theme === 'dark' ? '#0B1120' : '#6C63FF';
    
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', color);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = color;
      document.head.appendChild(meta);
    }
  }, [theme]);

  const handleSelectCategory = (category: Category, initialFrom?: Unit, initialTo?: Unit) => {
    setSelectedCategory(category);
    setInitialUnits({ from: initialFrom, to: initialTo });
    setCurrentScreen('conversion');
  };

  const handleBack = () => {
    setCurrentScreen('home');
    setSelectedCategory(null);
    setInitialUnits({});
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-bg-dark flex items-center justify-center p-0 md:p-8 transition-colors duration-300">
      <div className="w-full h-screen md:h-[90vh] md:max-w-5xl bg-white dark:bg-card-dark md:rounded-[3rem] shadow-2xl relative overflow-hidden transition-colors duration-300">
        <AnimatePresence mode="wait">
          {/* No Internet Overlay */}
          {!isOnline && (
            <motion.div
              key="offline-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-white dark:bg-bg-dark flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="mb-8 p-6 rounded-full bg-red-50 dark:bg-red-900/10 text-red-500">
                <WifiOff size={64} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'bn' ? 'ইন্টারনেট সংযোগ নেই' : 'No Internet Connection'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs">
                {language === 'bn' 
                  ? 'কারেন্সি রেট এবং ডাটা লোড করার জন্য ইন্টারনেট প্রয়োজন। দয়া করে আপনার কানেকশন চেক করুন।' 
                  : 'Internet is required to fetch currency rates and load data. Please check your connection.'}
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-8 py-4 bg-[#6C63FF] text-white font-bold rounded-2xl shadow-lg shadow-[#6C63FF]/20 active:scale-95 transition-transform"
              >
                <RefreshCw size={20} />
                <span>{language === 'bn' ? 'আবার চেষ্টা করুন' : 'Try Again'}</span>
              </button>
            </motion.div>
          )}
        {currentScreen === 'splash' && (
          <SplashScreen key="splash" onComplete={() => setCurrentScreen('home')} />
        )}
        
        {currentScreen === 'home' && (
          <HomeScreen 
            key="home" 
            language={language}
            categories={categories}
            currencyCategory={CURRENCY_CATEGORY}
            imageConverterCategory={IMAGE_CONVERTER_CATEGORY}
            visibleCategories={visibleCategories}
            onSelectCategory={handleSelectCategory}
            onShowHistory={() => setCurrentScreen('history')}
            onShowSettings={() => setCurrentScreen('settings')}
            onShowImageConverter={() => setCurrentScreen('image-converter')}
          />
        )}

        {currentScreen === 'image-converter' && (
          <ImageConverterScreen 
            key="image-converter"
            language={language}
            onBack={handleBack}
          />
        )}

        {currentScreen === 'conversion' && selectedCategory && (
          <ConversionScreen 
            key="conversion" 
            category={selectedCategory} 
            language={language}
            deviceId={deviceId}
            initialFromUnit={initialUnits.from}
            initialToUnit={initialUnits.to}
            onBack={handleBack} 
          />
        )}

        {currentScreen === 'history' && (
          <HistoryScreen 
            key="history" 
            language={language}
            deviceId={deviceId}
            onBack={handleBack} 
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen 
            key="settings"
            language={language}
            theme={theme}
            categories={categories}
            currencyCategory={CURRENCY_CATEGORY}
            imageConverterCategory={IMAGE_CONVERTER_CATEGORY}
            visibleCategories={visibleCategories}
            onUpdateLanguage={setLanguage}
            onUpdateTheme={setTheme}
            onUpdateVisibleCategories={setVisibleCategories}
            onBack={handleBack}
          />
        )}

        {currentScreen === 'admin' && (
          <AdminScreen key="admin" />
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}
