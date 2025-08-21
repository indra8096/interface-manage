'use client';

import Link from 'next/link';

export default function PolitiqueConfidentialite() {
  return (
    <div className="bg-black text-white font-karla min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-effect border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Link href="/" className="text-xl font-karla-bold" style={{ color: '#CCFF00' }}>
                Drelto
              </Link>
            </div>
            
            <div className="flex space-x-4">
              <Link href="/" className="px-6 py-2 text-black font-karla-bold rounded-lg transition-all duration-300" style={{ background: '#CCFF00' }}>
                RETOUR
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-karla-bold mb-6 gradient-text">
              Politique de Confidentialité
            </h1>
            <p className="text-xl text-gray-300">
              Conformément au RGPD et à la législation belge en vigueur
            </p>
          </div>

          <div className="glass-effect rounded-2xl p-8 border border-gray-700 space-y-8">
            <div>
              <p className="text-gray-300 leading-relaxed">
                La présente politique de confidentialité décrit comment Drelto Interface Manage collecte, utilise et protège les données personnelles de ses
                utilisateurs, conformément au Règlement Général sur la Protection des Données
                (RGPD) et à la législation belge en vigueur.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: '#CCFF00' }}>
                Données collectées
              </h2>
              <p className="text-gray-300 mb-3">Nous collectons les types de données personnelles suivants :</p>
              <div className="space-y-2 text-gray-300">
                <p><strong>Données d&apos;identité :</strong> Nom, prénom, adresse e-mail, adresse postale, numéro de téléphone.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: '#CCFF00' }}>
                Finalités de la collecte des données
              </h2>
              <p className="text-gray-300 mb-3">Les données personnelles collectées sont utilisées aux fins suivantes :</p>
              <div className="space-y-3 text-gray-300">
                <p><strong>Création et gestion de compte :</strong> Pour permettre aux utilisateurs de créer et gérer leur compte sur la plateforme.</p>
                <p><strong>Fourniture de services :</strong> Pour assurer le bon fonctionnement des services proposés par la plateforme.</p>
                <p><strong>Amélioration de l&apos;expérience utilisateur :</strong> Pour analyser l&apos;utilisation de la plateforme et améliorer son ergonomie et ses fonctionnalités.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: '#CCFF00' }}>
                Durée de conservation des données
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Les données personnelles sont conservées pendant une durée n&apos;excédant pas celle
                nécessaire à la réalisation des finalités pour lesquelles elles sont collectées et traitées.
                La durée de conservation varie en fonction du type de données et de la finalité du
                traitement. Par exemple, les données de compte sont conservées tant que le compte
                est actif, et les données de connexion peuvent être conservées pour une durée limitée
                à des fins de sécurité et d&apos;analyse.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: '#CCFF00' }}>
                Droits des utilisateurs
              </h2>
              <p className="text-gray-300 mb-3">Conformément au RGPD, les utilisateurs disposent des droits suivants concernant leurs données personnelles :</p>
              <div className="space-y-3 text-gray-300">
                <p><strong>Droit d&apos;accès :</strong> Obtenir la confirmation que des données personnelles les concernant sont ou non traitées et, lorsqu&apos;elles le sont, l&apos;accès auxdites données.</p>
                <p><strong>Droit de rectification :</strong> Demander la correction des données personnelles inexactes ou incomplètes.</p>
                <p><strong>Droit à l&apos;effacement (droit à l&apos;oubli) :</strong> Demander la suppression de leurs données personnelles dans certaines conditions.</p>
                <p><strong>Droit à la limitation du traitement :</strong> Demander la limitation du traitement de leurs données personnelles dans certaines conditions.</p>
                <p><strong>Droit à la portabilité des données :</strong> Recevoir les données personnelles qu&apos;ils ont fournies, dans un format structuré, couramment utilisé et lisible par machine, et les transmettre à un autre responsable du traitement.</p>
                <p><strong>Droit d&apos;opposition :</strong> S&apos;opposer au traitement de leurs données personnelles dans certaines conditions.</p>
              </div>
              <p className="text-gray-300 mt-4">
                Pour exercer ces droits, les utilisateurs peuvent contacter le Délégué à la Protection
                des Données (DPO) ou le contact désigné à l&apos;adresse e-mail suivante : <strong>guillaume.rosin@risk-horizon.be</strong>
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: '#CCFF00' }}>
                Base légale du traitement
              </h2>
              <p className="text-gray-300 mb-3">Le traitement des données personnelles est fondé sur les bases légales suivantes :</p>
              <div className="space-y-3 text-gray-300">
                <p><strong>Consentement :</strong> L&apos;utilisateur a consenti au traitement de ses données personnelles pour une ou plusieurs finalités spécifiques.</p>
                <p><strong>Exécution d&apos;un contrat :</strong> Le traitement est nécessaire à l&apos;exécution d&apos;un contrat auquel l&apos;utilisateur est partie ou à l&apos;exécution de mesures précontractuelles prises à la demande de l&apos;utilisateur.</p>
                <p><strong>Obligation légale :</strong> Le traitement est nécessaire au respect d&apos;une obligation légale à laquelle Drelto est soumis.</p>
                <p><strong>Intérêt légitime :</strong> Le traitement est nécessaire aux fins des intérêts légitimes poursuivis par Drelto ou par un tiers, à moins que ne prévalent les intérêts ou les libertés et droits fondamentaux de l&apos;utilisateur qui exigent une protection des données à caractère personnel.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: '#CCFF00' }}>
                Sécurité des données
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Nous mettons en œuvre des mesures techniques et organisationnelles appropriées
                pour assurer un niveau de sécurité adapté au risque, y compris la protection contre le
                traitement non autorisé ou illicite et contre la perte, la destruction ou les dommages
                d&apos;origine accidentelle des données personnelles.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: '#CCFF00' }}>
                Contact
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Pour toute question relative à cette politique de confidentialité ou pour exercer vos
                droits, vous pouvez nous contacter à l&apos;adresse suivante : <strong>guillaume.rosin@risk-horizon.be</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-900/50 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center space-x-6 mb-4">
            <a href="/mentions-legales" className="text-gray-400 hover:text-[#CCFF00] transition-colors">Mentions Légales</a>
            <a href="/politique-confidentialite" className="text-gray-400 hover:text-[#CCFF00] transition-colors">Politique de Confidentialité</a>
            <a href="/cgu" className="text-gray-400 hover:text-[#CCFF00] transition-colors">CGU</a>
          </div>
          <p className="text-sm text-gray-500">
            © 2025 Drelto. Tous droits réservés.
          </p>
        </div>
      </footer>

      <style jsx>{`
        .glass-effect {
          background: rgba(17, 17, 17, 0.5);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #CCFF00 0%, #9933FF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  );
}
