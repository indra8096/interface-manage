'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import TaskColumn from '@/components/TaskColumn';
import ServicesSidebar from '@/components/ServicesSidebar';
import CategoryDetailsPanel from '@/components/CategoryDetailsPanel';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import PanelCard from './PanelCard';
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
  assignedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
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

interface SubscriptionData {
  plan: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  userLimit: number;
  currentUsers: number;
}

export default function ManagementDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'billing'>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('user');
  const [userDisplayInfo, setUserDisplayInfo] = useState<{ role: string; name: string | null }>({ role: '', name: null });
  const [tasksAddedFromPanel, setTasksAddedFromPanel] = useState<Array<{
    id: number;
    name: string;
    description: string;
    importance: string;
    category: string;
    score: number;
    dueDate: string;
    assignedTo: string;
    createdAt?: string;
    completedAt?: string;
  }>>([]);
  const [panelCards, setPanelCards] = useState<Array<{
    id: number;
    name: string;
    type: string;
    category: string;
    description: string;
    priority: string;
    total?: number;
    completed?: number;
    equipmentCount?: number;
    status?: string;
    certificationDate?: string;
    nextAudit?: string;
    deadline?: string;
    isActive: boolean;
  }>>([]);
  const [renderKey, setRenderKey] = useState(0);
  const [isServicesSidebarOpen, setIsServicesSidebarOpen] = useState(false);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; taskId?: number; taskName?: string; type: 'regular' | 'panel' }>({ show: false, type: 'regular' });
  const [isSuperAdminView, setIsSuperAdminView] = useState(false);
  const [superAdminCompanyInfo, setSuperAdminCompanyInfo] = useState<{ companyId: string; companyName: string } | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [billingLoading, setBillingLoading] = useState(true);
  const router = useRouter();

  // Vérifier l'authentification et le rôle
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || !role) {
      router.push('/login');
      return;
    }

    // Vérifier que l'utilisateur est bien MANAGEMENT_ADMIN
    if (role !== 'MANAGEMENT_ADMIN') {
      router.push('/dashboard');
      return;
    }

    setUserRole(role);
    const name = localStorage.getItem('name');
    setUserDisplayInfo({ role, name });
    
    fetchTasks();
    fetchPanelCards();
    fetchSubscriptionData();
  }, [router]);

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

  const fetchPanelCards = async () => {
    try {
      const response = await fetch('/api/panel_cards');
      if (response.ok) {
        const data = await response.json();
        setPanelCards(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des cartes:', error);
    }
  };

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/subscriptions/status');
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setBillingLoading(false);
    }
  };

  const handleUpgrade = async (newPlan: string) => {
    try {
      const response = await fetch('/api/subscriptions/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: newPlan }),
      });
      
      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleCancel = async () => {
    if (confirm('Êtes-vous sûr de vouloir annuler votre abonnement ?')) {
      try {
        await fetch('/api/subscriptions/cancel', {
          method: 'POST',
        });
        fetchSubscriptionData();
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center border-2 border-[#CCFF00] animate-spin">
            <div className="w-8 h-8 rounded-full border-2 border-transparent border-t-[#CCFF00]"></div>
          </div>
          <p className="text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header 
        userRole={userRole}
        userDisplayInfo={userDisplayInfo}
        isSuperAdminView={isSuperAdminView}
        superAdminCompanyInfo={superAdminCompanyInfo}
        onReturnToSuperAdmin={() => {}}
      />

      {/* Navigation des onglets */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-karla-medium text-sm transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-[#CCFF00] text-[#CCFF00]'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Dashboard Principal
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`py-4 px-1 border-b-2 font-karla-medium text-sm transition-colors ${
                activeTab === 'billing'
                  ? 'border-[#CCFF00] text-[#CCFF00]'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Gérer Abonnement
            </button>
          </nav>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="flex-1">
        {activeTab === 'dashboard' && (
          <div className="flex h-screen">
            {/* Sidebar des services */}
            <ServicesSidebar
              isOpen={isServicesSidebarOpen}
              onClose={() => setIsServicesSidebarOpen(false)}
              onAddTask={(task) => {
                const newTask = {
                  ...task,
                  id: Date.now(),
                  status: 'warning' as const,
                  createdAt: new Date().toISOString(),
                };
                setTasks(prev => [...prev, newTask]);
                setTasksAddedFromPanel(prev => [...prev, newTask]);
              }}
            />

            {/* Contenu principal */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto">
                  {/* Cartes du panel */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {panelCards.map((card, index) => (
                      <PanelCard
                        key={`${card.id}-${renderKey}`}
                        card={card}
                        onAddTask={(task) => {
                          const newTask = {
                            ...task,
                            id: Date.now(),
                            status: 'warning' as const,
                            createdAt: new Date().toISOString(),
                          };
                          setTasks(prev => [...prev, newTask]);
                          setTasksAddedFromPanel(prev => [...prev, newTask]);
                        }}
                        onViewDetails={() => setIsDetailsPanelOpen(true)}
                        onViewHistory={() => setIsHistoryModalOpen(true)}
                        onDelete={() => setDeleteConfirmation({ show: true, taskId: card.id, taskName: card.name, type: 'panel' })}
                      />
                    ))}
                  </div>

                  {/* Colonnes de tâches */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <TaskColumn
                      title="À Faire"
                      status="warning"
                      tasks={tasks.filter(task => task.status === 'warning')}
                      onTaskUpdate={(taskId, updates) => {
                        setTasks(prev => prev.map(task => 
                          task.id === taskId ? { ...task, ...updates } : task
                        ));
                      }}
                      onDeleteTask={(taskId) => {
                        setTasks(prev => prev.filter(task => task.id !== taskId));
                      }}
                    />
                    <TaskColumn
                      title="En Cours"
                      status="error"
                      tasks={tasks.filter(task => task.status === 'error')}
                      onTaskUpdate={(taskId, updates) => {
                        setTasks(prev => prev.map(task => 
                          task.id === taskId ? { ...task, ...updates } : task
                        ));
                      }}
                      onDeleteTask={(taskId) => {
                        setTasks(prev => prev.filter(task => task.id !== taskId));
                      }}
                    />
                    <TaskColumn
                      title="Terminé"
                      status="completed"
                      tasks={tasks.filter(task => task.status === 'completed')}
                      onTaskUpdate={(taskId, updates) => {
                        setTasks(prev => prev.map(task => 
                          task.id === taskId ? { ...task, ...updates } : task
                        ));
                      }}
                      onDeleteTask={(taskId) => {
                        setTasks(prev => prev.filter(task => task.id !== taskId));
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {billingLoading ? (
              <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center border-2 border-[#CCFF00] animate-spin">
                    <div className="w-8 h-8 rounded-full border-2 border-transparent border-t-[#CCFF00]"></div>
                  </div>
                  <p className="text-gray-300">Chargement de la facturation...</p>
                </div>
              </div>
            ) : subscription ? (
              <div className="space-y-8">
                {/* En-tête */}
                <div className="text-center">
                  <h1 className="text-4xl font-karla-bold mb-4" style={{ color: '#CCFF00' }}>
                    Gestion de l'Abonnement
                  </h1>
                  <p className="text-xl text-gray-300">
                    Gérez votre abonnement et vos factures
                  </p>
                </div>

                {/* Informations de l'abonnement */}
                <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700">
                  <h2 className="text-2xl font-karla-bold mb-6" style={{ color: '#CCFF00' }}>
                    Informations de l'Abonnement
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-gray-700">
                        <span className="text-gray-300 font-karla-medium">Plan actuel</span>
                        <span className="text-white font-karla-bold capitalize">{subscription.plan}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-3 border-b border-gray-700">
                        <span className="text-gray-300 font-karla-medium">Statut</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-karla-medium ${
                          subscription.status === 'active' 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-red-900 text-red-300'
                        }`}>
                          {subscription.status === 'active' ? 'Actif' : subscription.status}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-3 border-b border-gray-700">
                        <span className="text-gray-300 font-karla-medium">Utilisateurs</span>
                        <span className="text-white font-karla-bold">
                          {subscription.currentUsers} / {subscription.userLimit === 999 ? 'Illimité' : subscription.userLimit}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-gray-700">
                        <span className="text-gray-300 font-karla-medium">Prochaine facturation</span>
                        <span className="text-white font-karla-bold">
                          {new Date(subscription.currentPeriodEnd).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-3 border-b border-gray-700">
                        <span className="text-gray-300 font-karla-medium">Annulation</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-karla-medium ${
                          subscription.cancelAtPeriodEnd 
                            ? 'bg-yellow-900 text-yellow-300' 
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {subscription.cancelAtPeriodEnd ? 'À la fin de la période' : 'Non programmée'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-xl font-karla-bold mb-4" style={{ color: '#CCFF00' }}>
                      Changer de Plan
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Mettez à niveau ou rétrogradez votre plan selon vos besoins.
                    </p>
                    <button
                      onClick={() => handleUpgrade('professional')}
                      className="w-full py-3 bg-gradient-to-r from-[#CCFF00] to-[#9933FF] text-black rounded-xl font-karla-bold hover:from-[#9933FF] hover:to-[#CCFF00] transition-all duration-300"
                    >
                      Gérer le Plan
                    </button>
                  </div>
                  
                  <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-xl font-karla-bold mb-4" style={{ color: '#CCFF00' }}>
                      Facturation
                    </h3>
                    <p className="text-gray-300 mb-4">
                      Consultez vos factures et mettez à jour vos informations de paiement.
                    </p>
                    <button
                      onClick={() => window.open('/api/billing/portal', '_blank')}
                      className="w-full py-3 border-2 border-[#CCFF00] text-[#CCFF00] rounded-xl font-karla-bold hover:bg-[#CCFF00] hover:text-black transition-all duration-300"
                    >
                      Portail de Facturation
                    </button>
                  </div>
                </div>

                {/* Actions dangereuses */}
                <div className="bg-red-900/20 rounded-2xl p-6 border border-red-500/30">
                  <h3 className="text-xl font-karla-bold mb-4 text-red-400">
                    Zone Dangereuse
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Ces actions sont irréversibles. Réfléchissez bien avant de continuer.
                  </p>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl font-karla-bold hover:bg-red-700 transition-all duration-300"
                  >
                    Annuler l'Abonnement
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center bg-gray-800">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h2 className="text-2xl font-karla-bold mb-4 text-gray-300">
                  Aucun abonnement trouvé
                </h2>
                <p className="text-gray-400 mb-8">
                  Il semble qu'aucun abonnement actif ne soit associé à votre compte.
                </p>
                <a
                  href="/souscrire"
                  className="inline-block px-8 py-3 bg-gradient-to-r from-[#CCFF00] to-[#9933FF] text-black rounded-xl font-karla-bold hover:from-[#9933FF] hover:to-[#CCFF00] transition-all duration-300"
                >
                  Souscrire un Abonnement
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
