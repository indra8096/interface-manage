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
              <Link href="/" className="text-xl font-karla-bold" style={{ color: 'var(--theme-primary)' }}>
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
            <h1 className="text-4xl md:text-5xl font-karla-bold mb-6" style={{ color: 'var(--theme-primary)' }}>
              Mentions Légales
            </h1>
            <p className="text-xl text-gray-300">
              Conformément aux obligations légales en vigueur en Belgique
            </p>
          </div>

          <div className="glass-effect rounded-2xl p-8 border border-gray-700 space-y-8">
            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: 'var(--theme-primary)' }}>
                Qui est l&apos;éditeur du site ?
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Le site interface-managee-drelto.vercel.app est édité par l&apos;Association Drelto ASBL, domiciliée Rue de Cuesmes 199, 7012 Flénu dont le numéro d&apos;entreprise est le 1008.675.581.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: 'var(--theme-primary)' }}>
                Qui est l&apos;hébergeur du site ?
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Le site est hébergé par : Vercel Inc., dont le siège social est situé au 340 S Lemon Ave #4133 Walnut, CA 91789, États-Unis.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: 'var(--theme-primary)' }}>
                Qui est le directeur de la publication ?
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Monsieur Guillaume RICHARD est le directeur de la publication. Il peut être contacté à l&apos;adresse suivante : guillaume.rosin@drelto.be
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: 'var(--theme-primary)' }}>
                Quels sont les droits liés à la propriété intellectuelle ?
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Tous les contenus présents sur ce site, tels que les textes, images, graphiques et logos, sont protégés par des droits d&apos;auteur. Cela signifie que vous ne pouvez pas copier, distribuer, modifier ou utiliser ces éléments sans avoir obtenu une autorisation écrite de Risk Horizon ASBL au préalable.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: 'var(--theme-primary)' }}>
                Le site est-il toujours disponible ?
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Nous faisons de notre mieux pour que notre site soit accessible en permanence. Cependant, il peut arriver que le site soit temporairement indisponible en raison de maintenances techniques, de mises à jour ou de problèmes de réseau.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: 'var(--theme-primary)' }}>
                Quand Drelto ASBL n&apos;est-elle pas responsable de l&apos;utilisation du site ?
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Drelto ASBL ne peut pas être tenue responsable des dommages directs ou indirects dans les cas suivants :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4 mt-3">
                <li>Si vous accédez ou utilisez ce site et que vous subissez des problèmes ou des pertes.</li>
                <li>En cas d&apos;interruption de l&apos;accès au site, y compris pendant les maintenances techniques ou les mises à jour.</li>
                <li>Si les informations sur le site sont inexactes ou incomplètes.</li>
                <li>Si vous utilisez des liens vers des sites tiers, nous déclinons toute responsabilité pour le contenu de ces sites.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: 'var(--theme-primary)' }}>
                Quel tribunal est compétent en cas de litige ?
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Si un désaccord survient, nous vous encourageons d&apos;abord à nous contacter par e-mail pour essayer de le résoudre.
              </p>
              <p className="text-gray-300 leading-relaxed mt-3">
                Si le litige persiste, l&apos;utilisateur reconnaît que la loi belge s&apos;applique concernant l&apos;utilisation de notre site web. Tout différend sera soumis à la compétence exclusive du tribunal de commerce de Mons.
              </p>
            </div>

            <div className="text-center pt-6 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                <strong>Date de dernière mise à jour :</strong> 26 aout 2025
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
