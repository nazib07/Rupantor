import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  React.useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-card-dark transition-colors"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-[#6C63FF]"
      >
        <RefreshCw className="h-16 w-16 text-white" />
      </motion.div>
      
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-4xl font-bold tracking-tight text-[#6C63FF]"
      >
        রূপান্তর
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-2 text-sm font-medium uppercase tracking-widest text-[#6C63FF]"
      >
        Unit Converter
      </motion.p>
    </motion.div>
  );
};

export default SplashScreen;
