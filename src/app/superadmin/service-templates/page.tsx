'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

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

interface FormData {
  name: string;
  description: string;
  category: 'defensive' | 'general' | 'offensive';
  icon: string;
  defaultScore: number;
  defaultImportance: string;
}

export default function ServiceTemplatesManagement() {
  const [templates, setTemplates] = useState<ServiceTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ServiceTemplate | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: 'defensive',
    icon: '🛡️',
    defaultScore: 0,
    defaultImportance: 'Moyenne'
  });
  const router = useRouter();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/superadmin/service_templates', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      } else if (response.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error);
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

      const method = editingTemplate ? 'PUT' : 'POST';
      const body = editingTemplate 
        ? { ...formData, id: editingTemplate.id }
        : formData;

      const response = await fetch('/api/superadmin/service_templates', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setShowForm(false);
        setEditingTemplate(null);
        setFormData({
          name: '',
          description: '',
          category: 'defensive',
          icon: '🛡️',
          defaultScore: 0,
          defaultImportance: 'Moyenne'
        });
        fetchTemplates();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
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
    setShowForm(true);
  };

  const handleDelete = async (templateId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template de service ?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/superadmin/service_templates?id=${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchTemplates();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
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
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-karla-bold mb-4">Gestion des Templates de Services</h1>
          <p className="text-gray-400">Créez des templates de services qui seront disponibles dans toutes les entreprises</p>
        </div>

        {/* Bouton Ajouter */}
        <div className="mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-karla-bold hover:bg-blue-700 transition-all duration-300"
          >
            + Nouveau Service
          </motion.button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-gray-900 rounded-xl border border-gray-700"
          >
            <h2 className="text-2xl font-karla-bold mb-6">
              {editingTemplate ? 'Modifier le Service' : 'Nouveau Service'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-karla-medium mb-2">Nom</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
                    required
                  />
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
                  <label className="block text-sm font-karla-medium mb-2">Icône</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
                    placeholder="🛡️"
                  />
                </div>

                <div>
                  <label className="block text-sm font-karla-medium mb-2">Score par défaut</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.defaultScore}
                    onChange={(e) => setFormData({...formData, defaultScore: parseInt(e.target.value) || 0})}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-karla-medium mb-2">Importance par défaut</label>
                  <select
                    value={formData.defaultImportance}
                    onChange={(e) => setFormData({...formData, defaultImportance: e.target.value})}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="Faible">Faible</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Haute">Haute</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-karla-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white h-24"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-karla-bold hover:bg-green-700 transition-all duration-300"
                >
                  {editingTemplate ? 'Modifier' : 'Créer'}
                </motion.button>
                
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowForm(false);
                    setEditingTemplate(null);
                    setFormData({
                      name: '',
                      description: '',
                      category: 'defensive',
                      icon: '🛡️',
                      defaultScore: 0,
                      defaultImportance: 'Moyenne'
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

        {/* Liste des templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-gray-900 rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{template.icon}</span>
                  <div>
                    <h3 className="text-lg font-karla-bold">{template.name}</h3>
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                      {getCategoryLabel(template.category)}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEdit(template)}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(template.id)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </motion.button>
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-4">{template.description}</p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Score:</span>
                  <span className="text-white">{template.defaultScore}/10</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Importance:</span>
                  <span className="text-white">{template.defaultImportance}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">Aucun template de service trouvé</div>
            <p className="text-gray-500">Commencez par créer votre premier service</p>
          </div>
        )}
      </div>
    </div>
  );
}
