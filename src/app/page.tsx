'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import TaskColumn from '@/components/TaskColumn';
import AddTaskModal from '@/components/AddTaskModal';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';

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

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
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
      if (!token) {
        router.push('/login');
      }
    }
  }, [router]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = (category: string) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
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

  const handleCreateTask = async (taskData: { name: string; score: number }) => {
    if (!selectedCategory) {
      alert("Erreur : aucune catégorie sélectionnée !");
      return;
    }
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...taskData,
          category: selectedCategory,
        }),
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks(prevTasks => [newTask, ...prevTasks]);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
    }
  };

  const getTasksByCategory = (category: string) => {
    return tasks.filter(task => task.category === category);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
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
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header futuriste */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-12">
              <div>
                                 <h1 className="text-5xl font-karla-bold text-white mb-4">
                   <span style={{ color: '#FFFFFF' }}>
                     Tableau de bord
                   </span>
                 </h1>
                <p className="text-gray-400 font-karla-regular text-lg">
                  Interface de contrôle des systèmes de cybersécurité
                </p>
              </div>
            </div>

            {/* Statistiques principales - Style futuriste */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <motion.div 
                className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-800 hover:border-[#CCFF00] transition-all duration-500"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-gray-400 font-karla-medium text-sm mb-2">SERVICES ACTIFS</div>
                    <div className="text-6xl font-karla-bold text-[#CCFF00]">{tasks.length}</div>
                  </div>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#CCFF00] to-[#9933FF] flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-black"></div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-800 hover:border-[#9933FF] transition-all duration-500"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-gray-400 font-karla-medium text-sm mb-2">TÂCHES TERMINÉES</div>
                    <div className="text-6xl font-karla-bold text-[#9933FF]">
                      {Math.round((tasks.filter(t => t.status === 'completed').length / Math.max(tasks.length, 1)) * 100)}%
                    </div>
                  </div>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#9933FF] to-[#CCFF00] flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-black"></div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Statistiques détaillées - Style futuriste */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <motion.div 
                className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl border border-gray-800 hover:border-[#CCFF00] transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="text-center">
                  <div className="text-3xl font-karla-bold text-[#CCFF00] mb-2">
                    {tasks.filter(t => t.category === 'defensive').length}
                  </div>
                  <div className="text-gray-400 font-karla-medium text-sm">DÉFENSIF</div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl border border-gray-800 hover:border-[#CCFF00] transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="text-center">
                  <div className="text-3xl font-karla-bold text-[#CCFF00] mb-2">
                    {tasks.filter(t => t.category === 'general').length}
                  </div>
                  <div className="text-gray-400 font-karla-medium text-sm">GÉNÉRAL</div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl border border-gray-800 hover:border-[#9933FF] transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="text-center">
                  <div className="text-3xl font-karla-bold text-[#9933FF] mb-2">
                    {tasks.filter(t => t.category === 'offensive').length}
                  </div>
                  <div className="text-gray-400 font-karla-medium text-sm">OFFENSIF</div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl border border-gray-800 hover:border-[#9933FF] transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="text-center">
                  <div className="text-3xl font-karla-bold text-[#9933FF] mb-2">
                    {tasks.filter(t => t.status === 'completed').length}
                  </div>
                  <div className="text-gray-400 font-karla-medium text-sm">TERMINÉS</div>
                </div>
              </motion.div>
            </div>
          </div>

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
            />
            <TaskColumn
              category="general"
              tasks={getTasksByCategory('general')}
              onAddTask={handleAddTask}
              onStatusChange={handleStatusChange}
            />
            <TaskColumn
              category="offensive"
              tasks={getTasksByCategory('offensive')}
              onAddTask={handleAddTask}
              onStatusChange={handleStatusChange}
            />
          </motion.div>
        </div>
      </main>

             <AddTaskModal
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         onSubmit={handleCreateTask}
         category={selectedCategory}
       />
       
       <Footer />
     </div>
   );
 }
