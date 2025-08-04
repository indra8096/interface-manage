'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
              <header 
       className="border-b border-[#CCFF00] px-8 py-6 transition-all duration-300"
       style={{ 
         background: 'var(--bg-primary)',
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
             <div className="text-sm font-karla-regular transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>
               <span className="font-karla-semibold text-[#CCFF00]">STATUT:</span>
                              <span className="ml-2 px-3 py-1 bg-[#CCFF00] text-black rounded-full text-xs font-karla-bold">
                 SYSTÈME ACTIF
               </span>
             </div>
             
             <ThemeToggle />
             
             <button
               onClick={() => window.location.href = '/admin/users'}
               className="px-4 py-2 rounded-lg hover:from-[#CCFF00] hover:to-[#9933FF] hover:text-black transition-all duration-300 font-karla-medium hover:border-transparent"
               style={{
                 background: 'var(--bg-secondary)',
                 color: 'var(--text-primary)',
                 border: '1px solid var(--border-primary)'
               }}
               title="Gérer les utilisateurs"
             >
               ADMIN
             </button>
           </div>
          
                     <button
             onClick={handleLogout}
             className="px-4 py-2 rounded-lg transition-all duration-300 font-karla-medium"
             style={{
               background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
               color: '#FFFFFF',
               border: '1px solid #dc2626'
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