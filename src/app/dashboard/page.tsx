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



export default function Home() {
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
  const [renderKey, setRenderKey] = useState(0); // Pour forcer le re-rendu des cartes

  const [isServicesSidebarOpen, setIsServicesSidebarOpen] = useState(false);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false); // Nouvel état pour la popup d'historique
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; taskId?: number; taskName?: string; type: 'regular' | 'panel' }>({ show: false, type: 'regular' });
  const [isSuperAdminView, setIsSuperAdminView] = useState(false);
  const [superAdminCompanyInfo, setSuperAdminCompanyInfo] = useState<{ companyId: string; companyName: string } | null>(null);
  const router = useRouter();

  // Fonction pour retourner au dashboard super admin
  const handleReturnToSuperAdmin = () => {
    // Nettoyer les données de retour
    localStorage.removeItem('superAdminReturn');
    localStorage.removeItem('superAdminCompanyId');
    localStorage.removeItem('superAdminCompanyName');
    
    // Retourner au dashboard super admin
    router.push('/superadmin');
  };

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

      console.log('fetchPanelCards: Récupération des cartes depuis l\'API...');
      const response = await fetch('/api/panel_cards', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('fetchPanelCards: Données reçues:', data);
        console.log('fetchPanelCards: panelCards reçus:', data.panelCards);
        
        // Vérifier les données de progression
        if (data.panelCards && Array.isArray(data.panelCards)) {
          data.panelCards.forEach((card: any, index: number) => {
            console.log(`fetchPanelCards: Carte ${index + 1}:`, {
              name: card.name,
              total: card.total,
              completed: card.completed,
              type: card.type
            });
          });
        }
        
        // Mettre à jour l'état panelCards
        setPanelCards(data.panelCards);
        
        // Synchroniser tasksAddedFromPanel avec les nouvelles données
        // Appeler directement avec les nouvelles données au lieu d'utiliser setTimeout
        syncTasksAddedFromPanelWithData(data.panelCards);
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
      
      // Vérifier si c'est un super admin en mode "vue"
      const isSuperAdminReturn = localStorage.getItem('superAdminReturn');
      const superAdminCompanyId = localStorage.getItem('superAdminCompanyId');
      const superAdminCompanyName = localStorage.getItem('superAdminCompanyName');
      
      if (!token) {
        router.push('/login');
        return;
      }

      // Si c'est un super admin en mode "vue", autoriser l'accès
      if (isSuperAdminReturn === 'true' && superAdminCompanyId && superAdminCompanyName) {
        setIsSuperAdminView(true);
        setSuperAdminCompanyInfo({
          companyId: superAdminCompanyId,
          companyName: superAdminCompanyName
        });
        // Ne pas rediriger vers /superadmin
      } else {
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
      }

      if (role) {
        // Conversion des rôles pour le dashboard
        const itRole = localStorage.getItem('itRole');
        const adminItRoles = new Set(['IT_ADMIN', 'IT_MANAGER', 'IT_DIRECTOR', 'CIO']);
        if (role === 'SUPER_ADMIN' || role === 'COMPANY_ADMIN' || (itRole && adminItRoles.has(itRole))) {
          setUserRole('admin'); // Accès complet : services, panel de suivi, etc.
        } else {
          setUserRole('user'); // Accès limité : seulement les tâches
        }
        
        // Préparer les informations d'affichage de l'utilisateur
        const displayRole = itRole || '';
        const displayName = localStorage.getItem('name');
        setUserDisplayInfo({ role: displayRole, name: displayName });
      }

      if (savedTasksFromPanel) {
        try {
          const parsedTasks = JSON.parse(savedTasksFromPanel);
          setTasksAddedFromPanel(parsedTasks);
        } catch (error) {
          console.error('Erreur lors du chargement des tâches du panneau:', error);
        }
      }
      // Les cartes de panel sont maintenant chargées depuis l'API via fetchPanelCards()
    }
  }, [router]);

  useEffect(() => {
    fetchTasks();
    fetchPanelCards();
    
    // Suppression de l'intervalle automatique qui causait des boucles infinies
    // Les données seront mises à jour manuellement quand nécessaire
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Log des changements de tasksAddedFromPanel pour le débogage
  useEffect(() => {
    console.log('tasksAddedFromPanel a changé:', tasksAddedFromPanel);
  }, [tasksAddedFromPanel]);

  // Synchronisation avec les données du panel
  useEffect(() => {
    // Synchronisation immédiate seulement au montage du composant
    // Pas d'intervalle pour éviter les boucles infinies
    if (typeof window !== 'undefined') {
      const companyId = localStorage.getItem('companyId');
      
      // Vérifier les tâches existantes dans localStorage
      const savedTasksFromPanel = localStorage.getItem(`tasksAddedFromPanel_${companyId}`);
      if (savedTasksFromPanel) {
        try {
          const parsedTasks = JSON.parse(savedTasksFromPanel);
          console.log('Chargement initial des tâches du panneau:', parsedTasks);
          setTasksAddedFromPanel(parsedTasks);
        } catch (error) {
          console.error('Erreur lors du chargement des tâches du panneau:', error);
        }
      }
    }
  }, []); // Dépendances vides - exécuté seulement au montage

  const handleAddTask = (taskData: { name: string; score: number; category: string; description: string; importance: string; dueDate: string; assignedTo: string }) => {
    handleCreateTask(taskData);
  };

  const handleAddTaskFromPanel = (taskData: { name: string; score: number; category: string; description: string; importance: string; dueDate: string; assignedTo: string }) => {
    const companyId = localStorage.getItem('companyId');
    
    // Trouver l'ID de la carte par son nom dans panelCards
    const cardData = panelCards.find(card => card.name === taskData.name);
    if (!cardData) {
      console.error('Carte non trouvée pour ajout au dashboard:', taskData.name);
      return;
    }
    
    // Créer la tâche avec l'ID de la carte et toutes les données de progression
    const taskWithId = {
      id: cardData.id,
      ...taskData,
      // Copier les données de progression de la carte
      total: cardData.total,
      completed: cardData.completed,
      equipmentCount: cardData.equipmentCount,
      status: cardData.status,
      certificationDate: cardData.certificationDate,
      nextAudit: cardData.nextAudit,
      deadline: cardData.deadline,
      type: cardData.type,
      category: cardData.category
    };
    
    // Ne pas appeler handleCreateTask pour éviter l'ajout dans les TaskColumns
    // Marquer cette tâche comme ajoutée depuis le panneau
    const updatedTasks = [...tasksAddedFromPanel, taskWithId];
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
    const byCategory = tasks.filter(task => task.category === category);
    // Pour les admins: n'afficher que les tâches non terminées dans les colonnes
    return userRole === 'admin' ? byCategory.filter(t => t.status !== 'completed') : byCategory;
  };

  const getCardData = (taskName: string) => {
    // Récupérer les données de la carte depuis l'API
    if (!panelCards || !Array.isArray(panelCards)) {
      console.log('getCardData: panelCards est null ou pas un tableau');
      return null;
    }
    
    console.log('getCardData: panelCards disponibles:', panelCards);
    
    // D'abord essayer de trouver par nom (pour la compatibilité)
    let card = panelCards.find(card => card.name === taskName);
    
    if (card) {
      console.log(`getCardData: Carte trouvée par nom "${taskName}":`, card);
      console.log(`getCardData: total=${card.total}, completed=${card.completed}`);
    }
    
    // Si pas trouvé par nom, essayer de trouver par ID dans tasksAddedFromPanel
    if (!card) {
      const task = tasksAddedFromPanel.find(task => task.name === taskName);
      if (task && task.id) {
        card = panelCards.find(card => card.id === task.id);
        if (card) {
          console.log(`getCardData: Carte trouvée par ID pour "${taskName}":`, card);
          console.log(`getCardData: total=${card.total}, completed=${card.completed}`);
        }
      }
    }
    
    if (!card) {
      console.log(`getCardData: Aucune carte trouvée pour "${taskName}"`);
    }
    
    return card || null;
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
  const forceSyncPanelData = async () => {
    console.log('ForceSyncPanelData appelé - Synchronisation immédiate depuis l\'API');
    
    // Rafraîchir les données depuis l'API au lieu du localStorage
    await fetchPanelCards();
    
    // Forcer le re-rendu immédiat pour mettre à jour l'affichage
    setRenderKey(prev => {
      const newKey = prev + 1;
      console.log('Nouveau renderKey:', newKey);
      return newKey;
    });
    
    // Forcer aussi la mise à jour des tâches ajoutées depuis le panel
    // pour s'assurer que les barres de progression sont à jour
    const companyId = localStorage.getItem('companyId');
    if (companyId) {
      const storedTasks = localStorage.getItem(`tasksAddedFromPanel_${companyId}`);
      if (storedTasks) {
        try {
          const currentTasks = JSON.parse(storedTasks);
          // Mettre à jour les tâches avec les nouvelles données des cartes
          const updatedTasks = currentTasks.map((task: any) => {
            const updatedCardData = panelCards.find(card => card.id === task.id);
            if (updatedCardData) {
              return {
                ...task,
                total: updatedCardData.total,
                completed: updatedCardData.completed,
                equipmentCount: updatedCardData.equipmentCount,
                status: updatedCardData.status,
                certificationDate: updatedCardData.certificationDate,
                nextAudit: updatedCardData.nextAudit,
                deadline: updatedCardData.deadline,
                type: updatedCardData.type,
                category: updatedCardData.category
              };
            }
            return task;
          });
          
          setTasksAddedFromPanel(updatedTasks);
          localStorage.setItem(`tasksAddedFromPanel_${companyId}`, JSON.stringify(updatedTasks));
          console.log('✅ Tâches du panel mises à jour avec les nouvelles données');
        } catch (error) {
          console.error('❌ Erreur lors de la mise à jour des tâches du panel:', error);
        }
      }
    }
  };

  // Fonction pour synchroniser tasksAddedFromPanel avec les données mises à jour de panelCards
  const syncTasksAddedFromPanelWithData = (newPanelCards: Array<{
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
  }>) => {
    const companyId = localStorage.getItem('companyId');
    if (!companyId) {
      console.log('syncTasksAddedFromPanelWithData: Pas de companyId trouvé');
      return;
    }

    // Récupérer les tâches actuelles depuis localStorage
    const storedTasks = localStorage.getItem(`tasksAddedFromPanel_${companyId}`);
    if (!storedTasks) {
      console.log('syncTasksAddedFromPanelWithData: Pas de tâches stockées dans localStorage');
      return;
    }

    try {
      const currentTasks = JSON.parse(storedTasks);
      console.log('syncTasksAddedFromPanelWithData: Tâches actuelles:', currentTasks);
      console.log('syncTasksAddedFromPanelWithData: PanelCards disponibles:', newPanelCards);
      
      // Vérifier si les données ont réellement changé pour éviter les re-rendus inutiles
      let hasChanges = false;
      
      // Mettre à jour chaque tâche avec les données les plus récentes de panelCards
      const updatedTasks = currentTasks.map((task: any) => {
        console.log(`syncTasksAddedFromPanelWithData: Traitement de la tâche:`, task);
        
        const updatedCardData = newPanelCards.find(card => card.id === task.id);
        if (updatedCardData) {
          console.log(`syncTasksAddedFromPanelWithData: Carte trouvée pour ID ${task.id}:`, updatedCardData);
          
          // Vérifier si les données de progression ont changé
          if (task.total !== updatedCardData.total || 
              task.completed !== updatedCardData.completed ||
              task.description !== updatedCardData.description) {
            hasChanges = true;
          }
          
          return {
            ...task,
            name: updatedCardData.name, // Mettre à jour le nom
            description: updatedCardData.description || task.description,
            // Mettre à jour les données de progression pour la barre de progression
            total: updatedCardData.total,
            completed: updatedCardData.completed,
            equipmentCount: updatedCardData.equipmentCount,
            status: updatedCardData.status,
            certificationDate: updatedCardData.certificationDate,
            nextAudit: updatedCardData.nextAudit,
            deadline: updatedCardData.deadline,
            // Garder les autres propriétés spécifiques à la tâche (importance, score, etc.)
          };
        } else {
          console.log(`syncTasksAddedFromPanelWithData: Aucune carte trouvée pour ID ${task.id}`);
        }
        return task;
      });

      console.log('syncTasksAddedFromPanelWithData: Tâches mises à jour:', updatedTasks);

      // Ne mettre à jour l'état que si des changements ont été détectés
      if (hasChanges) {
        setTasksAddedFromPanel(updatedTasks);
        localStorage.setItem(`tasksAddedFromPanel_${companyId}`, JSON.stringify(updatedTasks));
        console.log('TasksAddedFromPanel synchronisé avec les données mises à jour');
      } else {
        console.log('Aucun changement détecté, pas de mise à jour nécessaire');
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation de tasksAddedFromPanel:', error);
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
      
      {/* Bouton retour pour Super Admin */}
      {isSuperAdminView && superAdminCompanyInfo && (
        <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-yellow-400 text-lg">🔍</div>
              <div>
                <p className="text-yellow-300 font-semibold">
                  Mode Super Admin - Vue de l&apos;entreprise
                </p>
                <p className="text-yellow-400 text-sm">
                  Vous consultez le dashboard de l&apos;entreprise : <span className="font-bold">{superAdminCompanyInfo.companyName}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleReturnToSuperAdmin}
              className="px-6 py-2 bg-yellow-600 text-black font-semibold rounded-lg hover:bg-yellow-700 transition-all duration-300 flex items-center space-x-2"
            >
              <span>←</span>
              <span>Retour au Dashboard Super Admin</span>
            </button>
          </div>
        </div>
      )}
      
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header futuriste */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h1 className="text-5xl font-karla-bold mb-4 transition-colors duration-300 dashboard-title" style={{ color: 'var(--text-primary)' }}>
                   <span style={{ color: 'var(--text-primary)' }}>
                     Tableau de bord
                   </span>
                   <span className="text-2xl font-karla-medium ml-4" style={{ color: 'var(--theme-primary)' }}>
                     {userDisplayInfo.role && (() => {
                       const roleLabel = userDisplayInfo.role === 'IT_INTERN' ? 'Stagiaire IT' :
                                        userDisplayInfo.role === 'IT_SUPPORT' ? 'Technicien support IT' :
                                        userDisplayInfo.role === 'IT_ENGINEER' ? 'Ingénieur système / réseau' :
                                        userDisplayInfo.role === 'IT_ADMIN' ? 'Administrateur IT' :
                                        userDisplayInfo.role === 'IT_MANAGER' ? 'Chef IT' :
                                        userDisplayInfo.role === 'IT_DIRECTOR' ? 'Responsable IT' :
                                        userDisplayInfo.role === 'CIO' ? "Directeur des systèmes d'information" : '';
                       return roleLabel + (userDisplayInfo.name ? ` • ${userDisplayInfo.name}` : '');
                     })()}
                   </span>
                 </h1>
                 <p className="font-karla-regular text-lg transition-colors duration-300 dashboard-subtitle" style={{ color: 'var(--text-muted)' }}>
                   Interface de contrôle des systèmes de cybersécurité
                 </p>
              </div>
            </div>

            {/* Statistiques principales - Style futuriste */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                             <motion.div 
                 className="p-8 rounded-2xl hover:border-[#CCFF00] transition-all duration-500 border border-gray-700"
                       style={{ background: 'var(--bg-card)' }}
                 whileHover={{ scale: 1.02 }}
               >
                <div className="flex items-center justify-between">
                  <div>
                                         <div className="font-karla-medium text-sm mb-2 transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>SERVICES ACTIFS</div>
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
                 className="p-8 rounded-2xl hover:border-[#9933FF] transition-all duration-500 border border-gray-700"
                       style={{ background: 'var(--bg-card)' }}
                 whileHover={{ scale: 1.02 }}
               >
                <div className="flex items-center justify-between">
                  <div>
                                         <div className="font-karla-medium text-sm mb-2 transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>TÂCHES TERMINÉES</div>
                                         <div className="text-6xl font-karla-bold" style={{ color: 'var(--theme-secondary)' }}>
                       {Math.min(Math.round((tasks.filter(t => t.status === 'completed').length / Math.max(tasks.length, 1)) * 100), 100)}%
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
                                        <div className="font-karla-medium text-sm transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>DÉFENSIF</div>
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
                                        <div className="font-karla-medium text-sm transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>GÉNÉRAL</div>
                </div>
              </motion.div>
              
              <motion.div 
                className="p-6 rounded-xl hover:border-[#9933FF] transition-all duration-300 border border-gray-700"
                      style={{ background: 'var(--bg-card)' }}
                whileHover={{ y: -5 }}
              >
                <div className="text-center">
                                     <div className="text-3xl font-karla-bold mb-2" style={{ color: 'var(--theme-secondary)' }}>
                     {tasks.filter(t => t.category === 'offensive').length}
                   </div>
                                        <div className="font-karla-medium text-sm transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>OFFENSIF</div>
                </div>
              </motion.div>
              
              <motion.div 
                key="completed"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsHistoryModalOpen(true)}
                className="p-6 rounded-xl hover:border-[#9933FF] transition-all duration-300 cursor-pointer relative border border-gray-700"
                      style={{ background: 'var(--bg-card)' }}
              >
                <div className="text-center">
                                     <div className="text-3xl font-karla-bold mb-2" style={{ color: 'var(--theme-secondary)' }}>
                     {tasks.filter(t => t.status === 'completed').length}
                   </div>
                                        <div className="font-karla-medium text-sm transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>TERMINÉS</div>
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
                  <h2 className="text-2xl font-karla-bold mb-2 transition-colors duration-300 dashboard-section-title" style={{ color: 'var(--text-primary)' }}>
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
                        category={category as 'defensive' | 'general' | 'offensive'}
                        userRole={userRole}
                        cardType={(cardData?.type as 'coverage' | 'infrastructure' | 'compliance' | 'recommendation') || 'coverage'}
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
              currentUserName={userDisplayInfo.name || undefined}
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
              currentUserName={userDisplayInfo.name || undefined}
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
              currentUserName={userDisplayInfo.name || undefined}
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
        panelCards={panelCards || []}
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
                className="w-full max-w-4xl border border-gray-700 rounded-xl p-6 max-h-[90vh] overflow-y-auto"
                      style={{ background: 'var(--bg-card)' }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-karla-bold" style={{ color: 'var(--text-primary)' }}>
                    Historique des Tâches Terminées
                  </h3>
                  <button
                    onClick={() => setIsHistoryModalOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-800 transition-all duration-300"
                    style={{ color: 'var(--text-primary)' }}
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
                            className="p-4 rounded-lg border border-gray-600 relative group"
                            style={{ background: 'var(--bg-card)' }}
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
                            {/* Personne assignée */}
                            {task.assignedTo && (
                              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                Assigné à: {task.assignedTo}
                              </div>
                            )}
                            
                            {/* Dates d'attribution et de fin */}
                            {task.createdAt && (
                              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                Attribuée le: {new Date(task.createdAt).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                              </div>
                            )}
                            {task.completedAt && (
                              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                Terminée le: {new Date(task.completedAt).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                              </div>
                            )}
                            
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
                              className="p-4 rounded-lg border border-gray-600 relative group"
                              style={{ background: 'var(--bg-card)' }}
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
                              {/* Personne assignée */}
                              {task.assignedTo && (
                                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                  Assigné à: {task.assignedTo}
                                </div>
                              )}
                              
                              {/* Dates d'attribution et de fin */}
                              {task.createdAt && (
                                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                  Attribuée le: {new Date(task.createdAt).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                  })}
                                </div>
                              )}
                              {task.completedAt && (
                                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                  Terminée le: {new Date(task.completedAt).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                  })}
                                </div>
                              )}
                              
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
                className="w-full max-w-md border border-gray-700 rounded-xl p-6"
                      style={{ background: 'var(--bg-card)' }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-karla-bold" style={{ color: 'var(--text-primary)' }}>
                    Confirmer la suppression
                  </h3>
                  <button
                    onClick={cancelDeleteFromHistory}
                    className="p-2 rounded-lg hover:bg-gray-800 transition-all duration-300"
                    style={{ color: 'var(--text-primary)' }}
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
