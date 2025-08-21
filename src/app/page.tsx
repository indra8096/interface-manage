'use client';

export default function Home() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-black text-white font-karla min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-effect border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 animate-fade-in">
              <span className="text-xl font-karla-bold" style={{ color: '#CCFF00' }}>
                Drelto
              </span>
            </div>
            
            <div className="hidden md:flex space-x-8">
              <button onClick={() => scrollToSection('features')} className="text-sm font-karla-medium transition-colors text-gray-300 hover:text-white">Fonctionnalités</button>
              <button onClick={() => scrollToSection('interfaces')} className="text-sm font-karla-medium transition-colors text-gray-300 hover:text-white">Interfaces</button>
              <button onClick={() => scrollToSection('tech')} className="text-sm font-karla-medium transition-colors text-gray-300 hover:text-white">Technologies</button>
              <button onClick={() => scrollToSection('purple-team')} className="text-sm font-karla-medium transition-colors text-gray-300 hover:text-white">Purple Team</button>
            </div>

            <div className="animate-fade-in">
              <a href="/login" className="px-6 py-2 text-black font-karla-bold rounded-lg hover-scale transition-all duration-300" style={{ background: '#CCFF00' }}>
                CONNEXION
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8 animate-slide-up">
            <h1 className="text-5xl md:text-7xl font-karla-bold mb-6" style={{ color: '#CCFF00' }}>
              Drelto
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-karla-medium max-w-3xl mx-auto">
              <span style={{ color: '#9933FF' }}>ClientConnect</span> est une plateforme de gestion d&apos;infrastructure moderne avec contrôle d&apos;accès avancé.
            </p>
          </div>

          <div className="flex justify-center items-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <button onClick={() => scrollToSection('features')} className="px-8 py-4 border-2 font-karla-bold rounded-xl transition-all duration-300 text-lg" style={{ borderColor: '#CCFF00', color: '#CCFF00' }}>
              DÉCOUVRIR
            </button>
          </div>

          <div className="mt-16 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#CCFF00]/20 to-[#9933FF]/20 rounded-2xl blur-3xl"></div>
              <div className="relative glass-effect rounded-2xl p-8 border border-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <h3 className="text-xl font-karla-bold mb-2" style={{ color: '#CCFF00' }}>Performance</h3>
                    <p className="text-gray-400">Interface rapide, détaillée, simple et optimisée.</p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-karla-bold mb-2" style={{ color: '#CCFF00' }}>Sécurité</h3>
                    <p className="text-gray-400">Contrôle d&apos;accès basé sur les rôles</p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-karla-bold mb-2" style={{ color: '#CCFF00' }}>Design</h3>
                    <p className="text-gray-400">Interface moderne et intuitive</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-karla-bold mb-6" style={{ color: '#9933FF' }}>
              Fonctionnalités
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Découvrez les principales fonctionnalités de notre plateforme de gestion d&apos;infrastructure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="glass-effect rounded-xl p-6 border border-gray-700 hover:border-[#CCFF00] transition-all duration-300 hover-scale animate-slide-up">
              <h3 className="text-xl font-karla-bold mb-3" style={{ color: '#CCFF00' }}>Dashboard Interactif</h3>
              <p className="text-gray-400 mb-4">Tableau de bord moderne avec drag & drop pour la gestion des tâches</p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 rounded-full mr-3" style={{ background: '#CCFF00' }}></span>
                  Colonnes Kanban
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 rounded-full mr-3" style={{ background: '#CCFF00' }}></span>
                  Drag & Drop
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 rounded-full mr-3" style={{ background: '#CCFF00' }}></span>
                  Statistiques temps réel
                </li>
              </ul>
            </div>

            <div className="glass-effect rounded-xl p-6 border border-gray-700 hover:border-[#CCFF00] transition-all duration-300 hover-scale animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-xl font-karla-bold mb-3" style={{ color: '#CCFF00' }}>Gestion des Utilisateurs</h3>
              <p className="text-gray-400 mb-4">Administration complète des utilisateurs avec contrôle d&apos;accès</p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 rounded-full mr-3" style={{ background: '#CCFF00' }}></span>
                  Rôles Admin/User
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 rounded-full mr-3" style={{ background: '#CCFF00' }}></span>
                  CRUD Utilisateurs
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 rounded-full mr-3" style={{ background: '#CCFF00' }}></span>
                  Permissions granulaires
                </li>
              </ul>
            </div>

            <div className="glass-effect rounded-xl p-6 border border-gray-700 hover:border-[#CCFF00] transition-all duration-300 hover-scale animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-xl font-karla-bold mb-3" style={{ color: '#CCFF00' }}>Services Prédéfinis</h3>
              <p className="text-gray-400 mb-4">Bibliothèque de services configurables pour l&apos;infrastructure</p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 rounded-full mr-3" style={{ background: '#CCFF00' }}></span>
                  Services Défensifs
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 rounded-full mr-3" style={{ background: '#CCFF00' }}></span>
                  Services Offensifs
                </li>
                <li className="flex items-center text-sm text-gray-300">
                  <span className="w-2 h-2 rounded-full mr-3" style={{ background: '#CCFF00' }}></span>
                  Ajout personnalisé
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Interfaces Section */}
      <section id="interfaces" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-karla-bold mb-6" style={{ color: '#9933FF' }}>
              Interfaces
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Découvrez les différentes interfaces de notre plateforme de gestion d&apos;infrastructure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Carte Interface de Connexion */}
            <div className="glass-effect rounded-xl overflow-hidden border border-gray-700 hover:border-[#CCFF00] transition-all duration-300 hover-scale animate-slide-up">
              <div className="aspect-video bg-gray-800 flex items-center justify-center relative overflow-hidden">
                <img src="/connexion.png" alt="Interface de Connexion" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center p-6">
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-karla-bold mb-2" style={{ color: '#CCFF00' }}>Fonctionnalités</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Design futuriste avec couleurs Drelto</li>
                  <li>• Authentification sécurisée</li>
                  <li>• Interface responsive</li>
                </ul>
              </div>
            </div>

            {/* Carte Dashboard Principal */}
            <div className="glass-effect rounded-xl overflow-hidden border border-gray-700 hover:border-[#CCFF00] transition-all duration-300 hover-scale animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="aspect-video bg-gray-800 flex items-center justify-center relative overflow-hidden">
                <img src="/tableau.png" alt="Dashboard Principal" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center p-6">
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-karla-bold mb-2" style={{ color: '#CCFF00' }}>Fonctionnalités</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Statistiques en temps réel</li>
                  <li>• Services actifs et terminés</li>
                  <li>• Navigation intuitive</li>
                </ul>
              </div>
            </div>

            {/* Carte Gestion des Services */}
            <div className="glass-effect rounded-xl overflow-hidden border border-gray-700 hover:border-[#CCFF00] transition-all duration-300 hover-scale animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="aspect-video bg-gray-800 flex items-center justify-center relative overflow-hidden">
                <img src="/services.png" alt="Gestion des Services" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center p-6">
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-karla-bold mb-2" style={{ color: '#CCFF00' }}>Fonctionnalités</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Colonnes Défensif/Général/Offensif</li>
                  <li>• Drag & Drop interactif</li>
                  <li>• Suivi de progression</li>
                </ul>
              </div>
            </div>

            {/* Carte Services Prédéfinis */}
            <div className="glass-effect rounded-xl overflow-hidden border border-gray-700 hover:border-[#CCFF00] transition-all duration-300 hover-scale animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="aspect-video bg-gray-800 flex items-center justify-center relative overflow-hidden">
                <img src="/predefinis.png" alt="Services Prédéfinis" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center p-6">
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-karla-bold mb-2" style={{ color: '#CCFF00' }}>Fonctionnalités</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Catalogue de services</li>
                  <li>• Recherche et filtrage</li>
                  <li>• Ajout personnalisé (Admin)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section id="tech" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-karla-bold mb-6" style={{ color: '#9933FF' }}>
              Technologies
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Stack technologique moderne et robuste pour une application performante
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group animate-slide-up">
              <h3 className="font-karla-bold text-lg" style={{ color: '#CCFF00' }}>Next.js 15</h3>
            </div>

            <div className="text-center group animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <h3 className="font-karla-bold text-lg" style={{ color: '#CCFF00' }}>TypeScript</h3>
            </div>

            <div className="text-center group animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h3 className="font-karla-bold text-lg" style={{ color: '#CCFF00' }}>Tailwind CSS</h3>
            </div>

            <div className="text-center group animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <h3 className="font-karla-bold text-lg" style={{ color: '#CCFF00' }}>Framer Motion</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Purple Team Section */}
      <section id="purple-team" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-karla-bold mb-6" style={{ color: '#9933FF' }}>
              Purple Team
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Un pont entre attaque et défense pour renforcer la sécurité de manière proactive
            </p>
          </div>

          <div className="glass-effect rounded-2xl p-8 border border-gray-700 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-center mb-8">
              <p className="text-lg text-gray-300 font-karla-medium max-w-4xl mx-auto">
                La Purple Team combine les forces de la Red Team et de la Blue Team pour renforcer la sécurité de manière proactive, 
                en apprenant des tests offensifs et en améliorant les défenses en continu.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-xl border border-gray-700 hover:border-[#CCFF00] transition-all duration-300">
                <h3 className="text-xl font-karla-bold mb-3" style={{ color: '#CCFF00' }}>Collaboration</h3>
                <p className="text-gray-400">Facilite la collaboration entre Red et Blue Teams pour une approche unifiée</p>
              </div>

              <div className="text-center p-6 rounded-xl border border-gray-700 hover:border-[#CCFF00] transition-all duration-300">
                <h3 className="text-xl font-karla-bold mb-3" style={{ color: '#CCFF00' }}>Identification</h3>
                <p className="text-gray-400">Identifie les lacunes dans la détection et la réponse aux incidents</p>
              </div>

              <div className="text-center p-6 rounded-xl border border-gray-700 hover:border-[#CCFF00] transition-all duration-300">
                <h3 className="text-xl font-karla-bold mb-3" style={{ color: '#CCFF00' }}>Optimisation</h3>
                <p className="text-gray-400">Optimise les techniques offensives pour tester efficacement les défenses</p>
              </div>

              <div className="text-center p-6 rounded-xl border border-gray-700 hover:border-[#CCFF00] transition-all duration-300">
                <h3 className="text-xl font-karla-bold mb-3" style={{ color: '#CCFF00' }}>Amélioration</h3>
                <p className="text-gray-400">Améliore les règles de détection (SIEM, EDR, etc.)</p>
              </div>

              <div className="text-center p-6 rounded-xl border border-gray-700 hover:border-[#CCFF00] transition-all duration-300">
                <h3 className="text-xl font-karla-bold mb-3" style={{ color: '#CCFF00' }}>Documentation</h3>
                <p className="text-gray-400">Documente les enseignements pour renforcer la sécurité</p>
              </div>

              <div className="text-center p-6 rounded-xl border border-gray-700 hover:border-[#CCFF00] transition-all duration-300">
                <h3 className="text-xl font-karla-bold mb-3" style={{ color: '#CCFF00' }}>Amélioration Continue</h3>
                <p className="text-gray-400">Processus d&apos;amélioration continue basé sur les retours d&apos;expérience</p>
              </div>
            </div>

            {/* Section Drelto et Purple Team */}
            <div className="mt-12 p-8 bg-gray-900/50 rounded-xl border border-gray-700 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="text-center">
                <h3 className="text-xl font-karla-bold mb-4" style={{ color: '#CCFF00' }}>Comment Drelto facilite l&apos;approche Purple Team</h3>
                <p className="text-gray-300 text-sm leading-relaxed max-w-4xl mx-auto">
                  Notre plateforme Drelto est conçue pour soutenir l&apos;approche Purple Team en permettant aux équipes Red et Blue de collaborer efficacement. 
                  Les services prédéfinis (défensifs et offensifs) facilitent le partage de connaissances, tandis que le système de gestion des tâches 
                  permet de documenter les enseignements et d&apos;améliorer continuellement les processus de sécurité.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900/50 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <span className="text-2xl font-karla-bold" style={{ color: '#CCFF00' }}>
                Drelto
              </span>
            </div>
            <p className="text-gray-400 mb-6">
              Plateforme moderne de gestion d&apos;infrastructure développée avec les dernières technologies
            </p>
            <div className="flex justify-center space-x-6 mb-4">
              <a href="#interfaces" className="text-gray-400 hover:text-[#CCFF00] transition-colors">
                Interfaces
              </a>
              <a href="#tech" className="text-gray-400 hover:text-[#CCFF00] transition-colors">
                Technologies
              </a>
              <a href="#purple-team" className="text-gray-400 hover:text-[#CCFF00] transition-colors">
                Purple Team
              </a>
            </div>
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
        
        .animate-slide-up {
          animation: slideUp 0.8s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
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