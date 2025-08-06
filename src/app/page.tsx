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

  const [isServicesSidebarOpen, setIsServicesSidebarOpen] = useState(false);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
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
    // Valeur par défaut basée sur le contexte
    return 'general';
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
                className="p-6 rounded-xl hover:border-[#9933FF] transition-all duration-300"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)'
                }}
                whileHover={{ y: -5 }}
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
                  
                  return (
                    <motion.div
                      key={index}
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
      />
    </div>
  );
}
