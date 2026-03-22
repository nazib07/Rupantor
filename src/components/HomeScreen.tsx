import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Ruler, 
  Weight, 
  Thermometer, 
  Square, 
  Box, 
  Clock, 
  Zap, 
  HardDrive,
  History as HistoryIcon,
  Settings as SettingsIcon,
  ChevronLeft,
  Coins,
  Mic,
  MicOff
} from 'lucide-react';
import { CategoryType, Language, Unit } from '../types';
import { translations } from '../constants/translations';
import { DEFAULT_UNITS } from '../services/unitService';

interface HomeScreenProps {
  language: Language;
  visibleCategories: CategoryType[];
  onSelectCategory: (category: CategoryType) => void;
  onShowHistory: () => void;
  onShowSettings: () => void;
}

export const categories = [
  { id: 'Length', icon: Ruler },
  { id: 'Weight', icon: Weight },
  { id: 'Temperature', icon: Thermometer },
  { id: 'Area', icon: Square },
  { id: 'Volume', icon: Box },
  { id: 'Time', icon: Clock },
  { id: 'Speed', icon: Zap },
  { id: 'Digital Storage', icon: HardDrive },
  { id: 'Currency', icon: Coins },
];

const HomeScreen: React.FC<HomeScreenProps> = ({ language, visibleCategories, onSelectCategory, onShowHistory, onShowSettings }) => {
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  const startVoiceSearch = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Voice search is not supported in this browser.');
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

    recognition.start();
  }, [language]);

  const filteredCategories = categories
    .filter(cat => {
      const isVisible = visibleCategories.includes(cat.id as CategoryType);
      if (!isVisible) return false;
      
      const categoryName = t.categories[cat.id as keyof typeof t.categories].toLowerCase();
      return categoryName.includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      const nameA = t.categories[a.id as keyof typeof t.categories];
      const nameB = t.categories[b.id as keyof typeof t.categories];
      return nameA.localeCompare(nameB, language === 'bn' ? 'bn' : 'en');
    });

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    const separators = [' to ', ' থেকে '];
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
        const fromPart = parts[0].trim();
        const toPart = parts[1].trim();

        if (fromPart && toPart) {
          // Find category that contains both units
          for (const [category, units] of Object.entries(DEFAULT_UNITS)) {
            const isMatch = (unit: Unit, queryPart: string) => {
              const name = unit.name.toLowerCase();
              const nameBn = unit.nameBn?.toLowerCase() || '';
              const id = unit.id.toLowerCase();
              const symbol = unit.symbol.toLowerCase();
              
              // Basic matches
              if (name === queryPart || nameBn === queryPart || id === queryPart || symbol === queryPart) return true;
              
              // Plural matches (simple)
              if (name + 's' === queryPart || name + 'es' === queryPart) return true;
              
              // Common variations
              if (name === 'meter' && queryPart === 'metre') return true;
              if (name === 'meter' && queryPart === 'metres') return true;
              if (name === 'kilometer' && queryPart === 'kilometre') return true;
              if (name === 'kilometer' && queryPart === 'kilometres') return true;
              if (name === 'centimeter' && queryPart === 'centimetre') return true;
              if (name === 'centimeter' && queryPart === 'centimetres') return true;
              if (name === 'millimeter' && queryPart === 'millimetre') return true;
              if (name === 'millimeter' && queryPart === 'millimetres') return true;
              if (name === 'liter' && queryPart === 'litre') return true;
              if (name === 'liter' && queryPart === 'litres') return true;
              
              return false;
            };

            const hasFrom = units.some(u => isMatch(u, fromPart));
            const hasTo = units.some(u => isMatch(u, toPart));

            if (hasFrom && hasTo) {
              onSelectCategory(category as CategoryType);
              setSearchQuery(''); // Clear search after navigating
              break;
            }
          }
        }
      }
    }
  }, [searchQuery, onSelectCategory]);

  return (
    <div className="flex h-full flex-col bg-white dark:bg-black transition-colors overflow-hidden">
      {/* Fixed Header */}
      <div className="px-6 pt-12 pb-4 max-w-4xl mx-auto w-full">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#6C63FF]">{t.appName}</h1>
          <div className="flex gap-3">
            <button 
              onClick={onShowHistory}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8E7FF] dark:bg-zinc-900 text-[#6C63FF] transition-transform active:scale-90"
            >
              <HistoryIcon size={20} />
            </button>
            <button 
              onClick={onShowSettings}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8E7FF] dark:bg-zinc-900 text-[#6C63FF] transition-transform active:scale-90"
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
              className="w-full rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 py-4 pl-12 pr-12 text-sm text-gray-800 dark:text-zinc-200 focus:border-[#6C63FF] focus:outline-none transition-colors"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" title="search" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <button 
              onClick={startVoiceSearch}
              className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isListening ? 'text-[#6C63FF] animate-pulse' : 'text-gray-400 dark:text-zinc-600'}`}
            >
              {isListening ? <Mic size={20} /> : <Mic size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-12 scrollbar-hide">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
          {filteredCategories.map((cat, index) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectCategory(cat.id as CategoryType)}
              className="flex flex-col items-center justify-center rounded-3xl border border-gray-50 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 card-shadow transition-all hover:border-[#6C63FF]/20 active:scale-95"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8E7FF] dark:bg-[#6C63FF]/10 text-[#6C63FF]">
                <cat.icon size={24} />
              </div>
              <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">{t.categories[cat.id as keyof typeof t.categories]}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
