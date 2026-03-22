import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { 
  History as HistoryIcon,
  Settings as SettingsIcon,
  Mic
} from 'lucide-react';
import { CategoryType, Language, Category, Unit } from '../types';
import { translations } from '../constants/translations';
import { fetchCategories, fetchUnitsByCategory } from '../services/unitService';

interface HomeScreenProps {
  language: Language;
  categories: Category[];
  currencyCategory: Category;
  visibleCategories: string[];
  onSelectCategory: (category: Category) => void;
  onShowHistory: () => void;
  onShowSettings: () => void;
}

// Filter out non-component exports if any, and keep only icons
const ICON_MAP: Record<string, any> = Object.entries(LucideIcons).reduce((acc, [name, Icon]) => {
  if (name !== 'createLucideIcon' && name !== 'LucideIcon' && (typeof Icon === 'function' || typeof Icon === 'object')) {
    acc[name] = Icon;
  }
  return acc;
}, {} as Record<string, any>);

const HomeScreen: React.FC<HomeScreenProps> = ({ language, categories, currencyCategory, visibleCategories, onSelectCategory, onShowHistory, onShowSettings }) => {
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [unitsMap, setUnitsMap] = useState<Record<string, Unit[]>>({});

  useEffect(() => {
    const loadAllUnits = async () => {
      const map: Record<string, Unit[]> = {};
      const allCats = [currencyCategory, ...categories];
      await Promise.all(allCats.map(async (cat) => {
        try {
          const units = await fetchUnitsByCategory(cat.id, cat.nameEn);
          map[cat.id] = units;
        } catch (e) {
          console.error(`Failed to load units for ${cat.id}`, e);
        }
      }));
      setUnitsMap(map);
    };

    if (categories.length > 0 || currencyCategory) {
      loadAllUnits();
    }
  }, [categories, currencyCategory]);

  const startVoiceSearch = useCallback(async () => {
    // Pre-flight check for Android: Trigger native permission popup if not granted
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Just request it and immediately stop the tracks
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (err) {
      console.error('Permission pre-flight failed', err);
      // If user denied, the browser/WebView will handle it, but we continue 
      // to let the SpeechRecognition try its own error handling
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert(language === 'bn' ? 'আপনার ডিভাইসে ভয়েস সার্চ সাপোর্ট করে না' : 'Voice search is not supported on this device.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'bn' ? 'bn-BD' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error('Recognition start failed', e);
      setIsListening(false);
    }
  }, [language]);

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return;

    // Support multiple separators for English and Bengali
    const separators = [' to ', ' into ', ' in ', ' থেকে ', ' হতে ', ' তে ', ' এ '];
    let foundSeparator = '';
    
    for (const sep of separators) {
      if (query.includes(sep)) {
        foundSeparator = sep;
        break;
      }
    }

    if (foundSeparator) {
      const parts = query.split(foundSeparator);
      if (parts.length === 2) {
        // Clean parts: remove numbers and extra spaces
        // e.g., "5 meters" -> "meters"
        const cleanPart = (p: string) => p.replace(/[0-9.]/g, '').trim();
        const fromPart = cleanPart(parts[0]);
        const toPart = cleanPart(parts[1]);

        if (fromPart && toPart) {
          // Find category that contains both units
          for (const catId of Object.keys(unitsMap)) {
            const units = unitsMap[catId];
            
            const isMatch = (unit: Unit, queryPart: string) => {
              const nameEn = unit.nameEn.toLowerCase();
              const nameBn = unit.nameBn.toLowerCase();
              const symbol = unit.symbol.toLowerCase();
              
              const q = queryPart.toLowerCase().trim();
              if (!q) return false;

              // 1. Direct matches
              if (nameEn === q || nameBn === q || symbol === q) return true;
              
              // 2. Plural matches (common patterns)
              const isPluralMatch = (base: string) => {
                return base + 's' === q || 
                       base + 'es' === q || 
                       (base.endsWith('y') && base.slice(0, -1) + 'ies' === q);
              };
              if (isPluralMatch(nameEn)) return true;

              // 3. Common Unit Variations (Meter/Metre, Liter/Litre)
              const variations: Record<string, string[]> = {
                'meter': ['metre', 'metres', 'meters'],
                'kilometer': ['kilometre', 'kilometres', 'kilometers', 'km'],
                'centimeter': ['centimetre', 'centimetres', 'centimeters', 'cm'],
                'millimeter': ['millimetre', 'millimetres', 'millimeters', 'mm'],
                'liter': ['litre', 'litres', 'liters', 'l'],
                'gram': ['grams', 'gm', 'g'],
                'kilogram': ['kilograms', 'kg'],
                'inch': ['inches', 'in'],
                'foot': ['feet', 'ft'],
                'yard': ['yards', 'yd'],
                'mile': ['miles', 'mi'],
                'second': ['seconds', 'sec', 's'],
                'minute': ['minutes', 'min', 'm'],
                'hour': ['hours', 'hr', 'h'],
                'celsius': ['centigrade', 'degree celsius', 'degree centigrade'],
                'fahrenheit': ['degree fahrenheit'],
              };

              for (const [base, alts] of Object.entries(variations)) {
                if (nameEn === base && alts.includes(q)) return true;
              }

              // 4. Currency common names mapping
              const currencyMap: Record<string, string[]> = {
                'USD': ['dollar', 'dollars', 'ডলার', 'ইউএস ডলার', 'ইউএসডি'],
                'BDT': ['taka', 'tk', 'টাকা', 'বিডিটি'],
                'INR': ['rupee', 'rupees', 'rupi', 'রুপি', 'ভারতীয় রুপি'],
                'EUR': ['euro', 'euros', 'ইউরো'],
                'GBP': ['pound', 'pounds', 'পাউন্ড', 'ব্রিটিশ পাউন্ড'],
                'SAR': ['riyal', 'riyals', 'রিয়াল', 'সৌদি রিয়াল'],
                'AED': ['dirham', 'dirhams', 'দিরহাম', 'আমিরাত দিরহাম'],
                'CAD': ['canadian dollar', 'কানাডিয়ান ডলার'],
                'AUD': ['australian dollar', 'অস্ট্রেলিয়ান ডলার'],
                'CNY': ['yuan', 'ইউয়ান', 'চীনা ইউয়ান'],
                'JPY': ['yen', 'ইয়েন', 'জাপানি ইয়েন'],
              };

              if (currencyMap[symbol.toUpperCase()]?.includes(q)) return true;
              
              return false;
            };

            const hasFrom = units.some(u => isMatch(u, fromPart));
            const hasTo = units.some(u => isMatch(u, toPart));

            if (hasFrom && hasTo) {
              const allCats = [currencyCategory, ...categories];
              const selectedCat = allCats.find(c => c.id === catId);
              if (selectedCat) {
                onSelectCategory(selectedCat);
                setSearchQuery(''); // Clear search after navigating
                break;
              }
            }
          }
        }
      }
    }
  }, [searchQuery, onSelectCategory, unitsMap, categories, currencyCategory]);

  const filteredCategories = [currencyCategory, ...categories]
    .filter(cat => {
      const isVisible = visibleCategories.includes(cat.id);
      if (!isVisible) return false;
      
      const categoryName = (language === 'bn' ? cat.nameBn : cat.nameEn).toLowerCase();
      return categoryName.includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      // Keep currency first if it exists, otherwise sort by order or name
      if (a.id === currencyCategory.id) return -1;
      if (b.id === currencyCategory.id) return 1;
      
      const orderA = a.order ?? 999;
      const orderB = b.order ?? 999;
      if (orderA !== orderB) return orderA - orderB;

      const nameA = language === 'bn' ? a.nameBn : a.nameEn;
      const nameB = language === 'bn' ? b.nameBn : b.nameEn;
      return nameA.localeCompare(nameB, language === 'bn' ? 'bn' : 'en');
    });

  return (
    <div className="flex h-full flex-col bg-white dark:bg-card-dark transition-colors overflow-hidden">
      {/* Fixed Header */}
      <div className="px-6 pt-12 pb-4 max-w-4xl mx-auto w-full">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#6C63FF]">{t.appName}</h1>
          <div className="flex gap-3">
            <button 
              onClick={onShowHistory}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8E7FF] dark:bg-secondary-dark text-[#6C63FF] transition-transform active:scale-90"
            >
              <HistoryIcon size={20} />
            </button>
            <button 
              onClick={onShowSettings}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8E7FF] dark:bg-secondary-dark text-[#6C63FF] transition-transform active:scale-90"
            >
              <SettingsIcon size={20} />
            </button>
          </div>
        </div>

        <div className="mb-2">
          <div className="relative">
            <input 
              type="text" 
              placeholder={t.searchPlaceholder} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-gray-100 dark:border-border-dark bg-gray-50 dark:bg-secondary-dark py-4 pl-12 pr-12 text-sm text-gray-800 dark:text-zinc-200 focus:border-[#6C63FF] focus:outline-none transition-colors"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <button 
              onClick={startVoiceSearch}
              className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isListening ? 'text-[#6C63FF] animate-pulse' : 'text-gray-400 dark:text-zinc-600'}`}
            >
              <Mic size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-12 scrollbar-hide">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
          {filteredCategories.map((cat, index) => {
            const Icon = ICON_MAP[cat.iconName] || LucideIcons.Grid;
            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelectCategory(cat)}
                className="flex flex-col items-center justify-center rounded-3xl border border-gray-50 dark:border-border-dark bg-white dark:bg-secondary-dark p-6 card-shadow transition-all hover:border-[#6C63FF]/20 active:scale-95"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8E7FF] dark:bg-[#6C63FF]/10 text-[#6C63FF]">
                  <Icon size={24} />
                </div>
                <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400 text-center">
                  {language === 'bn' ? cat.nameBn : cat.nameEn}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
