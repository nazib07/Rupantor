import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ArrowRightLeft, Home, CheckCircle2, ChevronDown, RefreshCw } from 'lucide-react';
import { Category, Unit, Language } from '../types';
import { fetchUnitsByCategory, convert, saveHistory, fetchCurrencyRates } from '../services/unitService';
import { translations } from '../constants/translations';

interface ConversionScreenProps {
  category: Category;
  language: Language;
  deviceId: string;
  initialFromUnit?: Unit;
  initialToUnit?: Unit;
  onBack: () => void;
}

const UnitDropdown: React.FC<{
  units: Unit[];
  selectedUnit: Unit;
  onSelect: (unit: Unit) => void;
  language: Language;
}> = ({ units, selectedUnit, onSelect, language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative max-w-[50%]" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left w-full"
      >
        <span className="text-lg font-semibold truncate flex-1">
          {language === 'bn' ? selectedUnit.nameBn : selectedUnit.nameEn}
        </span>
        <ChevronDown size={16} className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute left-0 mt-2 z-50 w-64 max-h-64 overflow-y-auto rounded-2xl bg-white dark:bg-secondary-dark shadow-2xl border border-gray-100 dark:border-border-dark p-2 scrollbar-hide"
          >
            {units.map((unit) => (
              <button
                key={unit.id}
                onClick={() => {
                  onSelect(unit);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  selectedUnit.id === unit.id
                    ? 'bg-[#6C63FF] text-white'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <span>{language === 'bn' ? unit.nameBn : unit.nameEn}</span>
                {unit.symbol && <span className={`text-[10px] px-1.5 py-0.5 rounded ${selectedUnit.id === unit.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-white/10'}`}>{unit.symbol}</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ConversionScreen: React.FC<ConversionScreenProps> = ({ 
  category, 
  language, 
  deviceId, 
  initialFromUnit, 
  initialToUnit, 
  onBack 
}) => {
  const t = translations[language];
  const [units, setUnits] = useState<Unit[]>([]);
  const [fromUnit, setFromUnit] = useState<Unit | null>(null);
  const [toUnit, setToUnit] = useState<Unit | null>(null);
  const [inputValue, setInputValue] = useState<string>('1');
  const [result, setResult] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSavedPopup, setShowSavedPopup] = useState<boolean>(false);

  const loadUnits = async (isManualSync = false) => {
    if (isManualSync) setIsSyncing(true);
    else setLoading(true);
    
    setError(null);
    try {
      const response = await fetchUnitsByCategory(category.id, category.nameEn);
      setUnits(response.units);
      if (response.lastUpdated) {
        setLastUpdated(response.lastUpdated);
      }
      
      // If initial units are provided, use them. Otherwise use defaults.
      if (initialFromUnit && initialToUnit) {
        // Ensure the initial units are actually in the fetched units list
        const foundFrom = response.units.find(u => u.id === initialFromUnit.id);
        const foundTo = response.units.find(u => u.id === initialToUnit.id);
        if (foundFrom && foundTo) {
          setFromUnit(foundFrom);
          setToUnit(foundTo);
        } else {
          // Fallback to first two units if initial units aren't found in the current category
          setFromUnit(response.units[0]);
          setToUnit(response.units[1]);
        }
      } else if (!fromUnit && !toUnit && response.units.length >= 2) {
        setFromUnit(response.units[0]);
        setToUnit(response.units[1]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load units');
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadUnits();
  }, [category.id]);

  const handleSync = () => {
    if (isCurrency) {
      loadUnits(true);
    }
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    const date = new Date(lastUpdated);
    return date.toLocaleTimeString(language === 'bn' ? 'bn-BD' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

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
        fromUnit: language === 'bn' ? fromUnit.nameBn : fromUnit.nameEn,
        toUnit: language === 'bn' ? toUnit.nameBn : toUnit.nameEn,
        fromValue: parseFloat(inputValue),
        toValue: result,
        category: language === 'bn' ? category.nameBn : category.nameEn,
        deviceId
      });
      
      setShowSavedPopup(true);
      setTimeout(() => setShowSavedPopup(false), 2000);
    }
  };

  if (!fromUnit || !toUnit) return null;

  const isCurrency = category.id === 'currency' || category.nameEn.toLowerCase() === 'currency' || category.nameEn.toLowerCase().includes('currency');

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
        <h2 className="text-xl font-bold text-[#6C63FF]">{language === 'bn' ? category.nameBn : category.nameEn}</h2>
        <button 
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-secondary-dark text-gray-600 dark:text-zinc-400 transition-transform active:scale-90"
        >
          <Home size={20} />
        </button>
      </div>

      <AnimatePresence>
        {showSavedPopup && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-28 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none"
          >
            <div className="flex items-center gap-3 rounded-2xl bg-green-500 px-6 py-3 text-white shadow-xl shadow-green-500/20">
              <CheckCircle2 size={20} />
              <span className="font-bold">
                {language === 'bn' ? 'সফলভাবে সংরক্ষিত হয়েছে' : 'Saved Successfully'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 flex flex-1 flex-col px-6 max-w-3xl mx-auto w-full">
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
            {/* Sync Info for Currency */}
            {isCurrency && (
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
                    {language === 'bn' ? 'সর্বশেষ আপডেট' : 'Last Updated'}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-zinc-300">
                    <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                    <span>{lastUpdated ? formatLastUpdated() : (language === 'bn' ? 'এখনও নেই' : 'Never')}</span>
                  </div>
                </div>
                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#6C63FF]/10 text-[#6C63FF] text-xs font-bold hover:bg-[#6C63FF]/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                  {language === 'bn' ? 'সিঙ্ক করুন' : 'Sync Now'}
                </button>
              </div>
            )}

            {/* From Unit */}
            <div className="rounded-3xl bg-gray-50 dark:bg-secondary-dark p-6 transition-colors">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-600">{t.from}</label>
            <div className="flex items-center justify-between gap-4">
              <UnitDropdown 
                units={units}
                selectedUnit={fromUnit}
                onSelect={setFromUnit}
                language={language}
              />
              <input 
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 bg-transparent text-right text-xl font-bold text-[#6C63FF] outline-none min-w-0"
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
            <div className="flex items-center justify-between gap-4">
              <UnitDropdown 
                units={units}
                selectedUnit={toUnit}
                onSelect={setToUnit}
                language={language}
              />
              <div className="flex-1 text-right text-xl font-bold text-[#6C63FF] truncate min-w-0">
                {result.toLocaleString(undefined, { maximumFractionDigits: 4 })}
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
