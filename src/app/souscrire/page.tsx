'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Souscrire() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactEmail: '',
    contactName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    plan: 'starter',
    userCount: 5,
    billingCycle: 'monthly'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: { monthly: 15, yearly: 150 },
      description: 'Parfait pour les petites équipes',
      userLimit: 5,
      support: 'Support email'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: { monthly: 35, yearly: 350 },
      description: 'Idéal pour les équipes moyennes',
      userLimit: 50,
      support: 'Support prioritaire + Chat'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: { monthly: 75, yearly: 750 },
      description: 'Pour les grandes organisations',
      userLimit: 'illimité',
      support: 'Support 24/7 + Téléphone'
    }
  ];

  const [selectedPlan, setSelectedPlan] = useState(plans[0]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlanSelect = (plan: typeof plans[0]) => {
    setSelectedPlan(plan);
    setFormData(prev => ({
      ...prev,
      plan: plan.id,
      userCount: typeof plan.userLimit === 'number' ? plan.userLimit : 999
    }));
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulation d'envoi de données
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitMessage('Votre demande de souscription a été envoyée avec succès ! Vous recevrez vos identifiants de connexion par email dans les 24h.');
    } catch (error) {
      setSubmitMessage('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSubmitMessage('');
  };

  return (
    <div className="bg-black text-white font-karla min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-effect border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 animate-fade-in">
              <a href="/" className="text-xl font-karla-bold" style={{ color: '#CCFF00' }}>
                Drelto
              </a>
            </div>
            
            <div className="animate-fade-in flex items-center space-x-4">
              <a href="/souscrire" className="px-6 py-2 border-2 font-karla-bold rounded-lg hover-scale transition-all duration-300" style={{ borderColor: '#9933FF', color: '#9933FF' }}>
                SOUSCRIRE
              </a>
              <a href="/login" className="px-6 py-2 text-black font-karla-bold rounded-lg hover-scale transition-all duration-300" style={{ background: '#CCFF00' }}>
                CONNEXION
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-6xl font-karla-bold mb-6" style={{ color: '#CCFF00' }}>
              Souscrire à Drelto
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choisissez le plan qui correspond à vos besoins et commencez à utiliser notre plateforme de gestion d'infrastructure
            </p>
          </motion.div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-karla-bold mb-6" style={{ color: 'white' }}>
              Choisissez votre plan
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Des tarifs transparents et flexibles pour tous les besoins
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="glass-effect rounded-2xl p-8 border border-gray-700 hover:border-[#CCFF00] transition-all duration-300 hover-scale cursor-pointer"
                onClick={() => handlePlanSelect(plan)}
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-karla-bold mb-2" style={{ color: '#CCFF00' }}>
                    {plan.name}
                  </h3>
                  <p className="text-gray-400 mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-karla-bold" style={{ color: '#CCFF00' }}>
                      {formData.billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly}€
                    </span>
                    <span className="text-gray-400 ml-2">
                      /{formData.billingCycle === 'monthly' ? 'mois' : 'an'}
                    </span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-sm text-gray-300">
                    <span className="w-2 h-2 rounded-full mr-3" style={{ background: '#CCFF00' }}></span>
                    {plan.userLimit === 'illimité' ? 'Utilisateurs illimités' : `Jusqu'à ${plan.userLimit} utilisateurs`}
                  </li>
                  <li className="flex items-center text-sm text-gray-300">
                    <span className="w-2 h-2 rounded-full mr-3" style={{ background: '#CCFF00' }}></span>
                    Dashboard complet
                  </li>
                  <li className="flex items-center text-sm text-gray-300">
                    <span className="w-2 h-2 rounded-full mr-3" style={{ background: '#CCFF00' }}></span>
                    Services prédéfinis
                  </li>
                  <li className="flex items-center text-sm text-gray-300">
                    <span className="w-2 h-2 rounded-full mr-3" style={{ background: '#CCFF00' }}></span>
                    {plan.support}
                  </li>
                </ul>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-[#CCFF00] to-[#9933FF] text-black rounded-xl font-karla-bold hover:from-[#9933FF] hover:to-[#CCFF00] transition-all duration-300"
                >
                  CHOISIR CE PLAN
                </motion.button>
              </motion.div>
            ))}
          </div>

          {/* Billing Cycle Toggle */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setFormData(prev => ({ ...prev, billingCycle: 'monthly' }))}
                className={`px-6 py-2 rounded-md font-karla-medium transition-all duration-300 ${
                  formData.billingCycle === 'monthly'
                    ? 'bg-[#CCFF00] text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setFormData(prev => ({ ...prev, billingCycle: 'yearly' }))}
                className={`px-6 py-2 rounded-md font-karla-medium transition-all duration-300 ${
                  formData.billingCycle === 'yearly'
                    ? 'bg-[#CCFF00] text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Annuel (-17%)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de souscription */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-900 rounded-2xl p-8 border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-karla-bold" style={{ color: '#CCFF00' }}>
                Souscription - {selectedPlan.name}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {submitMessage ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: '#CCFF00' }}>
                  <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg text-gray-300 mb-4">{submitMessage}</p>
                <a 
                  href="/login" 
                  className="inline-block px-8 py-3 bg-[#CCFF00] text-black font-karla-bold rounded-lg hover-scale transition-all duration-300"
                >
                  SE CONNECTER
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Récapitulatif du plan */}
                <div className="bg-gray-800 rounded-xl p-6 mb-6">
                  <h3 className="text-xl font-karla-bold mb-4" style={{ color: '#CCFF00' }}>
                    Récapitulatif de votre commande
                  </h3>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-karla-medium text-white">
                      Plan {selectedPlan.name} - {formData.billingCycle === 'monthly' ? 'Mensuel' : 'Annuel'}
                    </span>
                    <span className="text-xl font-karla-bold" style={{ color: '#CCFF00' }}>
                      {formData.billingCycle === 'monthly' ? selectedPlan.price.monthly : selectedPlan.price.yearly}€
                      /{formData.billingCycle === 'monthly' ? 'mois' : 'an'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>Utilisateurs inclus</span>
                    <span>{selectedPlan.userLimit === 'illimité' ? 'Utilisateurs illimités' : `Jusqu'à ${selectedPlan.userLimit} utilisateurs`}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>Support</span>
                    <span>{selectedPlan.support}</span>
                  </div>
                </div>

                {/* Formulaire */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-karla-semibold text-white mb-3">
                      NOM DE L'ENTREPRISE *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-white focus:border-[#CCFF00] focus:ring-2 focus:ring-[#CCFF00]/20 outline-none transition-all font-karla-regular"
                      placeholder="Nom de votre entreprise"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-karla-semibold text-white mb-3">
                      EMAIL DE CONTACT *
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-white focus:border-[#CCFF00] focus:ring-2 focus:ring-[#CCFF00]/20 outline-none transition-all font-karla-regular"
                      placeholder="contact@entreprise.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-karla-semibold text-white mb-3">
                      NOM DU CONTACT *
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-white focus:border-[#CCFF00] focus:ring-2 focus:ring-[#CCFF00]/20 outline-none transition-all font-karla-regular"
                      placeholder="Prénom Nom"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-karla-semibold text-white mb-3">
                      TÉLÉPHONE
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-white focus:border-[#CCFF00] focus:ring-2 focus:ring-[#CCFF00]/20 outline-none transition-all font-karla-regular"
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-karla-semibold text-white mb-3">
                      ADRESSE *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-white focus:border-[#CCFF00] focus:ring-2 focus:ring-[#CCFF00]/20 outline-none transition-all font-karla-regular"
                      placeholder="123 Rue de la Paix"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-karla-semibold text-white mb-3">
                      VILLE *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-white focus:border-[#CCFF00] focus:ring-2 focus:ring-[#CCFF00]/20 outline-none transition-all font-karla-regular"
                      placeholder="Paris"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-karla-semibold text-white mb-3">
                      CODE POSTAL *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-white focus:border-[#CCFF00] focus:ring-2 focus:ring-[#CCFF00]/20 outline-none transition-all font-karla-regular"
                      placeholder="75001"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-karla-semibold text-white mb-3">
                      PAYS *
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-white focus:border-[#CCFF00] focus:ring-2 focus:ring-[#CCFF00]/20 outline-none transition-all font-karla-regular"
                      required
                    >
                      <option value="">Sélectionner un pays</option>
                      <option value="FR">France</option>
                      <option value="BE">Belgique</option>
                      <option value="CH">Suisse</option>
                      <option value="CA">Canada</option>
                      <option value="US">États-Unis</option>
                      <option value="GB">Royaume-Uni</option>
                      <option value="DE">Allemagne</option>
                      <option value="ES">Espagne</option>
                      <option value="IT">Italie</option>
                      <option value="NL">Pays-Bas</option>
                    </select>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-[#CCFF00] to-[#9933FF] text-black rounded-xl font-karla-bold hover:from-[#9933FF] hover:to-[#CCFF00] transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'TRAITEMENT EN COURS...' : 'SOUSCRIRE MAINTENANT'}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900/50 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <span className="text-2xl font-karla-bold" style={{ color: '#CCFF00' }}>
              Drelto
            </span>
          </div>
          <p className="text-gray-400 mb-6">
            Plateforme moderne de gestion d'infrastructure développée avec les dernières technologies
          </p>
          <div className="flex justify-center space-x-6 mb-4">
            <a href="/mentions-legales" className="text-gray-400 hover:text-[#CCFF00] transition-colors">
              Mentions Légales
            </a>
            <a href="/politique-confidentialite" className="text-gray-400 hover:text-[#CCFF00] transition-colors">
              Politique de Confidentialité
            </a>
            <a href="/cgu" className="text-gray-400 hover:text-[#CCFF00] transition-colors">
              CGU
            </a>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800">
            <p className="text-sm text-gray-500">
              © 2025 Drelto.
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .glass-effect {
          background: rgba(17, 17, 17, 0.5);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .hover-scale {
          transition: transform 0.3s ease;
        }
        
        .hover-scale:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}
