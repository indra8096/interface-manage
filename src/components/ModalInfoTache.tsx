import React from 'react';

interface ModalInfoTacheProps {
  id: number;
  name: string;
  status: string;
  score: number;
  importance: string;
  description?: string;
  dueDate?: string;
  assignedTo?: string;
  createdAt?: string;
  updatedAt?: string;
  onClose: () => void;
}

const ModalInfoTache: React.FC<ModalInfoTacheProps> = ({ name, status, score, importance, description, dueDate, assignedTo, createdAt, updatedAt, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative text-black">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-primary text-xl">×</button>
        <h2 className="text-xl font-bold mb-4">Détails de la tâche</h2>
        <div className="mb-2"><span className="font-medium">Nom :</span> {name}</div>
        <div className="mb-2"><span className="font-medium">Statut :</span> {status}</div>
        <div className="mb-2"><span className="font-medium">Score :</span> {score}</div>
        <div className="mb-2"><span className="font-medium">Importance :</span> {importance}</div>
        {description && <div className="mb-2"><span className="font-medium">Description :</span> {description}</div>}
        {dueDate && <div className="mb-2"><span className="font-medium">Échéance :</span> {dueDate}</div>}
        <div className="mb-2"><span className="font-medium">Assignée à :</span> {assignedTo || 'Non assignée'}</div>
        {createdAt && <div className="mb-2"><span className="font-medium">Créée le :</span> {new Date(createdAt).toLocaleString()}</div>}
        {updatedAt && <div className="mb-2"><span className="font-medium">Modifiée le :</span> {new Date(updatedAt).toLocaleString()}</div>}
      </div>
    </div>
  );
};

export default ModalInfoTache; 