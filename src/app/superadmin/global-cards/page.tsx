'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PanelCardTemplate {
  id: number;
  name: string;
  type: 'coverage' | 'infrastructure' | 'compliance' | 'recommendation';
  category: 'defensive' | 'general' | 'offensive';
  description?: string;
  priority: string;
  isActive: boolean;
  instances: Array<{
    id: number;
    company: {
      id: number;
      name: string;
    };
  }>;
}

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

export default function GlobalCardsPage() {
  const [panelTemplates, setPanelTemplates] = useState<PanelCardTemplate[]>([]);
  const [serviceTemplates, setServiceTemplates] = useState<ServiceTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

      // Récupérer les templates de cartes panel
      const panelResponse = await fetch('/api/superadmin/panel_templates', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (panelResponse.ok) {
        const panelData = await panelResponse.json();
        setPanelTemplates(panelData.templates || []);
      }

      // Récupérer les templates de services
      const serviceResponse = await fetch('/api/superadmin/service_templates', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (serviceResponse.ok) {
        const serviceData = await serviceResponse.json();
        setServiceTemplates(serviceData.templates || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error);
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-karla-bold mb-4">Gestion des Templates</h1>
          <p className="text-gray-400">Gérez les templates qui seront répliqués dans toutes les entreprises</p>
        </div>

        {/* Boutons de Navigation */}
        <div className="mb-8 flex gap-4">
          <Link href="/superadmin/panel-templates">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-purple-600 text-white rounded-xl font-karla-bold hover:bg-purple-700 transition-all duration-300 flex items-center gap-3"
            >
              <span className="text-2xl">📊</span>
              Templates Panel de Suivi
            </motion.button>
          </Link>
          
          <Link href="/superadmin/service-templates">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl font-karla-bold hover:bg-blue-700 transition-all duration-300 flex items-center gap-3"
            >
              <span className="text-2xl">🛡️</span>
              Templates Services Prédéfinis
            </motion.button>
          </Link>
        </div>

        {/* Aperçu des Templates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Templates Panel de Suivi */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gray-900 rounded-xl border border-gray-700"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">📊</span>
              <div>
                <h2 className="text-2xl font-karla-bold">Templates Panel de Suivi</h2>
                <p className="text-gray-400">Cartes de suivi répliquées dans toutes les entreprises</p>
              </div>
            </div>

            <div className="space-y-4">
              {panelTemplates.slice(0, 3).map((template) => (
                <div key={template.id} className="p-4 bg-gray-800 rounded-lg border border-gray-600">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-karla-bold text-lg">{template.name}</h3>
                      <div className="flex gap-2 mt-2">
                        <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                          {getTypeLabel(template.type)}
                        </span>
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                          {getCategoryLabel(template.category)}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">
                      {template.instances.length} entreprise(s)
                    </span>
                  </div>
                </div>
              ))}
              
              {panelTemplates.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  Aucun template de panel créé
                </div>
              )}

              {panelTemplates.length > 3 && (
                <div className="text-center py-4">
                  <span className="text-gray-400">
                    +{panelTemplates.length - 3} autres templates
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6">
              <Link href="/superadmin/panel-templates">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl font-karla-bold hover:bg-purple-700 transition-all duration-300"
                >
                  Gérer les Templates Panel
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Templates Services Prédéfinis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gray-900 rounded-xl border border-gray-700"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🛡️</span>
              <div>
                <h2 className="text-2xl font-karla-bold">Templates Services Prédéfinis</h2>
                <p className="text-gray-400">Services disponibles dans toutes les entreprises</p>
              </div>
            </div>

            <div className="space-y-4">
              {serviceTemplates.slice(0, 3).map((template) => (
                <div key={template.id} className="p-4 bg-gray-800 rounded-lg border border-gray-600">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{template.icon}</span>
                      <div>
                        <h3 className="font-karla-bold text-lg">{template.name}</h3>
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                          {getCategoryLabel(template.category)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Score: {template.defaultScore}/10</div>
                      <div className="text-sm text-gray-400">{template.defaultImportance}</div>
                    </div>
                  </div>
                </div>
              ))}
              
              {serviceTemplates.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  Aucun template de service créé
                </div>
              )}

              {serviceTemplates.length > 3 && (
                <div className="text-center py-4">
                  <span className="text-gray-400">
                    +{serviceTemplates.length - 3} autres services
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6">
              <Link href="/superadmin/service-templates">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-karla-bold hover:bg-blue-700 transition-all duration-300"
                >
                  Gérer les Templates Services
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Statistiques */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gray-900 rounded-xl border border-gray-700 text-center"
          >
            <div className="text-3xl font-karla-bold text-purple-400 mb-2">
              {panelTemplates.length}
            </div>
            <div className="text-gray-400">Templates Panel</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gray-900 rounded-xl border border-gray-700 text-center"
          >
            <div className="text-3xl font-karla-bold text-blue-400 mb-2">
              {serviceTemplates.length}
            </div>
            <div className="text-gray-400">Templates Services</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gray-900 rounded-xl border border-gray-700 text-center"
          >
            <div className="text-3xl font-karla-bold text-green-400 mb-2">
              {panelTemplates.length + serviceTemplates.length}
            </div>
            <div className="text-gray-400">Total Templates</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 