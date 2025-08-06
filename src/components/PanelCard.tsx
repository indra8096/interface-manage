import React from 'react';

interface PanelCardProps {
  name: string;
  description?: string;
  importance?: string;
  total?: number;
  completed?: number;
  equipmentCount?: number;
  status?: string;
  certificationDate?: string;
  nextAudit?: string;
  priority?: string;
  deadline?: string;
  category: 'defensive' | 'general' | 'offensive';
  userRole?: string;
  onEdit?: (cardName: string, cardType: string) => void;
  onDelete?: (cardName: string) => void;
  onAddToDashboard?: (taskName: string, description: string, importance: string) => void;
  cardType: 'coverage' | 'infrastructure' | 'compliance' | 'recommendation';
  tasksAddedFromPanel?: { name: string }[];
}

const categoryColors = {
  defensive: '#3b82f6',
  general: '#10b981', 
  offensive: '#ef4444'
};

const PanelCard: React.FC<PanelCardProps> = ({ 
  name, 
  description, 
  importance, 
  total = 0,
  completed = 0,
  equipmentCount,
  status,
  certificationDate,
  nextAudit,
  priority,
  deadline,
  category,
  userRole = 'user',
  onEdit,
  onDelete,
  onAddToDashboard,
  cardType,
  tasksAddedFromPanel = []
}) => {
  const percentage = total && completed ? Math.round((completed / total) * 100) : 0;
  const isAddedToDashboard = tasksAddedFromPanel.some(task => task.name === name);

  // Fonction pour rendre le contenu spécifique selon le type
  const renderSpecificContent = () => {
    switch (cardType) {
      case 'coverage':
        return (
          <>
            <div className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              {completed} complété sur {total}
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-700 ease-out" 
                style={{ 
                  width: `${percentage}%`, 
                  background: `linear-gradient(90deg, ${categoryColors[category]}, ${categoryColors[category]}80)` 
                }}
              ></div>
            </div>
          </>
        );

      case 'infrastructure':
        return (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 rounded-full" style={{ 
                background: status === 'Sécurisé' ? '#10b981' : 
                           status === 'À vérifier' ? '#f59e0b' : 
                           status === 'Critique' ? '#ef4444' : '#3b82f6' 
              }}></div>
              <span className="text-sm font-karla-bold" style={{ color: 'var(--text-primary)' }}>{name}</span>
            </div>
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              {equipmentCount || 0} équipements
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              État: {status || 'Normal'}
            </div>
          </>
        );

      case 'compliance':
        return (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-karla-bold" style={{ color: 'var(--text-primary)' }}>{name}</span>
              <span className="px-3 py-1 rounded-full text-xs font-karla-bold" style={{ 
                background: status === 'CONFORME' ? '#10b981' : 
                           status === 'EN COURS' ? '#f59e0b' : '#ef4444', 
                color: 'black'
              }}>
                {status}
              </span>
            </div>
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              {certificationDate ? `Certification obtenue en ${certificationDate}` : 'Mise en conformité en cours'}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {nextAudit ? `Prochaine audit: ${nextAudit}` : 'Échéance: Octobre 2024'}
            </div>
          </>
        );

      case 'recommendation':
        return (
          <>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full mt-2" style={{ 
                background: priority === 'Haute' ? '#ef4444' : 
                           priority === 'Moyenne' ? '#f59e0b' : '#10b981' 
              }}></div>
              <div className="flex-1">
                <h4 className="text-sm font-karla-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Priorité {priority}
                </h4>
                <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                  {description}
                </p>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Échéance: {deadline || 'Non définie'}
                </div>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className="p-4 rounded-lg border transition-all duration-300 hover:border-opacity-60 group relative"
      style={{ 
        background: 'var(--bg-card)', 
        borderColor: 'var(--border-secondary)' 
      }}
    >
      <div className="flex justify-between items-center mb-2">
        {cardType !== 'infrastructure' && cardType !== 'compliance' && cardType !== 'recommendation' && (
          <span className="text-sm font-karla-medium" style={{ color: 'var(--text-primary)' }}>{name}</span>
        )}
        <div className="flex items-center gap-2">
          {cardType === 'coverage' && (
            <span className="text-xs font-karla-bold" style={{ color: categoryColors[category] }}>
              {percentage}%
            </span>
          )}
          {userRole === 'admin' && onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(name, cardType);
              }}
              className="px-2 py-1 rounded text-xs font-karla-medium transition-all duration-300"
              style={{ 
                background: categoryColors[category],
                color: 'black'
              }}
            >
              MODIFIER
            </button>
          )}
          {userRole === 'admin' && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(name);
              }}
              className="px-2 py-1 rounded text-xs font-karla-medium transition-all duration-300"
              style={{ 
                background: '#ef4444',
                color: 'white'
              }}
              title="Supprimer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          {userRole === 'admin' && onAddToDashboard && !isAddedToDashboard && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToDashboard(name, description || '', importance || 'Moyenne');
              }}
              className="px-2 py-1 rounded text-xs font-karla-medium transition-all duration-300"
              style={{ 
                background: categoryColors[category],
                color: 'black'
              }}
            >
              A
            </button>
          )}
        </div>
      </div>
      {renderSpecificContent()}
    </div>
  );
};

export default PanelCard;