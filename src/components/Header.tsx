import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faCogs, faRocket, faUser, faUserShield } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';

const Header: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRole(localStorage.getItem('role'));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="shadow-sm border-b border-gray-200"
      style={{ backgroundColor: '#9933FF' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faShieldAlt} className="text-blue-600 text-xl" />
              <FontAwesomeIcon icon={faCogs} className="text-green-600 text-xl" />
              <FontAwesomeIcon icon={faRocket} className="text-red-600 text-xl" />
            </div>
            <h1 className="text-xl font-karla-bold text-white">Interface de Gestion</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-white font-karla-regular">
              <span className="font-karla-semibold">Statut :</span>
              <span className="ml-2 px-2 py-1 bg-white text-purple-800 rounded-full text-xs font-karla-medium">
                En ligne
              </span>
            </div>
            {role === 'admin' && (
              <>
                <FontAwesomeIcon icon={faUserShield} className="text-white text-xl ml-4" title="Administrateur" />
                <button
                  onClick={() => window.location.href = '/admin/users'}
                  className="ml-2 px-3 py-1 bg-white text-purple-800 rounded hover:bg-gray-100 transition font-karla-medium"
                  title="Gérer les utilisateurs"
                >
                  Gérer les utilisateurs
                </button>
              </>
            )}
            {role === 'user' && (
              <FontAwesomeIcon icon={faUser} className="text-white text-xl ml-4" title="Utilisateur" />
            )}
            {role && (
              <button
                onClick={handleLogout}
                className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition font-karla-medium"
                title="Déconnexion"
              >
                Déconnexion
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header; 