'use client';

import { useState } from 'react';
import TaskCard from '../../components/TaskCard';

export default function TestDropzonePage() {
  const [tasks] = useState([
    {
      id: 1,
      name: 'Audit de sécurité réseau',
      status: 'warning' as const,
      score: 8,
      description: 'Analyse complète de la sécurité du réseau d\'entreprise avec tests de pénétration',
      importance: 'Élevée',
      dueDate: '2024-12-15',
      assignedTo: 'Jean Dupont',
      assignedBy: 'Marie Martin',
      createdAt: '2024-11-01',
      updatedAt: '2024-11-15',
      category: 'defensive' as const,
    },
    {
      id: 2,
      name: 'Mise à jour des pare-feu',
      status: 'completed' as const,
      score: 6,
      description: 'Installation des dernières mises à jour de sécurité sur tous les pare-feu',
      importance: 'Moyenne',
      dueDate: '2024-11-10',
      assignedTo: 'Pierre Durand',
      assignedBy: 'Marie Martin',
      createdAt: '2024-10-15',
      updatedAt: '2024-11-08',
      completedAt: '2024-11-08',
      category: 'defensive' as const,
    },
    {
      id: 3,
      name: 'Formation sécurité utilisateurs',
      status: 'error' as const,
      score: 4,
      description: 'Organisation de sessions de formation sur la sécurité pour tous les employés',
      importance: 'Faible',
      dueDate: '2024-12-30',
      assignedTo: 'Sophie Bernard',
      assignedBy: 'Marie Martin',
      createdAt: '2024-11-01',
      updatedAt: '2024-11-01',
      category: 'general' as const,
    },
  ]);

  const handleStatusChange = async (id: number, newStatus: 'completed' | 'warning' | 'error') => {
    console.log(`Changement de statut pour la tâche ${id} vers ${newStatus}`);
    // Ici vous pourriez appeler votre API pour mettre à jour le statut
  };

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-karla-bold mb-8 text-center" style={{ color: 'var(--text-primary)' }}>
          Test des Nouvelles TaskCard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div key={task.id} className="w-full">
              <TaskCard
                {...task}
                onStatusChange={handleStatusChange}
                userRole="admin"
              />
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-xl border" style={{ 
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)'
        }}>
          <h2 className="text-xl font-karla-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Nouvelles Fonctionnalités Implémentées
          </h2>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <li>✅ Tâches terminées affichées en grisé avec date de fin</li>
            <li>✅ Informations sur les assignations (assigné par/à)</li>
            <li>✅ Priorité en lecture seule (plus de modification directe)</li>
            <li>✅ Menu accordéon pour afficher plus d'informations</li>
            <li>✅ Titres agrandis et hauteur des cards réduite</li>
            <li>✅ Bouton Valider remplacé par un rond avec icône</li>
            <li>✅ Switch personnalisé pour l'option "Afficher"</li>
            <li>✅ Suppression de l'icône info (remplacée par l'accordéon)</li>
            <li>✅ Gestion intelligente des permissions admin/employé</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
