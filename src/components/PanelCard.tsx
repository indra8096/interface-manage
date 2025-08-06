import React from 'react';

interface PanelCardProps {
  name: string;
  description?: string;
  importance?: string;
  total?: number;
  completed?: number;
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

  return (
    <div 
      className="p-4 rounded-lg border transition-all duration-300 hover:border-opacity-60 group relative"
      style={{ 
        background: 'var(--bg-card)', 
        borderColor: 'var(--border-secondary)' 
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-karla-medium" style={{ color: 'var(--text-primary)' }}>{name}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-karla-bold" style={{ color: categoryColors[category] }}>
            {percentage}%
          </span>
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
    </div>
  );
};

export default PanelCard;