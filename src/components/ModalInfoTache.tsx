'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ModalInfoTacheProps {
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
  onClose: () => void;
}

const statusColors = {
  completed: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
};

const statusLabels = {
  completed: 'TERMINÉ',
  warning: 'EN COURS',
  error: 'EN ATTENTE',
};

export default function ModalInfoTache({
  id,
  name,
  status,
  score,
  importance,
  description,
  dueDate,
  assignedTo,
  createdAt,
  updatedAt,
  onClose,
}: ModalInfoTacheProps) {
  return (
    <AnimatePresence>
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
          className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 w-full max-w-lg border border-gray-800 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-karla-bold text-white">
              <span className="bg-gradient-to-r from-[#CCFF00] to-[#9933FF] bg-clip-text text-transparent">
                INFORMATIONS SERVICE
              </span>
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-[#CCFF00] transition-colors p-2 rounded-lg hover:bg-gray-800"
            >
              <div className="w-6 h-6 rounded-full bg-current"></div>
            </button>
          </div>

          <div className="space-y-6">
            {/* En-tête avec nom et statut */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-gray-700">
              <div>
                <h3 className="text-xl font-karla-bold text-white mb-2">{name}</h3>
                <div className="flex items-center gap-3">
                  <div 
                    className="px-3 py-1 rounded-full text-xs font-karla-bold text-black"
                    style={{ backgroundColor: statusColors[status] }}
                  >
                    {statusLabels[status]}
                  </div>
                  <div 
                    className="px-3 py-1 rounded-full text-xs font-karla-bold text-black"
                    style={{ 
                      background: `linear-gradient(135deg, #CCFF00, #9933FF)`
                    }}
                  >
                    SCORE: {score}
                  </div>
                </div>
              </div>
            </div>

            {/* Informations détaillées */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-gray-700">
                <h4 className="text-sm font-karla-semibold text-[#CCFF00] mb-3">PRIORITÉ</h4>
                <p className="text-white font-karla-regular">{importance || 'Non définie'}</p>
              </div>

              <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-gray-700">
                <h4 className="text-sm font-karla-semibold text-[#CCFF00] mb-3">ASSIGNÉ À</h4>
                <p className="text-white font-karla-regular">{assignedTo || 'Non assigné'}</p>
              </div>

              <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-gray-700">
                <h4 className="text-sm font-karla-semibold text-[#CCFF00] mb-3">ÉCHÉANCE</h4>
                <p className="text-white font-karla-regular">
                  {dueDate ? new Date(dueDate).toLocaleDateString('fr-FR') : 'Non définie'}
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-gray-700">
                <h4 className="text-sm font-karla-semibold text-[#CCFF00] mb-3">ID SERVICE</h4>
                <p className="text-white font-karla-regular">#{id}</p>
              </div>
            </div>

            {/* Description */}
            {description && (
              <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-gray-700">
                <h4 className="text-sm font-karla-semibold text-[#CCFF00] mb-3">DESCRIPTION</h4>
                <p className="text-white font-karla-regular">{description}</p>
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-gray-700">
                <h4 className="text-sm font-karla-semibold text-[#CCFF00] mb-3">CRÉÉ LE</h4>
                <p className="text-white font-karla-regular">
                  {createdAt ? new Date(createdAt).toLocaleDateString('fr-FR') : 'Non disponible'}
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-gray-700">
                <h4 className="text-sm font-karla-semibold text-[#CCFF00] mb-3">MODIFIÉ LE</h4>
                <p className="text-white font-karla-regular">
                  {updatedAt ? new Date(updatedAt).toLocaleDateString('fr-FR') : 'Non disponible'}
                </p>
              </div>
            </div>

            {/* Bouton de fermeture */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full py-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl font-karla-bold hover:from-[#CCFF00] hover:to-[#9933FF] hover:text-black transition-all duration-300 border border-gray-600 hover:border-transparent"
            >
              FERMER
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 