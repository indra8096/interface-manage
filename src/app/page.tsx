'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import TaskColumn from '@/components/TaskColumn';

import ServicesSidebar from '@/components/ServicesSidebar';
import CategoryDetailsPanel from '@/components/CategoryDetailsPanel';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import PanelCard from '../components/PanelCard';
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
  const router = useRouter();

  // Charger les tâches depuis l'API
  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      const savedTasksFromPanel = localStorage.getItem('tasksAddedFromPanel');
      const savedPanelCards = localStorage.getItem('panelCards');
      
      if (!token) {
        router.push('/login');
      }
      if (role) {
        setUserRole(role);
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
  }, []);

  // Synchronisation avec les données du panel
  useEffect(() => {
    let lastPanelCards = '';
    let lastTasksFromPanel = '';

    const syncPanelData = () => {
      if (typeof window !== 'undefined') {
        // Vérifier les changements dans panelCards
        const savedPanelCards = localStorage.getItem('panelCards') || '';
        if (savedPanelCards !== lastPanelCards) {
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
        const savedTasksFromPanel = localStorage.getItem('tasksAddedFromPanel') || '';
        if (savedTasksFromPanel !== lastTasksFromPanel) {
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
    // Ne pas appeler handleCreateTask pour éviter l'ajout dans les TaskColumns
    // Marquer cette tâche comme ajoutée depuis le panneau
    const updatedTasks = [...tasksAddedFromPanel, taskData];
    setTasksAddedFromPanel(updatedTasks);
    // Sauvegarder dans localStorage
    localStorage.setItem('tasksAddedFromPanel', JSON.stringify(updatedTasks));
  };

  const removeTaskFromPanel = (taskName: string) => {
    const updatedTasks = tasksAddedFromPanel.filter(task => task.name !== taskName);
    setTasksAddedFromPanel(updatedTasks);
    localStorage.setItem('tasksAddedFromPanel', JSON.stringify(updatedTasks));
  };

  const handleStatusChange = async (id: number, newStatus: 'completed' | 'warning' | 'error') => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === id ? { ...task, status: newStatus } : task
          )
        );
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
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      // Forcer la récupération immédiate des données
      const savedPanelCards = localStorage.getItem('panelCards');
      const savedTasksFromPanel = localStorage.getItem('tasksAddedFromPanel');
      
      console.log('Données actuelles - panelCards:', savedPanelCards);
      console.log('Données actuelles - tasksAddedFromPanel:', savedTasksFromPanel);
      
      if (savedPanelCards) {
        try {
          const parsedCards = JSON.parse(savedPanelCards);
          console.log('Mise à jour immédiate des cartes:', parsedCards);
          setPanelCards(parsedCards);
        } catch (error) {
          console.error('Erreur lors de la synchronisation des cartes:', error);
        }
      }

      if (savedTasksFromPanel) {
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
                 className="p-8 rounded-2xl hover:border-[#CCFF00] transition-all duration-500"
                 style={{
                   background: 'var(--bg-card)',
                   border: '1px solid var(--border-primary)'
                 }}
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
                 className="p-8 rounded-2xl hover:border-[#9933FF] transition-all duration-500"
                 style={{
                   background: 'var(--bg-card)',
                   border: '1px solid var(--border-primary)'
                 }}
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
                className="p-6 rounded-xl hover:border-[#9933FF] transition-all duration-300"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)'
                }}
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
                className="p-6 rounded-xl hover:border-[#9933FF] transition-all duration-300 cursor-pointer"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)'
                }}
              >
                <div className="text-center">
                                     <div className="text-3xl font-karla-bold mb-2" style={{ color: 'var(--theme-secondary)' }}>
                     {tasks.filter(t => t.status === 'completed').length}
                   </div>
                  <div className="font-karla-medium text-sm transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>TERMINÉS</div>
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
                className="w-full max-w-4xl bg-black border rounded-xl p-6 max-h-[90vh] overflow-y-auto"
                style={{ borderColor: 'var(--border-primary)' }}
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
                            className="p-4 rounded-lg border"
                            style={{ 
                              background: 'var(--bg-card)', 
                              borderColor: 'var(--border-secondary)' 
                            }}
                          >
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
                              className="p-4 rounded-lg border"
                              style={{ 
                                background: 'var(--bg-card)', 
                                borderColor: 'var(--border-secondary)' 
                              }}
                            >
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
    </div>
  );
}
