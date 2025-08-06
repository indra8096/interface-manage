'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface User {
  id: number;
  email: string;
  role: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState('user');
  const router = useRouter();

  useEffect(() => {
    // Protection : seulement admin
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('role');
      if (role !== 'admin') {
        router.push('/');
      }
    }
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    if (res.ok) {
      setUsers(await res.json());
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess('Utilisateur créé avec succès !');
      setEmail(''); setPassword(''); setRole('user');
      fetchUsers();
    } else {
      setError('Erreur lors de la création de l\'utilisateur');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setSuccess('Utilisateur supprimé avec succès !');
      fetchUsers();
    }
  };

  const handleEdit = (user: User) => {
    setEditId(user.id);
    setEditEmail(user.email);
    setEditPassword('');
    setEditRole(user.role);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    const res = await fetch(`/api/users/${editId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: editEmail, password: editPassword, role: editRole }),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess('Utilisateur modifié avec succès !');
      setEditId(null);
      setEditEmail('');
      setEditPassword('');
      setEditRole('user');
      fetchUsers();
    } else {
      setError('Erreur lors de la modification de l\'utilisateur');
    }
  };

  return (
    <div className="min-h-screen transition-all duration-300" style={{ background: 'var(--bg-primary)' }}>
      <Header />
      
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header futuriste */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h1 className="text-5xl font-karla-bold mb-4 transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>
                  <span style={{ color: 'var(--text-primary)' }}>
                    Administration
                  </span>
                </h1>
                <p className="font-karla-regular text-lg transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>
                  Gestion des utilisateurs et des accès système
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-3 px-6 py-3 text-white rounded-xl font-karla-bold hover:bg-[#7c3aed] transition-all duration-300 shadow-lg"
                style={{ backgroundColor: '#9933FF' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                RETOUR AU TABLEAU
              </motion.button>
            </div>

            {/* Statistiques principales */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              <motion.div 
                className="p-8 rounded-2xl hover:border-[#CCFF00] transition-all duration-500"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)'
                }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-karla-medium text-sm mb-2 transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>UTILISATEURS TOTAUX</div>
                    <div className="text-6xl font-karla-bold" style={{ color: 'var(--theme-primary)' }}>{users.length}</div>
                  </div>
                  <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, #CCFF00, #a3cc00)'
                  }}>
                    <div className="w-16 h-16 rounded-full" style={{ background: 'var(--bg-primary)' }}></div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="p-8 rounded-2xl hover:border-[#9933FF] transition-all duration-500"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)'
                }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-karla-medium text-sm mb-2 transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>ADMINISTRATEURS</div>
                    <div className="text-6xl font-karla-bold" style={{ color: 'var(--theme-secondary)' }}>
                      {users.filter(u => u.role === 'admin').length}
                    </div>
                  </div>
                  <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, #9933FF, #7c3aed)'
                  }}>
                    <div className="w-16 h-16 rounded-full" style={{ background: 'var(--bg-primary)' }}></div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="p-8 rounded-2xl hover:border-[#CCFF00] transition-all duration-500"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)'
                }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-karla-medium text-sm mb-2 transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>UTILISATEURS</div>
                    <div className="text-6xl font-karla-bold" style={{ color: 'var(--theme-primary)' }}>
                      {users.filter(u => u.role === 'user').length}
                    </div>
                  </div>
                  <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, #CCFF00, #a3cc00)'
                  }}>
                    <div className="w-16 h-16 rounded-full" style={{ background: 'var(--bg-primary)' }}></div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Formulaire de création */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <div className="p-8 rounded-2xl hover:border-[#CCFF00] transition-all duration-500"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-primary)'
              }}>
              <h2 className="text-2xl font-karla-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                Créer un nouvel utilisateur
              </h2>
              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
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
                <div>
                  <label className="block text-sm font-karla-semibold mb-2 transition-colors duration-300" style={{ color: 'var(--text-muted)' }}>
                    Rôle
                  </label>
                  <select 
                    value={role} 
                    onChange={e => setRole(e.target.value)} 
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-300 font-karla-regular focus:outline-none focus:ring-2 focus:ring-[#CCFF00] focus:border-transparent" 
                    style={{ 
                      background: 'var(--bg-secondary)',
                      borderColor: 'var(--border-primary)',
                      color: 'var(--text-primary)'
                    }}
                    required 
                  >
                    <option value="user">Utilisateur</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
                <motion.button 
                  type="submit" 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 text-white rounded-xl font-karla-bold transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" 
                  style={{ backgroundColor: '#CCFF00', color: '#000000' }}
                  disabled={loading}
                >
                  {loading ? 'Création...' : 'CRÉER UTILISATEUR'}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Messages d'état */}
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
              <div className="font-karla-semibold">{error}</div>
            </motion.div>
          )}
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl border-l-4" 
              style={{ 
                background: 'rgba(34, 197, 94, 0.1)',
                borderLeftColor: '#22c55e',
                color: '#22c55e'
              }}
            >
              <div className="font-karla-semibold">{success}</div>
            </motion.div>
          )}

          {/* Tableau des utilisateurs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="p-8 rounded-2xl hover:border-[#9933FF] transition-all duration-500"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <h2 className="text-2xl font-karla-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Liste des utilisateurs
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border-primary)' }}>
                    <th className="p-4 text-left font-karla-semibold" style={{ color: 'var(--text-muted)' }}>Email</th>
                    <th className="p-4 text-left font-karla-semibold" style={{ color: 'var(--text-muted)' }}>Rôle</th>
                    <th className="p-4 text-center font-karla-semibold" style={{ color: 'var(--text-muted)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <motion.tr 
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="border-b hover:bg-opacity-50 transition-all duration-300" 
                      style={{ 
                        borderColor: 'var(--border-primary)',
                        background: 'transparent'
                      }}
                    >
                      {editId === user.id ? (
                        <td colSpan={3} className="p-4" style={{ background: 'var(--bg-secondary)' }}>
                          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                                         <input 
                               type="email" 
                               value={editEmail} 
                               onChange={e => setEditEmail(e.target.value)} 
                               className="px-4 py-3 rounded-xl border transition-all duration-300 font-karla-regular focus:outline-none focus:ring-2 focus:ring-[#CCFF00] focus:border-transparent" 
                               style={{ 
                                 background: 'var(--bg-primary)',
                                 borderColor: 'var(--border-primary)',
                                 color: 'var(--text-primary)'
                               }}
                               required 
                             />
                                                         <input 
                               type="password" 
                               value={editPassword} 
                               onChange={e => setEditPassword(e.target.value)} 
                               className="px-4 py-3 rounded-xl border transition-all duration-300 font-karla-regular focus:outline-none focus:ring-2 focus:ring-[#CCFF00] focus:border-transparent" 
                               style={{ 
                                 background: 'var(--bg-primary)',
                                 borderColor: 'var(--border-primary)',
                                 color: 'var(--text-primary)'
                               }}
                               placeholder="Nouveau mot de passe (optionnel)" 
                             />
                            <select 
                              value={editRole} 
                              onChange={e => setEditRole(e.target.value)} 
                              className="px-4 py-3 rounded-xl border transition-all duration-300 font-karla-regular focus:outline-none focus:ring-2 focus:ring-[#CCFF00] focus:border-transparent" 
                              style={{ 
                                background: 'var(--bg-primary)',
                                borderColor: 'var(--border-primary)',
                                color: 'var(--text-primary)'
                              }}
                              required 
                            >
                              <option value="user">Utilisateur</option>
                              <option value="admin">Administrateur</option>
                            </select>
                            <div className="flex gap-2">
                              <motion.button 
                                type="submit" 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-3 text-white rounded-xl font-karla-bold transition-all duration-300 shadow-lg" 
                                style={{ backgroundColor: '#22c55e' }}
                              >
                                Enregistrer
                              </motion.button>
                              <motion.button 
                                type="button" 
                                onClick={() => setEditId(null)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-3 rounded-xl font-karla-bold transition-all duration-300 shadow-lg" 
                                style={{ 
                                  backgroundColor: 'var(--bg-primary)',
                                  color: 'var(--text-primary)',
                                  border: '1px solid var(--border-primary)'
                                }}
                              >
                                Annuler
                              </motion.button>
                            </div>
                          </form>
                        </td>
                      ) : (
                        <>
                          <td className="p-4 font-karla-regular" style={{ color: 'var(--text-primary)' }}>
                            {user.email}
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-karla-semibold ${
                              user.role === 'admin' 
                                ? 'text-white' 
                                : 'text-black'
                            }`} style={{
                              backgroundColor: user.role === 'admin' ? '#9933FF' : '#CCFF00'
                            }}>
                              {user.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex gap-2 justify-center">
                              <motion.button 
                                onClick={() => handleEdit(user)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-3 py-2 text-white rounded-lg font-karla-semibold transition-all duration-300 shadow-lg" 
                                style={{ backgroundColor: '#f59e0b' }}
                              >
                                Modifier
                              </motion.button>
                              <motion.button 
                                onClick={() => handleDelete(user.id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-3 py-2 text-white rounded-lg font-karla-semibold transition-all duration-300 shadow-lg" 
                                style={{ backgroundColor: '#ef4444' }}
                              >
                                Supprimer
                              </motion.button>
                            </div>
                          </td>
                        </>
                      )}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 