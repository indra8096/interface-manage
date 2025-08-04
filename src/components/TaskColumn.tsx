'use client';

import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';
import ProgressCircle from './ProgressCircle';

interface Task {
  id: number;
  name: string;
  status: 'completed' | 'warning' | 'error';
  score: number;
  category: string;
  description?: string;
  importance?: string;
  dueDate?: string;
  assignedTo?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TaskColumnProps {
  category: 'defensive' | 'general' | 'offensive';
  tasks: Task[];
  onAddTask: (category: string) => void;
  onStatusChange: (id: number, newStatus: 'completed' | 'warning' | 'error') => void;
}

const categoryTitles = {
  defensive: 'DÉFENSIF',
  general: 'GÉNÉRAL',
  offensive: 'OFFENSIF',
};

const categoryColors = {
  defensive: '#CCFF00',
  general: '#CCFF00',
  offensive: '#9933FF',
};

const categoryDescriptions = {
  defensive: 'Systèmes de protection et surveillance',
  general: 'Services d\'infrastructure et maintenance',
  offensive: 'Tests de pénétration et évaluation',
};

export default function TaskColumn({ category, tasks, onAddTask, onStatusChange }: TaskColumnProps) {
  const percentage = Math.round((tasks.filter(t => t.status === 'completed').length / Math.max(tasks.length, 1)) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 border border-[#9933FF] hover:border-[#CCFF00] transition-all duration-500 backdrop-blur-sm"
      style={{ 
        boxShadow: `0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px ${categoryColors[category]}20`
      }}
    >
      {/* Header futuriste */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-karla-bold text-white mb-2">
              {categoryTitles[category]}
            </h2>
            <p className="text-gray-400 font-karla-regular text-sm">
              {categoryDescriptions[category]}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#CCFF00] to-[#9933FF] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-black"></div>
          </div>
        </div>
        
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
      </div>

      {/* Section statistiques futuriste */}
      <div className="mb-8 p-6 rounded-xl bg-gradient-to-br from-black to-gray-900 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-karla-semibold text-gray-300">PROGRESSION</h3>
          <span className="text-xs text-gray-500 font-karla-medium">OBJECTIF: 100%</span>
        </div>
        <div className="flex items-center justify-center">
          <ProgressCircle
            percentage={percentage}
            color={categoryColors[category]}
            category={category}
          />
        </div>
        <div className="text-center mt-4">
          <div className="text-xs text-gray-400 font-karla-medium mb-1">
            SERVICES COMPLÉTÉS
          </div>
          <div className="text-lg font-karla-bold" style={{ color: categoryColors[category] }}>
            {tasks.length}/10
          </div>
        </div>
      </div>

      {/* Liste des tâches avec design futuriste */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-karla-semibold text-gray-300">SERVICES ACTIFS</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse"></div>
            <span className="text-xs text-gray-500 font-karla-medium">ONLINE</span>
          </div>
        </div>
        
        <AnimatePresence mode="popLayout">
          {tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-500"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-gray-700">
                <div className="w-8 h-8 rounded-full bg-gray-600"></div>
              </div>
              <p className="text-sm font-karla-medium text-gray-400">AUCUN SERVICE ACTIF</p>
              <p className="text-xs text-gray-600 mt-1">Initialisez votre premier service</p>
            </motion.div>
          ) : (
            tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
              >
                <TaskCard
                  {...task}
                  category={category}
                  onStatusChange={onStatusChange}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Bouton d'ajout futuriste */}
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onAddTask(category)}
        className="w-full p-4 rounded-xl font-karla-semibold flex items-center justify-center gap-3 transition-all duration-300"
        style={{ 
          background: `linear-gradient(135deg, ${categoryColors[category]}, ${categoryColors[category]}80)`,
          color: 'black'
        }}
      >
        <div className="w-6 h-6 rounded-full bg-black bg-opacity-20 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-black"></div>
        </div>
        <span className="text-sm font-karla-bold">AJOUTER UN SERVICE</span>
      </motion.button>
    </motion.div>
  );
} 