'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

function SubscriptionSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [subscriptionData, setSubscriptionData] = useState<{
    companyName: string;
    plan: string;
    billingCycle: string;
    email: string;
    managementAdmin: {
      email: string;
      name: string;
    } | null;
    credentialsGenerated: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // Essayer d'abord Stripe, puis PayPal
      fetch(`/api/subscriptions/session?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            // Si Stripe échoue, essayer PayPal
            return fetch(`/api/subscriptions/paypal-session?subscription_id=${sessionId}`)
              .then(res => res.json());
          }
          return data;
        })
        .then(data => {
          setSubscriptionData(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Erreur:', error);
          setLoading(false);
        });
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="bg-black text-white font-karla min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center border-2 border-[#CCFF00] animate-spin">
            <div className="w-8 h-8 rounded-full border-2 border-transparent border-t-[#CCFF00]"></div>
          </div>
          <p className="text-gray-300">Vérification de votre souscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white font-karla min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-effect border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 animate-fade-in">
              <Link href="/" className="text-xl font-karla-bold" style={{ color: '#CCFF00' }}>
                Drelto
              </Link>
            </div>
            
            <div className="animate-fade-in flex items-center space-x-4">
              <Link href="/login" className="px-6 py-2 text-black font-karla-bold rounded-lg hover-scale transition-all duration-300" style={{ background: '#CCFF00' }}>
                CONNEXION
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Success Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: '#CCFF00' }}>
              <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-karla-bold mb-6" style={{ color: '#CCFF00' }}>
              Souscription réussie !
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Félicitations ! Votre entreprise a été créée avec succès et votre abonnement est maintenant actif.
            </p>

            {subscriptionData && (
              <div className="glass-effect rounded-2xl p-8 border border-gray-800 max-w-2xl mx-auto mb-8">
                <h2 className="text-2xl font-karla-bold mb-6" style={{ color: '#CCFF00' }}>
                  Détails de votre abonnement
                </h2>
                
                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-300">Entreprise</span>
                    <span className="text-white font-karla-medium">{subscriptionData.companyName}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-300">Plan</span>
                    <span className="text-white font-karla-medium capitalize">{subscriptionData.plan}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-300">Facturation</span>
                    <span className="text-white font-karla-medium capitalize">{subscriptionData.billingCycle}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300">Email de connexion</span>
                    <span className="text-white font-karla-medium">{subscriptionData.email}</span>
                  </div>
                </div>
              </div>
            )}

            {subscriptionData?.credentialsGenerated && subscriptionData?.managementAdmin ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-[#CCFF00]/20 to-[#9933FF]/20 rounded-2xl p-6 border border-[#CCFF00]/30">
                  <h3 className="text-2xl font-karla-bold mb-4" style={{ color: '#CCFF00' }}>
                    🎉 Merci de votre confiance !
                  </h3>
                  <p className="text-lg text-gray-300 mb-4">
                    Votre compte administrateur a été créé avec succès. Voici vos identifiants de connexion :
                  </p>
                  
                  <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 font-karla-medium">Email de connexion :</span>
                        <span className="text-[#CCFF00] font-mono">
                          {subscriptionData.managementAdmin.email}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 font-karla-medium">Mot de passe temporaire :</span>
                        <span className="text-[#CCFF00] font-mono">
                          [Envoyé par email]
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                      <p className="text-yellow-300 text-sm">
                        ⚠️ Votre mot de passe temporaire a été envoyé par email. 
                        Nous vous recommandons de le changer lors de votre première connexion.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/login" 
                    className="px-8 py-4 bg-gradient-to-r from-[#CCFF00] to-[#9933FF] text-black rounded-xl font-karla-bold hover:from-[#9933FF] hover:to-[#CCFF00] transition-all duration-300 shadow-lg"
                  >
                    SE CONNECTER MAINTENANT
                  </Link>
                  
                  <Link 
                    href="/" 
                    className="px-8 py-4 border-2 border-[#CCFF00] text-[#CCFF00] rounded-xl font-karla-bold hover:bg-[#CCFF00] hover:text-black transition-all duration-300"
                  >
                    RETOUR À L&apos;ACCUEIL
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-lg text-gray-300">
                  Vous avez reçu un email avec vos identifiants de connexion.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/login" 
                    className="px-8 py-4 bg-gradient-to-r from-[#CCFF00] to-[#9933FF] text-black rounded-xl font-karla-bold hover:from-[#9933FF] hover:to-[#CCFF00] transition-all duration-300 shadow-lg"
                  >
                    SE CONNECTER MAINTENANT
                  </Link>
                  
                  <Link 
                    href="/" 
                    className="px-8 py-4 border-2 border-[#CCFF00] text-[#CCFF00] rounded-xl font-karla-bold hover:bg-[#CCFF00] hover:text-black transition-all duration-300"
                  >
                    RETOUR À L&apos;ACCUEIL
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

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

export default function SubscriptionSuccess() {
  return (
    <Suspense fallback={
      <div className="bg-black text-white font-karla min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center border-2 border-[#CCFF00] animate-spin">
            <div className="w-8 h-8 rounded-full border-2 border-transparent border-t-[#CCFF00]"></div>
          </div>
          <p className="text-gray-300">Chargement...</p>
        </div>
      </div>
    }>
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
