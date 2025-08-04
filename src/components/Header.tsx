'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <header 
      className="bg-black border-b border-gray-800 px-8 py-6"
      style={{ 
        background: 'linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.98) 100%)',
        backdropFilter: 'blur(20px)'
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <motion.div 
          className="flex items-center gap-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#CCFF00] to-[#9933FF] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-black"></div>
          </div>
          <h1 className="text-2xl font-karla-bold text-white">
            <span style={{ color: '#CCFF00' }}>
              drelto
            </span>
          </h1>
        </motion.div>
        
        <motion.div 
          className="flex items-center space-x-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400 font-karla-regular">
              <span className="font-karla-semibold text-[#CCFF00]">STATUT:</span>
                             <span className="ml-2 px-3 py-1 bg-[#CCFF00] text-black rounded-full text-xs font-karla-bold">
                 SYSTÈME ACTIF
               </span>
            </div>
            
            <button
              onClick={() => window.location.href = '/admin/users'}
              className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:from-[#CCFF00] hover:to-[#9933FF] hover:text-black transition-all duration-300 font-karla-medium border border-gray-700 hover:border-transparent"
              title="Gérer les utilisateurs"
            >
              ADMIN
            </button>
          </div>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-500 hover:to-red-600 transition-all duration-300 font-karla-medium border border-red-600 hover:border-red-500"
            title="Déconnexion"
          >
            DÉCONNEXION
          </button>
        </motion.div>
      </div>
    </header>
  );
} 