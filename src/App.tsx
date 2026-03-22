import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import SplashScreen from './components/SplashScreen';
import HomeScreen from './components/HomeScreen';
import ConversionScreen from './components/ConversionScreen';
import HistoryScreen from './components/HistoryScreen';
import SettingsScreen from './components/SettingsScreen';
import { CategoryType, Language, Theme } from './types';

type Screen = 'splash' | 'home' | 'conversion' | 'history' | 'settings';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');
  const [deviceId, setDeviceId] = useState<string>('');
  const [visibleCategories, setVisibleCategories] = useState<CategoryType[]>([
    'Length', 'Weight', 'Temperature', 'Area', 'Volume', 'Time', 'Speed', 'Digital Storage', 'Currency'
  ]);

  useEffect(() => {
    let id = localStorage.getItem('rupantor_device_id');
    if (!id) {
      id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('rupantor_device_id', id);
    }
    setDeviceId(id);

    const savedLanguage = localStorage.getItem('rupantor_language') as Language;
    const savedTheme = localStorage.getItem('rupantor_theme') as Theme;
    const savedVisibleCategories = localStorage.getItem('rupantor_visible_categories');

    if (savedLanguage) setLanguage(savedLanguage);
    if (savedTheme) setTheme(savedTheme || 'light');
    if (savedVisibleCategories) {
      try {
        setVisibleCategories(JSON.parse(savedVisibleCategories));
      } catch (e) {
        console.error('Failed to parse visible categories', e);
      }
    }
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

  const handleSelectCategory = (category: CategoryType) => {
    setSelectedCategory(category);
    setCurrentScreen('conversion');
  };

  const handleBack = () => {
    setCurrentScreen('home');
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-950 flex items-center justify-center p-0 md:p-8 transition-colors duration-300">
      <div className="w-full h-screen md:h-[90vh] md:max-w-5xl bg-white dark:bg-black md:rounded-[3rem] shadow-2xl relative overflow-hidden transition-colors duration-300">
        <AnimatePresence mode="wait">
        {currentScreen === 'splash' && (
          <SplashScreen key="splash" onComplete={() => setCurrentScreen('home')} />
        )}
        
        {currentScreen === 'home' && (
          <HomeScreen 
            key="home" 
            language={language}
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
            onBack={() => setCurrentScreen('home')} 
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen 
            key="settings"
            language={language}
            theme={theme}
            visibleCategories={visibleCategories}
            onUpdateLanguage={setLanguage}
            onUpdateTheme={setTheme}
            onUpdateVisibleCategories={setVisibleCategories}
            onBack={() => setCurrentScreen('home')}
          />
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
