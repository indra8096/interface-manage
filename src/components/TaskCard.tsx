'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faCheck, faUser, faUserTie, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import TaskModal from './TaskModal';

// Composant Switch personnalisé
const Switch = ({ checked, onChange, disabled = false }: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) => {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      } ${
        checked 
          ? 'bg-green-500 focus:ring-green-500' 
          : 'bg-gray-300 focus:ring-gray-400'
      }`}
      style={{
        boxShadow: checked ? '0 0 0 2px rgba(34, 197, 94, 0.2)' : '0 0 0 2px rgba(156, 163, 175, 0.2)'
      }}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

interface TaskCardProps {
  id: number;
  name: string;
  status: 'completed' | 'warning' | 'error';
  score: number;
  description?: string;
  importance?: string;
  dueDate?: string;
  assignedTo?: string;
  assignedBy?: string; // Nouveau : qui a assigné la tâche
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string; // Nouveau : date de fin
  category?: string;
  onStatusChange: (id: number, newStatus: 'completed' | 'warning' | 'error') => void;
  userRole?: string;
}

const statusColors = {
  completed: '#10b981',     // Vert pour terminé
  warning: '#f59e0b',       // Orange pour en cours
  error: '#ef4444',         // Rouge pour en attente
};

const categoryColors = {
  defensive: '#9933FF',
  general: '#9933FF',
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
  assignedBy,
  createdAt,
  updatedAt,
  completedAt,
  category,
  onStatusChange,
  userRole = 'user',
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleComplete = async () => {
    await onStatusChange(id, 'completed');
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        window.location.reload();
      } else {
        console.error('Erreur lors de la suppression:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleSaveEdit = async (taskId: number, taskData: { name: string; description: string; score: number; importance: string; dueDate: string; assignedTo: string }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        console.error('Erreur lors de la mise à jour:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  // Formatage de la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Déterminer si la tâche est terminée
  const isCompleted = status === 'completed';

  // Si la tâche n'est pas visible, ne pas l'afficher
  if (!isVisible) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.3 }}
        className={`relative p-4 rounded-xl border transition-all duration-300 group ${
          isCompleted ? 'opacity-75' : ''
        }`}
        style={{ 
          background: isCompleted ? 'var(--bg-secondary)' : 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
          borderLeft: `4px solid ${category ? categoryColors[category as keyof typeof categoryColors] : statusColors[status]}`,
          boxShadow: `0 8px 20px rgba(0,0,0,0.15), 0 0 0 1px ${category ? categoryColors[category as keyof typeof categoryColors] : statusColors[status]}20`
        }}
      >
        {/* Filtre grisé pour les tâches terminées */}
        {isCompleted && (
          <div 
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: `linear-gradient(135deg, rgba(107, 114, 128, 0.1), rgba(107, 114, 128, 0.05))`
            }}
          />
        )}
        
        {/* Contenu de la carte */}
        <div className={`relative ${isCompleted ? 'z-20' : ''}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-grow min-w-0">
              {/* Header avec nom et score */}
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-karla-bold text-base transition-colors duration-300 ${isCompleted ? 'line-through' : ''}`} style={{ color: 'var(--text-primary)' }}>
                  {name}
                </h3>
                <div className="flex items-center gap-2">
                  {/* Switch Afficher */}
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon 
                      icon={isVisible ? faEye : faEyeSlash} 
                      className="w-3 h-3" 
                      style={{ color: 'var(--text-muted)' }}
                    />
                    <Switch 
                      checked={isVisible} 
                      onChange={setIsVisible}
                    />
                  </div>
                  
                  {/* Toggle pour l'accordéon */}
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1 rounded-full transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                    style={{ color: 'var(--text-muted)' }}
                    title={isExpanded ? "Réduire" : "Développer"}
                  >
                    <FontAwesomeIcon 
                      icon={isExpanded ? faChevronUp : faChevronDown} 
                      className="w-3 h-3" 
                    />
                  </button>
                </div>
              </div>

              {/* Informations sur les assignations */}
              <div className="mb-3 space-y-2">
                {/* Assigné par */}
                {assignedBy && (
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faUserTie} className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                    <span className="text-xs font-karla-medium transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>
                      Assigné par: <span className="font-karla-semibold">{assignedBy}</span>
                    </span>
                  </div>
                )}
                
                {/* Assigné à */}
                {assignedTo && (
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faUser} className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                    <span className="text-xs font-karla-medium transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>
                      Assigné à: <span className="font-karla-semibold">{assignedTo}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Priorité (lecture seule) */}
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-karla-medium transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>PRIORITÉ:</span>
                  <span className="text-xs px-2 py-1 rounded-lg font-karla-semibold transition-colors duration-300" style={{
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-primary)'
                  }}>
                    {importance || 'Moyenne'}
                  </span>
                </div>
              </div>

              {/* Statut visuel */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ 
                      backgroundColor: statusColors[status]
                    }}
                  />
                  <span className="text-xs font-karla-medium uppercase transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>
                    {status === 'completed' ? 'Terminé' : 
                     status === 'warning' ? 'En cours' : 'En attente'}
                  </span>
                </div>
                
                {/* Date de fin pour les tâches terminées */}
                {isCompleted && completedAt && (
                  <span className="text-xs font-karla-medium transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>
                    Terminé le {formatDate(completedAt)}
                  </span>
                )}
              </div>

              {/* Menu accordéon */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t pt-3 mt-3"
                    style={{ borderColor: 'var(--border-primary)' }}
                  >
                    {/* Description */}
                    {description && (
                      <div className="mb-3">
                        <h4 className="text-xs font-karla-semibold mb-2 transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>
                          DESCRIPTION
                        </h4>
                        <p className="text-sm font-karla-regular transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>
                          {description}
                        </p>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="space-y-2">
                      {dueDate && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-karla-medium transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>
                            Échéance: <span className="font-karla-semibold">{formatDate(dueDate)}</span>
                          </span>
                        </div>
                      )}
                      
                      {createdAt && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-karla-medium transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>
                            Créé le: <span className="font-karla-semibold">{formatDate(createdAt)}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions avec design futuriste */}
            <div className="flex flex-col gap-2">
              {/* Bouton Modifier */}
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 rounded-lg transition-all duration-200 group-hover:scale-105"
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--theme-primary)',
                  border: '1px solid var(--border-primary)'
                }}
                title="Modifier"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>

              {/* Bouton Valider (rond) */}
              <button
                onClick={handleComplete}
                disabled={isCompleted}
                className={`p-2 rounded-full transition-all duration-200 group-hover:scale-105 ${
                  isCompleted ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                }`}
                style={{
                  background: isCompleted ? 'var(--bg-secondary)' : 'var(--bg-secondary)',
                  color: isCompleted ? 'var(--text-muted)' : 'var(--theme-primary)',
                  border: '1px solid var(--border-primary)'
                }}
                title={isCompleted ? "Déjà terminé" : "Marquer comme terminé"}
              >
                <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
              </button>

              {/* Bouton Supprimer (admin seulement) */}
              {(userRole === 'admin' || userRole === 'SUPER_ADMIN' || userRole === 'COMPANY_ADMIN') && (
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-lg transition-all duration-200 group-hover:scale-105"
                  style={{
                    background: 'var(--bg-secondary)',
                    color: 'var(--theme-primary)',
                    border: '1px solid var(--border-primary)'
                  }}
                  title="Supprimer"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

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