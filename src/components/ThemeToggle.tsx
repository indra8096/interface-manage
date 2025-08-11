'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
             style={{
         background: theme === 'dark' 
           ? 'linear-gradient(135deg, #CCFF00, #9933FF)' 
           : 'linear-gradient(135deg, #9933FF, #FFFFFF)',
         color: theme === 'dark' ? '#000000' : '#000000'
       }}
      title={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 0 : 180 }}
        transition={{ duration: 0.5 }}
        className="w-6 h-6 flex items-center justify-center"
      >
        {theme === 'dark' ? (
          // Icône soleil pour le mode clair
          <div className="relative">
            <div className="w-4 h-4 rounded-full bg-black"></div>
            <div className="absolute inset-0 w-4 h-4">
              <div className="absolute top-0 left-1/2 w-0.5 h-1 bg-black transform -translate-x-1/2"></div>
              <div className="absolute bottom-0 left-1/2 w-0.5 h-1 bg-black transform -translate-x-1/2"></div>
              <div className="absolute left-0 top-1/2 w-1 h-0.5 bg-black transform -translate-y-1/2"></div>
              <div className="absolute right-0 top-1/2 w-1 h-0.5 bg-black transform -translate-y-1/2"></div>
            </div>
          </div>
        ) : (
          // Icône lune pour le mode sombre
          <div className="w-4 h-4 rounded-full border-2 border-black relative">
            <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-black transform translate-x-1 -translate-y-1"></div>
          </div>
        )}
      </motion.div>
    </motion.button>
  );
} 