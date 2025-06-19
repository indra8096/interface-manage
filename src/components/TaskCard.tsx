import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

interface TaskCardProps {
  id: number;
  name: string;
  status: 'completed' | 'warning' | 'error';
  score: number;
  onStatusChange: (id: number, newStatus: 'completed' | 'warning' | 'error') => void;
}

const statusIcons = {
  completed: faCheckCircle,
  warning: faExclamationCircle,
  error: faTimesCircle,
};

const statusColors = {
  completed: '#16a34a', // Vert
  warning: '#eab308',   // Jaune
  error: '#dc2626',     // Rouge
};

const TaskCard: React.FC<TaskCardProps> = ({
  id,
  name,
  status,
  score,
  onStatusChange,
}) => {
  const handleStatusClick = () => {
    const statusOrder: ('completed' | 'warning' | 'error')[] = ['completed', 'warning', 'error'];
    const currentIndex = statusOrder.indexOf(status);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    onStatusChange(id, statusOrder[nextIndex]);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="bg-task-bg p-4 rounded-md shadow-custom border-l-4 hover:shadow-custom-hover transition-all duration-300"
      style={{ borderLeftColor: statusColors[status] }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-grow">
          <h3 className="text-primary font-medium mb-2">{name}</h3>
          <div className="text-xs text-gray-500">
            Score: <span className="font-medium">{score}</span>
          </div>
        </div>
        <button
          onClick={handleStatusClick}
          className="text-lg transition-colors duration-300 hover:opacity-80"
          style={{ color: statusColors[status] }}
        >
          <FontAwesomeIcon icon={statusIcons[status]} />
        </button>
      </div>
    </motion.div>
  );
};

export default TaskCard; 