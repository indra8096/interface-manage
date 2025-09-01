'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

interface User {
  id: number;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface Company {
  id: number;
  name: string;
  createdAt: string;
  users: User[];
  _count: {
    users: number;
    tasks: number;
  };
}

export default function CompanyDashboardPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // États pour la gestion des utilisateurs
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [showEditUserForm, setShowEditUserForm] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [createUserData, setCreateUserData] = useState({
    email: '',
    password: '',
    role: 'COMPANY_USER',
    itRole: 'IT_INTERN',
    name: ''
  });
  const [editUserData, setEditUserData] = useState({
    email: '',
    role: 'COMPANY_USER',
    itRole: 'IT_INTERN',
    name: ''
  });
  
  // États de chargement
  const [creatingUser, setCreatingUser] = useState(false);
  const [updatingUser, setUpdatingUser] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const companyId = params.id;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      
      if (!token) {
        router.push('/login');
        return;
      }
      
      if (role !== 'SUPER_ADMIN') {
        router.push('/dashboard');
        return;
      }
      
      if (companyId) {
        fetchCompanyDetails(token, companyId);
      }
    }
  }, [router, companyId]);

  const fetchCompanyDetails = async (token: string, id: string | string[]) => {
    try {
      const companyIdStr = Array.isArray(id) ? id[0] : id;
      const response = await fetch(`/api/superadmin/companies/${companyIdStr}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Erreur lors de la récupération des détails de l\'entreprise');
      }

      const data = await response.json();
      setCompany(data.company);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour créer un utilisateur
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const companyIdStr = Array.isArray(companyId) ? companyId[0] : companyId;
      const response = await fetch(`/api/superadmin/companies/${companyIdStr}/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createUserData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création de l\'utilisateur');
      }

      setSuccessMessage('Utilisateur créé avec succès !');
      setShowCreateUserForm(false);
      setCreateUserData({ email: '', password: '', role: 'COMPANY_USER' });
      
      // Recharger les détails de l'entreprise
      if (companyId) {
        fetchCompanyDetails(token, companyId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setCreatingUser(false);
    }
  };

  // Fonction pour modifier un utilisateur
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setUpdatingUser(true);
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const companyIdStr = Array.isArray(companyId) ? companyId[0] : companyId;
      const response = await fetch(`/api/superadmin/companies/${companyIdStr}/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editUserData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la modification de l\'utilisateur');
      }

      setSuccessMessage('Utilisateur modifié avec succès !');
      setShowEditUserForm(false);
      setSelectedUser(null);
      setEditUserData({ email: '', role: 'COMPANY_USER', itRole: 'IT_INTERN', name: '' });
      
      // Recharger les détails de l'entreprise
      if (companyId) {
        fetchCompanyDetails(token, companyId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setUpdatingUser(false);
    }
  };

  // Fonction pour supprimer un utilisateur
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setDeletingUser(true);
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const companyIdStr = Array.isArray(companyId) ? companyId[0] : companyId;
      const response = await fetch(`/api/superadmin/companies/${companyIdStr}/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression de l\'utilisateur');
      }

      setSuccessMessage('Utilisateur supprimé avec succès !');
      setShowDeleteUserModal(false);
      setSelectedUser(null);
      
      // Recharger les détails de l'entreprise
      if (companyId) {
        fetchCompanyDetails(token, companyId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setDeletingUser(false);
    }
  };

  // Fonction pour ouvrir le formulaire de modification
  const openEditForm = (user: User) => {
    setSelectedUser(user);
    setEditUserData({
      email: user.email,
      role: user.role,
      itRole: (user as any).itRole || 'IT_INTERN',
      name: (user as any).name || ''
    });
    setShowEditUserForm(true);
  };

  // Fonction pour ouvrir le modal de suppression
  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteUserModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-karla flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4" style={{ color: '#CCFF00' }}>
            Chargement...
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-black text-white font-karla flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4 text-red-400">
            Entreprise non trouvée
          </div>
          <Link href="/superadmin">
            <button className="px-6 py-3 bg-[#CCFF00] text-black font-bold rounded-lg hover:bg-[#B3E600] transition-all duration-300">
              Retour au dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const admins = company.users.filter(user => user.role === 'COMPANY_ADMIN');
  const employees = company.users.filter(user => user.role === 'COMPANY_USER');

  return (
    <div className="min-h-screen bg-black text-white font-karla">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
                         <div className="flex items-center space-x-2">
               <span className="text-xl font-bold" style={{ color: '#CCFF00' }}>
                 drelto
               </span>
               <span className="text-sm text-gray-400">Super Admin</span>
             </div>
             
             <div className="flex space-x-4">
               <button 
                 onClick={() => router.push('/superadmin')}
                 className="px-4 py-2 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 border border-white/30"
               >
                 Retour Dashboard
               </button>
               <button 
                 onClick={() => setShowCreateUserForm(true)}
                 className="px-4 py-2 bg-[#CCFF00] text-black font-semibold rounded-lg hover:bg-[#B3E600] transition-all duration-300"
               >
                 Nouvel Utilisateur
               </button>
               <button 
                 onClick={() => {
                   localStorage.removeItem('token');
                   localStorage.removeItem('role');
                   router.push('/login');
                 }}
                 className="px-4 py-2 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 border border-white/30"
               >
                 Déconnexion
               </button>
             </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: '#CCFF00' }}>
              {company.name}
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Gestion des utilisateurs et administrateurs de cette entreprise
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-black/50 backdrop-blur-md rounded-xl p-6 border border-gray-800 hover:border-[#CCFF00] transition-all duration-300">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2" style={{ color: '#CCFF00' }}>
                  {company._count.users}
                </div>
                <div className="text-gray-400 font-medium">Utilisateurs Total</div>
              </div>
            </div>
            
            <div className="bg-black/50 backdrop-blur-md rounded-xl p-6 border border-gray-800 hover:border-[#9933FF] transition-all duration-300">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2" style={{ color: '#9933FF' }}>
                  {admins.length}
                </div>
                <div className="text-gray-400 font-medium">Administrateurs</div>
              </div>
            </div>
            
            <div className="bg-black/50 backdrop-blur-md rounded-xl p-6 border border-gray-800 hover:border-[#CCFF00] transition-all duration-300">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2" style={{ color: '#CCFF00' }}>
                  {company._count.tasks}
                </div>
                <div className="text-gray-400 font-medium">Tâches Total</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Users Lists */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Administrateurs */}
            <div className="bg-black/50 backdrop-blur-md rounded-xl p-6 border border-gray-800">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#CCFF00' }}>
                Administrateurs ({admins.length})
              </h2>
              
              {admins.length > 0 ? (
                <div className="space-y-4">
                  {admins.map((admin) => (
                    <div key={admin.id} className="bg-gray-900/30 rounded-lg p-4 border border-gray-700">
                                             <div className="flex items-center justify-between">
                         <div>
                           <h3 className="text-white font-semibold text-lg">
                             {admin.email}
                           </h3>
                           <p className="text-gray-400 text-sm">
                             Créé le {new Date(admin.createdAt).toLocaleDateString('fr-FR')}
                           </p>
                         </div>
                         <div className="flex items-center space-x-2">
                           <span className="px-3 py-1 bg-[#CCFF00]/20 text-[#CCFF00] rounded-full text-sm font-medium">
                             COMPANY_ADMIN
                           </span>
                                                       <button
                              onClick={() => openEditForm(admin)}
                              className="p-2 bg-[#9933FF] text-white rounded-lg hover:bg-[#7B2FCC] transition-all duration-300"
                              title="Modifier"
                            >
                              <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteModal(admin);
                              }}
                              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
                              title="Supprimer"
                            >
                              <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                            </button>
                         </div>
                       </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">👥</div>
                  <p className="text-gray-400">Aucun administrateur</p>
                </div>
              )}
            </div>

            {/* Employés */}
            <div className="bg-black/50 backdrop-blur-md rounded-xl p-6 border border-gray-800">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#9933FF' }}>
                Employés ({employees.length})
              </h2>
              
              {employees.length > 0 ? (
                <div className="space-y-4">
                  {employees.map((employee) => (
                    <div key={employee.id} className="bg-gray-900/30 rounded-lg p-4 border border-gray-700">
                                             <div className="flex items-center justify-between">
                         <div>
                           <h3 className="text-white font-semibold text-lg">
                             {employee.email}
                           </h3>
                           <p className="text-gray-400 text-sm">
                             Créé le {new Date(employee.createdAt).toLocaleDateString('fr-FR')}
                           </p>
                         </div>
                         <div className="flex items-center space-x-2">
                           <span className="px-3 py-1 bg-[#9933FF]/20 text-[#9933FF] rounded-full text-sm font-medium">
                             COMPANY_USER
                           </span>
                                                       <button
                              onClick={() => openEditForm(employee)}
                              className="p-2 bg-[#9933FF] text-white rounded-lg hover:bg-[#7B2FCC] transition-all duration-300"
                              title="Modifier"
                            >
                              <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openDeleteModal(employee);
                              }}
                              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
                              title="Supprimer"
                            >
                              <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                            </button>
                         </div>
                       </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">👤</div>
                  <p className="text-gray-400">Aucun employé</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Messages d'état */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="bg-red-900/50 border border-red-500 rounded-xl p-4">
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="bg-green-900/50 border border-green-500 rounded-xl p-4">
            <p className="text-green-300">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Modal de création d'utilisateur */}
      {showCreateUserForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black/90 backdrop-blur-md rounded-2xl p-8 border border-gray-800 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#CCFF00' }}>
                Créer un nouvel utilisateur
              </h2>
              <button
                onClick={() => setShowCreateUserForm(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={createUserData.email}
                  onChange={(e) => setCreateUserData({ ...createUserData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                  placeholder="email@exemple.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Mot de passe *
                </label>
                <input
                  type="password"
                  required
                  value={createUserData.password}
                  onChange={(e) => setCreateUserData({ ...createUserData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                  placeholder="Mot de passe sécurisé"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Rôle *
                </label>
                <select
                  value={createUserData.role}
                  onChange={(e) => setCreateUserData({ ...createUserData, role: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                >
                  <option value="COMPANY_USER">Employé</option>
                  <option value="COMPANY_ADMIN">Administrateur</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Rôle IT
                </label>
                <select
                  value={createUserData.itRole}
                  onChange={(e) => setCreateUserData({ ...createUserData, itRole: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                >
                  <option value="IT_INTERN">Stagiaire IT</option>
                  <option value="IT_SUPPORT">Technicien support IT</option>
                  <option value="IT_ENGINEER">Ingénieur système / réseau</option>
                  <option value="IT_ADMIN">Administrateur IT</option>
                  <option value="IT_MANAGER">Chef IT</option>
                  <option value="IT_DIRECTOR">Responsable IT</option>
                  <option value="CIO">Directeur des systèmes d’information</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Nom (affiché)
                </label>
                <input
                  type="text"
                  value={createUserData.name}
                  onChange={(e) => setCreateUserData({ ...createUserData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                  placeholder="Nom et prénom"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="flex-1 px-6 py-3 bg-[#CCFF00] text-black font-bold rounded-lg hover:bg-[#B3E600] transition-all duration-300 disabled:opacity-50"
                >
                  {creatingUser ? 'Création...' : 'Créer l\'utilisateur'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateUserForm(false)}
                  className="px-6 py-3 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 border border-white/30"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de modification d'utilisateur */}
      {showEditUserForm && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black/90 backdrop-blur-md rounded-2xl p-8 border border-gray-800 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#9933FF' }}>
                Modifier l'utilisateur
              </h2>
              <button
                onClick={() => setShowEditUserForm(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditUser} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={editUserData.email}
                  onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                  placeholder="email@exemple.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Rôle *
                </label>
                <select
                  value={editUserData.role}
                  onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                >
                  <option value="COMPANY_USER">Employé</option>
                  <option value="COMPANY_ADMIN">Administrateur</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Rôle IT
                </label>
                <select
                  value={editUserData.itRole}
                  onChange={(e) => setEditUserData({ ...editUserData, itRole: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                >
                  <option value="IT_INTERN">Stagiaire IT</option>
                  <option value="IT_SUPPORT">Technicien support IT</option>
                  <option value="IT_ENGINEER">Ingénieur système / réseau</option>
                  <option value="IT_ADMIN">Administrateur IT</option>
                  <option value="IT_MANAGER">Chef IT</option>
                  <option value="IT_DIRECTOR">Responsable IT</option>
                  <option value="CIO">Directeur des systèmes d’information</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Nom (affiché)
                </label>
                <input
                  type="text"
                  value={editUserData.name}
                  onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all durée-300"
                  placeholder="Nom et prénom"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={updatingUser}
                  className="flex-1 px-6 py-3 bg-[#9933FF] text-white font-bold rounded-lg hover:bg-[#7B2FCC] transition-all duration-300 disabled:opacity-50"
                >
                  {updatingUser ? 'Modification...' : 'Modifier l\'utilisateur'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditUserForm(false)}
                  className="px-6 py-3 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 border border-white/30"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {showDeleteUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black/90 backdrop-blur-md rounded-2xl p-8 border border-gray-800 max-w-md w-full">
                         <div className="text-center mb-6">
               <div className="mb-6">
                 <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600/20 rounded-full border-2 border-red-500/30 mb-4">
                   <FontAwesomeIcon icon={faTrash} className="w-10 h-10 text-red-400" />
                 </div>
               </div>
               <h2 className="text-2xl font-bold text-white mb-2">
                 Supprimer l'utilisateur
               </h2>
               <p className="text-gray-400 mb-6">
                 Êtes-vous sûr de vouloir supprimer <span className="text-red-400 font-bold">{selectedUser.email}</span> ?
               </p>
               <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
                 <div className="flex items-center space-x-3">
                   <div className="flex-shrink-0">
                     <FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5 text-red-400" />
                   </div>
                   <p className="text-red-300 text-sm font-medium">
                     Cette action supprimera définitivement cet utilisateur et toutes ses données associées.
                   </p>
                 </div>
               </div>
             </div>

            <div className="flex space-x-4 pt-4">
              <button
                onClick={handleDeleteUser}
                disabled={deletingUser}
                className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all duration-300 disabled:opacity-50"
              >
                {deletingUser ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
              <button
                onClick={() => setShowDeleteUserModal(false)}
                className="px-6 py-3 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 border border-white/30"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-lg font-bold" style={{ color: '#CCFF00' }}>
              drelto
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            Plateforme de gestion d&apos;infrastructure moderne avec contrôle d&apos;accès avancé
          </p>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Karla:wght@300;400;500;600;700&display=swap');
        
        .font-karla {
          font-family: 'Karla', sans-serif;
        }
      `}</style>
    </div>
  );
}
