'use client';

import Link from 'next/link';

export default function MentionsLegales() {
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
              Mentions Légales
            </h1>
            <p className="text-xl text-gray-300">
              Conformément aux obligations légales en vigueur en Belgique
            </p>
          </div>

          <div className="glass-effect rounded-2xl p-8 border border-gray-700 space-y-8">
            <div>
              <p className="text-gray-300 leading-relaxed">
                Conformément aux obligations légales en vigueur en Belgique, notamment celles
                découlant du Code de droit économique, les présentes mentions légales définissent
                les informations d&apos;identification de l&apos;éditeur de la plateforme en ligne et les conditions
                d&apos;utilisation générales.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: '#CCFF00' }}>
                Informations sur l&apos;éditeur de la plateforme
              </h2>
              <div className="space-y-3 text-gray-300">
                <p><strong>Nom ou Dénomination sociale :</strong> Guillaume Rosin</p>
                <p><strong>Adresse complète :</strong> Rue de Cuesmes 199, 7012 Jemappes</p>
                <p><strong>Numéro de TVA intracommunautaire :</strong> BE20.642.017</p>
                <p><strong>Adresse e-mail :</strong> guillaume.rosin@risk-horizon.be</p>
                <p><strong>Numéro de téléphone :</strong> 0494876620</p>
                <p><strong>Responsable de la publication :</strong> Guillaume Rosin</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: '#CCFF00' }}>
                Informations sur l&apos;hébergeur
              </h2>
              <div className="space-y-3 text-gray-300">
                <p><strong>Nom de l&apos;hébergeur :</strong> Vercel</p>
                <p><strong>Adresse de l&apos;hébergeur :</strong> Vercel.com</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: '#CCFF00' }}>
                Propriété intellectuelle
              </h2>
              <p className="text-gray-300 leading-relaxed">
                L&apos;ensemble des éléments constituant la présente plateforme (textes, images, logos,
                icônes, sons, logiciels, etc.) sont la propriété exclusive de l&apos;éditeur, sauf mentions
                contraires. Toute reproduction, représentation, modification, publication, adaptation
                de tout ou partie des éléments de la plateforme, quel que soit le moyen ou le procédé
                utilisé, est interdite, sauf autorisation écrite préalable de l&apos;éditeur.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: '#CCFF00' }}>
                Limitation de responsabilité
              </h2>
              <p className="text-gray-300 leading-relaxed">
                L&apos;éditeur s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations diffusées sur
                cette plateforme, dont il se réserve le droit de corriger, à tout moment et sans préavis,
                le contenu. Toutefois, l&apos;éditeur ne peut garantir l&apos;exactitude, la précision ou
                l&apos;exhaustivité des informations mises à disposition sur cette plateforme. En
                conséquence, l&apos;éditeur décline toute responsabilité pour toute imprécision,
                inexactitude ou omission portant sur des informations disponibles sur la plateforme,
                ainsi que pour tous dommages résultant d&apos;une intrusion frauduleuse d&apos;un tiers ayant
                entraîné une modification des informations mises à disposition sur la plateforme.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: '#CCFF00' }}>
                Droit applicable et juridiction compétente
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Les présentes mentions légales sont régies par le droit belge. En cas de litige, et à
                défaut de résolution amiable, les tribunaux belges seront seuls compétents.
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
