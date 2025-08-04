import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faInfoCircle, faEdit } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import ModalInfoTache from './ModalInfoTache';
import EditTaskModal from './EditTaskModal';

interface TaskCardProps {
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
  category?: string;
  onStatusChange: (id: number, newStatus: 'completed' | 'warning' | 'error') => void;
}



const statusColors = {
  completed: '#16a34a', // Vert
  warning: '#eab308',   // Jaune
  error: '#dc2626',     // Rouge
};

const categoryColors = {
  defensive: '#2563eb', // Bleu
  general: '#16a34a',   // Vert
  offensive: '#dc2626', // Rouge
};

const TaskCard: React.FC<TaskCardProps> = ({
  id,
  name,
  status,
  score,
  importance = 'Moyenne',
  description,
  dueDate,
  assignedTo,
  createdAt,
  updatedAt,
  category,
  onStatusChange,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleComplete = () => onStatusChange(id, 'completed');
  const handleDelete = async () => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    // Optionnel : appeler onStatusChange ou déclencher un rafraîchissement des tâches
    if (typeof window !== 'undefined') window.location.reload();
  };

  const handleImportanceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ importance: e.target.value }),
    });
    // Recharger la page pour voir les changements
    window.location.reload();
  };

  const handleSaveEdit = async (taskId: number, taskData: { name: string; description: string; score: number; importance: string; dueDate: string; assignedTo: string }) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      
      if (response.ok) {
        // Fermer la modal
        setShowEditModal(false);
        // Recharger la page pour voir les changements
        window.location.reload();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="bg-task-bg p-4 rounded-md shadow-custom border-l-4 hover:shadow-custom-hover transition-all duration-300"
      style={{ borderLeftColor: category ? categoryColors[category as keyof typeof categoryColors] : statusColors[status] }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-primary font-karla-semibold">{name}</h3>
            <button onClick={() => setShowInfo(true)} className="text-blue-500 hover:text-blue-700" title="Informations">
              <FontAwesomeIcon icon={faInfoCircle} />
            </button>
          </div>
                     <div className="mb-2">
             <label className="text-xs text-gray-500 mr-2 font-karla-regular">Importance :</label>
                            <select
                 value={importance || 'Moyenne'}
                 onChange={handleImportanceChange}
                 className="text-xs px-2 py-1 border rounded text-black font-karla-regular"
               >
               <option value="Faible">Faible</option>
               <option value="Moyenne">Moyenne</option>
               <option value="Élevée">Élevée</option>
             </select>
           </div>
                     <div className="text-xs text-gray-500 font-karla-regular">
             Score: <span className="font-karla-semibold">{score}</span>
           </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <button
            onClick={() => setShowEditModal(true)}
            className="text-blue-600 hover:opacity-80 text-xl"
            title="Modifier"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button
            onClick={handleComplete}
            className="text-green-600 hover:opacity-80 text-xl"
            title="Valider"
          >
            <FontAwesomeIcon icon={faCheckCircle} />
          </button>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:opacity-80 text-xl"
            title="Supprimer"
          >
            <FontAwesomeIcon icon={faTimesCircle} />
          </button>
        </div>
      </div>
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
      
             <EditTaskModal
         isOpen={showEditModal}
         onClose={() => setShowEditModal(false)}
         onSave={handleSaveEdit}
         task={{
           id,
           name,
           status,
           score,
           importance: importance || 'Moyenne',
           description,
           dueDate,
           assignedTo,
           createdAt,
           updatedAt,
         }}
       />
    </motion.div>
  );
};

export default TaskCard; 