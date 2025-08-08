'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import TaskColumn from '@/components/TaskColumn';

import ServicesSidebar from '@/components/ServicesSidebar';
import CategoryDetailsPanel from '@/components/CategoryDetailsPanel';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import PanelCard from '../../components/PanelCard';
import { AnimatePresence } from 'framer-motion';

interface Task {
  id: number;
  name: string;
  status: 'completed' | 'warning' | 'error';
  score: number;
  category: string;
  description?: string;
  importance?: string;
  dueDate?: string;
  assignedTo?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ServiceCard {
  id: string;
  name: string;
  description: string;
  category: 'defensive' | 'general' | 'offensive';
  icon: string;
  defaultScore: number;
  defaultImportance: string;
}

interface PanelCardData {
  name: string;
  type: 'coverage' | 'infrastructure' | 'compliance' | 'recommendation';
  total?: number;
  completed?: number;
  equipmentCount?: number;
  status?: string;
  certificationDate?: string;
  nextAudit?: string;
  priority?: string;
  description?: string;
  deadline?: string;
  category?: 'defensive' | 'general' | 'offensive';
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('user');
  const [tasksAddedFromPanel, setTasksAddedFromPanel] = useState<Array<{
    name: string;
    description: string;
    importance: string;
    category: string;
    score: number;
    dueDate: string;
    assignedTo: string;
  }>>([]);
  const [panelCards, setPanelCards] = useState<Record<string, PanelCardData>>({});
  const [renderKey, setRenderKey] = useState(0); // Pour forcer le re-rendu des cartes

