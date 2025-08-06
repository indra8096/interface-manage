'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CardFormData {
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
}

interface CategoryDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  category: 'defensive' | 'general' | 'offensive';
  categoryTitle: string;
  userRole?: string;
  onAddTask?: (taskData: { name: string; score: number; category: string; description: string; importance: string; dueDate: string; assignedTo: string }) => void;
  tasksAddedFromPanel?: Array<{
    name: string;
    description: string;
    importance: string;
    category: string;
    score: number;
    dueDate: string;
    assignedTo: string;
  }>;
  forceSyncPanelData?: () => void;
}

const categoryColors = {
  defensive: '#CCFF00',
  general: '#CCFF00',
  offensive: '#9933FF',
};

const categoryDescriptions = {
  defensive: 'Systèmes de protection et surveillance',
  general: 'Services d&apos;infrastructure et maintenance',
  offensive: 'Tests de pénétration et évaluation',
};

// Cartes de base par défaut
const defaultCards: Record<string, CardFormData> = {
  'Formation Cybersécurité': {
    name: 'Formation Cybersécurité',
    type: 'coverage',
    total: 30,
    completed: 10,
    description: 'Formation de sensibilisation à la cybersécurité pour les employés'
  },
  'Pentest Infrastructure': {
    name: 'Pentest Infrastructure',
    type: 'coverage',
    total: 5,
    completed: 1,
    description: 'Test de pénétration sur l\'infrastructure réseau'
  },
  'Configuration Switches': {
    name: 'Configuration Switches',
    type: 'infrastructure',
    equipmentCount: 15,
    status: 'Sécurisé',
    description: 'Configuration et sécurisation des switches réseau'
  },
  'Audit Serveurs': {
    name: 'Audit Serveurs',
    type: 'infrastructure',
    equipmentCount: 8,
    status: 'À vérifier',
    description: 'Audit de sécurité des serveurs actifs'
  },
  'Maintenance Firewalls': {
    name: 'Maintenance Firewalls',
    type: 'infrastructure',
    equipmentCount: 3,
    status: 'Critique',
    description: 'Maintenance et mise à jour des firewalls'
  },
  'Configuration Routers': {
    name: 'Configuration Routers',
    type: 'infrastructure',
    equipmentCount: 5,
    status: 'Normal',
    description: 'Configuration et optimisation des routeurs'
  },
  'Audit ISO 27001': {
    name: 'Audit ISO 27001',
    type: 'compliance',
    status: 'CONFORME',
    certificationDate: '2023',
    nextAudit: 'Décembre 2024',
    description: 'Audit de conformité ISO 27001'
  },
  'Mise en conformité NIS2': {
    name: 'Mise en conformité NIS2',
    type: 'compliance',
    status: 'EN COURS',
    certificationDate: '',
    nextAudit: 'Octobre 2024',
    description: 'Mise en conformité avec la directive NIS2'
  },
  'Vérification RGPD': {
    name: 'Vérification RGPD',
    type: 'compliance',
    status: 'CONFORME',
    certificationDate: '',
    nextAudit: 'Mars 2024',
    description: 'Vérification de la conformité RGPD'
  },
  'Formation Cybersécurité Étendue': {
    name: 'Formation Cybersécurité Étendue',
    type: 'recommendation',
    priority: 'Haute',
    description: 'Étendre la formation cybersécurité aux 20 personnes restantes',
    deadline: '2 mois'
  },
  'Pentest Serveurs Restants': {
    name: 'Pentest Serveurs Restants',
    type: 'recommendation',
    priority: 'Moyenne',
    description: 'Effectuer des pentests sur les 4 serveurs restants',
    deadline: '3 mois'
  },
  'Mise à jour Documentation': {
    name: 'Mise à jour Documentation',
    type: 'recommendation',
    priority: 'Basse',
    description: 'Mettre à jour la documentation de sécurité',
    deadline: '6 mois'
  }
};

