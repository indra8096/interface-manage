'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('companyId', data.companyId?.toString() || '');
      localStorage.setItem('userCompanyId', data.companyId?.toString() || ''); // Pour la vérification de sécurité
      localStorage.setItem('companyName', data.companyName || '');
      
      // Redirection selon le rôle
      if (data.role === 'SUPER_ADMIN') {
        router.push('/superadmin');
      } else if (data.role === 'COMPANY_ADMIN' || data.role === 'COMPANY_USER') {
        router.push('/dashboard');
      } else {
        setError('Rôle non reconnu');
      }
    } else {
      setError('Identifiants invalides');
    }
  };

  return (
    <div className="min-h-screen transition-all duration-300" style={{ background: 'var(--bg-primary)' }}>
      <div className="min-h-screen flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Logo et titre */}
          <div className="text-center mb-12">
            <motion.div 
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#CCFF00] to-[#9933FF] flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="w-16 h-16 rounded-full bg-black"></div>
            </motion.div>
            <motion.h1 
              className="text-4xl font-karla-bold mb-2 transition-colors duration-300"
              style={{ color: 'var(--text-primary)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <span style={{ color: 'var(--theme-primary)' }}>drelto</span>
            </motion.h1>
            <motion.p 
              className="font-karla-regular text-lg transition-colors duration-300"
              style={{ color: 'var(--text-muted)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Interface de contrôle des systèmes
            </motion.p>
          </div>

          {/* Formulaire de connexion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="p-8 rounded-2xl hover:border-[#CCFF00] transition-all duration-500"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <h2 className="text-2xl font-karla-bold mb-8 text-center" style={{ color: 'var(--text-primary)' }}>
              Connexion
            </h2>

            {/* Message d'erreur */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl border-l-4" 
                style={{ 
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderLeftColor: '#ef4444',
                  color: '#ef4444'
                }}
              >
                <div className="font-karla-semibold text-center">{error}</div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-karla-semibold mb-2 transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>
                  Adresse email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 font-karla-regular focus:outline-none focus:ring-2 focus:ring-[#CCFF00] focus:border-transparent"
                  style={{ 
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-karla-semibold mb-2 transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 font-karla-regular focus:outline-none focus:ring-2 focus:ring-[#CCFF00] focus:border-transparent"
                  style={{ 
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                  required
                />
              </div>

              <motion.button 
                type="submit" 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl font-karla-bold transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#CCFF00', color: '#000000' }}
                disabled={loading}
              >
                {loading ? 'Connexion...' : 'SE CONNECTER'}
              </motion.button>
            </form>

            {/* By Drelto */}
            <motion.div 
              className="mt-8 pt-6 border-t text-center"
              style={{ borderColor: 'var(--border-primary)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <p className="font-karla-medium text-sm transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>
                By <span style={{ color: 'var(--theme-primary)' }}>Drelto</span>
              </p>
            </motion.div>
          </motion.div>

          {/* Informations supplémentaires */}
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#CCFF00' }}></div>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#9933FF' }}></div>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#CCFF00' }}></div>
            </div>
            <p className="font-karla-regular text-xs transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>
              Système de cybersécurité avancé
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 