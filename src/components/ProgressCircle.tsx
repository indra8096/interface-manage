'use client';

import { motion } from 'framer-motion';

interface ProgressCircleProps {
  percentage: number;
  color: string;
  category: string;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({ percentage, color, category }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      {/* Cercle de fond avec effet de glow futuriste */}
      <div 
        className="absolute inset-0 rounded-full opacity-20"
        style={{ 
          background: `radial-gradient(circle, ${color}40, transparent)`,
          filter: 'blur(12px)'
        }}
      />
      
      <svg className="transform -rotate-90 w-full h-full drop-shadow-2xl">
        {/* Définitions des gradients */}
        <defs>
          <linearGradient id={`gradient-${category}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id={`progress-${category}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={`${color}80`} />
          </linearGradient>
        </defs>
        
        {/* Cercle de fond */}
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke={`url(#gradient-${category})`}
          strokeWidth="8"
          fill="none"
          className="drop-shadow-lg"
        />
        
        {/* Cercle de progression avec animation */}
        <motion.circle
          cx="64"
          cy="64"
          r={radius}
          stroke={`url(#progress-${category})`}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="drop-shadow-xl"
          style={{
            filter: `drop-shadow(0 0 12px ${color}60)`
          }}
        />
      </svg>
      
      {/* Contenu central avec design futuriste */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-center"
        >
          <div 
            className="text-3xl font-karla-bold"
            style={{ color }}
          >
            {percentage}%
          </div>
        </motion.div>
      </div>
      
      {/* Indicateurs de progression futuristes */}
      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center gap-1">
          {[0, 25, 50, 75, 100].map((mark) => (
            <motion.div
              key={mark}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                percentage >= mark ? 'bg-[#CCFF00]' : 'bg-gray-600'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: percentage >= mark ? 1 : 0.5 }}
              transition={{ delay: mark / 100 * 0.5 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressCircle; 