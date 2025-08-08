'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('superadmin@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔍 Tentative de connexion...');
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      console.log('📡 Réponse API:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('✅ Connexion réussie:', data.role);
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('companyId', data.companyId?.toString() || '');
        localStorage.setItem('userCompanyId', data.companyId?.toString() || '');
        localStorage.setItem('companyName', data.companyName || '');
        
        // Redirection selon le rôle
        if (data.role === 'SUPER_ADMIN') {
          console.log('🚀 Redirection vers /superadmin');
          router.push('/superadmin');
        } else if (data.role === 'COMPANY_ADMIN' || data.role === 'COMPANY_USER') {
          console.log('🚀 Redirection vers /dashboard');
          router.push('/dashboard');
        } else {
          setError('Rôle non reconnu');
        }
      } else {
        const errorData = await res.json();
        console.log('❌ Erreur de connexion:', errorData);
        setError(errorData.error || 'Identifiants invalides');
      }
    } catch (err) {
      console.error('❌ Erreur lors de la connexion:', err);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#CCFF00] to-[#9933FF] flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-black"></div>
          </div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-[#CCFF00]">drelto</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Interface de contrôle des systèmes
          </p>
        </div>

        {/* Formulaire de connexion */}
        <div className="p-8 rounded-2xl bg-gray-900 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Connexion
          </h2>

          {/* Message d'erreur */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-900/20 border border-red-500/30">
              <div className="text-red-300 text-center font-semibold">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-[#CCFF00] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-[#CCFF00] focus:border-transparent"
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-3 rounded-xl font-bold transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-[#CCFF00] text-black hover:bg-[#B3E600]"
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'SE CONNECTER'}
            </button>
          </form>

          {/* By Drelto */}
          <div className="mt-8 pt-6 border-t border-gray-700 text-center">
            <p className="text-sm text-gray-400">
              By <span className="text-[#CCFF00]">Drelto</span>
            </p>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-2 h-2 rounded-full bg-[#CCFF00]"></div>
            <div className="w-2 h-2 rounded-full bg-[#9933FF]"></div>
            <div className="w-2 h-2 rounded-full bg-[#CCFF00]"></div>
          </div>
          <p className="text-xs text-gray-400">
            Système de cybersécurité avancé
          </p>
        </div>
      </div>
    </div>
  );
} 