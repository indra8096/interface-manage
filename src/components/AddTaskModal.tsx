'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: { name: string; score: number; category: string }) => void;
  category: string;
}

const categoryNames = {
  defensive: 'DÉFENSIF',
  general: 'GÉNÉRAL',
  offensive: 'OFFENSIF',
};

export default function AddTaskModal({ isOpen, onClose, onSubmit, category }: AddTaskModalProps) {
  const [name, setName] = useState('');
  const [score, setScore] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({ name: name.trim(), score, category });
      setName('');
      setScore(5);
    }
  };

  const scoreColors = {
    1: '#ef4444',
    2: '#f59e0b',
    3: '#f59e0b',
    4: '#eab308',
    5: '#84cc16',
    6: '#22c55e',
    7: '#10b981',
    8: '#06b6d4',
    9: '#3b82f6',
    10: '#8b5cf6',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 w-full max-w-md border border-gray-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-karla-bold text-white">
                <span className="bg-gradient-to-r from-[#CCFF00] to-[#9933FF] bg-clip-text text-transparent">
                  NOUVEAU SERVICE
                </span>
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-[#CCFF00] transition-colors p-2 rounded-lg hover:bg-gray-800"
              >
                <div className="w-6 h-6 rounded-full bg-current"></div>
              </button>
            </div>

            <div className="mb-6 p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-gray-700">
              <span className="text-sm text-gray-400 font-karla-regular">CATÉGORIE: </span>
              <span className="font-karla-semibold text-[#CCFF00]">{categoryNames[category as keyof typeof categoryNames]}</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-karla-semibold text-white mb-3">
                  NOM DU SERVICE
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-white focus:border-[#CCFF00] focus:ring-2 focus:ring-[#CCFF00]/20 outline-none transition-all font-karla-regular"
                  placeholder="Entrez le nom du service..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-karla-semibold text-white mb-3">
                  NIVEAU DE PRIORITÉ (1-10)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={score}
                    onChange={(e) => setScore(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, ${scoreColors[score as keyof typeof scoreColors]} 0%, ${scoreColors[score as keyof typeof scoreColors]} ${(score - 1) * 11.11}%, #374151 ${(score - 1) * 11.11}%, #374151 100%)`
                    }}
                  />
                  <span
                    className="px-4 py-2 rounded-full font-karla-bold text-sm text-black min-w-[3rem] text-center"
                    style={{
                      backgroundColor: scoreColors[score as keyof typeof scoreColors],
                    }}
                  >
                    {score}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-[#CCFF00] to-[#9933FF] text-black rounded-xl font-karla-bold hover:from-[#9933FF] hover:to-[#CCFF00] transition-all duration-300 shadow-lg"
              >
                CRÉER LE SERVICE
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 