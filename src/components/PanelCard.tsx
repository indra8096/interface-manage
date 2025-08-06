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
      className={`p-4 rounded-lg border transition-all duration-300 hover:border-opacity-60 group relative ${
        userRole === 'admin' && onDelete ? 'pr-12' : ''
      }`}
      style={{ 
        background: 'var(--bg-card)', 
        borderColor: 'var(--border-secondary)' 
      }}
    >
      {/* Icône corbeille - Toujours à droite */}
      {userRole === 'admin' && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(name);
          }}
          className="absolute top-2 right-2 p-2 rounded-lg transition-all duration-200 hover:scale-105"
          style={{
            background: 'var(--bg-secondary)',
            color: '#ef4444',
            border: '1px solid var(--border-primary)'
          }}
          title="Supprimer"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      )}

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