'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';
import ProgressCircle from './ProgressCircle';
import CategoryDetailsPanel from './CategoryDetailsPanel';

interface Task {
  id: number;
  name: string;
  status: 'completed' | 'warning' | 'error';
  score: number;
  category: string;
  description?: string;
  importance?: string;
  dueDate?: string;
  assignedTo?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TaskColumnProps {
  category: 'defensive' | 'general' | 'offensive';
  tasks: Task[];
  onAddTask: (taskData: { name: string; score: number; category: string; description: string; importance: string; dueDate: string; assignedTo: string }) => void;
  onStatusChange: (id: number, newStatus: 'completed' | 'warning' | 'error') => void;
  onDropService?: (service: { id: string; name: string; description: string; category: 'defensive' | 'general' | 'offensive'; icon: string; defaultScore: number; defaultImportance: string }, targetCategory: 'defensive' | 'general' | 'offensive') => void;
  userRole?: string;
  onAddTaskFromPanel?: (taskData: { name: string; score: number; category: string; description: string; importance: string; dueDate: string; assignedTo: string }) => void;
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

const categoryTitles = {
  defensive: 'DÉFENSIF',
  general: 'GÉNÉRAL',
  offensive: 'OFFENSIF',
};

const categoryColors = {
  defensive: 'var(--theme-primary)',
  general: 'var(--theme-primary)',
  offensive: 'var(--theme-secondary)',
};

const categoryDescriptions = {
  defensive: 'Systèmes de protection et surveillance',
  general: 'Services d\'infrastructure et maintenance',
  offensive: 'Tests de pénétration et évaluation',
};

export default function TaskColumn({ category, tasks, onAddTask, onStatusChange, onDropService, userRole = 'user', onAddTaskFromPanel, tasksAddedFromPanel = [], onRemoveTaskFromPanel }: TaskColumnProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    score: 5,
    importance: 'Moyenne',
    dueDate: '',
    assignedTo: '',
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [isOverCancel, setIsOverCancel] = useState(false);

  const percentage = Math.round((tasks.filter(t => t.status === 'completed').length / Math.max(tasks.length, 1)) * 100);

  const scoreColors = {
    1: '#ef4444',
    2: '#f59e0b',
    3: '#f59e0b',
    4: '#eab308',
    5: '#84cc16',
    6: '#22c55e',
    7: '#10b981',
    8: '#06b6d4',
    9: '#3b82f6',
    10: '#8b5cf6',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onAddTask({
        ...formData,
        category,
      });
      // Réinitialiser le formulaire
      setFormData({
        name: '',
        description: '',
        score: 5,
        importance: 'Moyenne',
        dueDate: '',
        assignedTo: '',
      });
      setShowAddForm(false);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setFormData({
      name: '',
      description: '',
      score: 5,
      importance: 'Moyenne',
      dueDate: '',
      assignedTo: '',
    });
  };

  // Gestion du drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    e.dataTransfer.effectAllowed = 'copy';
    setIsDragOver(true);
    console.log('Drag over sur la colonne:', category);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Vérifier si on quitte vraiment la colonne (pas juste un enfant)
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
      console.log('Drag leave de la colonne:', category);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setIsOverCancel(false);
    console.log('=== DROP DÉTECTÉ ===');
    console.log('Colonne cible:', category);
    
    // Vérifier si on dépose sur le bouton annuler
    const target = e.target as HTMLElement;
    const isCancelButton = target.closest('[data-cancel-button]');
    
    if (isCancelButton) {
      console.log('✅ Drop sur bouton ANNULER - Action annulée');
      return; // Annuler l'action sans créer de tâche
    }
    
    try {
      const serviceData = e.dataTransfer.getData('text/plain');
      console.log('Service data reçu:', serviceData);
      
      if (serviceData && onDropService) {
        const service = JSON.parse(serviceData);
        console.log('Service parsé:', service);
        console.log('Catégorie cible:', category);
        console.log('onDropService disponible:', !!onDropService);
        
        // Appeler onDropService avec le service et la catégorie
        onDropService(service, category);
        console.log('✅ onDropService appelé avec succès');
        
        // Feedback visuel subtil - la tâche apparaîtra immédiatement
        console.log(`Service "${service.name}" ajouté à la colonne ${category}!`);
      } else {
        console.log('❌ Pas de service data ou onDropService non défini');
        console.log('serviceData:', !!serviceData);
        console.log('onDropService:', !!onDropService);
      }
    } catch (error) {
      console.error('❌ Erreur lors du drop du service:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-2xl p-8 border transition-all duration-500 backdrop-blur-sm ${
        isDragOver 
          ? 'border-[#CCFF00] shadow-lg shadow-[#CCFF00]/20 scale-105 bg-[#CCFF00]/5' 
          : 'border-[#9933FF] hover:border-[#CCFF00]'
      }`}
      style={{
        background: 'var(--bg-card)',
        boxShadow: `0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px ${categoryColors[category]}20`
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
      }}
      data-testid={`task-column-${category}`}
    >
      {/* Header futuriste */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-karla-bold mb-2 transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>
              {categoryTitles[category]}
            </h2>
            <p className="font-karla-regular text-sm transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>
              {categoryDescriptions[category]}
            </p>
          </div>
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group"
            style={{
              background: 'linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))'
            }}
          >
            <div className="w-8 h-8 rounded-full transition-all duration-300" style={{ background: 'var(--bg-primary)' }}></div>
          </div>
        </div>
        
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
      </div>

      {/* Section statistiques futuriste */}
      <div className="mb-8 p-6 rounded-xl border transition-all duration-300" style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)'
      }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-karla-semibold transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>PROGRESSION</h3>
          <span className="text-xs font-karla-medium transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>OBJECTIF: 100%</span>
        </div>
        <div className="flex items-center justify-center">
          <ProgressCircle
            percentage={percentage}
            color={categoryColors[category]}
            category={category}
          />
        </div>
        <div className="text-center mt-4">
          <div className="text-xs font-karla-medium mb-1 transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>
            SERVICES COMPLÉTÉS
          </div>
          <div className="text-lg font-karla-bold" style={{ color: categoryColors[category] }}>
            {tasks.length}/10
          </div>
        </div>
      </div>

      {/* Liste des tâches avec design futuriste */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-karla-semibold transition-colors duration-300" style={{ color: 'var(--text-secondary)' }}>SERVICES ACTIFS</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--theme-primary)' }}></div>
            <span className="text-xs font-karla-medium transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>ONLINE</span>
          </div>
        </div>

        {/* Indicateur de zone de drop - juste après "SERVICES ACTIFS" */}
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className="space-y-3"
          >
            <div className="p-4 rounded-xl border-2 border-dashed border-[#CCFF00] bg-[#CCFF00]/10 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto mb-2 text-[#CCFF00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                <p className="text-[#CCFF00] font-karla-bold text-sm">DÉPOSER ICI</p>
              </div>
            </div>
            
            {/* Bouton Annuler */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              onClick={() => setIsDragOver(false)}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOverCancel(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOverCancel(false);
              }}
              data-cancel-button
              className={`w-full p-3 rounded-xl border-2 border-dashed flex items-center justify-center transition-all duration-300 ${
                isOverCancel 
                  ? 'border-red-400 bg-red-500/20 shadow-lg shadow-red-500/20' 
                  : 'border-red-500 bg-red-500/10 hover:bg-red-500/20'
              }`}
            >
              <div className="text-center">
                <svg className={`w-6 h-6 mx-auto mb-1 transition-colors duration-300 ${
                  isOverCancel ? 'text-red-400' : 'text-red-500'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <p className={`font-karla-bold text-sm transition-colors duration-300 ${
                  isOverCancel ? 'text-red-400' : 'text-red-500'
                }`}>ANNULER</p>
              </div>
            </motion.button>
          </motion.div>
        )}
        
        <AnimatePresence mode="popLayout">
          {tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 transition-colors duration-300"
              style={{ color: 'var(--text-muted)' }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center border transition-all duration-300" style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)'
              }}>
                <div className="w-8 h-8 rounded-full transition-colors duration-300" style={{ background: 'var(--text-muted)' }}></div>
              </div>
              <p className="text-sm font-karla-medium transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>AUCUN SERVICE ACTIF</p>
              <p className="text-xs mt-1 transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>Initialisez votre premier service</p>
            </motion.div>
          ) : (
            tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
              >
                <TaskCard
                  {...task}
                  category={category}
                  onStatusChange={onStatusChange}
                  userRole={userRole}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Formulaire d'ajout intégré - Style identique au formulaire de modification */}
      <AnimatePresence>
        {showAddForm ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 border border-gray-800 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-karla-bold text-white">
                  <span className="bg-gradient-to-r from-[#CCFF00] to-[#9933FF] bg-clip-text text-transparent">
                    NOUVEAU SERVICE
                  </span>
                </h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-[#CCFF00] transition-colors p-2 rounded-lg hover:bg-gray-800"
                >
                  <div className="w-6 h-6 rounded-full bg-current"></div>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-karla-semibold text-white mb-3">
                    NOM DU SERVICE
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-white focus:border-[#CCFF00] focus:ring-2 focus:ring-[#CCFF00]/20 outline-none transition-all font-karla-regular"
                    placeholder="Entrez le nom du service..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-karla-semibold text-white mb-3">
                    NIVEAU DE PRIORITÉ (1-10)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.score}
                      onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) })}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, ${scoreColors[formData.score as keyof typeof scoreColors]} 0%, ${scoreColors[formData.score as keyof typeof scoreColors]} ${(formData.score - 1) * 11.11}%, #374151 ${(formData.score - 1) * 11.11}%, #374151 100%)`
                      }}
                    />
                    <span
                      className="px-4 py-2 rounded-full font-karla-bold text-sm text-black min-w-[3rem] text-center"
                      style={{
                        backgroundColor: scoreColors[formData.score as keyof typeof scoreColors],
                      }}
                    >
                      {formData.score}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-karla-semibold text-white mb-3">
                    DESCRIPTION
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-white focus:border-[#CCFF00] focus:ring-2 focus:ring-[#CCFF00]/20 outline-none transition-all font-karla-regular"
                    rows={3}
                    placeholder="Description du service..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-karla-semibold text-white mb-3">
                    PRIORITÉ
                  </label>
                  <select
                    value={formData.importance}
                    onChange={e => setFormData({ ...formData, importance: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-white focus:border-[#CCFF00] focus:ring-2 focus:ring-[#CCFF00]/20 outline-none transition-all font-karla-regular"
                  >
                    <option value="Faible">Faible</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Élevée">Élevée</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-karla-semibold text-white mb-3">
                    ÉCHÉANCE
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-white focus:border-[#CCFF00] focus:ring-2 focus:ring-[#CCFF00]/20 outline-none transition-all font-karla-regular"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-karla-semibold text-white mb-3">
                    PERSONNE ASSIGNÉE
                  </label>
                  <input
                    type="text"
                    value={formData.assignedTo}
                    onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-white focus:border-[#CCFF00] focus:ring-2 focus:ring-[#CCFF00]/20 outline-none transition-all font-karla-regular"
                    placeholder="Nom de la personne assignée..."
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-[#CCFF00] to-[#9933FF] text-black rounded-xl font-karla-bold hover:from-[#9933FF] hover:to-[#CCFF00] transition-all duration-300 shadow-lg"
                >
                  CRÉER LE SERVICE
                </motion.button>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddForm(true)}
            className="w-full p-4 rounded-xl font-karla-semibold flex items-center justify-center gap-3 transition-all duration-300"
            style={{ 
              background: 'var(--theme-primary)',
              color: 'var(--bg-primary)'
            }}
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-primary)', opacity: 0.2 }}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#FFFFFF' }}>
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-sm font-karla-bold">AJOUTER UN SERVICE</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panneau de détails de la catégorie */}
      <CategoryDetailsPanel
        isOpen={isDetailsPanelOpen}
        onClose={() => setIsDetailsPanelOpen(false)}
        category={category}
        categoryTitle={categoryTitles[category]}
        userRole={userRole}
        onAddTask={onAddTaskFromPanel || onAddTask}
        tasksAddedFromPanel={tasksAddedFromPanel}
        onRemoveTaskFromPanel={onRemoveTaskFromPanel}
      />
    </motion.div>
  );
} 