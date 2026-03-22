import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Trash2, Home } from 'lucide-react';
import { HistoryItem, Language } from '../types';
import { subscribeToHistory } from '../services/unitService';
import { translations } from '../constants/translations';

interface HistoryScreenProps {
  language: Language;
  deviceId: string;
  onBack: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ language, deviceId, onBack }) => {
  const t = translations[language];
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToHistory(deviceId, setHistory);
    return () => unsubscribe();
  }, [deviceId]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-40 flex flex-col bg-white dark:bg-black transition-colors"
    >
      <div className="flex items-center justify-between px-6 pt-12 max-w-3xl mx-auto w-full">
        <button 
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 transition-transform active:scale-90"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-[#6C63FF]">{t.history}</h2>
        <button 
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 transition-transform active:scale-90"
        >
          <Home size={20} />
        </button>
      </div>

      <div className="mt-8 flex-1 overflow-y-auto px-6 pb-12 max-w-3xl mx-auto w-full">
        {history.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-400 dark:text-zinc-600">
            <p className="text-sm">{t.noHistory}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative border-b border-gray-100 dark:border-zinc-800 pb-4"
              >
                <div className="mb-1 text-xs font-bold text-gray-400 dark:text-zinc-600">
                  {t.categories[item.category as keyof typeof t.categories]}
                </div>
                <div className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
                  {item.fromUnit} {t.to} {item.toUnit}
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
                  {item.fromValue} {item.fromUnit} = {item.toValue.toLocaleString(undefined, { maximumFractionDigits: 6 })} {item.toUnit}
                </div>
                <div className="mt-2 text-[10px] font-medium text-gray-300 dark:text-zinc-700">
                  {formatDate(item.timestamp)}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HistoryScreen;
