import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Moon, Sun, Languages, Home, LayoutGrid } from 'lucide-react';
import { Language, Theme, CategoryType } from '../types';
import { translations } from '../constants/translations';
import { categories } from './HomeScreen';

interface SettingsScreenProps {
  language: Language;
  theme: Theme;
  visibleCategories: CategoryType[];
  onUpdateLanguage: (lang: Language) => void;
  onUpdateTheme: (theme: Theme) => void;
  onUpdateVisibleCategories: (categories: CategoryType[]) => void;
  onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
  language, 
  theme, 
  visibleCategories,
  onUpdateLanguage, 
  onUpdateTheme, 
  onUpdateVisibleCategories,
  onBack 
}) => {
  const t = translations[language];

  const toggleCategory = (categoryId: CategoryType) => {
    if (visibleCategories.includes(categoryId)) {
      // Don't allow hiding all categories
      if (visibleCategories.length > 1) {
        onUpdateVisibleCategories(visibleCategories.filter(id => id !== categoryId));
      }
    } else {
      onUpdateVisibleCategories([...visibleCategories, categoryId]);
    }
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-40 flex flex-col bg-white dark:bg-black"
    >
      <div className="flex items-center justify-between px-6 pt-12 max-w-2xl mx-auto w-full">
        <button 
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 transition-transform active:scale-90"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-[#6C63FF]">{t.settings}</h2>
        <button 
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 transition-transform active:scale-90"
        >
          <Home size={20} />
        </button>
      </div>

      <div className="mt-12 space-y-8 px-6 max-w-2xl mx-auto w-full overflow-y-auto pb-12 scrollbar-hide">
        {/* Theme Setting */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-600">
            <Moon size={16} />
            <span>{t.theme}</span>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => onUpdateTheme('light')}
              className={`flex-1 rounded-2xl py-4 font-bold transition-all ${
                theme === 'light' 
                  ? 'bg-[#6C63FF] text-white shadow-lg' 
                  : 'bg-gray-50 dark:bg-zinc-900 text-gray-500 dark:text-zinc-400'
              }`}
            >
              {t.light}
            </button>
            <button 
              onClick={() => onUpdateTheme('dark')}
              className={`flex-1 rounded-2xl py-4 font-bold transition-all ${
                theme === 'dark' 
                  ? 'bg-[#6C63FF] text-white shadow-lg' 
                  : 'bg-gray-50 dark:bg-zinc-900 text-gray-500 dark:text-zinc-400'
              }`}
            >
              {t.dark}
            </button>
          </div>
        </div>

        {/* Language Setting */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-600">
            <Languages size={16} />
            <span>{t.language}</span>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => onUpdateLanguage('en')}
              className={`flex-1 rounded-2xl py-4 font-bold transition-all ${
                language === 'en' 
                  ? 'bg-[#6C63FF] text-white shadow-lg' 
                  : 'bg-gray-50 dark:bg-zinc-900 text-gray-500 dark:text-zinc-400'
              }`}
            >
              {t.english}
            </button>
            <button 
              onClick={() => onUpdateLanguage('bn')}
              className={`flex-1 rounded-2xl py-4 font-bold transition-all ${
                language === 'bn' 
                  ? 'bg-[#6C63FF] text-white shadow-lg' 
                  : 'bg-gray-50 dark:bg-zinc-900 text-gray-500 dark:text-zinc-400'
              }`}
            >
              {t.bangla}
            </button>
          </div>
        </div>

        {/* Visible Categories Setting */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-600">
            <LayoutGrid size={16} />
            <span>{language === 'bn' ? 'দৃশ্যমান ক্যাটাগরি' : 'Visible Categories'}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map((cat) => {
              const isVisible = visibleCategories.includes(cat.id as CategoryType);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id as CategoryType)}
                  className={`flex items-center gap-3 rounded-xl p-3 text-left transition-all border ${
                    isVisible 
                      ? 'bg-[#6C63FF]/10 border-[#6C63FF] text-[#6C63FF]' 
                      : 'bg-gray-50 dark:bg-zinc-900 border-transparent text-gray-500 dark:text-zinc-400'
                  }`}
                >
                  <cat.icon size={18} />
                  <span className="text-xs font-semibold truncate">{t.categories[cat.id as keyof typeof t.categories]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsScreen;
