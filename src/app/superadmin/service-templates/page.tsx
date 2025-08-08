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

export default function ServiceTemplatesPage() {
  const [serviceTemplates, setServiceTemplates] = useState<ServiceTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

    if (role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchTemplates(token);
  }, [router]);

  const fetchTemplates = async (token: string) => {
    try {
      const response = await fetch('/api/superadmin/service_templates', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setServiceTemplates(data.templates || []);
      } else {
        setError('Erreur lors du chargement des templates');
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
        ? `/api/superadmin/service_templates/${editingTemplate.id}`
        : '/api/superadmin/service_templates';
      
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
        setSuccessMessage(editingTemplate ? 'Template modifié avec succès' : 'Template créé avec succès');
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
        fetchTemplates(token);
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
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/superadmin/service_templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccessMessage('Template supprimé avec succès');
        fetchTemplates(token);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#CCFF00] to-[#9933FF] flex items-center justify-center animate-pulse">
            <div className="w-16 h-16 rounded-full bg-black"></div>
          </div>
          <div className="text-[#CCFF00] text-xl font-bold mb-2">Chargement...</div>
          <div className="text-gray-400 text-sm">Récupération des templates</div>
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
              <span className="text-sm text-gray-400">Gestionnaire de Templates</span>
            </div>
            
            <div className="flex space-x-4">
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-[#CCFF00] text-black font-semibold rounded-lg hover:bg-[#B3E600] transition-all duration-300"
              >
                {showAddForm ? 'Annuler' : 'Nouveau Template'}
              </button>
              <button 
                onClick={() => router.push('/superadmin')}
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
                  Gestion des Templates de Services
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
                    <div className="font-medium text-sm mb-2 text-gray-400">TEMPLATES ACTIFS</div>
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
                    <div className="font-medium text-sm mb-2 text-gray-400">TOTAL TEMPLATES</div>
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
                  {editingTemplate ? 'Modifier le template' : 'Nouveau template'}
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

          {/* Liste des templates triés par catégorie */}
          <div className="space-y-12">
            {/* Section Défensif */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-white">Défensif</h2>
                  <span className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm font-medium">
                    {serviceTemplates.filter(t => t.category === 'defensive').length} template{serviceTemplates.filter(t => t.category === 'defensive').length > 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setFormData({
                      name: '',
                      description: '',
                      category: 'defensive',
                      icon: '🛡️',
                      defaultScore: 5,
                      defaultImportance: 'Moyenne'
                    });
                    setEditingTemplate(null);
                    setShowAddForm(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium"
                >
                  + Ajouter Défensif
                </button>
              </div>
              {serviceTemplates.filter(t => t.category === 'defensive').length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {serviceTemplates
                    .filter(template => template.category === 'defensive')
                    .map((template) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="group cursor-pointer select-none"
                    >
                      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-[#CCFF00] transition-all duration-300 hover:shadow-lg hover:shadow-[#CCFF00]/10">
                        <div className="relative">
                          {/* Boutons d'action */}
                          <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(template);
                              }}
                              className="p-2 bg-[#CCFF00] text-black rounded-lg hover:bg-[#B3E600] transition-all duration-300"
                            >
                              <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(template.id);
                              }}
                              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
                            >
                              <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                            </button>
                          </div>

                          <h3 className="font-karla-bold text-white mb-1 group-hover:text-[#CCFF00] transition-colors pr-20">
                            {template.name}
                          </h3>
                          <p className="text-sm text-gray-400 mb-3 font-karla-regular">
                            {template.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-1 rounded-full text-xs font-karla-medium bg-blue-900 text-blue-300">
                              {getCategoryLabel(template.category)}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>Score: {template.defaultScore}</span>
                              <span>•</span>
                              <span>{template.defaultImportance}</span>
                            </div>
                          </div>
                        </div>
                       
                        {/* Indicateur de statut */}
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#CCFF00] font-karla-medium">
                              {template.isActive ? 'ACTIF' : 'INACTIF'}
                            </span>
                            <span className="text-gray-500 font-karla-medium">
                              ID: {template.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Aucun template défensif. Cliquez sur "Ajouter Défensif" pour en créer un.
                </div>
              )}
            </div>

            {/* Section Général */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-8 bg-gray-500 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-white">Général</h2>
                  <span className="px-3 py-1 bg-gray-700/30 text-gray-300 rounded-full text-sm font-medium">
                    {serviceTemplates.filter(t => t.category === 'general').length} template{serviceTemplates.filter(t => t.category === 'general').length > 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setFormData({
                      name: '',
                      description: '',
                      category: 'general',
                      icon: '⚙️',
                      defaultScore: 5,
                      defaultImportance: 'Moyenne'
                    });
                    setEditingTemplate(null);
                    setShowAddForm(true);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 font-medium"
                >
                  + Ajouter Général
                </button>
              </div>
              {serviceTemplates.filter(t => t.category === 'general').length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {serviceTemplates
                    .filter(template => template.category === 'general')
                    .map((template) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="group cursor-pointer select-none"
                    >
                      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-[#CCFF00] transition-all duration-300 hover:shadow-lg hover:shadow-[#CCFF00]/10">
                        <div className="relative">
                          {/* Boutons d'action */}
                          <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(template);
                              }}
                              className="p-2 bg-[#CCFF00] text-black rounded-lg hover:bg-[#B3E600] transition-all duration-300"
                            >
                              <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(template.id);
                              }}
                              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
                            >
                              <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                            </button>
                          </div>

                          <h3 className="font-karla-bold text-white mb-1 group-hover:text-[#CCFF00] transition-colors pr-20">
                            {template.name}
                          </h3>
                          <p className="text-sm text-gray-400 mb-3 font-karla-regular">
                            {template.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-1 rounded-full text-xs font-karla-medium bg-gray-700 text-gray-300">
                              {getCategoryLabel(template.category)}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>Score: {template.defaultScore}</span>
                              <span>•</span>
                              <span>{template.defaultImportance}</span>
                            </div>
                          </div>
                        </div>
                       
                        {/* Indicateur de statut */}
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#CCFF00] font-karla-medium">
                              {template.isActive ? 'ACTIF' : 'INACTIF'}
                            </span>
                            <span className="text-gray-500 font-karla-medium">
                              ID: {template.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Aucun template général. Cliquez sur "Ajouter Général" pour en créer un.
                </div>
              )}
            </div>

            {/* Section Offensif */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-8 bg-red-500 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-white">Offensif</h2>
                  <span className="px-3 py-1 bg-red-900/30 text-red-300 rounded-full text-sm font-medium">
                    {serviceTemplates.filter(t => t.category === 'offensive').length} template{serviceTemplates.filter(t => t.category === 'offensive').length > 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setFormData({
                      name: '',
                      description: '',
                      category: 'offensive',
                      icon: '⚔️',
                      defaultScore: 5,
                      defaultImportance: 'Moyenne'
                    });
                    setEditingTemplate(null);
                    setShowAddForm(true);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 font-medium"
                >
                  + Ajouter Offensif
                </button>
              </div>
              {serviceTemplates.filter(t => t.category === 'offensive').length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {serviceTemplates
                    .filter(template => template.category === 'offensive')
                    .map((template) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="group cursor-pointer select-none"
                    >
                      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-[#CCFF00] transition-all duration-300 hover:shadow-lg hover:shadow-[#CCFF00]/10">
                        <div className="relative">
                          {/* Boutons d'action */}
                          <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(template);
                              }}
                              className="p-2 bg-[#CCFF00] text-black rounded-lg hover:bg-[#B3E600] transition-all duration-300"
                            >
                              <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(template.id);
                              }}
                              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
                            >
                              <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                            </button>
                          </div>

                          <h3 className="font-karla-bold text-white mb-1 group-hover:text-[#CCFF00] transition-colors pr-20">
                            {template.name}
                          </h3>
                          <p className="text-sm text-gray-400 mb-3 font-karla-regular">
                            {template.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-1 rounded-full text-xs font-karla-medium bg-red-900 text-red-300">
                              {getCategoryLabel(template.category)}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>Score: {template.defaultScore}</span>
                              <span>•</span>
                              <span>{template.defaultImportance}</span>
                            </div>
                          </div>
                        </div>
                       
                        {/* Indicateur de statut */}
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#CCFF00] font-karla-medium">
                              {template.isActive ? 'ACTIF' : 'INACTIF'}
                            </span>
                            <span className="text-gray-500 font-karla-medium">
                              ID: {template.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Aucun template offensif. Cliquez sur "Ajouter Offensif" pour en créer un.
                </div>
              )}
            </div>
          </div>

          {serviceTemplates.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-black/50 backdrop-blur-md rounded-xl p-12 border border-gray-800">
                <div className="text-6xl mb-4 text-[#CCFF00]">🛡️</div>
                <h3 className="text-xl font-bold text-white mb-2">Aucun template</h3>
                <p className="text-gray-400">Créez votre premier template de service</p>
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
