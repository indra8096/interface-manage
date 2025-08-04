'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import ModalInfoTache from './ModalInfoTache';
import TaskModal from './TaskModal';

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
        className={`relative p-6 rounded-xl border transition-all duration-300 group ${
          status === 'completed' ? 'overflow-hidden' : ''
        }`}
        style={{ 
          background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
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
                  <h3 className="font-karla-semibold text-sm transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>{name}</h3>
                  <button 
                    onClick={() => setShowInfo(true)} 
                    className="transition-colors hover:scale-110" 
                    style={{ color: 'var(--text-muted)' }}
                    title="Informations"
                  >
                    <FontAwesomeIcon icon={faInfoCircle} className="w-4 h-4" />
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
                  <span className="text-xs font-karla-medium transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>PRIORITÉ:</span>
                  <select
                    value={importance || 'Moyenne'}
                    onChange={handleImportanceChange}
                    className="text-xs px-3 py-1 border rounded-lg font-karla-regular focus:outline-none focus:ring-2 focus:ring-[#CCFF00] focus:border-transparent transition-colors duration-300"
                    style={{
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-primary)'
                    }}
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
                  <span className="text-xs font-karla-medium uppercase transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>
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
                 className="p-2 rounded-lg transition-all duration-200 group-hover:scale-105"
                 style={{
                   background: 'var(--bg-secondary)',
                   color: '#CCFF00',
                   border: '1px solid var(--border-primary)'
                 }}
                 title="Modifier"
               >
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                   <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                 </svg>
               </button>
                             <button
                 onClick={handleComplete}
                 className="p-2 rounded-lg transition-all duration-200 group-hover:scale-105"
                 style={{
                   background: 'var(--bg-secondary)',
                   color: '#10b981',
                   border: '1px solid var(--border-primary)'
                 }}
                 title="Valider"
               >
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                 </svg>
               </button>
                             <button
                 onClick={handleDelete}
                 className="p-2 rounded-lg transition-all duration-200 group-hover:scale-105"
                 style={{
                   background: 'var(--bg-secondary)',
                   color: '#ef4444',
                   border: '1px solid var(--border-primary)'
                 }}
                 title="Supprimer"
               >
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                 </svg>
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
        <TaskModal
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
          mode="edit"
        />
      )}
    </>
  );
};

export default TaskCard; 