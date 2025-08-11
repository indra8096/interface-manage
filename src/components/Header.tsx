'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('user');

  useEffect(() => {
    // Récupérer le rôle de l'utilisateur depuis le localStorage
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('role');
      // Conversion des rôles pour l'affichage
      if (role === 'COMPANY_ADMIN') {
        setUserRole('admin');
      } else if (role === 'COMPANY_USER') {
        setUserRole('user');
      } else {
        setUserRole(role || 'user');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    router.push('/login');
  };

  const handleAdminClick = () => {
    if (userRole === 'admin') {
      // Vérification de sécurité : seulement les COMPANY_ADMIN peuvent accéder
      const role = localStorage.getItem('role');
      if (role === 'COMPANY_ADMIN') {
        window.location.href = '/admin/users';
      }
    }
  };

  return (
              <header 
       className="border-b px-8 py-6 transition-all duration-300"
       style={{ 
         background: 'var(--bg-primary)',
         borderColor: 'var(--border-primary)',
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
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
               style={{
                 background: 'var(--theme-primary)'
               }}>
            <div className="w-8 h-8 rounded-full" style={{ background: 'var(--text-primary)' }}></div>
          </div>
                     <h1 className="text-2xl font-karla-bold transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>
             <span style={{ color: 'var(--theme-primary)' }}>
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
            <ThemeToggle />
            
            <button
              onClick={handleAdminClick}
              className={`px-4 py-2 rounded-lg transition-all duration-300 font-karla-medium ${
                userRole === 'admin' 
                  ? 'hover:opacity-80 cursor-pointer' 
                  : 'cursor-not-allowed opacity-50'
              }`}
              style={{
                background: userRole === 'admin' ? 'var(--theme-primary)' : 'var(--bg-card)',
                color: userRole === 'admin' ? 'var(--bg-primary)' : 'var(--text-primary)',
                border: '1px solid var(--border-primary)'
              }}
              title={userRole === 'admin' ? "Gérer les utilisateurs" : "Accès réservé aux administrateurs"}
              disabled={userRole !== 'admin'}
            >
              {userRole === 'admin' ? 'GÉRER LES UTILISATEURS' : 'USER'}
            </button>
          </div>
          
                     <button
             onClick={handleLogout}
             className="px-4 py-2 rounded-lg transition-all duration-300 font-karla-medium"
             style={{
               background: 'var(--theme-primary)',
               color: 'var(--bg-primary)',
               border: '1px solid var(--theme-primary)'
             }}
             title="Déconnexion"
           >
             DÉCONNEXION
           </button>
        </motion.div>
      </div>
    </header>
  );
} 