export default function CategoryDetailsPanel({ isOpen, onClose, category, categoryTitle, userRole = 'user', onAddTask, tasksAddedFromPanel = [], forceSyncPanelData }: CategoryDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState<'coverage' | 'infrastructure' | 'compliance' | 'recommendations'>('coverage');
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<CardFormData>({} as CardFormData);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [addFormData, setAddFormData] = useState<CardFormData>({} as CardFormData);
  const [savedCards, setSavedCards] = useState<Record<string, CardFormData>>({});
  const [deletedCards, setDeletedCards] = useState<Set<string>>(new Set());
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; cardName: string }>({ show: false, cardName: '' });
  const [renderKey, setRenderKey] = useState(0); // Pour forcer le re-rendu

  // Charger les cartes sauvegardées et les cartes supprimées au montage du composant
  useEffect(() => {
    const loadSavedCards = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('panelCards') || '{}');
        setSavedCards(saved);
      } catch (error) {
        console.error('Erreur lors du chargement des cartes:', error);
        setSavedCards({});
      }
    };

    const loadDeletedCards = () => {
      try {
        const deleted = JSON.parse(localStorage.getItem('deletedCards') || '[]');
        setDeletedCards(new Set(deleted));
      } catch (error) {
        console.error('Erreur lors du chargement des cartes supprimées:', error);
        setDeletedCards(new Set());
      }
    };

    loadSavedCards();
    loadDeletedCards();
  }, []);

  const tabs = [
    { id: 'coverage', label: 'COUVERTURE' },
    { id: 'infrastructure', label: 'INFRASTRUCTURE' },
    { id: 'compliance', label: 'CONFORMITÉ' },
    { id: 'recommendations', label: 'RECOMMANDATIONS' },
  ] as const;

  const handleAddToDashboard = (taskName: string, description: string, importance: string = 'Moyenne') => {
    if (onAddTask && !tasksAddedFromPanel.some(task => task.name === taskName)) {
      onAddTask({
        name: taskName,
        score: 5,
        category: category,
        description: description,
        importance: importance,
        dueDate: new Date().toISOString().split('T')[0],
        assignedTo: 'Admin'
      });
    }
  };

  const handleEditCard = (cardName: string, cardType: 'coverage' | 'infrastructure' | 'compliance' | 'recommendation') => {
    // Récupérer les données existantes de la carte (sauvegardées ou par défaut)
    const existingCard = savedCards[cardName] || defaultCards[cardName];
    
    setEditingCard(cardName);
    setEditFormData({
      ...existingCard,
      name: cardName,
      type: cardType
    });
  };

  const handleSaveEdit = () => {
    // Debug: afficher les données avant sauvegarde
    console.log('Sauvegarde de la modification:');
    console.log('Carte en cours d\'édition:', editingCard);
    console.log('Nouvelles données:', editFormData);
    console.log('Cartes sauvegardées avant:', savedCards);
    
    // Sauvegarder les modifications dans localStorage
    const updatedCards = { ...savedCards };
    
    // Supprimer l'ancienne entrée si le nom a changé
    if (editingCard && editingCard !== editFormData.name) {
      console.log('Suppression de l\'ancienne entrée:', editingCard);
      delete updatedCards[editingCard];
      
      // Mettre à jour le nom dans tasksAddedFromPanel si la carte y est présente
      const currentTasksFromPanel = JSON.parse(localStorage.getItem('tasksAddedFromPanel') || '[]');
      const updatedTasksFromPanel = currentTasksFromPanel.map((task: { name: string; [key: string]: unknown }) => {
        if (task.name === editingCard) {
          console.log('Mise à jour du nom dans tasksAddedFromPanel:', editingCard, '->', editFormData.name);
          return { ...task, name: editFormData.name };
        }
        return task;
      });
      localStorage.setItem('tasksAddedFromPanel', JSON.stringify(updatedTasksFromPanel));
    }
    
    // Ajouter/mettre à jour avec le nouveau nom
    updatedCards[editFormData.name] = editFormData;
    localStorage.setItem('panelCards', JSON.stringify(updatedCards));
    
    // Mettre à jour l'état local
    setSavedCards(updatedCards);
    setEditingCard(null);
    setEditFormData({} as CardFormData);
    setRenderKey(prev => prev + 1); // Forcer le re-rendu
    
    // Déclencher la synchronisation dans la page d'accueil
    if (forceSyncPanelData) {
      console.log('Appel de forceSyncPanelData depuis handleSaveEdit');
      forceSyncPanelData();
    } else {
      console.log('forceSyncPanelData n\'est pas défini');
    }
    
    // Debug: afficher les données après sauvegarde
    console.log('Cartes sauvegardées après:', updatedCards);
  };

  const handleAddNewCard = (cardType: 'coverage' | 'infrastructure' | 'compliance' | 'recommendation') => {
    setIsAddingCard(true);
    setAddFormData({
      name: '',
      type: cardType,
      // Valeurs par défaut selon le type
      ...(cardType === 'coverage' && {
        total: 0,
        completed: 0
      }),
      ...(cardType === 'infrastructure' && {
        equipmentCount: 0,
        status: 'Normal'
      }),
      ...(cardType === 'compliance' && {
        status: 'EN COURS',
        certificationDate: '',
        nextAudit: ''
      }),
      ...(cardType === 'recommendation' && {
        priority: 'Moyenne',
        description: '',
        deadline: ''
      })
    });
  };

  const handleSaveNewCard = () => {
    if (!addFormData.name.trim()) {
      alert('Le nom de la carte est requis');
      return;
    }

    // Sauvegarder la nouvelle carte dans localStorage
    const updatedCards = { ...savedCards };
    updatedCards[addFormData.name] = addFormData;
    localStorage.setItem('panelCards', JSON.stringify(updatedCards));
    
    // Mettre à jour l'état local
    setSavedCards(updatedCards);
    setIsAddingCard(false);
    setAddFormData({} as CardFormData);
    setRenderKey(prev => prev + 1); // Forcer le re-rendu
    
    // Déclencher la synchronisation dans la page d'accueil
    if (forceSyncPanelData) {
      forceSyncPanelData();
    }
    
    // Debug: afficher les cartes pour vérifier
    console.log('Nouvelle carte ajoutée:', addFormData);
    console.log('Cartes sauvegardées mises à jour:', updatedCards);
  };

  const handleCancelAdd = () => {
    setIsAddingCard(false);
    setAddFormData({} as CardFormData);
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
    setEditFormData({} as CardFormData);
  };

  const handleDeleteCard = (cardName: string) => {
    setDeleteConfirmation({ show: true, cardName });
  };

  const confirmDelete = () => {
    const cardName = deleteConfirmation.cardName;
    
    // Si c'est une carte sauvegardée, la supprimer du localStorage
    if (savedCards[cardName]) {
    const updatedCards = { ...savedCards };
      delete updatedCards[cardName];
    localStorage.setItem('panelCards', JSON.stringify(updatedCards));
    setSavedCards(updatedCards);
      setRenderKey(prev => prev + 1); // Forcer le re-rendu
      
      // Supprimer la carte de tasksAddedFromPanel si elle y est présente
      const currentTasksFromPanel = JSON.parse(localStorage.getItem('tasksAddedFromPanel') || '[]');
      const updatedTasksFromPanel = currentTasksFromPanel.filter((task: { name: string; [key: string]: unknown }) => task.name !== cardName);
      if (updatedTasksFromPanel.length !== currentTasksFromPanel.length) {
        console.log('Suppression de la carte de tasksAddedFromPanel:', cardName);
        localStorage.setItem('tasksAddedFromPanel', JSON.stringify(updatedTasksFromPanel));
      }
    }
    
    // Si c'est une carte de base, l'ajouter à la liste des cartes supprimées
    if (defaultCards[cardName]) {
      const updatedDeletedCards = new Set(deletedCards);
      updatedDeletedCards.add(cardName);
      localStorage.setItem('deletedCards', JSON.stringify([...updatedDeletedCards]));
      setDeletedCards(updatedDeletedCards);
      setRenderKey(prev => prev + 1); // Forcer le re-rendu
      
      // Supprimer la carte de tasksAddedFromPanel si elle y est présente
      const currentTasksFromPanel = JSON.parse(localStorage.getItem('tasksAddedFromPanel') || '[]');
      const updatedTasksFromPanel = currentTasksFromPanel.filter((task: { name: string; [key: string]: unknown }) => task.name !== cardName);
      if (updatedTasksFromPanel.length !== currentTasksFromPanel.length) {
        console.log('Suppression de la carte de base de tasksAddedFromPanel:', cardName);
        localStorage.setItem('tasksAddedFromPanel', JSON.stringify(updatedTasksFromPanel));
      }
    }
    
    // Déclencher la synchronisation dans la page d'accueil
    if (forceSyncPanelData) {
      forceSyncPanelData();
    }
    
    setDeleteConfirmation({ show: false, cardName: '' });
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ show: false, cardName: '' });
  };

  // Fonction pour obtenir toutes les cartes d'un type donné (base + ajoutées - supprimées)
  const getCardsByType = (type: string) => {
    const cards: CardFormData[] = [];
    const processedNames = new Set<string>();
    
    // Ajouter les cartes de base qui ne sont pas supprimées
    Object.values(defaultCards).forEach(card => {
      if (card.type === type && !deletedCards.has(card.name)) {
        // Utiliser la version sauvegardée si elle existe, sinon la version par défaut
        const savedCard = savedCards[card.name];
        const cardToAdd = savedCard || card;
        cards.push(cardToAdd);
        processedNames.add(cardToAdd.name);
      }
    });
    
    // Ajouter les cartes ajoutées dynamiquement (qui ne sont pas dans defaultCards)
    Object.values(savedCards).forEach(card => {
      if (card.type === type && !processedNames.has(card.name)) {
        cards.push(card);
        processedNames.add(card.name);
      }
    });
    
    // Debug: afficher les cartes trouvées
    console.log(`Cartes trouvées pour le type ${type}:`, cards);
    console.log('Cartes sauvegardées:', savedCards);
    console.log('Cartes supprimées:', deletedCards);
    console.log('Noms traités:', processedNames);
    
    return cards;
  };



  const renderCardWithStatus = (taskName: string, description: string, importance: string, children: React.ReactNode) => (
    <div 
      className="p-4 rounded-lg border transition-all duration-300 hover:border-opacity-60 group relative"
      style={{ 
        background: 'var(--bg-card)', 
        borderColor: 'var(--border-secondary)' 
      }}
    >
      {children}
      {tasksAddedFromPanel.some(task => task.name === taskName) && (
        <div className="mt-3 pt-2 border-t" style={{ borderColor: 'var(--border-secondary)' }}>
          <div className="text-center">
            <span className="px-2 py-1 rounded-full text-xs font-karla-bold" style={{ background: '#10b981', color: 'black' }}>
              AFFICHÉ
            </span>
          </div>
        </div>
      )}
    </div>
  );

  // Fonction générique pour rendre les cartes selon leur type
  const renderCardByType = (card: CardFormData) => {
    const cardType = card.type;
    
    switch (cardType) {
      case 'coverage':
        return (
                  <>
                    <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-karla-medium" style={{ color: 'var(--text-primary)' }}>{card.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-karla-bold" style={{ color: categoryColors[category] }}>
                  {card.total && card.completed ? 
                    Math.round((card.completed / card.total) * 100) : 0}%
                        </span>
                        {userRole === 'admin' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                      handleEditCard(card.name, 'coverage');
                            }}
                            className="px-2 py-1 rounded text-xs font-karla-medium transition-all duration-300"
                            style={{ 
                              background: categoryColors[category],
                              color: 'black'
                            }}
                          >
                            MODIFIER
                          </button>
                        )}
                        {userRole === 'admin' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                      handleDeleteCard(card.name);
                            }}
                            className="px-2 py-1 rounded text-xs font-karla-medium transition-all duration-300"
                            style={{ 
                              background: '#ef4444',
                              color: 'white'
                            }}
                            title="Supprimer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                {userRole === 'admin' && !tasksAddedFromPanel.some(task => task.name === card.name) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                      handleAddToDashboard(card.name, card.description || '', 'Moyenne');
                            }}
                            className="px-2 py-1 rounded text-xs font-karla-medium transition-all duration-300"
                            style={{ 
                              background: categoryColors[category],
                              color: 'black'
                            }}
                          >
                            A
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              {card.completed || 0} complété sur {card.total || 0}
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500" 
                        style={{ 
                  width: `${card.total && card.completed ? 
                    Math.round((card.completed / card.total) * 100) : 0}%`, 
                          background: categoryColors[category] 
                        }}
                      ></div>
                    </div>
                  </>
        );

      case 'infrastructure':
        return (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 rounded-full" style={{ 
                background: card.status === 'Sécurisé' ? '#10b981' : 
                           card.status === 'À vérifier' ? '#f59e0b' : 
                           card.status === 'Critique' ? '#ef4444' : '#3b82f6' 
              }}></div>
              <span className="text-sm font-karla-bold" style={{ color: 'var(--text-primary)' }}>{card.name}</span>
              <div className="flex items-center gap-2 ml-auto">
                        {userRole === 'admin' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                      handleEditCard(card.name, 'infrastructure');
                            }}
                            className="px-2 py-1 rounded text-xs font-karla-medium transition-all duration-300"
                            style={{ 
                              background: categoryColors[category],
                              color: 'black'
                            }}
                          >
                            MODIFIER
                          </button>
                        )}
                        {userRole === 'admin' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                      handleDeleteCard(card.name);
                            }}
                            className="px-2 py-1 rounded text-xs font-karla-medium transition-all duration-300"
                            style={{ 
                              background: '#ef4444',
                              color: 'white'
                            }}
                            title="Supprimer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                {userRole === 'admin' && !tasksAddedFromPanel.some(task => task.name === card.name) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                      handleAddToDashboard(card.name, card.description || '', 'Moyenne');
                            }}
                            className="px-2 py-1 rounded text-xs font-karla-medium transition-all duration-300"
                            style={{ 
                              background: categoryColors[category],
                              color: 'black'
                            }}
                          >
                            A
                          </button>
                        )}
                      </div>
                    </div>
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              {card.equipmentCount || 0} équipements
                    </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              État: {card.status || 'Normal'}
                    </div>
                  </>
        );

      case 'compliance':
                  return (
                    <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-karla-bold" style={{ color: 'var(--text-primary)' }}>{card.name}</span>
                        <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-karla-bold" style={{ 
                  background: card.status === 'CONFORME' ? '#10b981' : 
                             card.status === 'EN COURS' ? '#f59e0b' : '#ef4444', 
                  color: 'black'
                }}>
                  {card.status}
                          </span>
                          {userRole === 'admin' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                      handleEditCard(card.name, 'compliance');
                              }}
                              className="px-2 py-1 rounded text-xs font-karla-medium transition-all duration-300"
                              style={{ 
                                background: categoryColors[category],
                                color: 'black'
                              }}
                            >
                              MODIFIER
                            </button>
                          )}
                          {userRole === 'admin' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCard(card.name);
                              }}
                              className="px-2 py-1 rounded text-xs font-karla-medium transition-all duration-300"
                              style={{ 
                                background: '#ef4444',
                                color: 'white'
                              }}
                              title="Supprimer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                          {userRole === 'admin' && !tasksAddedFromPanel.some(task => task.name === card.name) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToDashboard(card.name, card.description || '', 'Moyenne');
                              }}
                              className="px-2 py-1 rounded text-xs font-karla-medium transition-all duration-300"
                              style={{ 
                                background: categoryColors[category],
                                color: 'black'
                              }}
                            >
                              A
                            </button>
                          )}
                        </div>
                      </div>
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              {card.certificationDate ? `Certification obtenue en ${card.certificationDate}` : 'Mise en conformité en cours'}
                      </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {card.nextAudit ? `Prochaine audit: ${card.nextAudit}` : 'Échéance: Octobre 2024'}
                      </div>
                    </>
        );

      case 'recommendation':
        return (
          <>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full mt-2" style={{ 
                background: card.priority === 'Haute' ? '#ef4444' : 
                           card.priority === 'Moyenne' ? '#f59e0b' : '#10b981' 
              }}></div>
              <div className="flex-1">
                <h4 className="text-sm font-karla-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Priorité {card.priority}
                </h4>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {card.description}
                </p>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Échéance: {card.deadline || 'Non définie'}
              </div>
              </div>
              <div className="flex items-center gap-2">
                      {userRole === 'admin' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                      handleEditCard(card.name, 'recommendation');
                          }}
                          className="px-2 py-1 rounded text-xs font-karla-medium transition-all duration-300"
                          style={{ 
                            background: categoryColors[category],
                            color: 'black'
                          }}
                        >
                          MODIFIER
                        </button>
                      )}
                      {userRole === 'admin' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                      handleDeleteCard(card.name);
                          }}
                          className="px-2 py-1 rounded text-xs font-karla-medium transition-all duration-300"
                          style={{ 
                            background: '#ef4444',
                            color: 'white'
                          }}
                          title="Supprimer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                {userRole === 'admin' && !tasksAddedFromPanel.some(task => task.name === card.name) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                      handleAddToDashboard(card.name, card.description || '', 'Moyenne');
                          }}
                          className="px-2 py-1 rounded text-xs font-karla-medium transition-all duration-300"
                          style={{ 
                            background: categoryColors[category],
                            color: 'black'
                          }}
                        >
                          A
                        </button>
                      )}
                    </div>
                  </div>
          </>
        );

      default:
        return null;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'coverage':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl border transition-all duration-300" style={{ 
              background: 'var(--bg-secondary)', 
              borderColor: 'var(--border-primary)' 
            }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-karla-bold" style={{ color: 'var(--text-primary)' }}>Indicateurs de Couverture</h3>
                         {userRole === 'admin' && (
                           <button
                    onClick={() => handleAddNewCard('coverage')}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-karla-medium transition-all duration-300"
                             style={{ 
                               background: categoryColors[category],
                               color: 'black'
                             }}
                    title="Ajouter une nouvelle carte"
                           >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                             </svg>
                           </button>
                         )}
                       </div>
              
              {/* Couverture globale */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-karla-medium" style={{ color: 'var(--text-secondary)' }}>Couverture Globale</span>
                  <span className="text-sm font-karla-bold" style={{ color: categoryColors[category] }}>67%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full transition-all duration-700 ease-out" 
                             style={{ 
                      width: '67%', 
                      background: `linear-gradient(90deg, ${categoryColors[category]}, ${categoryColors[category]}80)` 
                    }}
                  ></div>
                       </div>
                     </div>

              {/* Détails par service */}
              <div className="space-y-4">
                {getCardsByType('coverage').map((card) => (
                  <div key={`${card.name}-${renderKey}-${JSON.stringify(savedCards[card.name])}`}>
                      {renderCardWithStatus(card.name, card.description || '', 'Moyenne',
                    <>
                      {renderCardByType(card)}
                    </>
                         )}
                       </div>
                ))}
                     </div>
                     </div>
                     </div>
        );

      case 'infrastructure':
                  return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl border transition-all duration-300" style={{ 
              background: 'var(--bg-secondary)', 
              borderColor: 'var(--border-primary)' 
            }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-karla-bold" style={{ color: 'var(--text-primary)' }}>Équipements d&apos;Infrastructure</h3>
                          {userRole === 'admin' && (
                            <button
                    onClick={() => handleAddNewCard('infrastructure')}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-karla-medium transition-all duration-300"
                              style={{ 
                                background: categoryColors[category],
                                color: 'black'
                              }}
                    title="Ajouter une nouvelle carte"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          )}
                        </div>
              
              <div className="grid grid-cols-1 gap-4">
                {getCardsByType('infrastructure').map((card) => (
                  <div key={`${card.name}-${renderKey}-${JSON.stringify(savedCards[card.name])}`}>
                    {renderCardWithStatus(card.name, card.description || '', 'Moyenne',
                      <>
                  {renderCardByType(card)}
                    </>
                  )}
                    </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'compliance':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl border transition-all duration-300" style={{ 
              background: 'var(--bg-secondary)', 
              borderColor: 'var(--border-primary)' 
            }}>
                             <div className="flex items-center justify-between mb-6">
                 <h3 className="text-lg font-karla-bold" style={{ color: 'var(--text-primary)' }}>Standards de Conformité</h3>
                 {userRole === 'admin' && (
                   <button
                     onClick={() => handleAddNewCard('compliance')}
                     className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-karla-medium transition-all duration-300"
                     style={{ 
                       background: categoryColors[category],
                       color: 'black'
                     }}
                     title="Ajouter une nouvelle carte"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                     </svg>
                   </button>
                 )}
               </div>
              
              <div className="space-y-4">
                {getCardsByType('compliance').map((card) => (
                  <div key={`${card.name}-${renderKey}-${JSON.stringify(savedCards[card.name])}`}>
                    {renderCardWithStatus(card.name, card.description || '', 'Moyenne',
                   <>
                     {renderCardByType(card)}
                   </>
                         )}
                       </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'recommendations':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl border transition-all duration-300" style={{ 
              background: 'var(--bg-secondary)', 
              borderColor: 'var(--border-primary)' 
            }}>
                             <div className="flex items-center justify-between mb-6">
                 <h3 className="text-lg font-karla-bold" style={{ color: 'var(--text-primary)' }}>Recommandations d&apos;Amélioration</h3>
                 {userRole === 'admin' && (
                   <button
                     onClick={() => handleAddNewCard('recommendation')}
                     className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-karla-medium transition-all duration-300"
                     style={{ 
                       background: categoryColors[category],
                       color: 'black'
                     }}
                     title="Ajouter une nouvelle carte"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                     </svg>
                   </button>
                 )}
               </div>
              
              <div className="space-y-4">
                {getCardsByType('recommendation').map((card) => (
                  <div key={`${card.name}-${renderKey}-${JSON.stringify(savedCards[card.name])}`}>
                    {renderCardWithStatus(card.name, card.description || '', 'Moyenne',
                   <>
                     {renderCardByType(card)}
                   </>
                 )}
                       </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />
          
                     {/* Panel */}
           <motion.div
             initial={{ x: '100%' }}
             animate={{ x: 0 }}
             exit={{ x: '100%' }}
             transition={{ type: 'spring', damping: 25, stiffness: 200 }}
             className="fixed right-0 top-0 h-full w-full max-w-md bg-black border-l z-50 flex flex-col"
             style={{ borderColor: 'var(--border-primary)' }}
           >
             {/* Header */}
             <div className="p-6 border-b flex-shrink-0" style={{ borderColor: 'var(--border-primary)' }}>
               <div className="flex items-center justify-between mb-6">
                 <div>
                   <h2 className="text-xl font-karla-bold mb-1" style={{ color: categoryColors[category] }}>
                     {categoryTitle}
                   </h2>
                   <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                     {categoryDescriptions[category]}
                   </p>
                 </div>
                 <button
                   onClick={onClose}
                   className="p-2 rounded-lg hover:bg-gray-800 transition-all duration-300"
                   style={{ color: 'var(--text-muted)' }}
                 >
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
               </div>

               {/* Tabs - 2 lignes */}
               <div className="grid grid-cols-2 gap-2">
                 {tabs.map((tab) => (
                   <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`px-4 py-3 rounded-lg text-xs font-karla-medium transition-all duration-300 ${
                       activeTab === tab.id
                         ? 'text-black font-karla-bold shadow-lg'
                         : 'text-gray-400 hover:text-white hover:bg-gray-800'
                     }`}
                     style={{
                       background: activeTab === tab.id ? categoryColors[category] : 'transparent'
                     }}
                   >
                     {tab.label}
                   </button>
                 ))}
               </div>
             </div>

             {/* Content */}
             <div className="flex-1 overflow-y-auto p-6 min-h-0">
               {renderTabContent()}
             </div>
           </motion.div>

                     {/* Popup de modification */}
           <AnimatePresence>
             {editingCard && (
               <>
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   onClick={handleCancelEdit}
                   className="fixed inset-0 bg-black bg-opacity-50 z-[100]"
                 />
                 
                                   <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-black border rounded-xl p-6 z-[110]"
                    style={{ borderColor: 'var(--border-primary)' }}
                  >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-karla-bold" style={{ color: 'var(--text-primary)' }}>
                      Modifier {editFormData.name}
                    </h3>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 rounded-lg hover:bg-gray-800 transition-all duration-300"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                                     <div className="space-y-4">
                     {/* Champ nom de la carte */}
                     <div>
                       <label className="block text-sm font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                         Nom de la carte
                       </label>
                       <input
                         type="text"
                         value={editFormData.name || ''}
                         onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                         className="w-full px-3 py-2 rounded-lg border transition-all duration-300"
                         style={{ 
                           background: 'var(--bg-secondary)', 
                           borderColor: 'var(--border-secondary)',
                           color: 'var(--text-primary)'
                         }}
                         placeholder="Nom de la carte"
                       />
                     </div>
                     
                                           {/* Champs selon le type de carte */}
                      {editFormData.type === 'coverage' && (
                       <>
                         <div>
                           <label className="block text-sm font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                             Total
                           </label>
                           <input
                             type="number"
                             value={editFormData.total || 0}
                             onChange={(e) => setEditFormData({...editFormData, total: parseInt(e.target.value)})}
                             className="w-full px-3 py-2 rounded-lg border transition-all duration-300"
                             style={{ 
                               background: 'var(--bg-secondary)', 
                               borderColor: 'var(--border-secondary)',
                               color: 'var(--text-primary)'
                             }}
                             min="0"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                             Complété
                           </label>
                           <input
                             type="number"
                             value={editFormData.completed || 0}
                             onChange={(e) => setEditFormData({...editFormData, completed: parseInt(e.target.value)})}
                             className="w-full px-3 py-2 rounded-lg border transition-all duration-300"
                             style={{ 
                               background: 'var(--bg-secondary)', 
                               borderColor: 'var(--border-secondary)',
                               color: 'var(--text-primary)'
                             }}
                             min="0"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                             Pourcentage calculé
                           </label>
                           <div className="w-full px-3 py-2 rounded-lg border transition-all duration-300 bg-gray-800"
                             style={{ 
                               borderColor: 'var(--border-secondary)',
                               color: 'var(--text-primary)'
                             }}
                           >
                             {editFormData.total && editFormData.completed ? 
                               Math.round((editFormData.completed / editFormData.total) * 100) : 0}%
                           </div>
                         </div>
                       </>
                     )}

                    {editFormData.type === 'infrastructure' && (
                      <>
                        <div>
                                                     <label className="block text-sm font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                             Nombre d&apos;équipements
                           </label>
                          <input
                            type="number"
                            value={editFormData.equipmentCount || 0}
                            onChange={(e) => setEditFormData({...editFormData, equipmentCount: parseInt(e.target.value)})}
                            className="w-full px-3 py-2 rounded-lg border transition-all duration-300"
                            style={{ 
                              background: 'var(--bg-secondary)', 
                              borderColor: 'var(--border-secondary)',
                              color: 'var(--text-primary)'
                            }}
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                            État
                          </label>
                          <select
                            value={editFormData.status || ''}
                            onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                            className="w-full px-3 py-2 rounded-lg border transition-all duration-300"
                            style={{ 
                              background: 'var(--bg-secondary)', 
                              borderColor: 'var(--border-secondary)',
                              color: 'var(--text-primary)'
                            }}
                          >
                            <option value="Sécurisé">Sécurisé</option>
                            <option value="À vérifier">À vérifier</option>
                            <option value="Critique">Critique</option>
                            <option value="Normal">Normal</option>
                          </select>
                        </div>
                      </>
                    )}

                                         {editFormData.type === 'compliance' && (
                       <>
                         <div>
                           <label className="block text-sm font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                             Statut
                           </label>
                           <select
                             value={editFormData.status || ''}
                             onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                             className="w-full px-3 py-2 rounded-lg border transition-all duration-300"
                             style={{ 
                               background: 'var(--bg-secondary)', 
                               borderColor: 'var(--border-secondary)',
                               color: 'var(--text-primary)'
                             }}
                           >
                             <option value="CONFORME">CONFORME</option>
                             <option value="EN COURS">EN COURS</option>
                             <option value="NON CONFORME">NON CONFORME</option>
                           </select>
                         </div>
                         <div>
                           <label className="block text-sm font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                             Date de certification
                           </label>
                           <input
                             type="text"
                             value={editFormData.certificationDate || ''}
                             onChange={(e) => setEditFormData({...editFormData, certificationDate: e.target.value})}
                             className="w-full px-3 py-2 rounded-lg border transition-all duration-300"
                             style={{ 
                               background: 'var(--bg-secondary)', 
                               borderColor: 'var(--border-secondary)',
                               color: 'var(--text-primary)'
                             }}
                             placeholder="ex: 2023"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                             Prochaine audit
                           </label>
                           <input
                             type="text"
                             value={editFormData.nextAudit || ''}
                             onChange={(e) => setEditFormData({...editFormData, nextAudit: e.target.value})}
                             className="w-full px-3 py-2 rounded-lg border transition-all duration-300"
                             style={{ 
                               background: 'var(--bg-secondary)', 
                               borderColor: 'var(--border-secondary)',
                               color: 'var(--text-primary)'
                             }}
                             placeholder="ex: Décembre 2024"
                           />
                         </div>
                       </>
                     )}

                     {editFormData.type === 'recommendation' && (
                       <>
                         <div>
                           <label className="block text-sm font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                             Priorité
                           </label>
                           <select
                             value={editFormData.priority || ''}
                             onChange={(e) => setEditFormData({...editFormData, priority: e.target.value})}
                             className="w-full px-3 py-2 rounded-lg border transition-all duration-300"
                             style={{ 
                               background: 'var(--bg-secondary)', 
                               borderColor: 'var(--border-secondary)',
                               color: 'var(--text-primary)'
                             }}
                           >
                             <option value="Haute">Haute</option>
                             <option value="Moyenne">Moyenne</option>
                             <option value="Basse">Basse</option>
                           </select>
                         </div>
                         <div>
                           <label className="block text-sm font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                             Description
                           </label>
                           <textarea
                             value={editFormData.description || ''}
                             onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                             className="w-full px-3 py-2 rounded-lg border transition-all duration-300"
                             style={{ 
                               background: 'var(--bg-secondary)', 
                               borderColor: 'var(--border-secondary)',
                               color: 'var(--text-primary)'
                             }}
                             rows={3}
                             placeholder="Description de la recommandation"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                             Échéance
                           </label>
                           <input
                             type="text"
                             value={editFormData.deadline || ''}
                             onChange={(e) => setEditFormData({...editFormData, deadline: e.target.value})}
                             className="w-full px-3 py-2 rounded-lg border transition-all duration-300"
                             style={{ 
                               background: 'var(--bg-secondary)', 
                               borderColor: 'var(--border-secondary)',
                               color: 'var(--text-primary)'
                             }}
                             placeholder="ex: 3 mois"
                           />
                         </div>
                       </>
                     )}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 px-4 py-2 rounded-lg border transition-all duration-300"
                      style={{ 
                        borderColor: 'var(--border-secondary)',
                        color: 'var(--text-muted)'
                      }}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 px-4 py-2 rounded-lg font-karla-medium transition-all duration-300"
                      style={{ 
                        background: categoryColors[category],
                        color: 'black'
                      }}
                    >
                      Sauvegarder
                    </button>
                  </div>
                </motion.div>
              </>
            )}
                     </AnimatePresence>

           {/* Popup d'ajout de carte */}
           <AnimatePresence>
             {isAddingCard && (
               <>
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   onClick={handleCancelAdd}
                   className="fixed inset-0 bg-black bg-opacity-50 z-[100]"
                 />
                 
                 <motion.div
                   initial={{ opacity: 0, scale: 0.9, y: 20 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.9, y: 20 }}
                   className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-black border rounded-xl p-6 z-[110]"
                   style={{ borderColor: 'var(--border-primary)' }}
                 >
                   <div className="flex items-center justify-between mb-6">
                     <h3 className="text-lg font-karla-bold" style={{ color: 'var(--text-primary)' }}>
                       Ajouter une nouvelle carte
                     </h3>
                     <button
                       onClick={handleCancelAdd}
                       className="p-2 rounded-lg hover:bg-gray-800 transition-all duration-300"
                       style={{ color: 'var(--text-muted)' }}
                     >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                       </svg>
                     </button>
                   </div>

                   <div className="space-y-4">
                     {/* Champ nom de la carte */}
                     <div>
                       <label className="block text-sm font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                         Nom de la carte
                       </label>
                       <input
                         type="text"
                         value={addFormData.name || ''}
                         onChange={(e) => setAddFormData({...addFormData, name: e.target.value})}
                         className="w-full px-3 py-2 rounded-lg border transition-all duration-300"
                         style={{ 
                           background: 'var(--bg-secondary)', 
                           borderColor: 'var(--border-secondary)',
                           color: 'var(--text-primary)'
                         }}
                         placeholder="Nom de la carte"
                       />
                     </div>
                     
                     {/* Champs selon le type de carte */}
                     {addFormData.type === 'coverage' && (
                       <>
                         <div>
                           <label className="block text-sm font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                             Total
                           </label>
                           <input
                             type="number"
                             value={addFormData.total || 0}
                             onChange={(e) => setAddFormData({...addFormData, total: parseInt(e.target.value)})}
                             className="w-full px-3 py-2 rounded-lg border transition-all duration-300"
                             style={{ 
                               background: 'var(--bg-secondary)', 
                               borderColor: 'var(--border-secondary)',
                               color: 'var(--text-primary)'
                             }}
                             min="0"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                             Complété
                           </label>
                           <input
                             type="number"
                             value={addFormData.completed || 0}
                             onChange={(e) => setAddFormData({...addFormData, completed: parseInt(e.target.value)})}
                             className="w-full px-3 py-2 rounded-lg border transition-all duration-300"
                             style={{ 
                               background: 'var(--bg-secondary)', 
                               borderColor: 'var(--border-secondary)',
                               color: 'var(--text-primary)'
                             }}
                             min="0"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                             Pourcentage calculé
                           </label>
                           <div className="w-full px-3 py-2 rounded-lg border transition-all duration-300 bg-gray-800"
                             style={{ 
                               borderColor: 'var(--border-secondary)',
                               color: 'var(--text-primary)'
                             }}
                           >
                             {addFormData.total && addFormData.completed ? 
                               Math.round((addFormData.completed / addFormData.total) * 100) : 0}%
                           </div>
                         </div>
                       </>
                     )}

                     {addFormData.type === 'infrastructure' && (
                       <>
                         <div>
                           <label className="block text-sm font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                             Nombre d&apos;équipements
                           </label>
                           <input
                             type="number"
                             value={addFormData.equipmentCount || 0}
                             onChange={(e) => setAddFormData({...addFormData, equipmentCount: parseInt(e.target.value)})}
                             className="w-full px-3 py-2 rounded-lg border transition-all duration-300"
                             style={{ 
                               background: 'var(--bg-secondary)', 
                               borderColor: 'var(--border-secondary)',
                               color: 'var(--text-primary)'
                             }}
                             min="0"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                             État
                           </label>
                           <select
                             value={addFormData.status || ''}
                             onChange={(e) => setAddFormData({...addFormData, status: e.target.value})}
                             className="w-full px-3 py-2 rounded-lg border transition-all duration-300"
                             style={{ 
                               background: 'var(--bg-secondary)', 
                               borderColor: 'var(--border-secondary)',
                               color: 'var(--text-primary)'
                             }}
                           >
                             <option value="Sécurisé">Sécurisé</option>
                             <option value="À vérifier">À vérifier</option>
                             <option value="Critique">Critique</option>
                             <option value="Normal">Normal</option>
                           </select>
                         </div>
                       </>
                     )}

                     {addFormData.type === 'compliance' && (
                       <>
                         <div>
                           <label className="block text-sm font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                             Statut
                           </label>
                           <select
                             value={addFormData.status || ''}
                             onChange={(e) => setAddFormData({...addFormData, status: e.target.value})}
                             className="w-full px-3 py-2 rounded-lg border transition-all duration-300"
                             style={{ 
                               background: 'var(--bg-secondary)', 
                               borderColor: 'var(--border-secondary)',
                               color: 'var(--text-primary)'
                             }}
                           >
                             <option value="CONFORME">CONFORME</option>
                             <option value="EN COURS">EN COURS</option>
                             <option value="NON CONFORME">NON CONFORME</option>
                           </select>
                         </div>
                         <div>
                           <label className="block text-sm font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                             Date de certification
                           </label>
                           <input
                             type="text"
                             value={addFormData.certificationDate || ''}
                             onChange={(e) => setAddFormData({...addFormData, certificationDate: e.target.value})}
                             className="w-full px-3 py-2 rounded-lg border transition-all duration-300"
                             style={{ 
                               background: 'var(--bg-secondary)', 
                               borderColor: 'var(--border-secondary)',
                               color: 'var(--text-primary)'
                             }}
                             placeholder="ex: 2023"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                             Prochaine audit
                           </label>
                           <input
                             type="text"
                             value={addFormData.nextAudit || ''}
                             onChange={(e) => setAddFormData({...addFormData, nextAudit: e.target.value})}
                             className="w-full px-3 py-2 rounded-lg border transition-all duration-300"
                             style={{ 
                               background: 'var(--bg-secondary)', 
                               borderColor: 'var(--border-secondary)',
                               color: 'var(--text-primary)'
                             }}
                             placeholder="ex: Décembre 2024"
                           />
                         </div>
                       </>
                     )}

                     {addFormData.type === 'recommendation' && (
                       <>
                         <div>
                           <label className="block text-sm font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                             Priorité
                           </label>
                           <select
                             value={addFormData.priority || ''}
                             onChange={(e) => setAddFormData({...addFormData, priority: e.target.value})}
                             className="w-full px-3 py-2 rounded-lg border transition-all duration-300"
                             style={{ 
                               background: 'var(--bg-secondary)', 
                               borderColor: 'var(--border-secondary)',
                               color: 'var(--text-primary)'
                             }}
                           >
                             <option value="Haute">Haute</option>
                             <option value="Moyenne">Moyenne</option>
                             <option value="Basse">Basse</option>
                           </select>
                         </div>
                         <div>
                           <label className="block text-sm font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                             Description
                           </label>
                           <textarea
                             value={addFormData.description || ''}
                             onChange={(e) => setAddFormData({...addFormData, description: e.target.value})}
                             className="w-full px-3 py-2 rounded-lg border transition-all duration-300"
                             style={{ 
                               background: 'var(--bg-secondary)', 
                               borderColor: 'var(--border-secondary)',
                               color: 'var(--text-primary)'
                             }}
                             rows={3}
                             placeholder="Description de la recommandation"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                             Échéance
                           </label>
                           <input
                             type="text"
                             value={addFormData.deadline || ''}
                             onChange={(e) => setAddFormData({...addFormData, deadline: e.target.value})}
                             className="w-full px-3 py-2 rounded-lg border transition-all duration-300"
                             style={{ 
                               background: 'var(--bg-secondary)', 
                               borderColor: 'var(--border-secondary)',
                               color: 'var(--text-primary)'
                             }}
                             placeholder="ex: 3 mois"
                           />
                         </div>
                       </>
                     )}
                   </div>

                   <div className="flex gap-3 mt-6">
                     <button
                       onClick={handleCancelAdd}
                       className="flex-1 px-4 py-2 rounded-lg border transition-all duration-300"
                       style={{ 
                         borderColor: 'var(--border-secondary)',
                         color: 'var(--text-muted)'
                       }}
                     >
                       Annuler
                     </button>
                     <button
                       onClick={handleSaveNewCard}
                       className="flex-1 px-4 py-2 rounded-lg font-karla-medium transition-all duration-300"
                       style={{ 
                         background: categoryColors[category],
                         color: 'black'
                       }}
                     >
                       Ajouter
                     </button>
                   </div>
                 </motion.div>
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
                   onClick={cancelDelete}
                   className="fixed inset-0 bg-black bg-opacity-50 z-[120]"
                 />
                 
                 <motion.div
                   initial={{ opacity: 0, scale: 0.9, y: 20 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.9, y: 20 }}
                   className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-black border rounded-xl p-6 z-[130]"
                   style={{ borderColor: 'var(--border-primary)' }}
                 >
                   <div className="flex items-center justify-between mb-6">
                     <h3 className="text-lg font-karla-bold" style={{ color: 'var(--text-primary)' }}>
                       Confirmer la suppression
                     </h3>
                     <button
                       onClick={cancelDelete}
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
                           Supprimer la carte
                         </h4>
                         <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                           Cette action est irréversible
                         </p>
                       </div>
                     </div>
                     
                     <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                       Êtes-vous sûr de vouloir supprimer la carte <span className="font-karla-bold" style={{ color: 'var(--text-primary)' }}>&ldquo;{deleteConfirmation.cardName}&rdquo;</span> ?
                     </p>
                     <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                       Cette action supprimera définitivement la carte et toutes ses données associées.
                     </p>
                   </div>

                   <div className="flex gap-3">
                     <button
                       onClick={cancelDelete}
                       className="flex-1 px-4 py-3 rounded-lg border transition-all duration-300 font-karla-medium"
                       style={{ 
                         borderColor: 'var(--border-secondary)',
                         color: 'var(--text-muted)'
                       }}
                     >
                       Annuler
                     </button>
                     <button
                       onClick={confirmDelete}
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
               </>
             )}
           </AnimatePresence>
         </>
       )}
     </AnimatePresence>
   );
 } 