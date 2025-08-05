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

  const renderCardWithStatus = (taskName: string, description: string, importance: string, children: React.ReactNode) => (
    <div 
      className="p-4 rounded-lg border transition-all duration-300 hover:border-opacity-60 cursor-pointer group relative"
      style={{ 
        background: 'var(--bg-card)', 
        borderColor: 'var(--border-secondary)' 
      }}
             onClick={() => userRole === 'admin' && !tasksAddedFromPanel.some(task => task.name === taskName) && handleAddToDashboard(taskName, description, importance)}
    >
             {tasksAddedFromPanel.some(task => task.name === taskName) && (
         <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-karla-bold" style={{ background: '#10b981', color: 'black' }}>
           AFFICHÉ
         </div>
       )}
      {children}
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
                             onClick={() => setIsEditing(!isEditing)}
                             className="px-2 py-1 rounded text-xs font-karla-medium transition-all duration-300"
                             style={{ 
                               background: isEditing ? '#ef4444' : categoryColors[category],
                               color: 'black'
                             }}
                           >
                             {isEditing ? 'TERMINER' : 'MODIFIER'}
                           </button>
                         )}
                                                  {userRole === 'admin' && !tasksAddedFromPanel.some(task => task.name === 'Formation Cybersécurité') && (
                           <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: categoryColors[category] }}>
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                             </svg>
                           </div>
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
                             onClick={() => setIsEditing(!isEditing)}
                             className="px-2 py-1 rounded text-xs font-karla-medium transition-all duration-300"
                             style={{ 
                               background: isEditing ? '#ef4444' : categoryColors[category],
                               color: 'black'
                             }}
                           >
                             {isEditing ? 'TERMINER' : 'MODIFIER'}
                           </button>
                         )}
                                                  {userRole === 'admin' && !tasksAddedFromPanel.some(task => task.name === 'Pentest Infrastructure') && (
                           <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: categoryColors[category] }}>
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                             </svg>
                           </div>
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
                                     {tasksAddedFromPanel.some(task => task.name === 'Configuration Switches') && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-karla-bold" style={{ background: '#10b981', color: 'black' }}>
                      AFFICHÉ
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#10b981' }}></div>
                    <span className="text-sm font-karla-bold" style={{ color: 'var(--text-primary)' }}>Switches</span>
                                         {userRole === 'admin' && !tasksAddedFromPanel.some(task => task.name === 'Configuration Switches') && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-auto">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: categoryColors[category] }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>15 équipements configurés</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>État: Sécurisé</div>
                </div>

                <div 
                  className="p-4 rounded-lg border transition-all duration-300 hover:border-opacity-60 cursor-pointer group"
                  style={{ 
                    background: 'var(--bg-card)', 
                    borderColor: 'var(--border-secondary)' 
                  }}
                  onClick={() => userRole === 'admin' && handleAddToDashboard('Audit Serveurs', 'Audit de sécurité des serveurs actifs', 'Haute')}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }}></div>
                    <span className="text-sm font-karla-bold" style={{ color: 'var(--text-primary)' }}>Serveurs</span>
                    {userRole === 'admin' && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-auto">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: categoryColors[category] }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>8 serveurs actifs</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>État: À vérifier</div>
                </div>

                <div 
                  className="p-4 rounded-lg border transition-all duration-300 hover:border-opacity-60 cursor-pointer group"
                  style={{ 
                    background: 'var(--bg-card)', 
                    borderColor: 'var(--border-secondary)' 
                  }}
                  onClick={() => userRole === 'admin' && handleAddToDashboard('Maintenance Firewalls', 'Maintenance et mise à jour des firewalls', 'Critique')}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }}></div>
                    <span className="text-sm font-karla-bold" style={{ color: 'var(--text-primary)' }}>Firewalls</span>
                    {userRole === 'admin' && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-auto">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: categoryColors[category] }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>3 firewalls déployés</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>État: Critique</div>
                </div>

                <div 
                  className="p-4 rounded-lg border transition-all duration-300 hover:border-opacity-60 cursor-pointer group"
                  style={{ 
                    background: 'var(--bg-card)', 
                    borderColor: 'var(--border-secondary)' 
                  }}
                  onClick={() => userRole === 'admin' && handleAddToDashboard('Configuration Routers', 'Configuration et optimisation des routeurs', 'Moyenne')}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#3b82f6' }}></div>
                    <span className="text-sm font-karla-bold" style={{ color: 'var(--text-primary)' }}>Routers</span>
                    {userRole === 'admin' && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-auto">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: categoryColors[category] }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>5 routeurs configurés</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>État: Normal</div>
                </div>
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
                <div 
                  className="p-4 rounded-lg border transition-all duration-300 hover:border-opacity-60 cursor-pointer group"
                  style={{ 
                    background: 'var(--bg-card)', 
                    borderColor: 'var(--border-secondary)' 
                  }}
                  onClick={() => userRole === 'admin' && handleAddToDashboard('Audit ISO 27001', 'Audit de conformité ISO 27001', 'Haute')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-karla-bold" style={{ color: 'var(--text-primary)' }}>ISO 27001</span>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-karla-bold" style={{ background: '#10b981', color: 'black' }}>CONFORME</span>
                      {userRole === 'admin' && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: categoryColors[category] }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Certification obtenue en 2023</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Prochaine audit: Décembre 2024</div>
                </div>

                <div 
                  className="p-4 rounded-lg border transition-all duration-300 hover:border-opacity-60 cursor-pointer group"
                  style={{ 
                    background: 'var(--bg-card)', 
                    borderColor: 'var(--border-secondary)' 
                  }}
                  onClick={() => userRole === 'admin' && handleAddToDashboard('Mise en conformité NIS2', 'Mise en conformité avec la directive NIS2', 'Critique')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-karla-bold" style={{ color: 'var(--text-primary)' }}>NIS2</span>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-karla-bold" style={{ background: '#f59e0b', color: 'black' }}>EN COURS</span>
                      {userRole === 'admin' && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: categoryColors[category] }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Mise en conformité en cours</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Échéance: Octobre 2024</div>
                </div>

                <div 
                  className="p-4 rounded-lg border transition-all duration-300 hover:border-opacity-60 cursor-pointer group"
                  style={{ 
                    background: 'var(--bg-card)', 
                    borderColor: 'var(--border-secondary)' 
                  }}
                  onClick={() => userRole === 'admin' && handleAddToDashboard('Vérification RGPD', 'Vérification de la conformité RGPD', 'Moyenne')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-karla-bold" style={{ color: 'var(--text-primary)' }}>RGPD</span>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-karla-bold" style={{ background: '#10b981', color: 'black' }}>CONFORME</span>
                      {userRole === 'admin' && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: categoryColors[category] }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Conformité validée</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Dernière vérification: Mars 2024</div>
                </div>
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
                <div 
                  className="p-4 rounded-lg border transition-all duration-300 hover:border-opacity-60 cursor-pointer group"
                  style={{ 
                    background: 'var(--bg-card)', 
                    borderColor: 'var(--border-secondary)' 
                  }}
                  onClick={() => userRole === 'admin' && handleAddToDashboard('Formation Cybersécurité Étendue', 'Étendre la formation cybersécurité aux 20 personnes restantes', 'Haute')}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-2" style={{ background: '#ef4444' }}></div>
                    <div className="flex-1">
                      <h4 className="text-sm font-karla-bold mb-2" style={{ color: 'var(--text-primary)' }}>Priorité Haute</h4>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>Étendre la formation cybersécurité aux 20 personnes restantes</p>
                    </div>
                    {userRole === 'admin' && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: categoryColors[category] }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                <div 
                  className="p-4 rounded-lg border transition-all duration-300 hover:border-opacity-60 cursor-pointer group"
                  style={{ 
                    background: 'var(--bg-card)', 
                    borderColor: 'var(--border-secondary)' 
                  }}
                  onClick={() => userRole === 'admin' && handleAddToDashboard('Pentest Serveurs Restants', 'Effectuer des pentests sur les 4 serveurs restants', 'Moyenne')}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-2" style={{ background: '#f59e0b' }}></div>
                    <div className="flex-1">
                      <h4 className="text-sm font-karla-bold mb-2" style={{ color: 'var(--text-primary)' }}>Priorité Moyenne</h4>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>Effectuer des pentests sur les 4 serveurs restants</p>
                    </div>
                    {userRole === 'admin' && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: categoryColors[category] }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                <div 
                  className="p-4 rounded-lg border transition-all duration-300 hover:border-opacity-60 cursor-pointer group"
                  style={{ 
                    background: 'var(--bg-card)', 
                    borderColor: 'var(--border-secondary)' 
                  }}
                  onClick={() => userRole === 'admin' && handleAddToDashboard('Mise à jour Documentation', 'Mettre à jour la documentation de sécurité', 'Basse')}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-2" style={{ background: '#10b981' }}></div>
                    <div className="flex-1">
                      <h4 className="text-sm font-karla-bold mb-2" style={{ color: 'var(--text-primary)' }}>Priorité Basse</h4>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>Mettre à jour la documentation de sécurité</p>
                    </div>
                    {userRole === 'admin' && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: categoryColors[category] }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
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
            className="fixed right-0 top-0 h-full w-full max-w-md bg-black border-l z-50"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            {/* Header */}
            <div className="p-6 border-b" style={{ borderColor: 'var(--border-primary)' }}>
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
            <div className="flex-1 overflow-y-auto p-6">
              {renderTabContent()}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 