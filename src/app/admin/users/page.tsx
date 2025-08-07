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
    // Protection : seulement COMPANY_ADMIN
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      const companyId = localStorage.getItem('companyId');
      
      if (!token) {
        router.push('/login');
        return;
      }
      
      if (role !== 'COMPANY_ADMIN') {
        router.push('/dashboard');
        return;
      }
      
      // Vérification de sécurité : l'admin ne peut gérer que les utilisateurs de son entreprise
      if (!companyId) {
        router.push('/dashboard');
        return;
      }
    }
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        console.log('❌ 401 Unauthorized, redirection vers login');
        router.push('/login');
        return;
      }

      if (res.ok) {
        const usersData = await res.json();
        console.log('✅ Users data received:', usersData);
        setUsers(usersData);
      } else {
        console.error('❌ Error fetching users:', res.status);
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Convertir les rôles pour l'API
      const apiRole = role === 'admin' ? 'COMPANY_ADMIN' : 'COMPANY_USER';

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, password, role: apiRole }),
      });

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      if (res.ok) {
        setSuccess('Utilisateur créé avec succès !');
        setEmail(''); setPassword(''); setRole('user');
        fetchUsers();
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Erreur lors de la création de l\'utilisateur');
      }
    } catch (error) {
      setError('Erreur lors de la création de l\'utilisateur');
    } finally {
      setLoading(false);
    }
  };

  const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; userId?: number; userEmail?: string }>({ show: false });

  const handleDelete = async (id: number) => {
    const user = users.find(u => u.id === id);
    if (user) {
      setDeleteConfirmation({ show: true, userId: id, userEmail: user.email });
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirmation.userId) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch(`/api/users/${deleteConfirmation.userId}`, { 
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.status === 401) {
          router.push('/login');
          return;
        }

        if (res.ok) {
          setSuccess('Utilisateur supprimé avec succès !');
          fetchUsers();
        } else {
          const errorData = await res.json();
          setError(errorData.error || 'Erreur lors de la suppression');
        }
      } catch (error) {
        setError('Erreur lors de la suppression');
      }
    }
    setDeleteConfirmation({ show: false });
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ show: false });
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
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Convertir les rôles pour l'API
      const apiRole = editRole === 'admin' ? 'COMPANY_ADMIN' : 'COMPANY_USER';

      const res = await fetch(`/api/users/${editId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          email: editEmail, 
          password: editPassword, 
          role: apiRole 
        }),
      });

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      if (res.ok) {
        setSuccess('Utilisateur modifié avec succès !');
        setEditId(null);
        setEditEmail('');
        setEditPassword('');
        setEditRole('user');
        fetchUsers();
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Erreur lors de la modification de l\'utilisateur');
      }
    } catch (error) {
      setError('Erreur lors de la modification de l\'utilisateur');
    } finally {
      setLoading(false);
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
                      {users.filter(u => u.role === 'COMPANY_ADMIN').length}
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
                      {users.filter(u => u.role === 'COMPANY_USER').length}
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
                              user.role === 'COMPANY_ADMIN' 
                                ? 'text-white' 
                                : 'text-black'
                            }`} style={{
                              backgroundColor: user.role === 'COMPANY_ADMIN' ? '#9933FF' : '#CCFF00'
                            }}>
                              {user.role === 'COMPANY_ADMIN' ? 'ADMIN' : 'UTILISATEUR'}
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

       {/* Popup de confirmation de suppression - Style Drelto */}
       {deleteConfirmation.show && (
         <>
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={cancelDelete}
             className="fixed inset-0 bg-black bg-opacity-50 z-[100] backdrop-blur-sm"
           />
           
           <div className="fixed inset-0 flex items-center justify-center z-[110] p-4">
             <motion.div
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="w-full max-w-md bg-black border rounded-xl p-8 max-h-[90vh] overflow-y-auto"
               style={{ borderColor: 'var(--border-primary)' }}
             >
               <div className="text-center">
                 {/* Icône d'avertissement */}
                 <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                   <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                   </svg>
                 </div>

                 {/* Titre */}
                 <h3 className="text-2xl font-karla-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                   Confirmer la suppression
                 </h3>

                 {/* Message */}
                 <div className="mb-8">
                   <p className="text-lg font-karla-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                     Êtes-vous sûr de vouloir supprimer cet utilisateur ?
                   </p>
                   <p className="text-sm font-karla-semibold px-4 py-2 rounded-lg" style={{ 
                     background: 'rgba(239, 68, 68, 0.1)',
                     color: '#ef4444',
                     border: '1px solid rgba(239, 68, 68, 0.3)'
                   }}>
                     {deleteConfirmation.userEmail}
                   </p>
                   <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>
                     Cette action est irréversible et supprimera définitivement l&apos;utilisateur du système.
                   </p>
                 </div>

                 {/* Boutons d'action */}
                 <div className="flex gap-4">
                   <motion.button
                     onClick={cancelDelete}
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     className="flex-1 px-6 py-3 rounded-xl font-karla-bold transition-all duration-300 border"
                     style={{ 
                       borderColor: 'var(--border-primary)',
                       color: 'var(--text-primary)',
                       background: 'var(--bg-secondary)'
                     }}
                   >
                     Annuler
                   </motion.button>
                   
                   <motion.button
                     onClick={confirmDelete}
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     className="flex-1 px-6 py-3 rounded-xl font-karla-bold transition-all duration-300"
                     style={{ 
                       background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                       color: 'white'
                     }}
                   >
                     Supprimer
                   </motion.button>
                 </div>
               </div>
             </motion.div>
           </div>
         </>
       )}
     </div>
   );
} 