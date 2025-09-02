'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@/components/ui/switch';

interface CardFormData {
  id: number;
  name: string;
  type: 'coverage' | 'infrastructure' | 'compliance' | 'recommendation';
  category: 'defensive' | 'general' | 'offensive';
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
  onRemoveTaskFromPanel?: (taskName: string) => void;
  tasksAddedFromPanel?: Array<{
    id: number;
    name: string;
    description: string;
    importance: string;
    category: string;
    score: number;
    dueDate: string;
    assignedTo: string;
  }>;
  forceSyncPanelData?: () => void;
  panelCards?: Array<{
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
  }>;
}

const categoryColors = {
  defensive: 'var(--theme-primary)',
  general: 'var(--theme-primary)',
  offensive: 'var(--theme-primary)',
};

const categoryDescriptions = {
  defensive: 'Systèmes de protection et surveillance',
  general: 'Services d&apos;infrastructure et maintenance',
  offensive: 'Tests de pénétration et évaluation',
};



export default function CategoryDetailsPanel({ isOpen, onClose, category, categoryTitle, userRole = 'user', onAddTask, tasksAddedFromPanel = [], forceSyncPanelData, panelCards = [] }: CategoryDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState<'coverage' | 'infrastructure' | 'compliance' | 'recommendations'>('coverage');
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<CardFormData>({} as CardFormData);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [addFormData, setAddFormData] = useState<CardFormData>({} as CardFormData);
  const [savedCards, setSavedCards] = useState<Record<string, CardFormData>>({});
  const [renderKey, setRenderKey] = useState(0); // Pour forcer le re-rendu

  // Charger les cartes sauvegardées et les cartes supprimées au montage du composant
  useEffect(() => {
    const loadSavedCards = () => {
      try {
        const companyId = localStorage.getItem('companyId');
        const saved = JSON.parse(localStorage.getItem(`panelCards_${companyId}`) || '{}');
        setSavedCards(saved);
      } catch (error) {
        console.error('Erreur lors du chargement des cartes:', error);
        setSavedCards({});
      }
    };

    loadSavedCards();
  }, []);

  const tabs = [
    { id: 'coverage', label: 'COUVERTURE' },
    { id: 'infrastructure', label: 'INFRASTRUCTURE' },
    { id: 'compliance', label: 'CONFORMITÉ' },
    { id: 'recommendations', label: 'RECOMMANDATIONS' },
  ] as const;

  const handleAddToDashboard = (cardId: number, taskName: string, description: string, importance: string = 'Moyenne') => {
    if (onAddTask && !tasksAddedFromPanel.some(task => task.name === taskName && task.category === category)) {
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

  const handleEditCard = (cardName: string) => {
    console.log('handleEditCard appelé pour:', cardName);
    // Récupérer les données existantes de la carte depuis l'API
    const existingCard = panelCards.find(card => card.name === cardName);
    
    if (existingCard) {
      console.log('Carte trouvée:', existingCard);
      setEditingCard(cardName);
      setEditFormData({
        id: existingCard.id,
        name: existingCard.name,
        type: existingCard.type as 'coverage' | 'infrastructure' | 'compliance' | 'recommendation',
        category: existingCard.category as 'defensive' | 'general' | 'offensive', // Type assertion
        total: existingCard.total,
        completed: existingCard.completed,
        equipmentCount: existingCard.equipmentCount,
        status: existingCard.status,
        certificationDate: existingCard.certificationDate,
        nextAudit: existingCard.nextAudit,
        priority: existingCard.priority,
        description: existingCard.description,
        deadline: existingCard.deadline
      });
      console.log('editFormData initialisé avec:', {
        id: existingCard.id,
        name: existingCard.name,
        description: existingCard.description
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingCard) return;

    try {
      // Trouver l'instance de la carte dans panelCards
      const cardInstance = panelCards.find(card => card.name === editingCard);
      
      if (!cardInstance) {
        console.error('Carte non trouvée:', editingCard);
        return;
      }

      // Préparer les données à envoyer à l'API
      const updateData = {
        name: editFormData.name, // Inclure le nom pour permettre sa modification
        total: editFormData.total,
        completed: editFormData.completed,
        equipmentCount: editFormData.equipmentCount,
        status: editFormData.status,
        certificationDate: editFormData.certificationDate,
        nextAudit: editFormData.nextAudit,
        deadline: editFormData.deadline,
        description: editFormData.description, // Inclure la description
        priority: editFormData.priority // Inclure la priorité
      };

      // Envoyer la mise à jour à l'API
      const token = localStorage.getItem('token');
      const response = await fetch('/api/panel_cards', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: cardInstance.id,
          ...updateData
        })
      });

      if (response.ok) {
        console.log('Carte mise à jour avec succès');
        
        // Réinitialiser l'état d'édition
        setEditingCard(null);
        setEditFormData({} as CardFormData);
        // setIsEditing(false); // Désactiver le mode édition - supprimé
        setRenderKey(prev => prev + 1); // Forcer le re-rendu
        
        // Attendre un peu que l'API traite la mise à jour avant de synchroniser
        setTimeout(() => {
          // Déclencher la synchronisation dans la page d'accueil
          if (forceSyncPanelData) {
            console.log('Appel de forceSyncPanelData depuis handleSaveEdit (après délai)');
            forceSyncPanelData();
          }
        }, 1000); // Attendre 1 seconde pour une meilleure synchronisation
      } else {
        console.error('Erreur lors de la mise à jour de la carte');
        const errorData = await response.json();
        console.error('Détails de l\'erreur:', errorData);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleAddNewCard = (cardType: 'coverage' | 'infrastructure' | 'compliance' | 'recommendation') => {
    setIsAddingCard(true);
    setAddFormData({
      id: 0, // Nouvelle carte, ID 0
      name: '',
      type: cardType,
      category: category, // Ajouter la catégorie actuelle
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

  const handleSaveNewCard = async () => {
    if (!addFormData.name.trim()) {
      alert('Le nom de la carte est requis');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Token d\'authentification manquant');
        return;
      }

      // Créer la nouvelle carte via l'API
      const response = await fetch('/api/panel_cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: addFormData.name,
          type: addFormData.type,
          category: category,
          total: addFormData.total,
          completed: addFormData.completed,
          equipmentCount: addFormData.equipmentCount,
          status: addFormData.status,
          certificationDate: addFormData.certificationDate,
          nextAudit: addFormData.nextAudit,
          priority: addFormData.priority,
          description: addFormData.description,
          deadline: addFormData.deadline
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Nouvelle carte créée avec succès:', data.panelCard);
        
        // Réinitialiser le formulaire
        setIsAddingCard(false);
        setAddFormData({} as CardFormData);
        
        // Déclencher la synchronisation dans la page d'accueil avec un délai
        if (forceSyncPanelData) {
          setTimeout(() => {
            forceSyncPanelData();
          }, 1000); // Attendre 1 seconde pour que l'API traite la requête
        }
        
        // Forcer le re-rendu
        setRenderKey(prev => prev + 1);
      } else {
        const errorData = await response.json();
        console.error('Erreur lors de la création de la carte:', errorData);
        alert(`Erreur lors de la création de la carte: ${errorData.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur lors de la création de la carte:', error);
      alert('Erreur lors de la création de la carte');
    }
  };

  const handleCancelAdd = () => {
    setIsAddingCard(false);
    setAddFormData({} as CardFormData);
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
    setEditFormData({} as CardFormData);
    // setIsEditing(false); // Désactiver le mode édition - supprimé
  };

  // Les admins d'entreprise ne peuvent pas supprimer les templates du super admin
  // Seul le super admin peut gérer les templates depuis /superadmin/panel-templates

  // Fonction pour obtenir toutes les cartes d'un type donné depuis l'API
  const getCardsByType = (type: string) => {
    if (!panelCards || !Array.isArray(panelCards)) return [];
    
    return panelCards.filter(card => {
      // Filtrer les cartes par type et exclure les cartes avec des noms problématiques
      return card.type === type && card.isActive && card.name !== 'Switch';
    }).map(card => {
      return {
        id: card.id,
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
        deadline: card.deadline
      };
    });
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
                    Math.min(Math.round((card.completed / card.total) * 100), 100) : 0}%
                        </span>
                        {userRole === 'admin' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                      handleEditCard(card.name);
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
                        {/* Switch pour afficher/masquer la carte */}
                {userRole === 'admin' && (
                          <Switch 
                            id={`switch-${card.id}-${card.name}-${card.type}`}
                            checked={tasksAddedFromPanel.some(task => task.name === card.name && task.category === category)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleAddToDashboard(card.id, card.name, card.description || '', 'Moyenne');
                              }
                            }}
                          />
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
                    Math.min(Math.round((card.completed / card.total) * 100), 100) : 0}%`, 
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
              <span className="text-sm font-karla-bold infrastructure-card-name" style={{ color: 'var(--text-primary)' }}>{card.name}</span>
              <div className="flex items-center gap-2 ml-auto">
                        {userRole === 'admin' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                      handleEditCard(card.name);
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
                        {/* Switch pour afficher/masquer la carte */}
                {userRole === 'admin' && (
                          <Switch 
                            id={`switch-${card.id}-${card.name}-${card.type}`}
                            checked={tasksAddedFromPanel.some(task => task.name === card.name && task.category === category)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleAddToDashboard(card.id, card.name, card.description || '', 'Moyenne');
                              }
                            }}
                          />
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
              <span className="text-sm font-karla-bold compliance-card-name" style={{ color: 'var(--text-primary)' }}>{card.name}</span>
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
                      handleEditCard(card.name);
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
                          {/* Switch pour afficher/masquer la carte */}
                {userRole === 'admin' && (
                            <Switch 
                              id={`switch-${card.id}-${card.name}-${card.type}`}
                              checked={tasksAddedFromPanel.some(task => task.name === card.name && task.category === category)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleAddToDashboard(card.id, card.name, card.description || '', 'Moyenne');
                                }
                              }}
                            />
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
                <h4 className="text-sm font-karla-bold mb-2 recommendation-card-name" style={{ color: 'var(--text-primary)' }}>
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
                      handleEditCard(card.name);
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
                        {/* Switch pour afficher/masquer la carte */}
                {userRole === 'admin' && (
                        <Switch 
                          id={`switch-${card.id}-${card.name}-${card.type}`}
                          checked={tasksAddedFromPanel.some(task => task.name === card.name && task.category === category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleAddToDashboard(card.id, card.name, card.description || '', 'Moyenne');
                            }
                          }}
                        />
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
                <h3 className="text-lg font-karla-bold tab-title" style={{ color: 'var(--text-primary)' }}>Indicateurs de Couverture</h3>
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
                <h3 className="text-lg font-karla-bold tab-title" style={{ color: 'var(--text-primary)' }}>Équipements d&apos;Infrastructure</h3>
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
                 <h3 className="text-lg font-karla-bold tab-title" style={{ color: 'var(--text-primary)' }}>Standards de Conformité</h3>
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
                 <h3 className="text-lg font-karla-bold tab-title" style={{ color: 'var(--text-primary)' }}>Recommandations d&apos;Amélioration</h3>
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
             className="fixed right-0 top-0 h-full w-full max-w-md bg-black border-l z-50 flex flex-col panel-follow-up"
             style={{ borderColor: 'var(--border-primary)' }}
           >
             {/* Header */}
             <div className="p-6 border-b flex-shrink-0" style={{ borderColor: 'var(--border-primary)' }}>
               <div className="flex items-center justify-between mb-6">
                 <div>
                   <h2 className="text-xl font-karla-bold mb-1 panel-title" style={{ color: categoryColors[category] }}>
                     {categoryTitle}
                   </h2>
                   <p className="text-sm panel-description" style={{ color: 'var(--text-muted)' }}>
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
                    className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-md mx-4 bg-black border rounded-xl p-6 z-[110] max-h-[90vh] overflow-y-auto panel-edit-modal"
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
                         onChange={(e) => setEditFormData(prevData => ({...prevData, name: e.target.value}))}
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
                             onChange={(e) => setEditFormData(prevData => ({...prevData, total: parseInt(e.target.value)}))}
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
                             onChange={(e) => setEditFormData(prevData => ({...prevData, completed: parseInt(e.target.value)}))}
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
                               Math.min(Math.round((editFormData.completed / editFormData.total) * 100), 100) : 0}%
                           </div>
                         </div>
                         <div>
                           <label className="block text-sm font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                             Description
                           </label>
                           <textarea
                             value={editFormData.description || ''}
                             onChange={(e) => setEditFormData(prevData => ({...prevData, description: e.target.value}))}
                             className="w-full px-3 py-2 rounded-lg border transition-all duration-300"
                             style={{ 
                               background: 'var(--bg-secondary)', 
                               borderColor: 'var(--border-secondary)',
                               color: 'var(--text-primary)'
                             }}
                             rows={3}
                             placeholder="Description de la carte de couverture"
                           />
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
                           onChange={(e) => setEditFormData(prevData => ({...prevData, equipmentCount: parseInt(e.target.value)}))}
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
                           onChange={(e) => setEditFormData(prevData => ({...prevData, status: e.target.value}))}
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
                       <div>
                         <label className="block text-sm font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                           Description
                         </label>
                         <textarea
                           value={editFormData.description || ''}
                           onChange={(e) => setEditFormData(prevData => ({...prevData, description: e.target.value}))}
                           className="w-full px-3 py-2 rounded-lg border transition-all duration-300"
                           style={{ 
                             background: 'var(--bg-secondary)', 
                             borderColor: 'var(--border-secondary)',
                             color: 'var(--text-primary)'
                           }}
                           rows={3}
                           placeholder="Description de l'infrastructure"
                         />
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
                             onChange={(e) => setEditFormData(prevData => ({...prevData, status: e.target.value}))}
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
                             onChange={(e) => setEditFormData(prevData => ({...prevData, certificationDate: e.target.value}))}
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
                             onChange={(e) => setEditFormData(prevData => ({...prevData, nextAudit: e.target.value}))}
                             className="w-full px-3 py-2 rounded-lg border transition-all duration-300"
                             style={{ 
                               background: 'var(--bg-secondary)', 
                               borderColor: 'var(--border-secondary)',
                               color: 'var(--text-primary)'
                             }}
                             placeholder="ex: Décembre 2024"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                             Description
                           </label>
                           <textarea
                             value={editFormData.description || ''}
                             onChange={(e) => setEditFormData(prevData => ({...prevData, description: e.target.value}))}
                             className="w-full px-3 py-2 rounded-lg border transition-all duration-300"
                             style={{ 
                               background: 'var(--bg-secondary)', 
                               borderColor: 'var(--border-secondary)',
                               color: 'var(--text-primary)'
                             }}
                             rows={3}
                             placeholder="Description de la conformité"
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
                             onChange={(e) => setEditFormData(prevData => ({...prevData, priority: e.target.value}))}
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
                             onChange={(e) => setEditFormData(prevData => ({...prevData, description: e.target.value}))}
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
                             onChange={(e) => setEditFormData(prevData => ({...prevData, deadline: e.target.value}))}
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
                      className="flex-1 px-4 py-2 rounded-lg border transition-all duration-300 panel-cancel-button"
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
                   className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-md mx-4 bg-black border rounded-xl p-6 z-[110] max-h-[90vh] overflow-y-auto panel-add-modal"
                   style={{ borderColor: 'var(--border-primary)' }}
                 >
                   <div className="flex items-center justify-between mb-6">
                     <h3 className="text-lg font-karla-bold panel-add-title" style={{ color: 'var(--text-primary)' }}>
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
                         onChange={(e) => setAddFormData(prevData => ({...prevData, name: e.target.value}))}
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
                             onChange={(e) => setAddFormData(prevData => ({...prevData, total: parseInt(e.target.value)}))}
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
                             onChange={(e) => setAddFormData(prevData => ({...prevData, completed: parseInt(e.target.value)}))}
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
                               Math.min(Math.round((addFormData.completed / addFormData.total) * 100), 100) : 0}%
                           </div>
                         </div>
                         <div>
                           <label className="block text-sm font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                             Description
                           </label>
                           <textarea
                             value={addFormData.description || ''}
                             onChange={(e) => setAddFormData(prevData => ({...prevData, description: e.target.value}))}
                             className="w-full px-3 py-2 rounded-lg border transition-all duration-300"
                             style={{ 
                               background: 'var(--bg-secondary)', 
                               borderColor: 'var(--border-secondary)',
                               color: 'var(--text-primary)'
                             }}
                             rows={3}
                             placeholder="Description de la carte de couverture"
                           />
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
                             onChange={(e) => setAddFormData(prevData => ({...prevData, equipmentCount: parseInt(e.target.value)}))}
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
                             onChange={(e) => setAddFormData(prevData => ({...prevData, status: e.target.value}))}
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
                         <div>
                           <label className="block text-sm font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                             Description
                           </label>
                           <textarea
                             value={addFormData.description || ''}
                             onChange={(e) => setAddFormData(prevData => ({...prevData, description: e.target.value}))}
                             className="w-full px-3 py-2 rounded-lg border transition-all duration-300"
                             style={{ 
                               background: 'var(--bg-secondary)', 
                               borderColor: 'var(--border-secondary)',
                               color: 'var(--text-primary)'
                             }}
                             rows={3}
                             placeholder="Description de l'infrastructure"
                           />
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
                             onChange={(e) => setAddFormData(prevData => ({...prevData, status: e.target.value}))}
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
                             onChange={(e) => setAddFormData(prevData => ({...prevData, certificationDate: e.target.value}))}
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
                             onChange={(e) => setAddFormData(prevData => ({...prevData, nextAudit: e.target.value}))}
                             className="w-full px-3 py-2 rounded-lg border transition-all duration-300"
                             style={{ 
                               background: 'var(--bg-secondary)', 
                               borderColor: 'var(--border-secondary)',
                               color: 'var(--text-primary)'
                             }}
                             placeholder="ex: Décembre 2024"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                             Description
                           </label>
                           <textarea
                             value={addFormData.description || ''}
                             onChange={(e) => setAddFormData(prevData => ({...prevData, description: e.target.value}))}
                             className="w-full px-3 py-2 rounded-lg border transition-all duration-300"
                             style={{ 
                               background: 'var(--bg-secondary)', 
                               borderColor: 'var(--border-secondary)',
                               color: 'var(--text-primary)'
                             }}
                             rows={3}
                             placeholder="Description de la conformité"
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
                             onChange={(e) => setAddFormData(prevData => ({...prevData, priority: e.target.value}))}
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
                             onChange={(e) => setAddFormData(prevData => ({...prevData, description: e.target.value}))}
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
                             onChange={(e) => setAddFormData(prevData => ({...prevData, deadline: e.target.value}))}
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
                       className="flex-1 px-4 py-2 rounded-lg border transition-all duration-300 panel-cancel-button"
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


         </>
       )}
     </AnimatePresence>
   );
 } 