'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

interface Company {
  id: number;
  name: string;
  createdAt: string;
  _count: {
    users: number;
    tasks: number;
  };
  admin?: {
    email: string;
    role: string;
  };
}

export default function SuperAdminDashboard() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateCompanyForm, setShowCreateCompanyForm] = useState(false);
  const [createCompanyData, setCreateCompanyData] = useState({
    name: '',
    adminEmail: '',
    adminPassword: '',
    adminItRole: 'IT_ADMIN',
    adminName: ''
  });
  const [creatingCompany, setCreatingCompany] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // États pour la suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [deletingCompany, setDeletingCompany] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      
      console.log('🔍 SuperAdmin Dashboard - Vérification:', { 
        hasToken: !!token, 
        role: role,
        tokenLength: token?.length 
      });
      
      if (!token) {
        console.log('❌ Pas de token, redirection vers login');
        router.push('/login');
        return;
      }
      
      if (role !== 'SUPER_ADMIN') {
        console.log('❌ Rôle incorrect:', role, 'redirection vers dashboard');
        router.push('/dashboard');
        return;
      }
      
      console.log('✅ Vérifications OK, chargement des entreprises');
      fetchCompanies(token);
    }
  }, [router]);

  const fetchCompanies = async (token: string) => {
    try {
      console.log('🔍 Fetching companies with token:', token.substring(0, 20) + '...');
      
      const response = await fetch('/api/superadmin/companies', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 API Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('❌ API Error:', errorData);
        
        if (response.status === 401) {
          console.log('❌ 401 Unauthorized, redirection vers login');
          router.push('/login');
          return;
        }
        throw new Error(errorData.error || 'Erreur lors de la récupération des entreprises');
      }

      const data = await response.json();
      console.log('✅ Companies data received:', data);
      console.log('🔍 Companies with admin info:', data.companies.map((c: Company) => ({
        name: c.name,
        admin: c.admin,
        users: c._count.users
      })));
      setCompanies(data.companies);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingCompany(true);
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/superadmin/companies', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createCompanyData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création de la société');
      }

      setSuccessMessage('Société créée avec succès !');
      setShowCreateCompanyForm(false);
      setCreateCompanyData({ name: '', adminEmail: '', adminPassword: '', adminItRole: 'IT_ADMIN', adminName: '' });
      
      // Recharger les entreprises
      fetchCompanies(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setCreatingCompany(false);
    }
  };

  // Fonction pour ouvrir le modal de suppression
  const handleDeleteClick = (company: Company, e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher le clic sur la carte
    setCompanyToDelete(company);
    setDeletePassword('');
    setDeleteError('');
    setShowDeleteModal(true);
  };

  // Fonction pour supprimer la société
  const handleDeleteCompany = async () => {
    if (!companyToDelete || !deletePassword.trim()) {
      setDeleteError('Veuillez entrer votre mot de passe');
      return;
    }

    setDeletingCompany(true);
    setDeleteError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Vérifier le mot de passe du super admin
      const passwordCheckResponse = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: deletePassword })
      });

      if (!passwordCheckResponse.ok) {
        setDeleteError('Mot de passe incorrect');
        return;
      }

      // Supprimer la société
      const deleteResponse = await fetch(`/api/superadmin/companies/${companyToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      setSuccessMessage(`Société "${companyToDelete.name}" supprimée avec succès !`);
      setShowDeleteModal(false);
      setCompanyToDelete(null);
      setDeletePassword('');
      
      // Recharger les entreprises
      fetchCompanies(token);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setDeletingCompany(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-karla flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4" style={{ color: '#CCFF00' }}>
            Chargement...
          </div>
          <div className="text-gray-400">Récupération des entreprises</div>
        </div>
      </div>
    );
  }

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
                onClick={() => setShowCreateCompanyForm(!showCreateCompanyForm)}
                className="px-4 py-2 bg-[#CCFF00] text-black font-semibold rounded-lg hover:bg-[#B3E600] transition-all duration-300"
              >
                {showCreateCompanyForm ? 'Annuler' : 'Nouvelle Société'}
              </button>
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('role');
                  localStorage.removeItem('companyId');
                  localStorage.removeItem('userCompanyId');
                  localStorage.removeItem('companyName');
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
              Dashboard Global
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Gestion centralisée de toutes les entreprises utilisant la plateforme Drelto
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-black/50 backdrop-blur-md rounded-xl p-6 border border-gray-800 hover:border-[#CCFF00] transition-all duration-300">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2" style={{ color: '#CCFF00' }}>
                  {companies.length}
                </div>
                <div className="text-gray-400 font-medium">Entreprises</div>
              </div>
            </div>
            
            <div className="bg-black/50 backdrop-blur-md rounded-xl p-6 border border-gray-800 hover:border-[#9933FF] transition-all duration-300">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2" style={{ color: '#9933FF' }}>
                  {companies.reduce((total, company) => total + company._count.users, 0)}
                </div>
                <div className="text-gray-400 font-medium">Utilisateurs Total</div>
              </div>
            </div>
            
            <div className="bg-black/50 backdrop-blur-md rounded-xl p-6 border border-gray-800 hover:border-[#CCFF00] transition-all duration-300">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2" style={{ color: '#CCFF00' }}>
                  {companies.reduce((total, company) => total + company._count.tasks, 0)}
                </div>
                <div className="text-gray-400 font-medium">Tâches Total</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Companies Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-3xl font-bold mb-2" style={{ color: '#9933FF' }}>
                  Entreprises
                </h2>
                <p className="text-gray-400">Sélectionnez une entreprise pour accéder à son dashboard spécifique</p>
              </div>
              
              <div className="flex gap-4">
                <Link href="/superadmin/panel-templates">
                  <button className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all duration-300">
                    Templates Panel de Suivi
                  </button>
                </Link>
                <Link href="/superadmin/service-templates">
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all duration-300">
                    Templates Services Prédéfinis
                  </button>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {companies.map((company) => (
              <div
                key={company.id}
                className="bg-black/50 backdrop-blur-md rounded-xl p-6 border border-gray-800 hover:border-[#CCFF00] transition-all duration-300 cursor-pointer group relative"
                onClick={() => window.location.href = `/superadmin/companies/${company.id}/dashboard`}
              >
                {/* Bouton de suppression en bas à droite */}
                <button
                  onClick={(e) => handleDeleteClick(company, e)}
                  className="absolute bottom-4 right-4 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
                  title="Supprimer cette société"
                >
                  <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                </button>

                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-[#CCFF00] transition-colors">
                    {company.name}
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Administrateur:</span>
                    <span className="text-white font-semibold text-sm">
                      {company.admin ? company.admin.email : 'Non assigné'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Utilisateurs:</span>
                    <span className="text-white font-semibold">{company._count.users}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Tâches:</span>
                    <span className="text-white font-semibold">{company._count.tasks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Créée le:</span>
                    <span className="text-white text-sm">
                      {new Date(company.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="text-[#CCFF00] text-sm font-medium">
                    Cliquer pour accéder →
                  </div>
                </div>
              </div>
            ))}
          </div>

          {companies.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-black/50 backdrop-blur-md rounded-xl p-12 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-2">Aucune entreprise</h3>
                <p className="text-gray-400">Créez votre première entreprise pour commencer</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Formulaire de création de société */}
      {showCreateCompanyForm && (
        <section className="px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-black/50 backdrop-blur-md rounded-xl p-8 border border-gray-800">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold" style={{ color: '#9933FF' }}>
                  Créer une nouvelle société
                </h2>
                <button
                  onClick={() => setShowCreateCompanyForm(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateCompany} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Nom de la société *
                    </label>
                    <input
                      type="text"
                      required
                      value={createCompanyData.name}
                      onChange={(e) => setCreateCompanyData({ ...createCompanyData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                      placeholder="Nom de la société"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Email de l&apos;administrateur *
                    </label>
                    <input
                      type="email"
                      required
                      value={createCompanyData.adminEmail}
                      onChange={(e) => setCreateCompanyData({ ...createCompanyData, adminEmail: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                      placeholder="admin@societe.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Nom de l&apos;administrateur
                    </label>
                    <input
                      type="text"
                      value={createCompanyData.adminName}
                      onChange={(e) => setCreateCompanyData({ ...createCompanyData, adminName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                      placeholder="Jean Dupont"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Rôle IT de l&apos;administrateur *
                    </label>
                    <select
                      value={createCompanyData.adminItRole}
                      onChange={(e) => setCreateCompanyData({ ...createCompanyData, adminItRole: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                    >
                      <option value="IT_INTERN">Stagiaire IT</option>
                      <option value="IT_SUPPORT">Technicien support IT</option>
                      <option value="IT_ENGINEER">Ingénieur système / réseau</option>
                      <option value="IT_ADMIN">Administrateur IT</option>
                      <option value="IT_MANAGER">Chef IT</option>
                      <option value="IT_DIRECTOR">Responsable IT</option>
                      <option value="CIO">Directeur des systèmes d&apos;information</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Mot de passe de l&apos;administrateur *
                  </label>
                  <input
                    type="password"
                    required
                    value={createCompanyData.adminPassword}
                    onChange={(e) => setCreateCompanyData({ ...createCompanyData, adminPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                    placeholder="Mot de passe sécurisé"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={creatingCompany}
                    className="px-6 py-3 bg-[#CCFF00] text-black font-bold rounded-lg hover:bg-[#B3E600] transition-all duration-300 disabled:opacity-50"
                  >
                    {creatingCompany ? 'Création...' : 'Créer la société'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateCompanyForm(false)}
                    className="px-6 py-3 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 border border-white/30"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* Modal de confirmation de suppression */}
      <AnimatePresence>
        {showDeleteModal && companyToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-black/90 backdrop-blur-md rounded-2xl p-8 border border-gray-800 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Supprimer la société
                </h2>
                <p className="text-gray-400">
                  Êtes-vous sûr de vouloir supprimer <span className="text-red-400 font-bold">{companyToDelete.name}</span> ?
                </p>
                <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-300 text-sm">
                    Cette action supprimera définitivement :
                  </p>
                  <ul className="text-red-300 text-sm mt-2 space-y-1">
                    <li>• Tous les utilisateurs de cette société</li>
                    <li>• Toutes les tâches associées</li>
                    <li>• Toutes les cartes de suivi</li>
                    <li>• Toutes les données de la société</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Mot de passe Super Admin *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 pr-12"
                      placeholder="Entrez votre mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {deleteError && (
                  <div className="bg-red-900/50 border border-red-500 rounded-lg p-3">
                    <p className="text-red-300 text-sm">{deleteError}</p>
                  </div>
                )}

                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={handleDeleteCompany}
                    disabled={deletingCompany || !deletePassword.trim()}
                    className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingCompany ? 'Suppression...' : 'Supprimer définitivement'}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setCompanyToDelete(null);
                      setDeletePassword('');
                      setDeleteError('');
                    }}
                    className="px-6 py-3 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 border border-white/30"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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