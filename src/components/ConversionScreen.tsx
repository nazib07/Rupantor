import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ArrowRightLeft, Home } from 'lucide-react';
import { CategoryType, Unit, Language } from '../types';
import { fetchUnitsByCategory, DEFAULT_UNITS, convert, saveHistory } from '../services/unitService';
import { translations } from '../constants/translations';

interface ConversionScreenProps {
  category: CategoryType;
  language: Language;
  deviceId: string;
  onBack: () => void;
}

const ConversionScreen: React.FC<ConversionScreenProps> = ({ category, language, deviceId, onBack }) => {
  const t = translations[language];
  const [units, setUnits] = useState<Unit[]>([]);
  const [fromUnit, setFromUnit] = useState<Unit | null>(null);
  const [toUnit, setToUnit] = useState<Unit | null>(null);
  const [inputValue, setInputValue] = useState<string>('1');
  const [result, setResult] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUnits = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedUnits = await fetchUnitsByCategory(category);
        const finalUnits = fetchedUnits.length > 0 ? fetchedUnits : DEFAULT_UNITS[category] || [];
        setUnits(finalUnits);
        if (finalUnits.length >= 2) {
          setFromUnit(finalUnits[0]);
          setToUnit(finalUnits[1]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load units');
        // Fallback to defaults if API fails
        const fallbackUnits = DEFAULT_UNITS[category] || [];
        setUnits(fallbackUnits);
        if (fallbackUnits.length >= 2) {
          setFromUnit(fallbackUnits[0]);
          setToUnit(fallbackUnits[1]);
        }
      } finally {
        setLoading(false);
      }
    };
    loadUnits();
  }, [category]);

  useEffect(() => {
    if (fromUnit && toUnit && inputValue) {
      const value = parseFloat(inputValue);
      if (!isNaN(value)) {
        setResult(convert(value, fromUnit, toUnit));
      }
    }
  }, [fromUnit, toUnit, inputValue]);

  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const handleSave = async () => {
    if (fromUnit && toUnit && inputValue) {
      await saveHistory({
        fromUnit: language === 'bn' && fromUnit.nameBn ? fromUnit.nameBn : fromUnit.name,
        toUnit: language === 'bn' && toUnit.nameBn ? toUnit.nameBn : toUnit.name,
        fromValue: parseFloat(inputValue),
        toValue: result,
        category,
        deviceId
      });
    }
  };

  if (!fromUnit || !toUnit) return null;

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
        <h2 className="text-xl font-bold text-[#6C63FF]">{t.categories[category as keyof typeof t.categories]}</h2>
        <button 
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 transition-transform active:scale-90"
        >
          <Home size={20} />
        </button>
      </div>

      <div className="mt-12 flex flex-1 flex-col px-6 max-w-3xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#6C63FF] border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-red-100 p-4 text-red-500 dark:bg-red-900/20">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 text-xs font-bold text-[#6C63FF] underline"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* From Unit */}
            <div className="rounded-3xl bg-gray-50 dark:bg-zinc-900 p-6 transition-colors">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-600">{t.from}</label>
            <div className="flex items-center justify-between">
              <select 
                value={fromUnit.id}
                onChange={(e) => setFromUnit(units.find(u => u.id === e.target.value) || null)}
                className="bg-transparent text-lg font-semibold text-gray-800 dark:text-zinc-200 outline-none"
              >
                {units.map(u => (
                  <option key={u.id} value={u.id} className="dark:bg-zinc-900">
                    {language === 'bn' && u.nameBn ? u.nameBn : u.name}
                  </option>
                ))}
              </select>
              <input 
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-1/2 bg-transparent text-right text-2xl font-bold text-[#6C63FF] outline-none"
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button 
              onClick={handleSwap}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6C63FF] text-white shadow-lg transition-transform active:rotate-180"
            >
              <ArrowRightLeft size={20} />
            </button>
          </div>

          {/* To Unit */}
          <div className="rounded-3xl bg-[#E8E7FF] dark:bg-[#6C63FF]/10 p-6 transition-colors">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#6C63FF]/60 dark:text-[#6C63FF]/40">{t.to}</label>
            <div className="flex items-center justify-between">
              <select 
                value={toUnit.id}
                onChange={(e) => setToUnit(units.find(u => u.id === e.target.value) || null)}
                className="bg-transparent text-lg font-semibold text-[#6C63FF] outline-none"
              >
                {units.map(u => (
                  <option key={u.id} value={u.id} className="dark:bg-zinc-900">
                    {language === 'bn' && u.nameBn ? u.nameBn : u.name}
                  </option>
                ))}
              </select>
              <div className="text-right text-2xl font-bold text-[#6C63FF]">
                {result.toLocaleString(undefined, { maximumFractionDigits: 6 })}
              </div>
            </div>
          </div>
        </div>
        )}

        <div className="mt-auto pb-12">
          <button 
            onClick={handleSave}
            disabled={loading || !!error}
            className={`w-full rounded-2xl py-4 font-bold text-white shadow-lg transition-transform active:scale-95 ${
              loading || !!error ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#6C63FF]'
            }`}
          >
            {t.saveHistory}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ConversionScreen;
