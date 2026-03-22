import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react';
import SplashScreen from './components/SplashScreen';
import HomeScreen from './components/HomeScreen';
import ConversionScreen from './components/ConversionScreen';
import HistoryScreen from './components/HistoryScreen';
import SettingsScreen from './components/SettingsScreen';
import AdminScreen from './components/AdminScreen';
import { Category, Language, Theme } from './types';
import { fetchCategories } from './services/unitService';

type Screen = 'splash' | 'home' | 'conversion' | 'history' | 'settings' | 'admin';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
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

  useEffect(() => {
    if (window.location.pathname === '/admin') {
      setCurrentScreen('admin');
    }
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const fetchedCats = await fetchCategories();
      // Filter out any Firestore category named "Currency" to avoid duplicates
      const filteredCats = fetchedCats.filter(c => c.nameEn.toLowerCase() !== 'currency' && c.id !== 'currency');
      setCategories(filteredCats);
      
      // Initialize visible categories
      const savedVisible = localStorage.getItem('rupantor_visible_categories');
      const allPossibleIds = [CURRENCY_CATEGORY.id, ...filteredCats.map(c => c.id)];

      if (savedVisible) {
        try {
          const savedIds = JSON.parse(savedVisible);
          // Keep saved preferences but add any newly created categories from admin
          const newIds = allPossibleIds.filter(id => !savedIds.includes(id));
          
          // Filter out IDs that no longer exist
          const validSavedIds = savedIds.filter((id: string) => allPossibleIds.includes(id));
          
          setVisibleCategories([...validSavedIds, ...newIds]);
        } catch (e) {
          setVisibleCategories(allPossibleIds);
        }
      } else {
        setVisibleCategories(allPossibleIds);
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
    localStorage.setItem('rupantor_visible_categories', JSON.stringify(visibleCategories));
  }, [visibleCategories]);

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

  // Handle Android Back Button
  useEffect(() => {
    const handleBackButton = (e: PopStateEvent) => {
      if (currentScreen !== 'home' && currentScreen !== 'splash') {
        e.preventDefault();
        setCurrentScreen('home');
        // Push state again to keep the user in the app
        window.history.pushState(null, '', window.location.pathname);
      }
    };

    window.addEventListener('popstate', handleBackButton);
    
    // Initial state
    window.history.pushState(null, '', window.location.pathname);

    return () => window.removeEventListener('popstate', handleBackButton);
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

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    setCurrentScreen('conversion');
  };

  const handleBack = () => {
    setCurrentScreen('home');
    setSelectedCategory(null);
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
            visibleCategories={visibleCategories}
            onSelectCategory={handleSelectCategory}
            onShowHistory={() => setCurrentScreen('history')}
            onShowSettings={() => setCurrentScreen('settings')}
          />
        )}

        {currentScreen === 'conversion' && selectedCategory && (
          <ConversionScreen 
            key="conversion" 
            category={selectedCategory} 
            language={language}
            deviceId={deviceId}
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
