import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Trash2, Home } from 'lucide-react';
import { HistoryItem, Language } from '../types';
import { deleteHistoryItem, clearHistory } from '../services/unitService';
import { translations } from '../constants/translations';
import { useLiveQuery } from 'dexie-react-hooks';
import { db_local } from '../db';

interface HistoryScreenProps {
  language: Language;
  deviceId: string;
  onBack: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ language, deviceId, onBack }) => {
  const t = translations[language];
  
  const history = useLiveQuery(
    () => db_local.history
      .where('deviceId').equals(deviceId)
      .reverse()
      .limit(50)
      .toArray(),
    [deviceId]
  ) || [];

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিত?' : 'Are you sure?')) {
      await deleteHistoryItem(id);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm(language === 'bn' ? 'সব ইতিহাস মুছে ফেলবেন?' : 'Clear all history?')) {
      await clearHistory();
    }
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-40 flex flex-col bg-white dark:bg-card-dark transition-colors"
    >
      <div className="flex items-center justify-between px-6 pt-12 max-w-3xl mx-auto w-full">
        <button 
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-secondary-dark text-gray-600 dark:text-zinc-400 transition-transform active:scale-90"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-[#6C63FF]">{t.history}</h2>
        <div className="flex gap-2">
          {history.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 transition-transform active:scale-90"
            >
              <Trash2 size={20} />
            </button>
          )}
          <button 
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-secondary-dark text-gray-600 dark:text-zinc-400 transition-transform active:scale-90"
          >
            <Home size={20} />
          </button>
        </div>
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
                className="group relative border-b border-gray-100 dark:border-border-dark pb-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="mb-1 text-xs font-bold text-gray-400 dark:text-zinc-600">
                      {item.category}
                    </div>
                    <div className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
                      {item.fromUnit} {t.to} {item.toUnit}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
                      {item.fromValue} {item.fromUnit} = {item.toValue.toLocaleString(undefined, { maximumFractionDigits: 6 })} {item.toUnit}
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleDelete(e, item.id)}
                    className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
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
