'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface PanelCard {
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
  isActive: boolean;
  company?: {
    id: number;
    name: string;
  };
}

interface FormData {
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

export default function PanelCardsManagement() {
  const [cards, setCards] = useState<PanelCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<PanelCard | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: 'coverage',
    category: 'defensive',
    total: 0,
    completed: 0,
    equipmentCount: 0,
    status: 'Normal',
    priority: 'Moyenne',
    description: ''
  });
  const router = useRouter();

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/superadmin/panel_cards', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCards(data.cards || []);
      } else if (response.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des cartes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const url = editingCard 
        ? `/api/superadmin/panel_cards` 
        : `/api/superadmin/panel_cards`;
      
      const method = editingCard ? 'PUT' : 'POST';
      const body = editingCard 
        ? { ...formData, id: editingCard.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setShowForm(false);
        setEditingCard(null);
        setFormData({
          name: '',
          type: 'coverage',
          category: 'defensive',
          total: 0,
          completed: 0,
          equipmentCount: 0,
          status: 'Normal',
          priority: 'Moyenne',
          description: ''
        });
        fetchCards();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleEdit = (card: PanelCard) => {
    setEditingCard(card);
    setFormData({
      name: card.name,
      type: card.type,
      category: card.category,
      total: card.total || 0,
      completed: card.completed || 0,
      equipmentCount: card.equipmentCount || 0,
      status: card.status || 'Normal',
      certificationDate: card.certificationDate || '',
      nextAudit: card.nextAudit || '',
      priority: card.priority || 'Moyenne',
      description: card.description || '',
      deadline: card.deadline || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (cardId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/superadmin/panel_cards?id=${cardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchCards();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      coverage: 'Couverture',
      infrastructure: 'Infrastructure',
      compliance: 'Conformité',
      recommendation: 'Recommandation'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      defensive: 'Défensif',
      general: 'Général',
      offensive: 'Offensif'
    };
    return labels[category as keyof typeof labels] || category;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-karla-bold mb-4" style={{ color: '#ffffff' }}>Gestion des Cartes de Panel</h1>
          <p className="text-gray-400" style={{ color: '#9CA3AF' }}>Gérez les cartes de panel pour toutes les entreprises</p>
        </div>

        {/* Bouton Ajouter */}
        <div className="mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-karla-bold hover:bg-purple-700 transition-all duration-300"
            style={{ backgroundColor: '#9333EA', color: '#ffffff' }}
          >
            + Nouvelle Carte
          </motion.button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-gray-900 rounded-xl border border-gray-700"
            style={{ backgroundColor: '#111827', borderColor: '#374151' }}
          >
            <h2 className="text-2xl font-karla-bold mb-6" style={{ color: '#ffffff' }}>
              {editingCard ? 'Modifier la Carte' : 'Nouvelle Carte'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-karla-medium mb-2" style={{ color: '#ffffff' }}>Nom</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
                    style={{ backgroundColor: '#1F2937', borderColor: '#4B5563', color: '#ffffff' }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-karla-medium mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="coverage">Couverture</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="compliance">Conformité</option>
                    <option value="recommendation">Recommandation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-karla-medium mb-2">Catégorie</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="defensive">Défensif</option>
                    <option value="general">Général</option>
                    <option value="offensive">Offensif</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-karla-medium mb-2">Priorité</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="Faible">Faible</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Haute">Haute</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-karla-medium mb-2">Total</label>
                  <input
                    type="number"
                    value={formData.total}
                    onChange={(e) => setFormData({...formData, total: parseInt(e.target.value) || 0})}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-karla-medium mb-2">Complété</label>
                  <input
                    type="number"
                    value={formData.completed}
                    onChange={(e) => setFormData({...formData, completed: parseInt(e.target.value) || 0})}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-karla-medium mb-2">Équipements</label>
                  <input
                    type="number"
                    value={formData.equipmentCount}
                    onChange={(e) => setFormData({...formData, equipmentCount: parseInt(e.target.value) || 0})}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-karla-medium mb-2">Statut</label>
                  <input
                    type="text"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-karla-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white h-24"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-karla-medium mb-2">Date de Certification</label>
                  <input
                    type="date"
                    value={formData.certificationDate}
                    onChange={(e) => setFormData({...formData, certificationDate: e.target.value})}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-karla-medium mb-2">Prochain Audit</label>
                  <input
                    type="date"
                    value={formData.nextAudit}
                    onChange={(e) => setFormData({...formData, nextAudit: e.target.value})}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-karla-medium mb-2">Échéance</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-karla-bold hover:bg-green-700 transition-all duration-300"
                >
                  {editingCard ? 'Modifier' : 'Créer'}
                </motion.button>
                
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowForm(false);
                    setEditingCard(null);
                    setFormData({
                      name: '',
                      type: 'coverage',
                      category: 'defensive',
                      total: 0,
                      completed: 0,
                      equipmentCount: 0,
                      status: 'Normal',
                      priority: 'Moyenne',
                      description: ''
                    });
                  }}
                  className="px-6 py-3 bg-gray-600 text-white rounded-xl font-karla-bold hover:bg-gray-700 transition-all duration-300"
                >
                  Annuler
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Liste des cartes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-gray-900 rounded-xl border border-gray-700 hover:border-purple-500 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-karla-bold mb-2">{card.name}</h3>
                  <div className="flex gap-2 mb-2">
                    <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                      {getTypeLabel(card.type)}
                    </span>
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                      {getCategoryLabel(card.category)}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEdit(card)}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(card.id)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </motion.button>
                </div>
              </div>

              {card.description && (
                <p className="text-gray-400 text-sm mb-4">{card.description}</p>
              )}

              <div className="space-y-2 text-sm">
                {card.total !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Progression:</span>
                    <span className="text-white">{card.completed || 0}/{card.total}</span>
                  </div>
                )}
                
                {card.equipmentCount !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Équipements:</span>
                    <span className="text-white">{card.equipmentCount}</span>
                  </div>
                )}
                
                {card.status && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Statut:</span>
                    <span className="text-white">{card.status}</span>
                  </div>
                )}
                
                {card.priority && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Priorité:</span>
                    <span className="text-white">{card.priority}</span>
                  </div>
                )}
              </div>

              {card.company && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <span className="text-xs text-gray-500">Entreprise: {card.company.name}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {cards.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">Aucune carte de panel trouvée</div>
            <p className="text-gray-500">Commencez par créer votre première carte</p>
          </div>
        )}
      </div>
    </div>
  );
}
