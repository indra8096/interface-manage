'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import TaskColumn from '@/components/TaskColumn';
import AddTaskModal from '@/components/AddTaskModal';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

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
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-primary text-xl font-karla-regular">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Header />
      
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-karla-bold text-primary mb-8">
            Tableau de bord client
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
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
    </div>
  );
}
