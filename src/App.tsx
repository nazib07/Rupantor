import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
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
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');
  const [deviceId, setDeviceId] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [visibleCategories, setVisibleCategories] = useState<string[]>([]);

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
