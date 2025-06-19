import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faCogs, faRocket, faPlus } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';
import ProgressCircle from './ProgressCircle';

interface Task {
  id: number;
  name: string;
  status: 'completed' | 'warning' | 'error';
  score: number;
}

interface TaskColumnProps {
  category: 'defensive' | 'general' | 'offensive';
  tasks: Task[];
  onAddTask: (category: string) => void;
  onStatusChange: (id: number, newStatus: 'completed' | 'warning' | 'error') => void;
}

const categoryIcons = {
  defensive: faShieldAlt,
  general: faCogs,
  offensive: faRocket,
};

const categoryColors = {
  defensive: '#2563eb', // Bleu
  general: '#16a34a',   // Vert
  offensive: '#dc2626', // Rouge
};

const categoryTitles = {
  defensive: 'Défensif',
  general: 'Général',
  offensive: 'Offensive',
};

const TaskColumn: React.FC<TaskColumnProps> = ({
  category,
  tasks,
  onAddTask,
  onStatusChange,
}) => {
  // Filtrer les tâches non complétées
  const visibleTasks = tasks.filter((task) => task.status !== 'completed');
  const completedTasks = tasks.filter((task) => task.status === 'completed').length;
  const percentage = Math.round((completedTasks / (tasks.length || 1)) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-column-bg rounded-lg p-6 shadow-custom border border-gray-200 hover:shadow-custom-hover transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
        <FontAwesomeIcon
          icon={categoryIcons[category]}
          className="text-lg"
          style={{ color: categoryColors[category] }}
        />
        <h2 className="text-lg font-semibold" style={{ color: categoryColors[category] }}>
          {categoryTitles[category]}
        </h2>
      </div>

      <div className="mb-8">
        <ProgressCircle
          percentage={percentage}
          color={categoryColors[category]}
          category={category}
        />
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {visibleTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <TaskCard
                {...task}
                onStatusChange={onStatusChange}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onAddTask(category)}
        className="w-full mt-6 p-3 bg-white text-primary border border-gray-200 rounded-md font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-all duration-300"
        style={{ color: categoryColors[category] }}
      >
        <FontAwesomeIcon icon={faPlus} className="text-sm" />
        <span className="text-sm">Ajouter une tâche</span>
      </motion.button>
    </motion.div>
  );
};

export default TaskColumn; 