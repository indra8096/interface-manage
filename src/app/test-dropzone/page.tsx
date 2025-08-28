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
          Test des Nouvelles TaskCard Refaites
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
            Nouvelles Fonctionnalités Implémentées (Version 3)
          </h2>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <li>✅ <strong>Bouton rond à coche plus petit</strong> (w-6 h-6 au lieu de w-8 h-8)</li>
            <li>✅ <strong>Flèche accordéon alignée verticalement</strong> avec le bouton rond à coche</li>
            <li>✅ <strong>Hauteur des cards encore réduite</strong> (p-3 au lieu de p-4)</li>
            <li>✅ <strong>Personne assignée affichée sous le statut</strong> et pas dans l'accordéon</li>
            <li>✅ <strong>Interface plus compacte</strong> avec moins d'espacement</li>
            <li>✅ <strong>Boutons d'action alignés</strong> verticalement à droite</li>
            <li>✅ <strong>Accordéon simplifié</strong> sans les informations d'assignation</li>
          </ul>
        </div>

        <div className="mt-6 p-6 rounded-xl border" style={{ 
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)'
        }}>
          <h3 className="text-lg font-karla-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Instructions de Test (Version 3)
          </h3>
          <ol className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <li>1. <strong>Vérifiez que le bouton rond à coche</strong> est plus petit (6x6 au lieu de 8x8)</li>
            <li>2. <strong>Vérifiez que la flèche accordéon</strong> est alignée verticalement avec le bouton rond</li>
            <li>3. <strong>Vérifiez que la personne assignée</strong> apparaît juste sous le statut (En cours/Terminé)</li>
            <li>4. <strong>Vérifiez que la personne assignée</strong> n'apparaît plus dans l'accordéon</li>
            <li>5. <strong>Vérifiez que les cards sont plus compactes</strong> avec moins d'espacement</li>
            <li>6. <strong>Testez l'accordéon</strong> : il ne doit contenir que l'assignateur, priorité, description et dates</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
