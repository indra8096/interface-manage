import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

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

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: number, taskData: { name: string; description: string; score: number; importance: string; dueDate: string; assignedTo: string }) => void;
  task: Task | null;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  task,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    score: 5,
    importance: 'Moyenne',
    dueDate: '',
    assignedTo: '',
  });

  // Pré-remplir le formulaire avec les données de la tâche
  useEffect(() => {
    if (isOpen && task) {
      setFormData({
        name: task.name || '',
        description: task.description || '',
        score: task.score || 5,
        importance: task.importance || 'Moyenne',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        assignedTo: task.assignedTo || '',
      });
    }
  }, [isOpen, task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    
    onSave(task.id, formData);
    onClose();
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

  if (!task) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-karla-bold text-primary">Modification de la tâche</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Nom du service
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Score d&apos;importance (1-10)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span
                    className="px-3 py-1 rounded-full font-medium text-sm text-white"
                    style={{
                      backgroundColor: scoreColors[formData.score as keyof typeof scoreColors],
                    }}
                  >
                    {formData.score}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-black"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Importance
                </label>
                <select
                  value={formData.importance}
                  onChange={e => setFormData({ ...formData, importance: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-black"
                >
                  <option value="Faible">Faible</option>
                  <option value="Moyenne">Moyenne</option>
                  <option value="Élevée">Élevée</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Échéance
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Personne assignée
                </label>
                <input
                  type="text"
                  value={formData.assignedTo}
                  onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-black"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-all"
              >
                Sauvegarder les modifications
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditTaskModal; 