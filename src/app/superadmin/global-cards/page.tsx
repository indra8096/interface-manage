'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface GlobalCard {
  id: number;
  title: string;
  description?: string;
  category: string;
  content: any;
  isActive: boolean;
  createdAt: string;
}

export default function GlobalCardsPage() {
  const [cards, setCards] = useState<GlobalCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'service',
    content: {}
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchCards(token);
  }, [router]);

  const fetchCards = async (token: string) => {
    try {
      const response = await fetch('/api/superadmin/global_cards', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Erreur lors de la récupération des cartes');
      }

      const data = await response.json();
      setCards(data.globalCards);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/superadmin/global_cards', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la carte');
      }

      // Réinitialiser le formulaire et recharger les cartes
      setFormData({
        title: '',
        description: '',
        category: 'service',
        content: {}
      });
      setShowForm(false);
      fetchCards(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  const handleDelete = async (cardId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/superadmin/global_cards/${cardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      fetchCards(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-karla">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CCFF00] mx-auto"></div>
          <p className="mt-4 text-white">Chargement...</p>
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
              <span className="text-sm text-gray-400">Cartes Globales</span>
            </div>
            
            <div className="flex space-x-4">
              <button 
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 bg-[#CCFF00] text-black font-bold rounded-lg hover:bg-[#B3E600] transition-all duration-300"
              >
                {showForm ? 'Annuler' : 'Nouvelle Carte'}
              </button>
              <Link 
                href="/superadmin"
                className="px-4 py-2 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 border border-white/30"
              >
                Retour Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: '#CCFF00' }}>
              Cartes Globales
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Créer et gérer les cartes partagées entre toutes les entreprises
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-black/50 backdrop-blur-md rounded-xl p-6 border border-gray-800 hover:border-[#CCFF00] transition-all duration-300">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2" style={{ color: '#CCFF00' }}>
                  {cards.length}
                </div>
                <div className="text-gray-400 font-medium">Cartes Total</div>
              </div>
            </div>
            
            <div className="bg-black/50 backdrop-blur-md rounded-xl p-6 border border-gray-800 hover:border-[#9933FF] transition-all duration-300">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2" style={{ color: '#9933FF' }}>
                  {cards.filter(card => card.isActive).length}
                </div>
                <div className="text-gray-400 font-medium">Cartes Actives</div>
              </div>
            </div>
            
            <div className="bg-black/50 backdrop-blur-md rounded-xl p-6 border border-gray-800 hover:border-[#CCFF00] transition-all duration-300">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2" style={{ color: '#CCFF00' }}>
                  {cards.filter(card => !card.isActive).length}
                </div>
                <div className="text-gray-400 font-medium">Cartes Inactives</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="bg-red-900/50 border border-red-500 rounded-xl p-4">
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Formulaire de création */}
      {showForm && (
        <section className="px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-black/50 backdrop-blur-md rounded-xl p-8 border border-gray-800">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#9933FF' }}>
                Nouvelle Carte Globale
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Titre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                    placeholder="Titre de la carte"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                    placeholder="Description de la carte"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Catégorie *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#CCFF00] focus:border-[#CCFF00] transition-all duration-300"
                  >
                    <option value="service">Service</option>
                    <option value="suivi">Suivi</option>
                    <option value="dashboard">Dashboard</option>
                  </select>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-[#CCFF00] text-black font-bold rounded-lg hover:bg-[#B3E600] transition-all duration-300"
                  >
                    Créer la Carte
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
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

      {/* Liste des cartes */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#9933FF' }}>
              Cartes Globales
            </h2>
            <p className="text-gray-400">Cartes partagées entre toutes les entreprises</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map((card) => (
              <div 
                key={card.id} 
                className="group bg-black/50 backdrop-blur-md rounded-xl p-6 border border-gray-800 hover:border-[#CCFF00] transition-all duration-300 hover:scale-105"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-[#CCFF00] transition-colors duration-300">
                    {card.title}
                  </h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    card.isActive 
                      ? 'bg-[#CCFF00]/20 text-[#CCFF00] border border-[#CCFF00]/30' 
                      : 'bg-red-900/20 text-red-400 border border-red-500/30'
                  }`}>
                    {card.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                {card.description && (
                  <p className="text-gray-400 mb-4 text-sm leading-relaxed">{card.description}</p>
                )}
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                  <span className="text-sm text-gray-500 capitalize font-medium">{card.category}</span>
                  <button
                    onClick={() => handleDelete(card.id)}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-all duration-300"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>

          {cards.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-black/50 backdrop-blur-md rounded-xl p-12 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-2">Aucune carte globale</h3>
                <p className="text-gray-400">Créez votre première carte globale pour commencer</p>
              </div>
            </div>
          )}
        </div>
      </section>

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