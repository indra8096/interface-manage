'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

interface ServiceTemplate {
  id: number;
  name: string;
  description: string;
  category: 'defensive' | 'general' | 'offensive';
  icon: string;
  defaultScore: number;
  defaultImportance: string;
  isActive: boolean;
}

export default function ServicesPage() {
  const [serviceTemplates, setServiceTemplates] = useState<ServiceTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // États pour la gestion des templates
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ServiceTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'defensive' as 'defensive' | 'general' | 'offensive',
    icon: '🛡️',
    defaultScore: 5,
    defaultImportance: 'Moyenne'
  });

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token) {
      router.push('/login');
      return;
    }

    setUserRole(role || '');
    
    // Seuls les COMPANY_ADMIN peuvent accéder à cette page
    if (role !== 'COMPANY_ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchServiceTemplates(token);
  }, [router]);

  const fetchServiceTemplates = async (token: string) => {
    try {
      const response = await fetch('/api/services', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setServiceTemplates(data.services || []);
      } else {
        setError('Erreur lors du chargement des services');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const url = editingTemplate 
        ? `/api/services/${editingTemplate.id}`
        : '/api/services';
      
      const method = editingTemplate ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccessMessage(editingTemplate ? 'Service modifié avec succès' : 'Service créé avec succès');
        setShowAddForm(false);
        setEditingTemplate(null);
        setFormData({
          name: '',
          description: '',
          category: 'defensive',
          icon: '🛡️',
          defaultScore: 5,
          defaultImportance: 'Moyenne'
        });
        fetchServiceTemplates(token);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de la sauvegarde');
      }
    } catch (err) {
      setError('Erreur de connexion');
    }
  };

  const handleEdit = (template: ServiceTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      category: template.category,
      icon: template.icon,
      defaultScore: template.defaultScore,
      defaultImportance: template.defaultImportance
    });
    setShowAddForm(true);
  };

  const handleDelete = async (templateId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/services/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccessMessage('Service supprimé avec succès');
        fetchServiceTemplates(token);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      setError('Erreur de connexion');
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      defensive: 'DÉFENSIF',
      general: 'GÉNÉRAL',
      offensive: 'OFFENSIF'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      defensive: '#3b82f6',
      general: '#10b981',
      offensive: '#ef4444'
    };
    return colors[category as keyof typeof colors] || '#6b7280';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#CCFF00] to-[#9933FF] flex items-center justify-center animate-pulse">
            <div className="w-16 h-16 rounded-full bg-black"></div>
          </div>
          <div className="text-[#CCFF00] text-xl font-bold mb-2">Chargement...</div>
          <div className="text-gray-400 text-sm">Récupération des services</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-[#CCFF00]">drelto</span>
              <span className="text-sm text-gray-400">Gestionnaire de Services</span>
            </div>
            
            <div className="flex space-x-4">
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-[#CCFF00] text-black font-semibold rounded-lg hover:bg-[#B3E600] transition-all duration-300"
              >
                {showAddForm ? 'Annuler' : 'Nouveau Service'}
              </button>
              <button 
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 border border-white/30"
              >
                Retour Dashboard
              </button>
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('role');
                  router.push('/login');
                }}
                className="px-4 py-2 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 border border-white/30"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header futuriste */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h1 className="text-5xl font-bold mb-4 text-white">
                  Gestion des Services Prédéfinis
                </h1>
                <p className="text-lg text-gray-400">
                  Interface de contrôle des templates de services de cybersécurité
                </p>
              </div>
            </div>

            {/* Statistiques principales - Style futuriste */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <motion.div 
                className="p-8 rounded-2xl hover:border-[#CCFF00] transition-all duration-500 bg-black border border-gray-700"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm mb-2 text-gray-400">SERVICES ACTIFS</div>
                    <div className="text-6xl font-bold text-[#CCFF00]">{serviceTemplates.filter(s => s.isActive).length}</div>
                  </div>
                  <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, #9933FF, #7c3aed)'
                  }}>
                    <div className="w-16 h-16 rounded-full bg-black"></div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="p-8 rounded-2xl hover:border-[#9933FF] transition-all duration-500 bg-black border border-gray-700"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm mb-2 text-gray-400">TOTAL SERVICES</div>
                    <div className="text-6xl font-bold text-[#9933FF]">{serviceTemplates.length}</div>
                  </div>
                  <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, #9933FF, #7c3aed)'
                  }}>
                    <div className="w-16 h-16 rounded-full bg-black"></div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Statistiques détaillées - Style futuriste */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <motion.div 
                className="p-6 rounded-xl hover:border-[#CCFF00] transition-all duration-300 bg-black border border-gray-700"
                whileHover={{ y: -5 }}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2 text-[#CCFF00]">
                    {serviceTemplates.filter(s => s.category === 'defensive').length}
                  </div>
                  <div className="font-medium text-sm text-gray-400">DÉFENSIF</div>
                </div>
              </motion.div>
              
              <motion.div 
                className="p-6 rounded-xl hover:border-[#CCFF00] transition-all duration-300 bg-black border border-gray-700"
                whileHover={{ y: -5 }}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2 text-[#CCFF00]">
                    {serviceTemplates.filter(s => s.category === 'general').length}
                  </div>
                  <div className="font-medium text-sm text-gray-400">GÉNÉRAL</div>
                </div>
              </motion.div>
              
              <motion.div 
                className="p-6 rounded-xl hover:border-[#9933FF] transition-all duration-300 bg-black border border-gray-700"
                whileHover={{ y: -5 }}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2 text-[#9933FF]">
                    {serviceTemplates.filter(s => s.category === 'offensive').length}
                  </div>
                  <div className="font-medium text-sm text-gray-400">OFFENSIF</div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Formulaire d'ajout/modification */}
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-8 rounded-2xl bg-black border border-gray-700"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingTemplate ? 'Modifier le service' : 'Nouveau service'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingTemplate(null);
                    setFormData({
                      name: '',
                      description: '',
                      category: 'defensive',
                      icon: '🛡️',
                      defaultScore: 5,
                      defaultImportance: 'Moyenne'
                    });
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faTrash} className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>

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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    {editingTemplate ? 'Modifier' : 'Créer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingTemplate(null);
                      setFormData({
                        name: '',
                        description: '',
                        category: 'defensive',
                        icon: '🛡️',
                        defaultScore: 5,
                        defaultImportance: 'Moyenne'
                      });
                    }}
                    className="px-6 py-3 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 border border-white/30"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Liste des services */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceTemplates.map((template) => (
              <motion.div
                key={template.id}
                className="p-6 rounded-xl hover:border-[#CCFF00] transition-all duration-300 bg-black border border-gray-700"
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{template.icon}</span>
                    <div>
                      <h3 className="font-bold text-lg text-white">{template.name}</h3>
                      <span 
                        className="px-2 py-1 text-xs font-bold rounded-full text-white"
                        style={{ backgroundColor: getCategoryColor(template.category) }}
                      >
                        {getCategoryLabel(template.category)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(template)}
                      className="p-2 bg-[#CCFF00] text-black rounded-lg hover:bg-[#B3E600] transition-all duration-300"
                    >
                      <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
                    >
                      <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-4">{template.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Score:</span>
                    <span className="text-white font-semibold">{template.defaultScore}/10</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Importance:</span>
                    <span className="text-white font-semibold">{template.defaultImportance}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Statut:</span>
                    <span className={`font-semibold text-sm ${template.isActive ? 'text-green-400' : 'text-red-400'}`}>
                      {template.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {serviceTemplates.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-black/50 backdrop-blur-md rounded-xl p-12 border border-gray-800">
                <div className="text-6xl mb-4 text-[#CCFF00]">🛡️</div>
                <h3 className="text-xl font-bold text-white mb-2">Aucun service</h3>
                <p className="text-gray-400">Créez votre premier service prédéfini</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Messages d'état */}
      {error && (
        <div className="fixed bottom-4 right-4 max-w-md">
          <div className="bg-red-900/50 border border-red-500 rounded-xl p-4">
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="fixed bottom-4 right-4 max-w-md">
          <div className="bg-green-900/50 border border-green-500 rounded-xl p-4">
            <p className="text-green-300">{successMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
