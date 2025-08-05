'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  onRemoveTaskFromPanel?: (taskName: string) => void;
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

export default function CategoryDetailsPanel({ isOpen, onClose, category, categoryTitle, userRole = 'user', onAddTask, tasksAddedFromPanel = [], onRemoveTaskFromPanel }: CategoryDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState<'coverage' | 'infrastructure' | 'compliance' | 'recommendations'>('coverage');
  const [isEditing, setIsEditing] = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});

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

  const handleEditCard = (cardName: string, cardType: string) => {
    setEditingCard(cardName);
    setEditFormData({
      name: cardName,
      type: cardType,
             // Valeurs par défaut selon le type
       ...(cardType === 'coverage' && {
         total: cardName === 'Formation Cybersécurité' ? 30 : 5,
         completed: cardName === 'Formation Cybersécurité' ? 10 : 1
       }),
      ...(cardType === 'infrastructure' && {
        equipmentCount: cardName === 'Configuration Switches' ? 15 : 
                       cardName === 'Audit Serveurs' ? 8 :
                       cardName === 'Maintenance Firewalls' ? 3 : 5,
        status: cardName === 'Configuration Switches' ? 'Sécurisé' :
                cardName === 'Audit Serveurs' ? 'À vérifier' :
                cardName === 'Maintenance Firewalls' ? 'Critique' : 'Normal'
      }),
             ...(cardType === 'compliance' && {
         status: cardName === 'ISO 27001' ? 'CONFORME' :
                 cardName === 'NIS2' ? 'EN COURS' : 'CONFORME',
         certificationDate: cardName === 'ISO 27001' ? '2023' : '',
         nextAudit: cardName === 'ISO 27001' ? 'Décembre 2024' :
                    cardName === 'NIS2' ? 'Octobre 2024' : 'Mars 2024'
       }),
       ...(cardType === 'recommendation' && {
         priority: cardName === 'Formation Cybersécurité Étendue' ? 'Haute' :
                   cardName === 'Pentest Serveurs Restants' ? 'Moyenne' : 'Basse',
         description: cardName === 'Formation Cybersécurité Étendue' ? 'Étendre la formation cybersécurité aux 20 personnes restantes' :
                      cardName === 'Pentest Serveurs Restants' ? 'Effectuer des pentests sur les 4 serveurs restants' :
                      'Mettre à jour la documentation de sécurité',
         deadline: cardName === 'Formation Cybersécurité Étendue' ? '2 mois' :
                   cardName === 'Pentest Serveurs Restants' ? '3 mois' : '6 mois'
       })
    });
  };

  const handleSaveEdit = () => {
    // Ici on pourrait sauvegarder les modifications
    setEditingCard(null);
    setEditFormData({});
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
    setEditFormData({});
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
                     onClick={() => {/* TODO: Ajouter une nouvelle carte */}}
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
                {renderCardWithStatus('Formation Cybersécurité', 'Formation de sensibilisation à la cybersécurité pour les employés', 'Haute',
                  <>
                                         <div className="flex justify-between items-center mb-2">
                       <span className="text-sm font-karla-medium" style={{ color: 'var(--text-primary)' }}>Formation Cybersécurité</span>
                       <div className="flex items-center gap-2">
                         <span className="text-xs font-karla-bold" style={{ color: categoryColors[category] }}>33%</span>
                         {userRole === 'admin' && (
                           <button
                             onClick={() => handleEditCard('Formation Cybersécurité', 'coverage')}
                             className="px-2 py-1 rounded text-xs font-karla-medium transition-all duration-300"
                             style={{ 
                               background: categoryColors[category],
                               color: 'black'
                             }}
                           >
                             MODIFIER
                           </button>
                         )}
                                                                                                     {userRole === 'admin' && !tasksAddedFromPanel.some(task => task.name === 'Formation Cybersécurité') && (
                            <button
                              onClick={() => handleAddToDashboard('Formation Cybersécurité', 'Formation de sensibilisation à la cybersécurité pour les employés', 'Haute')}
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
                    <div className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>10 personnes formées sur 30</div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500" 
                        style={{ 
                          width: '33%', 
                          background: categoryColors[category] 
                        }}
                      ></div>
                    </div>
                  </>
                )}

                {renderCardWithStatus('Pentest Infrastructure', 'Test de pénétration sur l\'infrastructure réseau', 'Haute',
                  <>
                                         <div className="flex justify-between items-center mb-2">
                       <span className="text-sm font-karla-medium" style={{ color: 'var(--text-primary)' }}>Pentest Infrastructure</span>
                       <div className="flex items-center gap-2">
                         <span className="text-xs font-karla-bold" style={{ color: categoryColors[category] }}>20%</span>
                         {userRole === 'admin' && (
                           <button
                             onClick={() => handleEditCard('Pentest Infrastructure', 'coverage')}
                             className="px-2 py-1 rounded text-xs font-karla-medium transition-all duration-300"
                             style={{ 
                               background: categoryColors[category],
                               color: 'black'
                             }}
                           >
                             MODIFIER
                           </button>
                         )}
                                                                                                     {userRole === 'admin' && !tasksAddedFromPanel.some(task => task.name === 'Pentest Infrastructure') && (
                            <button
                              onClick={() => handleAddToDashboard('Pentest Infrastructure', 'Test de pénétration sur l\'infrastructure réseau', 'Haute')}
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
                    <div className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>1 serveur testé sur 5</div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500" 
                        style={{ 
                          width: '20%', 
                          background: categoryColors[category] 
                        }}
                      ></div>
                    </div>
                  </>
                )}
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
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-3 py-1 rounded-lg text-xs font-karla-medium transition-all duration-300"
                    style={{ 
                      background: isEditing ? '#ef4444' : categoryColors[category],
                      color: 'black'
                    }}
                  >
                    {isEditing ? 'TERMINER' : 'MODIFIER'}
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                                 <div 
                   className="p-4 rounded-lg border transition-all duration-300 hover:border-opacity-60 cursor-pointer group relative"
                   style={{ 
                     background: 'var(--bg-card)', 
                     borderColor: 'var(--border-secondary)' 
                   }}
                                      onClick={() => userRole === 'admin' && !tasksAddedFromPanel.some(task => task.name === 'Configuration Switches') && handleAddToDashboard('Configuration Switches', 'Configuration et sécurisation des switches réseau', 'Moyenne')}
                 >
                                     <div className="flex items-center gap-3 mb-3">
                     <div className="w-3 h-3 rounded-full" style={{ background: '#10b981' }}></div>
                     <span className="text-sm font-karla-bold" style={{ color: 'var(--text-primary)' }}>Switches</span>
                     <div className="flex items-center gap-2 ml-auto">
                       {userRole === 'admin' && (
                         <button
                           onClick={() => handleEditCard('Configuration Switches', 'infrastructure')}
                           className="px-2 py-1 rounded text-xs font-karla-medium transition-all duration-300"
                           style={{ 
                             background: categoryColors[category],
                             color: 'black'
                           }}
                         >
                           MODIFIER
                         </button>
                       )}
                       {userRole === 'admin' && !tasksAddedFromPanel.some(task => task.name === 'Configuration Switches') && (
                         <button
                           onClick={() => handleAddToDashboard('Configuration Switches', 'Configuration et sécurisation des switches réseau', 'Moyenne')}
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
                   <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>15 équipements configurés</div>
                   <div className="text-xs" style={{ color: 'var(--text-muted)' }}>État: Sécurisé</div>
                   {tasksAddedFromPanel.some(task => task.name === 'Configuration Switches') && (
                     <div className="mt-3 pt-2 border-t" style={{ borderColor: 'var(--border-secondary)' }}>
                       <div className="text-center">
                         <span className="px-2 py-1 rounded-full text-xs font-karla-bold" style={{ background: '#10b981', color: 'black' }}>
                           AFFICHÉ
                         </span>
                       </div>
                     </div>
                   )}
                </div>

                                 {renderCardWithStatus('Audit Serveurs', 'Audit de sécurité des serveurs actifs', 'Haute',
                   <>
                     <div className="flex items-center gap-3 mb-3">
                       <div className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }}></div>
                       <span className="text-sm font-karla-bold" style={{ color: 'var(--text-primary)' }}>Serveurs</span>
                       <div className="flex items-center gap-2 ml-auto">
                         {userRole === 'admin' && (
                           <button
                             onClick={() => handleEditCard('Audit Serveurs', 'infrastructure')}
                             className="px-2 py-1 rounded text-xs font-karla-medium transition-all duration-300"
                             style={{ 
                               background: categoryColors[category],
                               color: 'black'
                             }}
                           >
                             MODIFIER
                           </button>
                         )}
                         {userRole === 'admin' && !tasksAddedFromPanel.some(task => task.name === 'Audit Serveurs') && (
                           <button
                             onClick={() => handleAddToDashboard('Audit Serveurs', 'Audit de sécurité des serveurs actifs', 'Haute')}
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
                     <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>8 serveurs actifs</div>
                     <div className="text-xs" style={{ color: 'var(--text-muted)' }}>État: À vérifier</div>
                   </>
                 )}

                                 {renderCardWithStatus('Maintenance Firewalls', 'Maintenance et mise à jour des firewalls', 'Critique',
                   <>
                     <div className="flex items-center gap-3 mb-3">
                       <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }}></div>
                       <span className="text-sm font-karla-bold" style={{ color: 'var(--text-primary)' }}>Firewalls</span>
                       <div className="flex items-center gap-2 ml-auto">
                         {userRole === 'admin' && (
                           <button
                             onClick={() => handleEditCard('Maintenance Firewalls', 'infrastructure')}
                             className="px-2 py-1 rounded text-xs font-karla-medium transition-all duration-300"
                             style={{ 
                               background: categoryColors[category],
                               color: 'black'
                             }}
                           >
                             MODIFIER
                           </button>
                         )}
                         {userRole === 'admin' && !tasksAddedFromPanel.some(task => task.name === 'Maintenance Firewalls') && (
                           <button
                             onClick={() => handleAddToDashboard('Maintenance Firewalls', 'Maintenance et mise à jour des firewalls', 'Critique')}
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
                     <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>3 firewalls déployés</div>
                     <div className="text-xs" style={{ color: 'var(--text-muted)' }}>État: Critique</div>
                   </>
                 )}

                                 {renderCardWithStatus('Configuration Routers', 'Configuration et optimisation des routeurs', 'Moyenne',
                   <>
                     <div className="flex items-center gap-3 mb-3">
                       <div className="w-3 h-3 rounded-full" style={{ background: '#3b82f6' }}></div>
                       <span className="text-sm font-karla-bold" style={{ color: 'var(--text-primary)' }}>Routers</span>
                       <div className="flex items-center gap-2 ml-auto">
                         {userRole === 'admin' && (
                           <button
                             onClick={() => handleEditCard('Configuration Routers', 'infrastructure')}
                             className="px-2 py-1 rounded text-xs font-karla-medium transition-all duration-300"
                             style={{ 
                               background: categoryColors[category],
                               color: 'black'
                             }}
                           >
                             MODIFIER
                           </button>
                         )}
                         {userRole === 'admin' && !tasksAddedFromPanel.some(task => task.name === 'Configuration Routers') && (
                           <button
                             onClick={() => handleAddToDashboard('Configuration Routers', 'Configuration et optimisation des routeurs', 'Moyenne')}
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
                     <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>5 routeurs configurés</div>
                     <div className="text-xs" style={{ color: 'var(--text-muted)' }}>État: Normal</div>
                   </>
                 )}
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
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-3 py-1 rounded-lg text-xs font-karla-medium transition-all duration-300"
                    style={{ 
                      background: isEditing ? '#ef4444' : categoryColors[category],
                      color: 'black'
                    }}
                  >
                    {isEditing ? 'TERMINER' : 'MODIFIER'}
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                                 {renderCardWithStatus('Audit ISO 27001', 'Audit de conformité ISO 27001', 'Haute',
                   <>
                     <div className="flex items-center justify-between mb-3">
                       <span className="text-sm font-karla-bold" style={{ color: 'var(--text-primary)' }}>ISO 27001</span>
                       <div className="flex items-center gap-2">
                         <span className="px-3 py-1 rounded-full text-xs font-karla-bold" style={{ background: '#10b981', color: 'black' }}>CONFORME</span>
                         {userRole === 'admin' && (
                           <button
                             onClick={() => handleEditCard('Audit ISO 27001', 'compliance')}
                             className="px-2 py-1 rounded text-xs font-karla-medium transition-all duration-300"
                             style={{ 
                               background: categoryColors[category],
                               color: 'black'
                             }}
                           >
                             MODIFIER
                           </button>
                         )}
                         {userRole === 'admin' && !tasksAddedFromPanel.some(task => task.name === 'Audit ISO 27001') && (
                           <button
                             onClick={() => handleAddToDashboard('Audit ISO 27001', 'Audit de conformité ISO 27001', 'Haute')}
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
                     <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Certification obtenue en 2023</div>
                     <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Prochaine audit: Décembre 2024</div>
                   </>
                 )}

                                 {renderCardWithStatus('Mise en conformité NIS2', 'Mise en conformité avec la directive NIS2', 'Critique',
                   <>
                     <div className="flex items-center justify-between mb-3">
                       <span className="text-sm font-karla-bold" style={{ color: 'var(--text-primary)' }}>NIS2</span>
                       <div className="flex items-center gap-2">
                         <span className="px-3 py-1 rounded-full text-xs font-karla-bold" style={{ background: '#f59e0b', color: 'black' }}>EN COURS</span>
                         {userRole === 'admin' && (
                           <button
                             onClick={() => handleEditCard('Mise en conformité NIS2', 'compliance')}
                             className="px-2 py-1 rounded text-xs font-karla-medium transition-all duration-300"
                             style={{ 
                               background: categoryColors[category],
                               color: 'black'
                             }}
                           >
                             MODIFIER
                           </button>
                         )}
                         {userRole === 'admin' && !tasksAddedFromPanel.some(task => task.name === 'Mise en conformité NIS2') && (
                           <button
                             onClick={() => handleAddToDashboard('Mise en conformité NIS2', 'Mise en conformité avec la directive NIS2', 'Critique')}
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
                     <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Mise en conformité en cours</div>
                     <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Échéance: Octobre 2024</div>
                   </>
                 )}

                                 {renderCardWithStatus('Vérification RGPD', 'Vérification de la conformité RGPD', 'Moyenne',
                   <>
                     <div className="flex items-center justify-between mb-3">
                       <span className="text-sm font-karla-bold" style={{ color: 'var(--text-primary)' }}>RGPD</span>
                       <div className="flex items-center gap-2">
                         <span className="px-3 py-1 rounded-full text-xs font-karla-bold" style={{ background: '#10b981', color: 'black' }}>CONFORME</span>
                         {userRole === 'admin' && (
                           <button
                             onClick={() => handleEditCard('Vérification RGPD', 'compliance')}
                             className="px-2 py-1 rounded text-xs font-karla-medium transition-all duration-300"
                             style={{ 
                               background: categoryColors[category],
                               color: 'black'
                             }}
                           >
                             MODIFIER
                           </button>
                         )}
                         {userRole === 'admin' && !tasksAddedFromPanel.some(task => task.name === 'Vérification RGPD') && (
                           <button
                             onClick={() => handleAddToDashboard('Vérification RGPD', 'Vérification de la conformité RGPD', 'Moyenne')}
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
                     <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Conformité validée</div>
                     <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Dernière vérification: Mars 2024</div>
                   </>
                 )}
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
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-3 py-1 rounded-lg text-xs font-karla-medium transition-all duration-300"
                    style={{ 
                      background: isEditing ? '#ef4444' : categoryColors[category],
                      color: 'black'
                    }}
                  >
                    {isEditing ? 'TERMINER' : 'MODIFIER'}
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                                 {renderCardWithStatus('Formation Cybersécurité Étendue', 'Étendre la formation cybersécurité aux 20 personnes restantes', 'Haute',
                   <>
                     <div className="flex items-start gap-3">
                       <div className="w-2 h-2 rounded-full mt-2" style={{ background: '#ef4444' }}></div>
                       <div className="flex-1">
                         <h4 className="text-sm font-karla-bold mb-2" style={{ color: 'var(--text-primary)' }}>Priorité Haute</h4>
                         <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>Étendre la formation cybersécurité aux 20 personnes restantes</p>
                       </div>
                       <div className="flex items-center gap-2">
                         {userRole === 'admin' && (
                           <button
                             onClick={() => handleEditCard('Formation Cybersécurité Étendue', 'recommendation')}
                             className="px-2 py-1 rounded text-xs font-karla-medium transition-all duration-300"
                             style={{ 
                               background: categoryColors[category],
                               color: 'black'
                             }}
                           >
                             MODIFIER
                           </button>
                         )}
                         {userRole === 'admin' && !tasksAddedFromPanel.some(task => task.name === 'Formation Cybersécurité Étendue') && (
                           <button
                             onClick={() => handleAddToDashboard('Formation Cybersécurité Étendue', 'Étendre la formation cybersécurité aux 20 personnes restantes', 'Haute')}
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
                 )}

                                 {renderCardWithStatus('Pentest Serveurs Restants', 'Effectuer des pentests sur les 4 serveurs restants', 'Moyenne',
                   <>
                     <div className="flex items-start gap-3">
                       <div className="w-2 h-2 rounded-full mt-2" style={{ background: '#f59e0b' }}></div>
                       <div className="flex-1">
                         <h4 className="text-sm font-karla-bold mb-2" style={{ color: 'var(--text-primary)' }}>Priorité Moyenne</h4>
                         <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>Effectuer des pentests sur les 4 serveurs restants</p>
                       </div>
                       <div className="flex items-center gap-2">
                         {userRole === 'admin' && (
                           <button
                             onClick={() => handleEditCard('Pentest Serveurs Restants', 'recommendation')}
                             className="px-2 py-1 rounded text-xs font-karla-medium transition-all duration-300"
                             style={{ 
                               background: categoryColors[category],
                               color: 'black'
                             }}
                           >
                             MODIFIER
                           </button>
                         )}
                         {userRole === 'admin' && !tasksAddedFromPanel.some(task => task.name === 'Pentest Serveurs Restants') && (
                           <button
                             onClick={() => handleAddToDashboard('Pentest Serveurs Restants', 'Effectuer des pentests sur les 4 serveurs restants', 'Moyenne')}
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
                 )}

                                 {renderCardWithStatus('Mise à jour Documentation', 'Mettre à jour la documentation de sécurité', 'Basse',
                   <>
                     <div className="flex items-start gap-3">
                       <div className="w-2 h-2 rounded-full mt-2" style={{ background: '#10b981' }}></div>
                       <div className="flex-1">
                         <h4 className="text-sm font-karla-bold mb-2" style={{ color: 'var(--text-primary)' }}>Priorité Basse</h4>
                         <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>Mettre à jour la documentation de sécurité</p>
                       </div>
                       <div className="flex items-center gap-2">
                         {userRole === 'admin' && (
                           <button
                             onClick={() => handleEditCard('Mise à jour Documentation', 'recommendation')}
                             className="px-2 py-1 rounded text-xs font-karla-medium transition-all duration-300"
                             style={{ 
                               background: categoryColors[category],
                               color: 'black'
                             }}
                           >
                             MODIFIER
                           </button>
                         )}
                         {userRole === 'admin' && !tasksAddedFromPanel.some(task => task.name === 'Mise à jour Documentation') && (
                           <button
                             onClick={() => handleAddToDashboard('Mise à jour Documentation', 'Mettre à jour la documentation de sécurité', 'Basse')}
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
                 )}
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
        </>
      )}
    </AnimatePresence>
  );
} 