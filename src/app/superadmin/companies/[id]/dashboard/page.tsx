'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

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
            <div className="flex items-center space-x-4">
              <Link href="/superadmin">
                <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                  <span>← Retour</span>
                </button>
              </Link>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold" style={{ color: '#CCFF00' }}>
                  drelto
                </span>
                <span className="text-sm text-gray-400">Super Admin</span>
              </div>
            </div>
            
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
                        <span className="px-3 py-1 bg-[#CCFF00]/20 text-[#CCFF00] rounded-full text-sm font-medium">
                          COMPANY_ADMIN
                        </span>
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
                        <span className="px-3 py-1 bg-[#9933FF]/20 text-[#9933FF] rounded-full text-sm font-medium">
                          COMPANY_USER
                        </span>
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
