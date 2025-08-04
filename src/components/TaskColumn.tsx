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
  defensive: 'var(--theme-primary)',
  general: 'var(--theme-primary)',
  offensive: 'var(--theme-secondary)',
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
      className="rounded-2xl p-8 border border-[#9933FF] hover:border-[#CCFF00] transition-all duration-500 backdrop-blur-sm"
      style={{
        background: 'var(--bg-card)',
        boxShadow: `0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px ${categoryColors[category]}20`
      }}
    >
      {/* Header futuriste */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
                         <h2 className="text-2xl font-karla-bold mb-2 transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>
               {categoryTitles[category]}
             </h2>
             <p className="font-karla-regular text-sm transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>
               {categoryDescriptions[category]}
             </p>
          </div>
                     <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{
             background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))'
           }}>
             <div className="w-8 h-8 rounded-full" style={{ background: 'var(--bg-primary)' }}></div>
           </div>
        </div>
        
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
      </div>

      {/* Section statistiques futuriste */}
             <div className="mb-8 p-6 rounded-xl border transition-all duration-300" style={{
         background: 'var(--bg-secondary)',
         border: '1px solid var(--border-primary)'
       }}>
        <div className="flex items-center justify-between mb-4">
                     <h3 className="text-sm font-karla-semibold transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>PROGRESSION</h3>
           <span className="text-xs font-karla-medium transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>OBJECTIF: 100%</span>
        </div>
        <div className="flex items-center justify-center">
          <ProgressCircle
            percentage={percentage}
            color={categoryColors[category]}
            category={category}
          />
        </div>
        <div className="text-center mt-4">
                     <div className="text-xs font-karla-medium mb-1 transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>
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
           <h3 className="text-sm font-karla-semibold transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>SERVICES ACTIFS</h3>
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--theme-primary)' }}></div>
             <span className="text-xs font-karla-medium transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>ONLINE</span>
           </div>
         </div>
        
        <AnimatePresence mode="popLayout">
          {tasks.length === 0 ? (
                         <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="text-center py-12 transition-colors duration-300"
               style={{ color: 'var(--text-muted)' }}
             >
               <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center border transition-all duration-300" style={{
                 background: 'var(--bg-secondary)',
                 border: '1px solid var(--border-primary)'
               }}>
                 <div className="w-8 h-8 rounded-full transition-colors duration-300" style={{ background: 'var(--text-muted)' }}></div>
               </div>
               <p className="text-sm font-karla-medium transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>AUCUN SERVICE ACTIF</p>
               <p className="text-xs mt-1 transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>Initialisez votre premier service</p>
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
           background: 'var(--theme-primary)',
           color: 'var(--bg-primary)'
         }}
      >
                 <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-primary)', opacity: 0.2 }}>
           <div className="w-3 h-3 rounded-full" style={{ background: 'var(--bg-primary)' }}></div>
         </div>
        <span className="text-sm font-karla-bold">AJOUTER UN SERVICE</span>
      </motion.button>
    </motion.div>
  );
} 