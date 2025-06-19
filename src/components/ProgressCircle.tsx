import { motion } from 'framer-motion';

interface ProgressCircleProps {
  percentage: number;
  color: string;
  category: 'defensive' | 'general' | 'offensive';
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({ percentage, color, category }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const categoryColors = {
    defensive: 'text-cyan',
    general: 'text-secondary',
    offensive: 'text-accent',
  };

  return (
    <div className="relative w-32 h-32">
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="#f3f4f6"
          strokeWidth="8"
          fill="none"
        />
        <motion.circle
          cx="64"
          cy="64"
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className={`text-2xl font-bold ${categoryColors[category]}`}
        >
          {percentage}%
        </motion.span>
      </div>
    </div>
  );
};

export default ProgressCircle; 