  const [isServicesSidebarOpen, setIsServicesSidebarOpen] = useState(false);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false); // Nouvel état pour la popup d'historique
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; taskId?: number; taskName?: string; type: 'regular' | 'panel' }>({ show: false, type: 'regular' });
  const router = useRouter();

  // Charger les tâches depuis l'API
  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Pas de token trouvé');
        return;
      }

      const response = await fetch('/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else if (response.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les cartes de panel depuis l'API
  const fetchPanelCards = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Pas de token trouvé');
        return;
      }

      const response = await fetch('/api/panel_cards', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Convertir les cartes de panel en format compatible avec le localStorage
        const panelCardsData: Record<string, PanelCardData> = {};
        data.panelCards.forEach((card: {
          name: string;
          type: string;
          category: string;
          total: number;
          completed: number;
          equipmentCount: number;
          status: string;
          certificationDate: string;
          nextAudit: string;
          priority: string;
          description: string;
          deadline: string;
        }) => {
          panelCardsData[card.name] = {
            name: card.name,
            type: card.type as 'coverage' | 'infrastructure' | 'compliance' | 'recommendation',
            category: card.category as 'defensive' | 'general' | 'offensive',
            total: card.total,
            completed: card.completed,
            equipmentCount: card.equipmentCount,
            status: card.status,
            certificationDate: card.certificationDate,
            nextAudit: card.nextAudit,
            priority: card.priority,
            description: card.description,
            deadline: card.deadline,
          };
        });
        setPanelCards(panelCardsData);
      } else if (response.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des cartes de panel:', error);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      const companyId = localStorage.getItem('companyId');
      const userCompanyId = localStorage.getItem('userCompanyId');
      const savedTasksFromPanel = localStorage.getItem(`tasksAddedFromPanel_${companyId}`);
      const savedPanelCards = localStorage.getItem(`panelCards_${companyId}`);
      
      if (!token) {
        router.push('/login');
        return;
      }

      // Vérification de sécurité : l'utilisateur ne peut accéder qu'à son entreprise
      if (companyId && userCompanyId && companyId !== userCompanyId) {
        console.error('Tentative d\'accès non autorisé à une autre entreprise');
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      // Vérification du rôle : seuls COMPANY_ADMIN et COMPANY_USER peuvent accéder
      if (role === 'SUPER_ADMIN') {
        router.push('/superadmin');
        return;
      }

      if (role) {
        // Conversion des rôles pour le dashboard
        if (role === 'SUPER_ADMIN' || role === 'COMPANY_ADMIN') {
          setUserRole('admin'); // Accès complet : services, panel de suivi, etc.
        } else if (role === 'COMPANY_USER') {
          setUserRole('user'); // Accès limité : seulement les tâches
        }
      }

      if (savedTasksFromPanel) {
        try {
          const parsedTasks = JSON.parse(savedTasksFromPanel);
          setTasksAddedFromPanel(parsedTasks);
        } catch (error) {
          console.error('Erreur lors du chargement des tâches du panneau:', error);
        }
      }
      if (savedPanelCards) {
        try {
          const parsedCards = JSON.parse(savedPanelCards);
          setPanelCards(parsedCards);
        } catch (error) {
          console.error('Erreur lors du chargement des cartes du panneau:', error);
        }
      }
    }
  }, [router]);

  useEffect(() => {
    fetchTasks();
    fetchPanelCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Synchronisation avec les données du panel
  useEffect(() => {
    let lastPanelCards = '';
    let lastTasksFromPanel = '';

    const syncPanelData = () => {
      if (typeof window !== 'undefined') {
        const companyId = localStorage.getItem('companyId');
        
        // Vérifier les changements dans panelCards
        const savedPanelCards = localStorage.getItem(`panelCards_${companyId}`);
        if (savedPanelCards && savedPanelCards !== lastPanelCards) {
          console.log('Changement détecté dans panelCards');
          lastPanelCards = savedPanelCards;
          try {
            const parsedCards = JSON.parse(savedPanelCards);
            console.log('Synchronisation - Cartes mises à jour:', parsedCards);
            setPanelCards(parsedCards);
            setRenderKey(prev => prev + 1);
          } catch (error) {
            console.error('Erreur lors de la synchronisation des cartes du panneau:', error);
          }
        }

        // Vérifier les changements dans tasksAddedFromPanel
        const savedTasksFromPanel = localStorage.getItem(`tasksAddedFromPanel_${companyId}`);
        if (savedTasksFromPanel && savedTasksFromPanel !== lastTasksFromPanel) {
          console.log('Changement détecté dans tasksAddedFromPanel');
          lastTasksFromPanel = savedTasksFromPanel;
          try {
            const parsedTasks = JSON.parse(savedTasksFromPanel);
            console.log('Synchronisation - Tâches mises à jour:', parsedTasks);
            setTasksAddedFromPanel(parsedTasks);
            setRenderKey(prev => prev + 1);
          } catch (error) {
            console.error('Erreur lors de la synchronisation des tâches du panneau:', error);
          }
        }
      }
    };

    // Synchroniser immédiatement
    syncPanelData();

    // Vérifier les changements toutes les 500ms pour une synchronisation plus rapide
    const interval = setInterval(syncPanelData, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleAddTask = (taskData: { name: string; score: number; category: string; description: string; importance: string; dueDate: string; assignedTo: string }) => {
    handleCreateTask(taskData);
  };

  const handleAddTaskFromPanel = (taskData: { name: string; score: number; category: string; description: string; importance: string; dueDate: string; assignedTo: string }) => {
    const companyId = localStorage.getItem('companyId');
    // Ne pas appeler handleCreateTask pour éviter l'ajout dans les TaskColumns
    // Marquer cette tâche comme ajoutée depuis le panneau
    const updatedTasks = [...tasksAddedFromPanel, taskData];
    setTasksAddedFromPanel(updatedTasks);
    // Sauvegarder dans localStorage
    localStorage.setItem(`tasksAddedFromPanel_${companyId}`, JSON.stringify(updatedTasks));
  };

  const removeTaskFromPanel = (taskName: string) => {
    const companyId = localStorage.getItem('companyId');
    const updatedTasks = tasksAddedFromPanel.filter(task => task.name !== taskName);
    setTasksAddedFromPanel(updatedTasks);
    localStorage.setItem(`tasksAddedFromPanel_${companyId}`, JSON.stringify(updatedTasks));
  };

  const handleStatusChange = async (id: number, newStatus: 'completed' | 'warning' | 'error') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Pas de token trouvé');
        return;
      }

      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === id ? { ...task, status: newStatus } : task
          )
        );
      } else if (response.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const handleCreateTask = async (taskData: { name: string; score: number; category: string; description: string; importance: string; dueDate: string; assignedTo: string }) => {
    try {
      // Créer une tâche temporaire avec un ID temporaire pour l'affichage immédiat
      const tempTask: Task = {
        id: Date.now(), // ID temporaire
        name: taskData.name,
        status: 'warning', // Statut par défaut
        score: taskData.score,
        category: taskData.category,
        description: taskData.description,
        importance: taskData.importance,
        dueDate: taskData.dueDate,
        assignedTo: taskData.assignedTo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Ajouter immédiatement la tâche à l'interface
      setTasks(prevTasks => [tempTask, ...prevTasks]);

      // Ensuite, envoyer à l'API en arrière-plan
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Pas de token trouvé');
        return;
      }

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...taskData,
        }),
      });

      if (response.ok) {
        const newTask = await response.json();
        // Remplacer la tâche temporaire par la vraie tâche de l'API
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === tempTask.id ? newTask : task
          )
        );
      }
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
    }
  };

  const handleDropService = (service: ServiceCard, targetCategory: 'defensive' | 'general' | 'offensive') => {
    console.log('=== handleDropService appelé ===');
    console.log('Service déposé:', service.name, 'dans la catégorie:', targetCategory);
    console.log('Service complet:', service);
    
    // Créer automatiquement une nouvelle tâche basée sur le service glissé
    const newTaskData = {
      name: service.name,
      score: service.defaultScore,
      category: targetCategory,
      description: service.description,
      importance: service.defaultImportance,
      dueDate: '',
      assignedTo: '',
    };

    console.log('Nouvelle tâche à créer:', newTaskData);
    console.log('Appel de handleCreateTask...');
    
    // Appeler handleCreateTask pour créer la nouvelle tâche
    handleCreateTask(newTaskData);
    
    console.log('✅ handleDropService terminé avec succès');
  };

  const getTasksByCategory = (category: string) => {
    return tasks.filter(task => task.category === category);
  };

  const getCardData = (taskName: string) => {
    // Récupérer les données de la carte depuis le localStorage du panel
    return panelCards[taskName] || null;
  };

  const getCategoryFromTask = (taskName: string) => {
    // Déterminer la catégorie basée sur le nom de la tâche ou utiliser une valeur par défaut
    const cardData = getCardData(taskName);
    if (cardData && cardData.category) {
      return cardData.category;
    }
    
    // Si pas de catégorie dans les données, déterminer basé sur le type de carte
    if (cardData && cardData.type) {
      const typeToCategoryMap: Record<string, 'defensive' | 'general' | 'offensive'> = {
        'coverage': 'defensive',      // Couverture = défensif
        'infrastructure': 'defensive', // Infrastructure = défensif
        'compliance': 'general',      // Conformité = général
        'recommendation': 'general'   // Recommandations = général
      };
      
      return typeToCategoryMap[cardData.type] || 'general';
    }
    
    // Valeur par défaut basée sur le contexte
    return 'general';
  };

  // Fonction pour forcer la synchronisation des données du panel
  const forceSyncPanelData = () => {
    console.log('ForceSyncPanelData appelé - Synchronisation immédiate');
    if (typeof window !== 'undefined') {
      const companyId = localStorage.getItem('companyId');
      // Forcer la récupération immédiate des données
      const savedPanelCards = localStorage.getItem(`panelCards_${companyId}`);
      const savedTasksFromPanel = localStorage.getItem(`tasksAddedFromPanel_${companyId}`);
      
      console.log('Données actuelles - panelCards:', savedPanelCards);
      console.log('Données actuelles - tasksAddedFromPanel:', savedTasksFromPanel);
      
      if (savedPanelCards && savedPanelCards !== 'null') {
        try {
          const parsedCards = JSON.parse(savedPanelCards);
          console.log('Mise à jour immédiate des cartes:', parsedCards);
          setPanelCards(parsedCards);
        } catch (error) {
          console.error('Erreur lors de la synchronisation des cartes:', error);
        }
      }

      if (savedTasksFromPanel && savedTasksFromPanel !== 'null') {
        try {
          const parsedTasks = JSON.parse(savedTasksFromPanel);
          console.log('Mise à jour immédiate des tâches:', parsedTasks);
          setTasksAddedFromPanel(parsedTasks);
        } catch (error) {
          console.error('Erreur lors de la synchronisation des tâches:', error);
        }
      }
      
      // Forcer le re-rendu immédiat
      setRenderKey(prev => {
        const newKey = prev + 1;
        console.log('Nouveau renderKey:', newKey);
        return newKey;
      });
    }
  };

  // Fonction pour récupérer les tâches terminées
  const getCompletedTasks = () => {
    const completedTasks = tasks.filter(task => task.status === 'completed');
    const completedPanelTasks = tasksAddedFromPanel.filter(task => {
      const cardData = getCardData(task.name);
      if (cardData?.type === 'coverage') {
        return cardData.total && cardData.completed && cardData.completed >= cardData.total;
      }
      return false; // Pour l'instant, on ne considère que les tâches de type coverage comme "terminées"
    });
    
    return {
      regularTasks: completedTasks,
      panelTasks: completedPanelTasks
    };
  };

  // Fonction pour supprimer une tâche régulière de l'historique
  const removeFromHistory = async (taskId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Pas de token trouvé');
        return;
      }

      // Supprimer de la base de données
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Mettre à jour l'état local
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        console.log('Tâche supprimée de l\'historique:', taskId);
      } else if (response.status === 401) {
        router.push('/login');
      } else {
        console.error('Erreur lors de la suppression de la tâche');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  // Fonction pour supprimer une tâche du panel de l'historique
  const removePanelTaskFromHistory = (taskName: string) => {
    const companyId = localStorage.getItem('companyId');
    // Supprimer de tasksAddedFromPanel
    const updatedTasks = tasksAddedFromPanel.filter(task => task.name !== taskName);
    setTasksAddedFromPanel(updatedTasks);
    localStorage.setItem(`tasksAddedFromPanel_${companyId}`, JSON.stringify(updatedTasks));
    
    // Supprimer des données du panel si elle existe
    const currentPanelCards = JSON.parse(localStorage.getItem(`panelCards_${companyId}`) || '{}');
    if (currentPanelCards[taskName]) {
      delete currentPanelCards[taskName];
      localStorage.setItem(`panelCards_${companyId}`, JSON.stringify(currentPanelCards));
      setPanelCards(currentPanelCards);
    }
    
    console.log('Tâche du panel supprimée de l\'historique:', taskName);
  };

  // Fonction pour demander la confirmation de suppression
  const confirmDeleteFromHistory = (taskId?: number, taskName?: string, type: 'regular' | 'panel' = 'regular') => {
    setDeleteConfirmation({ show: true, taskId, taskName, type });
  };

  // Fonction pour confirmer la suppression
  const handleConfirmDeleteFromHistory = () => {
    if (deleteConfirmation.type === 'regular' && deleteConfirmation.taskId) {
      removeFromHistory(deleteConfirmation.taskId);
    } else if (deleteConfirmation.type === 'panel' && deleteConfirmation.taskName) {
      removePanelTaskFromHistory(deleteConfirmation.taskName);
    }
    setDeleteConfirmation({ show: false, type: 'regular' });
  };

  // Fonction pour annuler la suppression
  const cancelDeleteFromHistory = () => {
    setDeleteConfirmation({ show: false, type: 'regular' });
  };

     if (isLoading) {
     return (
       <div className="min-h-screen flex items-center justify-center transition-all duration-300" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#CCFF00] to-[#9933FF] flex items-center justify-center animate-pulse">
            <div className="w-16 h-16 rounded-full bg-black"></div>
          </div>
          <div className="text-[#CCFF00] text-xl font-karla-semibold mb-2">Initialisation du système</div>
          <div className="text-gray-400 text-sm font-karla-regular">Chargement des modules de sécurité</div>
        </div>
      </div>
    );
  }

     return (
     <div className="min-h-screen transition-all duration-300" style={{ background: 'var(--bg-primary)' }}>
      <Header />
      
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header futuriste */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-12">
              <div>
                                                  <h1 className="text-5xl font-karla-bold mb-4 transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>
                   <span style={{ color: 'var(--text-primary)' }}>
                     Tableau de bord
                   </span>
                 </h1>
                 <p className="font-karla-regular text-lg transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>
                   Interface de contrôle des systèmes de cybersécurité
                 </p>
              </div>
            </div>

            {/* Statistiques principales - Style futuriste */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                             <motion.div 
                 className="p-8 rounded-2xl hover:border-[#CCFF00] transition-all duration-500 bg-black border border-gray-700"
                 whileHover={{ scale: 1.02 }}
               >
                <div className="flex items-center justify-between">
                  <div>
                                         <div className="font-karla-medium text-sm mb-2 transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>SERVICES ACTIFS</div>
                                         <div className="text-6xl font-karla-bold" style={{ color: 'var(--theme-primary)' }}>{tasks.length}</div>
                  </div>
                                     <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{
                     background: 'linear-gradient(135deg, #9933FF, #7c3aed)'
                   }}>
                     <div className="w-16 h-16 rounded-full" style={{ background: 'var(--bg-primary)' }}></div>
                   </div>
                </div>
              </motion.div>

                             <motion.div 
                 className="p-8 rounded-2xl hover:border-[#9933FF] transition-all duration-500 bg-black border border-gray-700"
                 whileHover={{ scale: 1.02 }}
               >
                <div className="flex items-center justify-between">
                  <div>
                                         <div className="font-karla-medium text-sm mb-2 transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>TÂCHES TERMINÉES</div>
                                         <div className="text-6xl font-karla-bold" style={{ color: 'var(--theme-secondary)' }}>
                       {Math.round((tasks.filter(t => t.status === 'completed').length / Math.max(tasks.length, 1)) * 100)}%
                     </div>
                  </div>
                                     <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{
                     background: 'linear-gradient(135deg, #9933FF, #7c3aed)'
                   }}>
                     <div className="w-16 h-16 rounded-full" style={{ background: 'var(--bg-primary)' }}></div>
                   </div>
                </div>
              </motion.div>
            </div>

            {/* Statistiques détaillées - Style futuriste */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <motion.div 
                className="p-6 rounded-xl hover:border-[#CCFF00] transition-all duration-300"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)'
                }}
                whileHover={{ y: -5 }}
              >
                <div className="text-center">
                                     <div className="text-3xl font-karla-bold mb-2" style={{ color: 'var(--theme-primary)' }}>
                     {tasks.filter(t => t.category === 'defensive').length}
                   </div>
                  <div className="font-karla-medium text-sm transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>DÉFENSIF</div>
                </div>
              </motion.div>
              
              <motion.div 
                className="p-6 rounded-xl hover:border-[#CCFF00] transition-all duration-300"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)'
                }}
                whileHover={{ y: -5 }}
              >
                <div className="text-center">
                                     <div className="text-3xl font-karla-bold mb-2" style={{ color: 'var(--theme-primary)' }}>
                     {tasks.filter(t => t.category === 'general').length}
                   </div>
                  <div className="font-karla-medium text-sm transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>GÉNÉRAL</div>
                </div>
              </motion.div>
              
              <motion.div 
                className="p-6 rounded-xl hover:border-[#9933FF] transition-all duration-300 bg-black border border-gray-700"
                whileHover={{ y: -5 }}
              >
                <div className="text-center">
                                     <div className="text-3xl font-karla-bold mb-2" style={{ color: 'var(--theme-secondary)' }}>
                     {tasks.filter(t => t.category === 'offensive').length}
                   </div>
                  <div className="font-karla-medium text-sm transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>OFFENSIF</div>
                </div>
              </motion.div>
              
              <motion.div 
                key="completed"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsHistoryModalOpen(true)}
                className="p-6 rounded-xl hover:border-[#9933FF] transition-all duration-300 cursor-pointer relative bg-black border border-gray-700"
              >
                <div className="text-center">
                                     <div className="text-3xl font-karla-bold mb-2" style={{ color: 'var(--theme-secondary)' }}>
                     {tasks.filter(t => t.status === 'completed').length}
                   </div>
                  <div className="font-karla-medium text-sm transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>TERMINÉS</div>
                </div>
                {/* Indicateur "voir plus" */}
                <div className="absolute bottom-2 right-3 text-xs font-karla-medium" style={{ color: 'white' }}>
                  voir plus &gt;
                </div>
              </motion.div>
            </div>
          </div>

          {/* Section des tâches ajoutées depuis le panneau */}
          {tasksAddedFromPanel.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
                              <div className="mb-6">
                  <h2 className="text-2xl font-karla-bold mb-2 transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>
                    Indicateurs & Suivi Sécurité
                  </h2>
                </div>
              
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {tasksAddedFromPanel.map((task, index) => {
                  const cardData = getCardData(task.name);
                  const category = getCategoryFromTask(task.name);
                  
                  console.log('Rendu de la carte:', task.name, 'cardData:', cardData, 'category:', category);
                  
                  return (
                  <motion.div
                      key={`${task.name}-${renderKey}-${index}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <PanelCard 
                        name={task.name} 
                        description={cardData?.description || task.description} 
                        importance={task.importance}
                        total={cardData?.total}
                        completed={cardData?.completed}
                        equipmentCount={cardData?.equipmentCount}
                        status={cardData?.status}
                        certificationDate={cardData?.certificationDate}
                        nextAudit={cardData?.nextAudit}
                        priority={cardData?.priority}
                        deadline={cardData?.deadline}
                        category={category}
                        userRole={userRole}
                        cardType={cardData?.type || 'coverage'}
                        tasksAddedFromPanel={tasksAddedFromPanel}
                        onDelete={removeTaskFromPanel}
                      />
                  </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Boutons d'action - Visible seulement pour les admins */}
          {userRole === 'admin' && (
            <div className="flex justify-end gap-4 mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDetailsPanelOpen(true)}
                className="flex items-center gap-3 px-6 py-3 text-white rounded-xl font-karla-bold hover:bg-[#7c3aed] transition-all duration-300 shadow-lg"
                style={{ backgroundColor: '#9933FF' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
                PANEL DE SUIVIS
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsServicesSidebarOpen(true)}
                className="flex items-center gap-3 px-6 py-3 text-white rounded-xl font-karla-bold hover:bg-[#7c3aed] transition-all duration-300 shadow-lg"
                style={{ backgroundColor: '#9933FF' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                SERVICES PRÉDÉFINIS
              </motion.button>
            </div>
          )}

          {/* Colonnes de tâches */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <TaskColumn
              category="defensive"
              tasks={getTasksByCategory('defensive')}
              onAddTask={handleAddTask}
              onStatusChange={handleStatusChange}
              onDropService={handleDropService}
              userRole={userRole}
              onAddTaskFromPanel={handleAddTaskFromPanel}
              tasksAddedFromPanel={tasksAddedFromPanel}
              onRemoveTaskFromPanel={removeTaskFromPanel}
            />
            <TaskColumn
              category="general"
              tasks={getTasksByCategory('general')}
              onAddTask={handleAddTask}
              onStatusChange={handleStatusChange}
              onDropService={handleDropService}
              userRole={userRole}
              onAddTaskFromPanel={handleAddTaskFromPanel}
              tasksAddedFromPanel={tasksAddedFromPanel}
              onRemoveTaskFromPanel={removeTaskFromPanel}
            />
            <TaskColumn
              category="offensive"
              tasks={getTasksByCategory('offensive')}
              onAddTask={handleAddTask}
              onStatusChange={handleStatusChange}
              onDropService={handleDropService}
              userRole={userRole}
              onAddTaskFromPanel={handleAddTaskFromPanel}
              tasksAddedFromPanel={tasksAddedFromPanel}
              onRemoveTaskFromPanel={removeTaskFromPanel}
            />
          </motion.div>
        </div>
      </main>
      
      <Footer />

      {/* Menu latéral des services */}
      <ServicesSidebar
        isOpen={isServicesSidebarOpen}
        onClose={() => setIsServicesSidebarOpen(false)}
        onDropService={handleDropService}
      />

      {/* Panneau de détails des catégories */}
      <CategoryDetailsPanel
        isOpen={isDetailsPanelOpen}
        onClose={() => setIsDetailsPanelOpen(false)}
        category="defensive"
        categoryTitle="PANEL DE SUIVIS"
        userRole={userRole}
        onAddTask={handleAddTaskFromPanel}
        tasksAddedFromPanel={tasksAddedFromPanel}
        forceSyncPanelData={forceSyncPanelData}
      />

      {/* Popup d'historique des tâches terminées */}
      <AnimatePresence>
        {isHistoryModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryModalOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-[100]"
            />
            
            <div className="fixed inset-0 flex items-center justify-center z-[110] p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-4xl bg-black border border-gray-700 rounded-xl p-6 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-karla-bold" style={{ color: 'var(--text-primary)' }}>
                    Historique des Tâches Terminées
                  </h3>
                  <button
                    onClick={() => setIsHistoryModalOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-800 transition-all duration-300"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Tâches régulières terminées */}
                  {getCompletedTasks().regularTasks.length > 0 && (
                    <div>
                      <h4 className="text-lg font-karla-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                        Tâches Régulières Terminées ({getCompletedTasks().regularTasks.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getCompletedTasks().regularTasks.map((task, index) => (
                          <motion.div
                            key={`regular-${task.id}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 rounded-lg border border-gray-600 relative group bg-black"
                          >
                            {/* Bouton de suppression - Visible seulement pour les admins */}
                            {userRole === 'admin' && (
                              <button
                                onClick={() => confirmDeleteFromHistory(task.id)}
                                className="absolute bottom-2 right-2 p-1 rounded-full transition-all duration-300 hover:bg-red-600"
                                style={{ color: '#ef4444' }}
                                title="Supprimer de l'historique"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                            
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-karla-bold" style={{ color: 'var(--text-primary)' }}>
                                {task.name}
                              </span>
                              <span className="px-2 py-1 rounded-full text-xs font-karla-bold" style={{ 
                                background: '#10b981', 
                                color: 'black' 
                              }}>
                                TERMINÉ
                              </span>
                            </div>
                            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                              Score: {task.score}/100
                            </div>
                            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                              Catégorie: {task.category}
                            </div>
                            {task.description && (
                              <div className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                                {task.description}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tâches du panel terminées */}
                  {getCompletedTasks().panelTasks.length > 0 && (
                    <div>
                      <h4 className="text-lg font-karla-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                        Tâches du Panel Terminées ({getCompletedTasks().panelTasks.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getCompletedTasks().panelTasks.map((task, index) => {
                          const cardData = getCardData(task.name);
                          
                          return (
                            <motion.div
                              key={`panel-${task.name}`}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="p-4 rounded-lg border border-gray-600 relative group bg-black"
                            >
                              {/* Bouton de suppression - Visible seulement pour les admins */}
                              {userRole === 'admin' && (
                                <button
                                  onClick={() => confirmDeleteFromHistory(undefined, task.name, 'panel')}
                                  className="absolute bottom-2 right-2 p-1 rounded-full transition-all duration-300 hover:bg-red-600"
                                  style={{ color: '#ef4444' }}
                                  title="Supprimer de l'historique"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                              
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-karla-bold" style={{ color: 'var(--text-primary)' }}>
                                  {task.name}
                                </span>
                                <span className="px-2 py-1 rounded-full text-xs font-karla-bold" style={{ 
                                  background: '#10b981', 
                                  color: 'black' 
                                }}>
                                  100%
                                </span>
                              </div>
                              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                {cardData?.completed || 0} complété sur {cardData?.total || 0}
                              </div>
                              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                Type: {cardData?.type || 'coverage'}
                              </div>
                              {cardData?.description && (
                                <div className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                                  {cardData.description}
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Message si aucune tâche terminée */}
                  {getCompletedTasks().regularTasks.length === 0 && getCompletedTasks().panelTasks.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-karla-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                        Aucune tâche terminée
                      </h4>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Les tâches terminées apparaîtront ici
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Popup de confirmation de suppression */}
      <AnimatePresence>
        {deleteConfirmation.show && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={cancelDeleteFromHistory}
              className="fixed inset-0 bg-black bg-opacity-50 z-[120]"
            />
            
            <div className="fixed inset-0 flex items-center justify-center z-[130] p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-md bg-black border border-gray-700 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-karla-bold" style={{ color: 'var(--text-primary)' }}>
                    Confirmer la suppression
                  </h3>
                  <button
                    onClick={cancelDeleteFromHistory}
                    className="p-2 rounded-lg hover:bg-gray-800 transition-all duration-300"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: '#ef4444' }}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-base font-karla-bold" style={{ color: 'var(--text-primary)' }}>
                        Supprimer de l&apos;historique
                      </h4>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        Cette action est irréversible
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Êtes-vous sûr de vouloir supprimer cette tâche de l&apos;historique ?
                  </p>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                    La tâche sera également supprimée de la liste des tâches actives.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={cancelDeleteFromHistory}
                    className="flex-1 px-4 py-3 rounded-lg border transition-all duration-300 font-karla-medium"
                    style={{ 
                      borderColor: 'var(--border-secondary)',
                      color: 'var(--text-muted)'
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleConfirmDeleteFromHistory}
                    className="flex-1 px-4 py-3 rounded-lg font-karla-medium transition-all duration-300"
                    style={{ 
                      background: '#ef4444',
                      color: 'white'
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
