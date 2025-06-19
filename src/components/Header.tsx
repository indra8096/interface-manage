import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faCogs, faRocket } from '@fortawesome/free-solid-svg-icons';

const Header: React.FC = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-sm border-b border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faShieldAlt} className="text-blue-600 text-xl" />
              <FontAwesomeIcon icon={faCogs} className="text-green-600 text-xl" />
              <FontAwesomeIcon icon={faRocket} className="text-red-600 text-xl" />
            </div>
            <h1 className="text-xl font-bold text-primary">Interface de Gestion</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Statut :</span>
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                En ligne
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header; 