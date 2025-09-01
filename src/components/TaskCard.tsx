'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faCheck, faUser, faUserTie, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
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
  assignedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
  category?: string;
  onStatusChange: (id: number, newStatus: 'completed' | 'warning' | 'error') => void;
  userRole?: string;
  currentUserName?: string;
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
  currentUserName,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [optimisticDone, setOptimisticDone] = useState(false);
  const [optimisticCompletedAt, setOptimisticCompletedAt] = useState<string | null>(null);

  const handleComplete = async () => {
    if (isCompleted || optimisticDone) return;
    const nowIso = new Date().toISOString();
    setOptimisticDone(true);
    setOptimisticCompletedAt(nowIso);
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
  const isAdmin = userRole === 'admin' || userRole === 'SUPER_ADMIN' || userRole === 'COMPANY_ADMIN';
  const effectiveCompleted = isCompleted || optimisticDone;
  const effectiveCompletedAt = completedAt || optimisticCompletedAt || undefined;
  
  // Vérifier si la tâche est assignée à l'utilisateur connecté
  const isAssignedToCurrentUser = currentUserName && assignedTo && 
    (assignedTo.toLowerCase().includes(currentUserName.toLowerCase()) || 
     currentUserName.toLowerCase().includes(assignedTo.toLowerCase()));

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.3 }}
        className={`relative p-3 rounded-xl border transition-all duration-300 group ${
          effectiveCompleted ? 'opacity-60 grayscale' : ''
        }`}
        style={{ 
          background: effectiveCompleted ? 'var(--bg-secondary)' : 'var(--bg-card)',
          border: isAssignedToCurrentUser ? '1px solid #CCFF00' : '1px solid var(--border-primary)',
          borderLeft: `4px solid ${category ? categoryColors[category as keyof typeof categoryColors] : statusColors[status]}`,
          boxShadow: isAssignedToCurrentUser ? 
            `0 4px 12px rgba(204, 255, 0, 0.15), 0 0 0 1px rgba(204, 255, 0, 0.3)` :
            `0 6px 15px rgba(0,0,0,0.12), 0 0 0 1px ${category ? categoryColors[category as keyof typeof categoryColors] : statusColors[status]}20`
        }}
      >
        {/* Badge "ASSIGNÉ" - Design épuré */}
        {isAssignedToCurrentUser && !effectiveCompleted && (
          <div className="absolute top-2 right-2 z-30">
            <div className="bg-[#CCFF00] text-black px-2 py-0.5 rounded-md text-xs font-karla-medium shadow-sm">
              assigné
            </div>
          </div>
        )}

        {/* Filtre grisé pour les tâches terminées */}
        {effectiveCompleted && (
          <div 
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.6), rgba(31, 41, 55, 0.4))'
            }}
          />
        )}
        
        {/* Contenu de la carte */}
        <div className={`relative ${effectiveCompleted ? 'z-20' : ''}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-grow min-w-0">
              {/* Header avec nom */}
              <div className="mb-2">
                <h3 className={`font-karla-bold text-base transition-colors duration-300 ${effectiveCompleted ? 'line-through' : ''}`} style={{ color: 'var(--text-primary)' }}>
                  {name}
                </h3>
              </div>

              {/* Statut visuel et personne assignée */}
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ 
                      backgroundColor: effectiveCompleted ? statusColors['completed'] : statusColors[status]
                    }}
                  />
                  <span className="text-xs font-karla-medium uppercase transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>
                    {effectiveCompleted 
                      ? `Terminé${effectiveCompletedAt ? ` le ${formatDate(effectiveCompletedAt)}` : ''}` 
                      : status === 'warning' 
                        ? 'En cours' 
                        : 'En attente'}
                  </span>
                </div>
                
                {/* Personne assignée juste en dessous du statut */}
                {assignedTo && (
                  <div className="flex items-center gap-1 ml-4">
                    <FontAwesomeIcon icon={faUser} className="w-2 h-3" style={{ color: 'var(--text-muted)' }} />
                    <span className="text-xs font-karla-medium transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>
                      {assignedTo}
                    </span>
                  </div>
                )}
                
                
              </div>
            </div>

            {/* Bouton rond à coche et flèche accordéon alignés verticalement */}
            <div className="flex flex-col items-center gap-2">
              {/* Bouton rond à coche (plus petit) */}
              <button
                onClick={handleComplete}
                disabled={effectiveCompleted}
                className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                  effectiveCompleted 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-gray-400 hover:border-green-500 hover:bg-green-50'
                }`}
                title={isCompleted ? "Déjà terminé" : "Marquer comme terminé"}
              >
                {effectiveCompleted && <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />}
              </button>

              {/* Flèche accordéon alignée verticalement */}
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
                {/* Informations sur l'assignateur */}
                {assignedBy && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faUserTie} className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                      <span className="text-xs font-karla-medium transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>
                        Assigné par: <span className="font-karla-semibold">{assignedBy}</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Priorité */}
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
                <div className="space-y-2 mb-3">
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

                {/* Actions pour les admins */}
                {isAdmin && (
                  <div className="flex gap-2 pt-3 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                      style={{
                        background: 'var(--bg-secondary)',
                        color: 'var(--theme-primary)',
                        border: '1px solid var(--border-primary)'
                      }}
                      title="Modifier"
                    >
                      <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
                      <span className="text-xs font-karla-medium">Modifier</span>
                    </button>

                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                      style={{
                        background: 'var(--bg-secondary)',
                        color: '#ef4444',
                        border: '1px solid var(--border-primary)'
                      }}
                      title="Supprimer"
                    >
                      <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                      <span className="text-xs font-karla-medium">Supprimer</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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