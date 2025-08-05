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

const predefinedServices: ServiceCard[] = [
  // Services défensifs
  {
    id: 'firewall',
    name: 'Firewall',
    description: 'Système de protection réseau avec filtrage de trafic',
    category: 'defensive',
    icon: '🛡️',
    defaultScore: 8,
    defaultImportance: 'Élevée'
  },
  {
    id: 'ids-ips',
    name: 'IDS/IPS',
    description: 'Détection et prévention d\'intrusions',
    category: 'defensive',
    icon: '🔍',
    defaultScore: 9,
    defaultImportance: 'Élevée'
  },
  {
    id: 'vpn',
    name: 'VPN',
    description: 'Réseau privé virtuel sécurisé',
    category: 'defensive',
    icon: '🔒',
    defaultScore: 7,
    defaultImportance: 'Moyenne'
  },
  {
    id: 'antivirus',
    name: 'Antivirus',
    description: 'Protection contre les logiciels malveillants',
    category: 'defensive',
    icon: '🦠',
    defaultScore: 6,
    defaultImportance: 'Moyenne'
  },
  {
    id: 'backup',
    name: 'Sauvegarde',
    description: 'Système de sauvegarde automatisé',
    category: 'defensive',
    icon: '💾',
    defaultScore: 8,
    defaultImportance: 'Élevée'
  },

  // Services généraux
  {
    id: 'monitoring',
    name: 'Monitoring',
    description: 'Surveillance des systèmes et services',
    category: 'general',
    icon: '📊',
    defaultScore: 7,
    defaultImportance: 'Moyenne'
  },
  {
    id: 'backup-general',
    name: 'Sauvegarde Générale',
    description: 'Sauvegarde des données critiques',
    category: 'general',
    icon: '💿',
    defaultScore: 8,
    defaultImportance: 'Élevée'
  },
  {
    id: 'maintenance',
    name: 'Maintenance',
    description: 'Maintenance préventive des systèmes',
    category: 'general',
    icon: '🔧',
    defaultScore: 5,
    defaultImportance: 'Moyenne'
  },
  {
    id: 'documentation',
    name: 'Documentation',
    description: 'Documentation technique et procédures',
    category: 'general',
    icon: '📋',
    defaultScore: 6,
    defaultImportance: 'Moyenne'
  },
  {
    id: 'formation',
    name: 'Formation',
    description: 'Formation des équipes',
    category: 'general',
    icon: '🎓',
    defaultScore: 7,
    defaultImportance: 'Moyenne'
  },

  // Services offensifs
  {
    id: 'pentest',
    name: 'Pentest',
    description: 'Tests de pénétration et audit de sécurité',
    category: 'offensive',
    icon: '⚔️',
    defaultScore: 9,
    defaultImportance: 'Élevée'
  },
  {
    id: 'vulnerability-scan',
    name: 'Scan de Vulnérabilités',
    description: 'Analyse des vulnérabilités système',
    category: 'offensive',
    icon: '🔍',
    defaultScore: 8,
    defaultImportance: 'Élevée'
  },
  {
    id: 'red-team',
    name: 'Red Team',
    description: 'Simulation d\'attaques avancées',
    category: 'offensive',
    icon: '🎯',
    defaultScore: 10,
    defaultImportance: 'Élevée'
  },
  {
    id: 'social-engineering',
    name: 'Ingénierie Sociale',
    description: 'Tests de sensibilisation utilisateurs',
    category: 'offensive',
    icon: '🎭',
    defaultScore: 7,
    defaultImportance: 'Moyenne'
  },
  {
    id: 'forensics',
    name: 'Forensics',
    description: 'Analyse forensique et investigation',
    category: 'offensive',
    icon: '🔬',
    defaultScore: 8,
    defaultImportance: 'Élevée'
  }
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ServicesSidebar({ isOpen, onClose, onDropService }: ServicesSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [draggedService, setDraggedService] = useState<ServiceCard | null>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceCard | null>(null);
  const [services, setServices] = useState<ServiceCard[]>(() => {
    // Charger les services depuis le localStorage au démarrage
    if (typeof window !== 'undefined') {
      const savedServices = localStorage.getItem('customServices');
      if (savedServices) {
        const customServices = JSON.parse(savedServices);
        
        // Combiner et trier tous les services par catégorie
        const allServices = [...predefinedServices, ...customServices];
        const categoryOrder = ['defensive', 'general', 'offensive'];
        
        return allServices.sort((a, b) => {
          const aIndex = categoryOrder.indexOf(a.category);
          const bIndex = categoryOrder.indexOf(b.category);
          return aIndex - bIndex;
        });
      }
    }
    return predefinedServices;
  });
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    category: 'defensive' as 'defensive' | 'general' | 'offensive',
    score: 5,
    importance: 'Moyenne'
  });

  useEffect(() => {
    // Récupérer le rôle de l'utilisateur depuis le localStorage
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('role');
      setUserRole(role || 'user');
    }
  }, []);

  // Tous les utilisateurs peuvent accéder au menu des services prédéfinis
  // Seuls les admins peuvent ajouter de nouveaux services

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddService = () => {
    if (newService.name.trim() && newService.description.trim()) {
      const serviceToAdd: ServiceCard = {
        id: `custom-${Date.now()}`,
        name: newService.name,
        description: newService.description,
        category: newService.category,
        icon: '🔧', // Icône par défaut pour les services personnalisés
        defaultScore: newService.score,
        defaultImportance: newService.importance
      };

      setServices(prevServices => {
        // Trouver l'index où insérer le nouveau service dans la bonne catégorie
        let insertIndex = 0;
        
        // Définir l'ordre des catégories
        const categoryOrder = ['defensive', 'general', 'offensive'];
        const targetCategoryIndex = categoryOrder.indexOf(newService.category);
        
        // Parcourir les services existants pour trouver la bonne position
        for (let i = 0; i < prevServices.length; i++) {
          const currentCategoryIndex = categoryOrder.indexOf(prevServices[i].category);
          
          // Si on trouve une catégorie qui vient après, on insère avant
          if (currentCategoryIndex > targetCategoryIndex) {
            insertIndex = i;
            break;
          }
          
          // Si on est dans la même catégorie, on continue jusqu'à la fin de cette catégorie
          if (currentCategoryIndex === targetCategoryIndex) {
            insertIndex = i + 1;
          }
        }
        
        // Si on n'a pas trouvé de position, on ajoute à la fin
        if (insertIndex === 0 && prevServices.length > 0) {
          insertIndex = prevServices.length;
        }
        
        // Insérer le service à la bonne position
        const newServices = [...prevServices];
        newServices.splice(insertIndex, 0, serviceToAdd);
        
        // Sauvegarder les services personnalisés dans le localStorage
        const customServices = newServices.filter(service => service.id.startsWith('custom-'));
        localStorage.setItem('customServices', JSON.stringify(customServices));
        
        return newServices;
      });
      
      // Réinitialiser le formulaire
      setNewService({
        name: '',
        description: '',
        category: 'defensive',
        score: 5,
        importance: 'Moyenne'
      });
      
      // Fermer le formulaire
      setShowAddForm(false);
    }
  };

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
    
    // Ne pas fermer la sidebar automatiquement pour permettre le drop
    // La sidebar se fermera seulement si le drop est réussi dans handleDropService
  };



  const handleDeleteClick = (service: ServiceCard) => {
    setServiceToDelete(service);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;

    try {
      // Appel API pour supprimer le service de la base de données
      const response = await fetch(`/api/services/${serviceToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Supprimer du localStorage et de l'état local
        setServices(prevServices => {
          const updatedServices = prevServices.filter(service => service.id !== serviceToDelete.id);
          const customServices = updatedServices.filter(service => service.id.startsWith('custom-'));
          localStorage.setItem('customServices', JSON.stringify(customServices));
          return updatedServices;
        });
        
        console.log('Service supprimé avec succès');
      } else {
        console.error('Erreur lors de la suppression du service');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    } finally {
      setShowDeleteModal(false);
      setServiceToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setServiceToDelete(null);
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
                                     {userRole === 'admin' && (
                     <motion.button
                       whileHover={{ scale: 1.1 }}
                       whileTap={{ scale: 0.9 }}
                       onClick={() => setShowAddForm(true)}
                       className="w-8 h-8 rounded-full bg-[#CCFF00] text-black flex items-center justify-center hover:bg-[#9933FF] hover:text-white transition-all duration-300"
                       title="Ajouter un service prédéfini"
                     >
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                       </svg>
                     </motion.button>
                   )}
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

              {/* Barre de recherche */}
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un service..."
                  className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-700 bg-gray-800 text-white focus:border-[#CCFF00] focus:ring-2 focus:ring-[#CCFF00]/20 outline-none transition-all font-karla-regular"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

                         {/* Formulaire d'ajout de service prédéfini */}
                         <AnimatePresence>
                           {showAddForm && (
                             <motion.div
                               initial={{ opacity: 0, height: 0 }}
                               animate={{ opacity: 1, height: 'auto' }}
                               exit={{ opacity: 0, height: 0 }}
                               transition={{ duration: 0.3 }}
                               className="mb-6"
                             >
                               <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                                 <div className="flex justify-between items-center mb-4">
                                   <h3 className="text-lg font-karla-bold text-white">
                                     <span className="bg-gradient-to-r from-[#CCFF00] to-[#9933FF] bg-clip-text text-transparent">
                                       NOUVEAU SERVICE PRÉDÉFINI
                                     </span>
                                   </h3>
                                   <button
                                     onClick={() => setShowAddForm(false)}
                                     className="text-gray-400 hover:text-[#CCFF00] transition-colors p-1 rounded-lg hover:bg-gray-700"
                                   >
                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                     </svg>
                                   </button>
                                 </div>
                                 
                                 <div className="space-y-3">
                                                                       <div>
                                      <label className="block text-sm font-karla-semibold text-white mb-1">
                                        Nom du service
                                      </label>
                                      <input
                                        type="text"
                                        value={newService.name}
                                        onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00]/20 outline-none transition-all font-karla-regular text-sm"
                                        placeholder="Ex: Firewall"
                                      />
                                    </div>
                                   
                                                                       <div>
                                      <label className="block text-sm font-karla-semibold text-white mb-1">
                                        Description
                                      </label>
                                      <textarea
                                        value={newService.description}
                                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00]/20 outline-none transition-all font-karla-regular text-sm"
                                        rows={2}
                                        placeholder="Description du service..."
                                      />
                                    </div>
                                   
                                                                       <div>
                                      <label className="block text-sm font-karla-semibold text-white mb-1">
                                        Catégorie
                                      </label>
                                      <select 
                                        value={newService.category}
                                        onChange={(e) => setNewService({ ...newService, category: e.target.value as 'defensive' | 'general' | 'offensive' })}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00]/20 outline-none transition-all font-karla-regular text-sm"
                                      >
                                        <option value="defensive">Défensif</option>
                                        <option value="general">Général</option>
                                        <option value="offensive">Offensif</option>
                                      </select>
                                    </div>
                                   
                                   <div className="flex gap-3">
                                                                           <div className="flex-1">
                                        <label className="block text-sm font-karla-semibold text-white mb-1">
                                          Score (1-10)
                                        </label>
                                        <input
                                          type="number"
                                          min="1"
                                          max="10"
                                          value={newService.score}
                                          onChange={(e) => setNewService({ ...newService, score: parseInt(e.target.value) })}
                                          className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00]/20 outline-none transition-all font-karla-regular text-sm"
                                          placeholder="5"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <label className="block text-sm font-karla-semibold text-white mb-1">
                                          Priorité
                                        </label>
                                        <select 
                                          value={newService.importance}
                                          onChange={(e) => setNewService({ ...newService, importance: e.target.value })}
                                          className="w-full px-3 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00]/20 outline-none transition-all font-karla-regular text-sm"
                                        >
                                          <option value="Faible">Faible</option>
                                          <option value="Moyenne">Moyenne</option>
                                          <option value="Élevée">Élevée</option>
                                        </select>
                                      </div>
                                   </div>
                                   
                                                                       <motion.button
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      onClick={handleAddService}
                                      className="w-full py-2 bg-[#CCFF00] text-black rounded-lg font-karla-bold hover:bg-[#9933FF] hover:text-white transition-all duration-300 text-sm"
                                    >
                                      AJOUTER LE SERVICE
                                    </motion.button>
                                 </div>
                               </div>
                             </motion.div>
                           )}
                                                   </AnimatePresence>

                          {/* Modal de confirmation de suppression */}
                          <AnimatePresence>
                            {showDeleteModal && serviceToDelete && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
                              >
                                <motion.div
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0.8, opacity: 0 }}
                                  className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-md w-full mx-4"
                                >
                                  <div className="text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500 flex items-center justify-center">
                                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </div>
                                    
                                    <h3 className="text-xl font-karla-bold text-white mb-2">
                                      Confirmer la suppression
                                    </h3>
                                    
                                    <p className="text-gray-300 mb-6 font-karla-regular">
                                      Êtes-vous sûr de vouloir supprimer le service <span className="text-[#CCFF00] font-karla-bold">&ldquo;{serviceToDelete.name}&rdquo;</span> ?
                                    </p>
                                    
                                    <p className="text-sm text-gray-400 mb-6 font-karla-regular">
                                      Cette action sera définitive et supprimera le service pour tous les utilisateurs.
                                    </p>
                                    
                                    <div className="flex gap-3">
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={cancelDelete}
                                        className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-karla-bold transition-all duration-300"
                                      >
                                        ANNULER
                                      </motion.button>
                                      
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={confirmDelete}
                                        className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-karla-bold transition-all duration-300"
                                      >
                                        SUPPRIMER
                                      </motion.button>
                                    </div>
                                  </div>
                                </motion.div>
                              </motion.div>
                            )}
                          </AnimatePresence>

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
                           {/* Bouton de suppression pour l'admin - seulement pour les services personnalisés */}
                           {userRole === 'admin' && service.id.startsWith('custom-') && (
                             <motion.button
                               whileHover={{ scale: 1.1 }}
                               whileTap={{ scale: 0.9 }}
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleDeleteClick(service);
                               }}
                               className="absolute top-0 right-0 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-300 z-10"
                               title="Supprimer ce service"
                             >
                               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                               </svg>
                             </motion.button>
                           )}
                           
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