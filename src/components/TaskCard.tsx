'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ModalInfoTache from './ModalInfoTache';
import EditTaskModal from './EditTaskModal';

interface TaskCardProps {
  id: number;
  name: string;
  status: 'completed' | 'warning' | 'error';
  score: number;
  description?: string;
  importance?: string;
  dueDate?: string;
  assignedTo?: string;
  createdAt?: string;
  updatedAt?: string;
  category?: string;
  onStatusChange: (id: number, newStatus: 'completed' | 'warning' | 'error') => void;
}

const statusColors = {
  completed: '#10b981',     // Vert
  warning: '#f59e0b',       // Orange
  error: '#ef4444',         // Rouge
};

const categoryColors = {
  defensive: '#CCFF00',
  general: '#CCFF00',
  offensive: '#9933FF',
};

const TaskCard: React.FC<TaskCardProps> = ({
  id,
  name,
  status,
  score,
  description,
  importance,
  dueDate,
  assignedTo,
  createdAt,
  updatedAt,
  category,
  onStatusChange,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleComplete = async () => {
    await onStatusChange(id, 'completed');
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleImportanceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ importance: e.target.value }),
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleSaveEdit = async (taskId: number, taskData: { name: string; description: string; score: number; importance: string; dueDate: string; assignedTo: string }) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.3 }}
        className={`relative bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl border border-gray-800 hover:border-[#CCFF00] transition-all duration-300 group ${
          status === 'completed' ? 'overflow-hidden' : ''
        }`}
        style={{ 
          borderLeft: `4px solid ${category ? categoryColors[category as keyof typeof categoryColors] : statusColors[status]}`,
          boxShadow: `0 10px 25px rgba(0,0,0,0.2), 0 0 0 1px ${category ? categoryColors[category as keyof typeof categoryColors] : statusColors[status]}20`
        }}
      >
        {/* Filtre vert pour les tâches terminées */}
        {status === 'completed' && (
          <div 
            className="absolute inset-0 bg-[#10b981] bg-opacity-10 pointer-events-none z-10"
            style={{
              background: `linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))`
            }}
          />
        )}
        
        {/* Contenu de la carte */}
        <div className={`relative ${status === 'completed' ? 'z-20' : ''}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-grow">
              {/* Header avec nom et score */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-white font-karla-semibold text-sm">{name}</h3>
                  <button 
                    onClick={() => setShowInfo(true)} 
                    className="text-gray-400 hover:text-[#CCFF00] transition-colors" 
                    title="Informations"
                  >
                    <div className="w-4 h-4 rounded-full bg-gray-600 hover:bg-[#CCFF00] transition-colors"></div>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="px-3 py-1 rounded-full text-xs font-karla-bold text-black"
                    style={{ 
                      background: `linear-gradient(135deg, ${category ? categoryColors[category as keyof typeof categoryColors] : statusColors[status]}, ${category ? categoryColors[category as keyof typeof categoryColors] : statusColors[status]}80)`
                    }}
                  >
                    {score}
                  </div>
                </div>
              </div>

              {/* Section importance */}
              <div className="mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 font-karla-medium">PRIORITÉ:</span>
                  <select
                    value={importance || 'Moyenne'}
                    onChange={handleImportanceChange}
                    className="text-xs px-3 py-1 border border-gray-700 rounded-lg text-white font-karla-regular bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#CCFF00] focus:border-transparent"
                  >
                    <option value="Faible">Faible</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Élevée">Élevée</option>
                  </select>
                </div>
              </div>

              {/* Statut visuel */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ 
                      backgroundColor: status === 'completed' ? '#10b981' : 
                                     status === 'warning' ? '#f59e0b' : '#ef4444'
                    }}
                  />
                  <span className="text-xs text-gray-400 font-karla-medium uppercase">
                    {status === 'completed' ? 'Terminé' : 
                     status === 'warning' ? 'En cours' : 'En attente'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions avec design futuriste */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 rounded-lg bg-gray-800 text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black transition-all duration-200 group-hover:scale-105 border border-gray-700 hover:border-[#CCFF00]"
                title="Modifier"
              >
                <div className="w-4 h-4 rounded-full bg-current"></div>
              </button>
              <button
                onClick={handleComplete}
                className="p-2 rounded-lg bg-gray-800 text-[#10b981] hover:bg-[#10b981] hover:text-black transition-all duration-200 group-hover:scale-105 border border-gray-700 hover:border-[#10b981]"
                title="Valider"
              >
                <div className="w-4 h-4 rounded-full bg-current"></div>
              </button>
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg bg-gray-800 text-[#ef4444] hover:bg-[#ef4444] hover:text-black transition-all duration-200 group-hover:scale-105 border border-gray-700 hover:border-[#ef4444]"
                title="Supprimer"
              >
                <div className="w-4 h-4 rounded-full bg-current"></div>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {showInfo && (
        <ModalInfoTache
          id={id}
          name={name}
          status={status}
          score={score}
          importance={importance || 'Moyenne'}
          description={description}
          dueDate={dueDate}
          assignedTo={assignedTo}
          createdAt={createdAt}
          updatedAt={updatedAt}
          onClose={() => setShowInfo(false)}
        />
      )}

      {showEditModal && (
        <EditTaskModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
          task={{
            id,
            name,
            status,
            score,
            description,
            importance,
            dueDate,
            assignedTo,
            createdAt,
            updatedAt,
          }}
        />
      )}
    </>
  );
};

export default TaskCard; 