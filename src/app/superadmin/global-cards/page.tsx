'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';

interface GlobalCard {
  id: number;
  name: string;
  description: string;
  category: 'defensive' | 'general' | 'offensive';
  icon: string;
  defaultScore: number;
  defaultImportance: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  company?: {
    id: number;
    name: string;
  };
  isTaskService?: boolean; // Marqueur pour les services basés sur des tâches
}

interface PanelCard {
  id: number;
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
  isActive: boolean;
  company?: {
    id: number;
    name: string;
  };
  isIntelligent?: boolean; // Marqueur pour les cartes générées intelligemment
}

export default function GlobalCardsPage() {
  const [activeTab, setActiveTab] = useState<'panel' | 'services'>('panel');
  const [panelSubTab, setPanelSubTab] = useState<'coverage' | 'infrastructure' | 'compliance' | 'recommendation'>('coverage');
  const [globalCards, setGlobalCards] = useState<GlobalCard[]>([]);
  const [panelCards, setPanelCards] = useState<PanelCard[]>([]);
  const [globalStats, setGlobalStats] = useState({
    totalCompanies: 0,
    totalUsers: 0,
    totalTasks: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState<GlobalCard | null>(null);
  const [editingPanelCard, setEditingPanelCard] = useState<PanelCard | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'defensive' as 'defensive' | 'general' | 'offensive',
    icon: '🛡️',
    defaultScore: 5,
    defaultImportance: 'Moyenne',
  });
  const [panelFormData, setPanelFormData] = useState({
    name: '',
    type: 'coverage' as 'coverage' | 'infrastructure' | 'compliance' | 'recommendation',
    category: 'defensive' as 'defensive' | 'general' | 'offensive',
    total: 0,
    completed: 0,
    priority: 'Moyenne',
    description: '',
    deadline: '',
  });

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      
      if (!token || role !== 'SUPER_ADMIN') {
        router.push('/login');
        return;
      }
      
      fetchGlobalCards(token);
      fetchPanelCards(token);
    }
  }, [router]);

  const fetchGlobalCards = async (token: string) => {
    try {
      const response = await fetch('/api/superadmin/global_cards', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des cartes globales');
      }

      const data = await response.json();
      setGlobalCards(data.cards || []);
      if (data.globalStats) {
        setGlobalStats(data.globalStats);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const fetchPanelCards = async (token: string) => {
    try {
      // Récupérer les cartes de suivi de toutes les entreprises
      const response = await fetch('/api/superadmin/panel_cards', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des cartes du panneau');
      }

      const data = await response.json();
      setPanelCards(data.cards || []);
      if (data.globalStats) {
        setGlobalStats(data.globalStats);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des cartes du panneau:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const url = editingCard 
        ? `/api/superadmin/global_cards/${editingCard.id}`
        : '/api/superadmin/global_cards';
      
      const method = editingCard ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      setShowAddCardForm(false);
      setEditingCard(null);
      setFormData({
        name: '',
        description: '',
        category: 'defensive',
        icon: '🛡️',
        defaultScore: 5,
        defaultImportance: 'Moyenne',
      });
      
      fetchGlobalCards(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  const handleDelete = async (cardId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/superadmin/global_cards/${cardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      fetchGlobalCards(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  const handleEdit = (card: GlobalCard) => {
    setEditingCard(card);
    setFormData({
      name: card.name,
      description: card.description,
      category: card.category,
      icon: card.icon,
      defaultScore: card.defaultScore,
      defaultImportance: card.defaultImportance,
    });
    setShowAddCardForm(true);
  };

  const handleEditPanelCard = (card: PanelCard) => {
    setEditingPanelCard(card);
    setPanelFormData({
      name: card.name,
      type: card.type,
      category: card.category || 'defensive',
      total: card.total || 0,
      completed: card.completed || 0,
      priority: card.priority || 'Moyenne',
      description: card.description || '',
      deadline: card.deadline || '',
    });
    setShowAddCardForm(true);
  };

  const categoryColors = {
    defensive: '#CCFF00',
    general: '#CCFF00',
    offensive: '#9933FF',
  };

  const categoryTitles = {
    defensive: 'DÉFENSIF',
    general: 'GÉNÉRAL',
    offensive: 'OFFENSIF',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-karla flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4" style={{ color: '#CCFF00' }}>
            Chargement...
          </div>
          <div className="text-gray-400">Récupération des cartes globales</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-karla">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold" style={{ color: '#CCFF00' }}>
                drelto
              </span>
              <span className="text-sm text-gray-400">Cartes Globales</span>
            </div>
            
            <div className="flex space-x-4">
              <button 
                onClick={() => {
                  if (activeTab === 'services') {
                    setShowAddCardForm(true);
                  } else {
                    // Ouvrir le formulaire pour les cartes de panel
                    setPanelFormData({
                      name: '',
                      type: panelSubTab,
                      category: 'defensive',
                      total: 0,
                      completed: 0,
                      priority: 'Moyenne',
                      description: '',
                      deadline: '',
                    });
                    setShowAddCardForm(true);
                  }
                }}
                className="px-4 py-2 bg-[#CCFF00] text-black font-bold rounded-lg hover:bg-[#B3E600] transition-all duration-300"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Nouvelle Carte
              </button>
              <button 
                onClick={() => router.push('/superadmin')}
                className="px-4 py-2 text-[#CCFF00] font-semibold rounded-lg hover:bg-[#CCFF00]/10 transition-all duration-300 border border-[#CCFF00]/30"
              >
                Retour Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
                      <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: '#CCFF00' }}>
                Hub Centralisé
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Hub intelligent - Visualisation centralisée des vraies données de toutes les entreprises
              </p>
            </div>

          {/* Info Section */}
          <div className="mb-12">
            <div className="bg-black/50 backdrop-blur-md rounded-xl p-8 border border-gray-800">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#9933FF' }}>
                  Hub Intelligent - Système Interactif
                </h3>
                <p className="text-gray-300 text-lg">
                  Visualisation en temps réel des vraies données de toutes les entreprises avec analyse intelligente.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-lg border border-gray-700">
                  <h4 className="font-bold text-white mb-2">Données Réelles</h4>
                  <p className="text-gray-400 text-sm">Affichage des vraies cartes et tâches de chaque entreprise</p>
                </div>
                
                <div className="text-center p-4 rounded-lg border border-gray-700">
                  <h4 className="font-bold text-white mb-2">Analyse Intelligente</h4>
                  <p className="text-gray-400 text-sm">Génération automatique de cartes basées sur les données existantes</p>
                </div>
                
                <div className="text-center p-4 rounded-lg border border-gray-700">
                  <h4 className="font-bold text-white mb-2">Temps Réel</h4>
                  <p className="text-gray-400 text-sm">Mise à jour instantanée des données de toutes les sociétés</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            <div className="bg-black/50 backdrop-blur-md rounded-xl p-6 border border-gray-800 hover:border-[#CCFF00] transition-all duration-300">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2" style={{ color: '#CCFF00' }}>
                  {globalCards.length}
                </div>
                <div className="text-gray-400 font-medium">Services Prédéfinis</div>
              </div>
            </div>
            
            <div className="bg-black/50 backdrop-blur-md rounded-xl p-6 border border-gray-800 hover:border-[#9933FF] transition-all duration-300">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2" style={{ color: '#9933FF' }}>
                  {panelCards.length}
                </div>
                <div className="text-gray-400 font-medium">Cartes de Suivi</div>
              </div>
            </div>
            
            <div className="bg-black/50 backdrop-blur-md rounded-xl p-6 border border-gray-800 hover:border-[#CCFF00] transition-all duration-300">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2" style={{ color: '#CCFF00' }}>
                  {globalCards.filter(card => card.isActive).length}
                </div>
                <div className="text-gray-400 font-medium">Services Actifs</div>
              </div>
            </div>

            <div className="bg-black/50 backdrop-blur-md rounded-xl p-6 border border-gray-800 hover:border-[#9933FF] transition-all duration-300">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2" style={{ color: '#9933FF' }}>
                  {globalStats.totalCompanies}
                </div>
                <div className="text-gray-400 font-medium">Sociétés Impactées</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex space-x-1 bg-gray-900/50 rounded-xl p-1 flex-1">
              <button
                onClick={() => setActiveTab('panel')}
                className={`flex-1 py-3 px-6 rounded-lg font-karla-bold transition-all duration-300 ${
                  activeTab === 'panel'
                    ? 'bg-[#CCFF00] text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Panneau de Suivi Global
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`flex-1 py-3 px-6 rounded-lg font-karla-bold transition-all duration-300 ${
                  activeTab === 'services'
                    ? 'bg-[#CCFF00] text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Services Prédéfinis
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="text-white font-semibold">Filtrer par société:</label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
              >
                <option value="all">Toutes les sociétés</option>
                {Array.from(new Set([...globalCards, ...panelCards].map(card => card.company?.name).filter(Boolean))).map(companyName => (
                  <option key={companyName} value={companyName}>{companyName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'panel' && (
              <motion.div
                key="panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Sous-onglets pour le panel de suivi */}
                <div className="flex space-x-1 bg-gray-900/50 rounded-xl p-1 mb-8">
                  <button
                    onClick={() => setPanelSubTab('coverage')}
                    className={`flex-1 py-3 px-6 rounded-lg font-karla-bold transition-all duration-300 ${
                      panelSubTab === 'coverage'
                        ? 'bg-[#9933FF] text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Couverture
                  </button>
                  <button
                    onClick={() => setPanelSubTab('infrastructure')}
                    className={`flex-1 py-3 px-6 rounded-lg font-karla-bold transition-all duration-300 ${
                      panelSubTab === 'infrastructure'
                        ? 'bg-[#9933FF] text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Infrastructure
                  </button>
                  <button
                    onClick={() => setPanelSubTab('compliance')}
                    className={`flex-1 py-3 px-6 rounded-lg font-karla-bold transition-all duration-300 ${
                      panelSubTab === 'compliance'
                        ? 'bg-[#9933FF] text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Conformité
                  </button>
                  <button
                    onClick={() => setPanelSubTab('recommendation')}
                    className={`flex-1 py-3 px-6 rounded-lg font-karla-bold transition-all duration-300 ${
                      panelSubTab === 'recommendation'
                        ? 'bg-[#9933FF] text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Recommandations
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {panelCards
                    .filter(card => selectedCompany === 'all' || card.company?.name === selectedCompany)
                    .filter(card => card.type === panelSubTab)
                    .map((card) => (
                    <div
                      key={card.id}
                      className={`bg-black/50 backdrop-blur-md rounded-xl p-6 border transition-all duration-300 ${
                        card.isIntelligent 
                          ? 'border-[#9933FF] hover:border-[#B366FF]' 
                          : 'border-gray-800 hover:border-[#CCFF00]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-xl font-bold text-white">{card.name}</h3>
                          {card.isIntelligent && (
                            <span className="px-2 py-1 bg-[#9933FF] text-white text-xs font-bold rounded-full">
                              IA
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Type:</span>
                          <span className="text-white font-semibold text-sm capitalize">{card.type}</span>
                        </div>
                        {card.total && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Total:</span>
                            <span className="text-white font-semibold">{card.total}</span>
                          </div>
                        )}
                        {card.completed && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Terminé:</span>
                            <span className="text-white font-semibold">{card.completed}</span>
                          </div>
                        )}
                        {card.priority && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Priorité:</span>
                            <span className="text-white font-semibold">{card.priority}</span>
                          </div>
                        )}
                        {card.isIntelligent && card.total && card.completed && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Progression:</span>
                            <span className="text-white font-semibold">
                              {card.completed}/{card.total} ({Math.round((card.completed / card.total) * 100)}%)
                            </span>
                          </div>
                        )}
                        {card.company && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Société:</span>
                            <span className="text-white font-semibold text-sm">{card.company.name}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditPanelCard(card)}
                            className="flex-1 py-2 px-3 bg-[#CCFF00] text-black text-sm font-bold rounded-lg hover:bg-[#B3E600] transition-all duration-300"
                          >
                            <FontAwesomeIcon icon={faEdit} className="mr-1" />
                            Modifier
                          </button>
                          <button className="py-2 px-3 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-all duration-300">
                            <FontAwesomeIcon icon={faTrash} className="mr-1" />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {panelCards.filter(card => selectedCompany === 'all' || card.company?.name === selectedCompany).length === 0 && (
                  <div className="text-center py-16">
                    <div className="bg-black/50 backdrop-blur-md rounded-xl p-12 border border-gray-800">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {selectedCompany === 'all' 
                          ? 'Aucune carte de suivi trouvée' 
                          : `Aucune carte de suivi trouvée pour ${selectedCompany}`
                        }
                      </h3>
                      <p className="text-gray-400">
                        {selectedCompany === 'all' 
                          ? 'Créez votre première carte de suivi qui sera disponible pour toutes les entreprises' 
                          : 'Aucune carte de suivi trouvée pour cette société'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'services' && (
              <motion.div
                key="services"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {globalCards
                    .filter(card => selectedCompany === 'all' || card.company?.name === selectedCompany)
                    .map((card) => (
                    <div
                      key={card.id}
                      className={`bg-black/50 backdrop-blur-md rounded-xl p-6 border transition-all duration-300 ${
                        card.isTaskService 
                          ? 'border-[#FF6B35] hover:border-[#FF8A5C]' 
                          : 'border-gray-800 hover:border-[#CCFF00]'
                      }`}
                      style={{ borderLeft: `4px solid ${categoryColors[card.category]}` }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-xl font-bold text-white">{card.name}</h3>
                          {card.isTaskService && (
                            <span className="px-2 py-1 bg-[#FF6B35] text-white text-xs font-bold rounded-full">
                              TÂCHE
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Catégorie:</span>
                          <span className="text-white font-semibold text-sm">{categoryTitles[card.category]}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Score:</span>
                          <span className="text-white font-semibold">{card.defaultScore}/10</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Importance:</span>
                          <span className="text-white font-semibold">{card.defaultImportance}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Statut:</span>
                          <span className={`font-semibold text-sm ${card.isActive ? 'text-green-400' : 'text-red-400'}`}>
                            {card.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                        {card.company && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Société:</span>
                            <span className="text-white font-semibold text-sm">{card.company.name}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEdit(card)}
                            className="flex-1 py-2 px-3 bg-[#CCFF00] text-black text-sm font-bold rounded-lg hover:bg-[#B3E600] transition-all duration-300"
                          >
                            <FontAwesomeIcon icon={faEdit} className="mr-1" />
                            Modifier
                          </button>
                          <button 
                            onClick={() => handleDelete(card.id)}
                            className="py-2 px-3 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-all duration-300"
                          >
                            <FontAwesomeIcon icon={faTrash} className="mr-1" />
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {globalCards.filter(card => selectedCompany === 'all' || card.company?.name === selectedCompany).length === 0 && (
                  <div className="text-center py-16">
                    <div className="bg-black/50 backdrop-blur-md rounded-xl p-12 border border-gray-800">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {selectedCompany === 'all' 
                          ? 'Aucun service prédéfini trouvé' 
                          : `Aucun service prédéfini trouvé pour ${selectedCompany}`
                        }
                      </h3>
                      <p className="text-gray-400">
                        {selectedCompany === 'all' 
                          ? 'Créez votre premier service prédéfini qui sera disponible pour toutes les entreprises' 
                          : 'Aucun service prédéfini trouvé pour cette société'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Formulaire d'ajout/modification */}
      {showAddCardForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-black/90 backdrop-blur-md rounded-2xl p-8 border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#9933FF' }}>
                {editingCard ? 'Modifier le service' : 
                 editingPanelCard ? 'Modifier la carte de suivi' :
                 activeTab === 'services' ? 'Nouveau service prédéfini' : 'Nouvelle carte de suivi'}
              </h2>
              <button
                onClick={() => {
                  setShowAddCardForm(false);
                  setEditingCard(null);
                  setFormData({
                    name: '',
                    description: '',
                    category: 'defensive',
                    icon: '🛡️',
                    defaultScore: 5,
                    defaultImportance: 'Moyenne',
                  });
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {activeTab === 'services' ? (
                // Formulaire pour les services prédéfinis
                <>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Nom du service *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                      placeholder="Nom du service"
                    />
                  </div>
                </>
              ) : (
                // Formulaire pour les cartes de panel
                <>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Nom de la carte *
                    </label>
                    <input
                      type="text"
                      required
                      value={panelFormData.name}
                      onChange={(e) => setPanelFormData({ ...panelFormData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                      placeholder="Nom de la carte"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                  rows={3}
                  placeholder="Description du service"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Catégorie *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as 'defensive' | 'general' | 'offensive' })}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                  >
                    <option value="defensive">Défensif</option>
                    <option value="general">Général</option>
                    <option value="offensive">Offensif</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Icône
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                    placeholder="🛡️"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Score par défaut (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.defaultScore}
                    onChange={(e) => setFormData({ ...formData, defaultScore: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Importance par défaut
                  </label>
                  <select
                    value={formData.defaultImportance}
                    onChange={(e) => setFormData({ ...formData, defaultImportance: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                  >
                    <option value="Faible">Faible</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Élevée">Élevée</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#CCFF00] text-black font-bold rounded-lg hover:bg-[#B3E600] transition-all duration-300"
                >
                  {editingCard ? 'Modifier' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCardForm(false);
                    setEditingCard(null);
                    setFormData({
                      name: '',
                      description: '',
                      category: 'defensive',
                      icon: '🛡️',
                      defaultScore: 5,
                      defaultImportance: 'Moyenne',
                    });
                  }}
                  className="px-6 py-3 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 border border-white/30"
                >
                  Annuler
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Messages d'état */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="bg-red-900/50 border border-red-500 rounded-xl p-4">
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Karla:wght@300;400;500;600;700&display=swap');
        
        .font-karla {
          font-family: 'Karla', sans-serif;
        }
      `}</style>
    </div>
  );
} 