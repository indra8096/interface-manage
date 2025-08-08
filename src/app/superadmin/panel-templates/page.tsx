'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

interface PanelCardTemplate {
  id: number;
  name: string;
  type: 'coverage' | 'infrastructure' | 'compliance' | 'recommendation';
  category: 'defensive' | 'general' | 'offensive';
  description: string;
  total?: number;
  completed?: number;
  equipmentCount?: number;
  status?: string;
  certificationDate?: string;
  nextAudit?: string;
  priority?: string;
  deadline?: string;
  isActive: boolean;
}

export default function PanelTemplatesPage() {
  const [panelTemplates, setPanelTemplates] = useState<PanelCardTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // États pour la gestion des templates
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PanelCardTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<'coverage' | 'infrastructure' | 'compliance' | 'recommendation'>('coverage');
  const [formData, setFormData] = useState({
    name: '',
    type: 'coverage' as 'coverage' | 'infrastructure' | 'compliance' | 'recommendation',
    category: 'defensive' as 'defensive' | 'general' | 'offensive',
    description: '',
    total: 0,
    completed: 0,
    equipmentCount: 0,
    status: '',
    certificationDate: '',
    nextAudit: '',
    priority: 'Moyenne',
    deadline: ''
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
      const response = await fetch('/api/superadmin/panel_templates', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPanelTemplates(data.templates || []);
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
        ? `/api/superadmin/panel_templates/${editingTemplate.id}`
        : '/api/superadmin/panel_templates';
      
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
          type: 'coverage',
          category: 'defensive',
          description: '',
          total: 0,
          completed: 0,
          equipmentCount: 0,
          status: '',
          certificationDate: '',
          nextAudit: '',
          priority: 'Moyenne',
          deadline: ''
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

  const handleEdit = (template: PanelCardTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      category: template.category,
      description: template.description,
      total: template.total || 0,
      completed: template.completed || 0,
      equipmentCount: template.equipmentCount || 0,
      status: template.status || '',
      certificationDate: template.certificationDate || '',
      nextAudit: template.nextAudit || '',
      priority: template.priority || 'Moyenne',
      deadline: template.deadline || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (templateId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/superadmin/panel_templates/${templateId}`, {
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

  const getTypeLabel = (type: string) => {
    const labels = {
      coverage: 'COUVERTURE',
      infrastructure: 'INFRASTRUCTURE',
      compliance: 'CONFORMITÉ',
      recommendation: 'RECOMMANDATION'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTemplatesByType = (type: string) => {
    return panelTemplates.filter(template => template.type === type);
  };

  const renderCard = (template: PanelCardTemplate) => {
    const baseCardClasses = "bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-[#CCFF00] transition-all duration-300 hover:shadow-lg hover:shadow-[#CCFF00]/10";
    
    switch (template.type) {
      case 'coverage':
        return (
          <div className={baseCardClasses}>
            <div className="relative">
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
              
              <h3 className="font-karla-bold text-white mb-2 group-hover:text-[#CCFF00] transition-colors pr-20">
                {template.name}
              </h3>
              <p className="text-sm text-gray-400 mb-3 font-karla-regular">
                {template.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-lg font-karla-bold text-[#CCFF00]">{template.total}</div>
                    <div className="text-xs text-gray-400">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-karla-bold text-[#CCFF00]">{template.completed}</div>
                    <div className="text-xs text-gray-400">Terminé</div>
                  </div>
                </div>
                <span className="px-2 py-1 bg-blue-900 text-blue-300 text-xs rounded-full font-karla-medium">
                  COUVERTURE
                </span>
              </div>
            </div>
          </div>
        );

      case 'infrastructure':
        return (
          <div className={baseCardClasses}>
            <div className="relative">
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
              
              <h3 className="font-karla-bold text-white mb-2 group-hover:text-[#CCFF00] transition-colors pr-20">
                {template.name}
              </h3>
              <p className="text-sm text-gray-400 mb-3 font-karla-regular">
                {template.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-lg font-karla-bold text-[#CCFF00]">{template.equipmentCount}</div>
                    <div className="text-xs text-gray-400">Équipements</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-karla-medium ${
                      template.status === 'Critique' ? 'text-red-400' :
                      template.status === 'Sécurisé' ? 'text-green-400' :
                      template.status === 'À vérifier' ? 'text-yellow-400' :
                      'text-gray-400'
                    }`}>
                      {template.status}
                    </div>
                  </div>
                </div>
                <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full font-karla-medium">
                  INFRASTRUCTURE
                </span>
              </div>
            </div>
          </div>
        );

      case 'compliance':
        return (
          <div className={baseCardClasses}>
            <div className="relative">
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
              
              <h3 className="font-karla-bold text-white mb-2 group-hover:text-[#CCFF00] transition-colors pr-20">
                {template.name}
              </h3>
              <p className="text-sm text-gray-400 mb-3 font-karla-regular">
                {template.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Statut:</span>
                  <span className={`text-xs font-karla-medium ${
                    template.status === 'CONFORME' ? 'text-green-400' :
                    template.status === 'EN COURS' ? 'text-yellow-400' :
                    'text-gray-400'
                  }`}>
                    {template.status}
                  </span>
                </div>
                {template.certificationDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Certification:</span>
                    <span className="text-xs text-white">{template.certificationDate}</span>
                  </div>
                )}
                {template.nextAudit && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Prochain audit:</span>
                    <span className="text-xs text-white">{template.nextAudit}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-700">
                <span className="px-2 py-1 bg-red-900 text-red-300 text-xs rounded-full font-karla-medium">
                  CONFORMITÉ
                </span>
              </div>
            </div>
          </div>
        );

      case 'recommendation':
        return (
          <div className={baseCardClasses}>
            <div className="relative">
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
              
              <h3 className="font-karla-bold text-white mb-2 group-hover:text-[#CCFF00] transition-colors pr-20">
                {template.name}
              </h3>
              <p className="text-sm text-gray-400 mb-3 font-karla-regular">
                {template.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className={`text-sm font-karla-medium ${
                      template.priority === 'Haute' ? 'text-red-400' :
                      template.priority === 'Moyenne' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {template.priority}
                    </div>
                    <div className="text-xs text-gray-400">Priorité</div>
                  </div>
                  {template.deadline && (
                    <div className="text-center">
                      <div className="text-sm font-karla-medium text-white">{template.deadline}</div>
                      <div className="text-xs text-gray-400">Échéance</div>
                    </div>
                  )}
                </div>
                <span className="px-2 py-1 bg-purple-900 text-purple-300 text-xs rounded-full font-karla-medium">
                  RECOMMANDATION
                </span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
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
              <span className="text-sm text-gray-400">Gestionnaire de Templates Panel</span>
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
                  Gestion des Templates Panel de Suivi
                </h1>
                <p className="text-lg text-gray-400">
                  Interface de contrôle des templates de cartes de suivi
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
                    <div className="text-6xl font-bold text-[#CCFF00]">{panelTemplates.filter(s => s.isActive).length}</div>
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
                    <div className="text-6xl font-bold text-[#9933FF]">{panelTemplates.length}</div>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <motion.div 
                className="p-6 rounded-xl hover:border-[#CCFF00] transition-all duration-300 bg-black border border-gray-700"
                whileHover={{ y: -5 }}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2 text-[#CCFF00]">
                    {panelTemplates.filter(s => s.type === 'coverage').length}
                  </div>
                  <div className="font-medium text-sm text-gray-400">COUVERTURE</div>
                </div>
              </motion.div>
              
              <motion.div 
                className="p-6 rounded-xl hover:border-[#CCFF00] transition-all duration-300 bg-black border border-gray-700"
                whileHover={{ y: -5 }}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2 text-[#CCFF00]">
                    {panelTemplates.filter(s => s.type === 'infrastructure').length}
                  </div>
                  <div className="font-medium text-sm text-gray-400">INFRASTRUCTURE</div>
                </div>
              </motion.div>
              
              <motion.div 
                className="p-6 rounded-xl hover:border-[#CCFF00] transition-all duration-300 bg-black border border-gray-700"
                whileHover={{ y: -5 }}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2 text-[#CCFF00]">
                    {panelTemplates.filter(s => s.type === 'compliance').length}
                  </div>
                  <div className="font-medium text-sm text-gray-400">CONFORMITÉ</div>
                </div>
              </motion.div>
              
              <motion.div 
                className="p-6 rounded-xl hover:border-[#9933FF] transition-all duration-300 bg-black border border-gray-700"
                whileHover={{ y: -5 }}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2 text-[#9933FF]">
                    {panelTemplates.filter(s => s.type === 'recommendation').length}
                  </div>
                  <div className="font-medium text-sm text-gray-400">RECOMMANDATION</div>
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
                      type: 'coverage',
                      description: '',
                      total: 0,
                      completed: 0,
                      equipmentCount: 0,
                      status: '',
                      certificationDate: '',
                      nextAudit: '',
                      priority: 'Moyenne',
                      deadline: ''
                    });
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faTrash} className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Nom de la carte *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                      placeholder="Nom de la carte"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Type de carte *
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                    >
                      <option value="coverage">Couverture</option>
                      <option value="infrastructure">Infrastructure</option>
                      <option value="compliance">Conformité</option>
                      <option value="recommendation">Recommandation</option>
                    </select>
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
                    placeholder="Description de la carte"
                  />
                </div>

                {/* Champs spécifiques selon le type */}
                {formData.type === 'coverage' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Total
                      </label>
                      <input
                        type="number"
                        value={formData.total}
                        onChange={(e) => setFormData({ ...formData, total: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Terminé
                      </label>
                      <input
                        type="number"
                        value={formData.completed}
                        onChange={(e) => setFormData({ ...formData, completed: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                      />
                    </div>
                  </div>
                )}

                {formData.type === 'infrastructure' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Nombre d'équipements
                      </label>
                      <input
                        type="number"
                        value={formData.equipmentCount}
                        onChange={(e) => setFormData({ ...formData, equipmentCount: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Statut
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                      >
                        <option value="">Sélectionner un statut</option>
                        <option value="Sécurisé">Sécurisé</option>
                        <option value="À vérifier">À vérifier</option>
                        <option value="Critique">Critique</option>
                        <option value="Normal">Normal</option>
                      </select>
                    </div>
                  </div>
                )}

                {formData.type === 'compliance' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Statut
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                      >
                        <option value="">Sélectionner un statut</option>
                        <option value="CONFORME">CONFORME</option>
                        <option value="EN COURS">EN COURS</option>
                        <option value="NON CONFORME">NON CONFORME</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Date de certification
                      </label>
                      <input
                        type="text"
                        value={formData.certificationDate}
                        onChange={(e) => setFormData({ ...formData, certificationDate: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                        placeholder="2023"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Prochain audit
                      </label>
                      <input
                        type="text"
                        value={formData.nextAudit}
                        onChange={(e) => setFormData({ ...formData, nextAudit: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                        placeholder="Décembre 2024"
                      />
                    </div>
                  </div>
                )}

                {formData.type === 'recommendation' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Priorité
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                      >
                        <option value="Faible">Faible</option>
                        <option value="Moyenne">Moyenne</option>
                        <option value="Haute">Haute</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Échéance
                      </label>
                      <input
                        type="text"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                        placeholder="2 mois"
                      />
                    </div>
                  </div>
                )}

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
                        type: 'coverage',
                        description: '',
                        total: 0,
                        completed: 0,
                        equipmentCount: 0,
                        status: '',
                        certificationDate: '',
                        nextAudit: '',
                        priority: 'Moyenne',
                        deadline: ''
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

          {/* Onglets et contenu */}
          <div className="mb-8">
            {/* Onglets */}
            <div className="grid grid-cols-2 gap-2 mb-8">
              {[
                { id: 'coverage', label: 'COUVERTURE' },
                { id: 'infrastructure', label: 'INFRASTRUCTURE' },
                { id: 'compliance', label: 'CONFORMITÉ' },
                { id: 'recommendation', label: 'RECOMMANDATIONS' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3 rounded-lg text-xs font-karla-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'text-black font-karla-bold shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  style={{
                    background: activeTab === tab.id ? '#9933FF' : 'transparent'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Contenu des onglets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {getTemplatesByType(activeTab).map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="group cursor-pointer select-none"
                >
                  {renderCard(template)}
                </motion.div>
              ))}
            </div>

            {getTemplatesByType(activeTab).length === 0 && (
              <div className="text-center py-16">
                <div className="bg-black/50 backdrop-blur-md rounded-xl p-12 border border-gray-800">
                  <div className="text-6xl mb-4 text-[#CCFF00]">📊</div>
                  <h3 className="text-xl font-bold text-white mb-2">Aucun template</h3>
                  <p className="text-gray-400">Créez votre premier template de panel de suivi</p>
                </div>
              </div>
            )}
          </div>
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
