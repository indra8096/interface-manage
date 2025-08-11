'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ServiceCard {
  id: string;
  name: string;
  description: string;
  category: 'defensive' | 'general' | 'offensive';
  icon: string;
  defaultScore: number;
  defaultImportance: string;
}

interface ServicesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onDropService: (service: ServiceCard, targetCategory: 'defensive' | 'general' | 'offensive') => void;
}

export default function ServicesSidebar({ isOpen, onClose, onDropService }: ServicesSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedService, setDraggedService] = useState<ServiceCard | null>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [services, setServices] = useState<ServiceCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'defensive' | 'general' | 'offensive'>('all');

  // Charger les services depuis l'API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Token manquant');
          return;
        }

        const response = await fetch('/api/services', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setServices(data.services || []);
        } else {
          setError('Erreur lors du chargement des services');
        }
      } catch (error) {
        setError('Erreur de connexion');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchServices();
    }
  }, [isOpen]);

  // Déterminer le rôle de l'utilisateur
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('role');
      setUserRole(role || 'user');
    }
  }, []);

  const handleDragStart = (e: React.DragEvent, service: ServiceCard) => {
    setDraggedService(service);
    e.dataTransfer.setData('text/plain', JSON.stringify(service));
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.dropEffect = 'copy';
    
    // Créer une image de drag personnalisée
    const dragImage = new Image();
    dragImage.src = 'data:image/svg+xml;base64,' + btoa(`
      <svg width="200" height="80" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="80" fill="#1f2937" rx="8"/>
        <text x="10" y="25" fill="#CCFF00" font-family="Arial" font-size="12">${service.name}</text>
        <text x="10" y="45" fill="#9ca3af" font-family="Arial" font-size="10">${service.description.substring(0, 30)}...</text>
        <text x="10" y="65" fill="#CCFF00" font-family="Arial" font-size="10">Glisser vers une colonne</text>
      </svg>
    `);
    e.dataTransfer.setDragImage(dragImage, 100, 40);
    
    console.log('Drag started for service:', service.name);
    
    // Fermer automatiquement la sidebar quand on commence à glisser
    onClose();
    
    // Ajouter un effet visuel
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.5';
    target.style.transform = 'scale(0.95)';
  };

  const handleDragEnd = () => {
    setDraggedService(null);
    
    // Restaurer l'effet visuel
    const draggedElements = document.querySelectorAll('[draggable="true"]');
    draggedElements.forEach((element) => {
      const el = element as HTMLElement;
      el.style.opacity = '1';
      el.style.transform = 'scale(1)';
    });
    
    console.log('Drag ended for service');
  };

  const filteredServices = services.filter(service => {
    // Filtre par recherche textuelle
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtre par catégorie
    const matchesCategory = activeFilter === 'all' || service.category === activeFilter;
    
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-96 bg-gradient-to-b from-gray-900 to-black border-l border-gray-800 shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#CCFF00] to-[#9933FF] flex items-center justify-center animate-pulse">
                    <div className="w-6 h-6 rounded-full bg-black"></div>
                  </div>
                  <div className="text-[#CCFF00] text-sm font-bold">Chargement...</div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

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
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => e.preventDefault()}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 pointer-events-auto"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-gradient-to-b from-gray-900 to-black border-l border-gray-800 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-karla-bold text-white">
                    <span className="bg-gradient-to-r from-[#CCFF00] to-[#9933FF] bg-clip-text text-transparent">
                      SERVICES
                    </span>
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-[#CCFF00] transition-colors p-2 rounded-lg hover:bg-gray-800"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Onglets de filtrage */}
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-2 rounded-lg text-xs font-karla-medium transition-all duration-300 ${
                    activeFilter === 'all'
                      ? 'text-black font-karla-bold shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  style={{
                    background: activeFilter === 'all' ? 'var(--theme-primary)' : 'transparent'
                  }}
                >
                  TOUS ({services.length})
                </button>
                <button
                  onClick={() => setActiveFilter('defensive')}
                  className={`px-3 py-2 rounded-lg text-xs font-karla-medium transition-all duration-300 ${
                    activeFilter === 'defensive'
                      ? 'text-black font-karla-bold shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  style={{
                    background: activeFilter === 'defensive' ? 'var(--theme-primary)' : 'transparent'
                  }}
                >
                  DEFENSIVE ({services.filter(s => s.category === 'defensive').length})
                </button>
                <button
                  onClick={() => setActiveFilter('general')}
                  className={`px-3 py-2 rounded-lg text-xs font-karla-medium transition-all duration-300 ${
                    activeFilter === 'general'
                      ? 'text-black font-karla-bold shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  style={{
                    background: activeFilter === 'general' ? 'var(--theme-primary)' : 'transparent'
                  }}
                >
                  GENERALE ({services.filter(s => s.category === 'general').length})
                </button>
                <button
                  onClick={() => setActiveFilter('offensive')}
                  className={`px-3 py-2 rounded-lg text-xs font-karla-medium transition-all duration-300 ${
                    activeFilter === 'offensive'
                      ? 'text-black font-karla-bold shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  style={{
                    background: activeFilter === 'offensive' ? 'var(--theme-primary)' : 'transparent'
                  }}
                >
                  OFFENSIVE ({services.filter(s => s.category === 'offensive').length})
                </button>
              </div>

              {/* Indicateur de filtrage */}
              <div className="mb-3">
                <p className="text-xs text-gray-400 font-karla-medium">
                  {activeFilter === 'all' 
                    ? `Affichage de tous les services (${filteredServices.length})`
                    : `Services ${activeFilter.toUpperCase()} (${filteredServices.length})`
                  }
                </p>
              </div>

              {/* Barre de recherche */}
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un service..."
                  className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-700 bg-gray-800 text-white focus:outline-none transition-all font-karla-regular"
                  style={{
                    borderColor: 'var(--border-primary)'
                  }}
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Liste des services */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              <div className="space-y-4 pb-4">
                {filteredServices.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center border border-gray-700">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 font-karla-medium">Aucun service trouvé</p>
                    <p className="text-gray-500 text-sm mt-1">Essayez un autre terme de recherche</p>
                  </div>
                ) : (
                  filteredServices.map((service) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      draggable
                      onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, service)}
                      onDragEnd={handleDragEnd}
                      className="group cursor-grab active:cursor-grabbing select-none"
                    >
                      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-[#CCFF00] transition-all duration-300 hover:shadow-lg hover:shadow-[#CCFF00]/10">
                        <div className="relative">
                          <h3 className="font-karla-bold text-white mb-1 group-hover:text-[#CCFF00] transition-colors">
                            {service.name}
                          </h3>
                          <p className="text-sm text-gray-400 mb-3 font-karla-regular">
                            {service.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-1 rounded-full text-xs font-karla-medium ${
                              service.category === 'defensive' ? 'bg-blue-900 text-blue-300' :
                              service.category === 'general' ? 'bg-gray-700 text-gray-300' :
                              'bg-red-900 text-red-300'
                            }`}>
                              {service.category.toUpperCase()}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>Score: {service.defaultScore}</span>
                              <span>•</span>
                              <span>{service.defaultImportance}</span>
                            </div>
                          </div>
                        </div>
                       
                        {/* Indicateur de drag */}
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <div className="flex items-center justify-center text-xs text-[#CCFF00] font-karla-medium">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                            GLISSER POUR AJOUTER
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 