'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Task {
  id: number;
  name: string;
  status: 'completed' | 'warning' | 'error';
  score: number;
  importance?: string;
  description?: string;
  dueDate?: string;
  assignedTo?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: number, taskData: { name: string; description: string; score: number; importance: string; dueDate: string; assignedTo: string }) => void;
  onSubmit?: (task: { name: string; score: number; category: string; description: string; importance: string; dueDate: string; assignedTo: string }) => void;
  task: Task | null;
  mode: 'add' | 'edit';
  category?: string;
}

const categoryNames = {
  defensive: 'DÉFENSIF',
  general: 'GÉNÉRAL',
  offensive: 'OFFENSIF',
};

export default function TaskModal({
  isOpen,
  onClose,
  onSave,
  onSubmit,
  task,
  mode,
  category,
}: TaskModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    score: 5,
    importance: 'Moyenne',
    dueDate: '',
    assignedTo: '',
  });

  // Pré-remplir le formulaire avec les données de la tâche (mode edit uniquement)
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && task) {
        setFormData({
          name: task.name || '',
          description: task.description || '',
          score: task.score || 5,
          importance: task.importance || 'Moyenne',
          dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
          assignedTo: task.assignedTo || '',
        });
      } else if (mode === 'add') {
        // Réinitialiser le formulaire pour l'ajout
        setFormData({
          name: '',
          description: '',
          score: 5,
          importance: 'Moyenne',
          dueDate: '',
          assignedTo: '',
        });
      }
    }
  }, [isOpen, task, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'edit' && task && onSave) {
      onSave(task.id, formData);
    } else if (mode === 'add' && onSubmit && category) {
      onSubmit({
        name: formData.name,
        score: formData.score,
        category,
        description: formData.description,
        importance: formData.importance,
        dueDate: formData.dueDate,
        assignedTo: formData.assignedTo,
      });
    }
    
    onClose();
  };

  const scoreColors = {
    1: 'var(--theme-primary)',
    2: 'var(--theme-primary)',
    3: 'var(--theme-primary)',
    4: 'var(--theme-primary)',
    5: 'var(--theme-primary)',
    6: 'var(--theme-primary)',
    7: 'var(--theme-primary)',
    8: 'var(--theme-primary)',
    9: 'var(--theme-primary)',
    10: 'var(--theme-primary)',
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
                <span style={{ color: 'var(--theme-primary)' }}>
                  {mode === 'add' ? 'NOUVEAU SERVICE' : 'MODIFICATION'}
                </span>
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
              >
                <div className="w-6 h-6 rounded-full bg-current"></div>
              </button>
            </div>

            {mode === 'add' && category && (
              <div className="mb-6 p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-gray-700">
                <span className="text-sm text-gray-400 font-karla-regular">CATÉGORIE: </span>
                <span className="font-karla-semibold" style={{ color: 'var(--theme-primary)' }}>{categoryNames[category as keyof typeof categoryNames]}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-karla-semibold text-white mb-3">
                  NOM DU SERVICE
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-white focus:outline-none transition-all font-karla-regular"
                  placeholder={mode === 'add' ? "Entrez le nom du service..." : ""}
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
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) })}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, ${scoreColors[formData.score as keyof typeof scoreColors]} 0%, ${scoreColors[formData.score as keyof typeof scoreColors]} ${(formData.score - 1) * 11.11}%, #374151 ${(formData.score - 1) * 11.11}%, #374151 100%)`
                    }}
                  />
                  <span
                    className="px-4 py-2 rounded-full font-karla-bold text-sm text-black min-w-[3rem] text-center"
                    style={{
                      backgroundColor: scoreColors[formData.score as keyof typeof scoreColors],
                    }}
                  >
                    {formData.score}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-karla-semibold text-white mb-3">
                  DESCRIPTION
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-white focus:border-[#CCFF00] focus:ring-2 focus:ring-[#CCFF00]/20 outline-none transition-all font-karla-regular"
                  rows={3}
                  placeholder="Description du service..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-karla-semibold text-white mb-3">
                  PRIORITÉ
                </label>
                <select
                  value={formData.importance}
                  onChange={e => setFormData({ ...formData, importance: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-white focus:border-[#CCFF00] focus:ring-2 focus:ring-[#CCFF00]/20 outline-none transition-all font-karla-regular"
                >
                  <option value="Faible">Faible</option>
                  <option value="Moyenne">Moyenne</option>
                  <option value="Élevée">Élevée</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-karla-semibold text-white mb-3">
                  ÉCHÉANCE
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-white focus:border-[#CCFF00] focus:ring-2 focus:ring-[#CCFF00]/20 outline-none transition-all font-karla-regular"
                />
              </div>
              
              <div>
                <label className="block text-sm font-karla-semibold text-white mb-3">
                  PERSONNE ASSIGNÉE
                </label>
                <input
                  type="text"
                  value={formData.assignedTo}
                  onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-white focus:border-[#CCFF00] focus:ring-2 focus:ring-[#CCFF00]/20 outline-none transition-all font-karla-regular"
                  placeholder="Nom de la personne assignée..."
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-[#CCFF00] to-[#9933FF] text-black rounded-xl font-karla-bold hover:from-[#9933FF] hover:to-[#CCFF00] transition-all duration-300 shadow-lg"
              >
                {mode === 'add' ? 'CRÉER LE SERVICE' : 'SAUVEGARDER'}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 