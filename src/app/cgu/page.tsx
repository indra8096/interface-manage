'use client';

import Link from 'next/link';

export default function CGU() {
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
              Conditions Générales d&apos;Utilisation
            </h1>
            <p className="text-xl text-gray-300">
              CGU de la plateforme Drelto Interface manage
            </p>
          </div>

          <div className="glass-effect rounded-2xl p-8 border border-gray-700 space-y-8">
            <div>
              <p className="text-gray-300 leading-relaxed">
                Les présentes Conditions Générales d&apos;Utilisation (ci-après « CGU ») régissent l&apos;accès et
                l&apos;utilisation de la plateforme Drelto Interface manage par
                tout utilisateur. En accédant à la Plateforme et en l&apos;utilisant, l&apos;utilisateur reconnaît
                avoir lu, compris et accepté d&apos;être lié par les présentes CGU.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: '#CCFF00' }}>
                Objet
              </h2>
              <p className="text-gray-300 leading-relaxed">
                La Plateforme a pour objet d&apos;accompagner les PME dans la gestion sécurisée de leurs tâches et événements. Elle permet d&apos;assigner des missions aux employés, de suivre leur exécution et d&apos;organiser les projets tout en intégrant des bonnes pratiques de cybersécurité. Les entreprises bénéficient ainsi d&apos;une meilleure visibilité sur leur structure, d&apos;une organisation optimisée et d&apos;une protection renforcée contre les risques numériques.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: '#CCFF00' }}>
                Obligations de l&apos;utilisateur
              </h2>
              <p className="text-gray-300 mb-3">
                L&apos;utilisateur s&apos;engage à utiliser la Plateforme de manière loyale, licite et conforme aux
                présentes CGU, aux lois et règlements en vigueur, et aux bonnes mœurs. L&apos;utilisateur
                s&apos;interdit notamment de :
              </p>
              <div className="space-y-2 text-gray-300 ml-4">
                <p>• Utiliser la Plateforme à des fins illégales ou non autorisées.</p>
                <p>• Porter atteinte aux droits de propriété intellectuelle de l&apos;éditeur ou de tiers.</p>
                <p>• Introduire des virus, chevaux de Troie ou tout autre programme nuisible.</p>
                <p>• Collecter ou stocker des données personnelles d&apos;autres utilisateurs sans leur autorisation.</p>
                <p>• Tenter d&apos;accéder de manière non autorisée à la Plateforme ou à ses systèmes.</p>
                <p>• Publier du contenu illicite, diffamatoire, injurieux, obscène, menaçant, ou portant atteinte à la vie privée ou aux droits de tiers.</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: '#CCFF00' }}>
                Propriété intellectuelle
              </h2>
              <p className="text-gray-300 leading-relaxed">
                L&apos;ensemble des éléments de la Plateforme, y compris les textes, images, graphismes,
                logos, icônes, sons, logiciels, sont la propriété de l&apos;éditeur ou de ses partenaires et
                sont protégés par les lois belges et internationales relatives à la propriété
                intellectuelle. Toute reproduction, représentation, modification, publication,
                adaptation de tout ou partie des éléments de la Plateforme, quel que soit le moyen ou
                le procédé utilisé, est interdite, sauf autorisation écrite préalable de l&apos;éditeur.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: '#CCFF00' }}>
                Limitation de responsabilité
              </h2>
              <p className="text-gray-300 leading-relaxed">
                L&apos;éditeur s&apos;efforce d&apos;assurer le bon fonctionnement et la sécurité de la Plateforme.
                Toutefois, l&apos;éditeur ne saurait être tenu responsable des interruptions de service, des
                erreurs, des omissions, de l&apos;indisponibilité des informations et/ou de la présence de
                virus sur la Plateforme. L&apos;éditeur ne pourra être tenu responsable des dommages
                directs et indirects causés au matériel de l&apos;utilisateur, lors de l&apos;accès à la Plateforme, et
                résultant soit de l&apos;utilisation d&apos;un matériel ne répondant pas aux spécifications
                indiquées au point , soit de l&apos;apparition d&apos;un bug ou d&apos;une incompatibilité.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: '#CCFF00' }}>
                Liens hypertextes
              </h2>
              <p className="text-gray-300 leading-relaxed">
                La Plateforme peut contenir des liens hypertextes vers d&apos;autres sites internet. L&apos;éditeur
                ne dispose d&apos;aucun moyen de contrôler ces sites et n&apos;assume aucune responsabilité
                quant à leur contenu.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: '#CCFF00' }}>
                Modification des CGU
              </h2>
              <p className="text-gray-300 leading-relaxed">
                L&apos;éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les
                modifications prendront effet dès leur publication sur la Plateforme. Il est conseillé à
                l&apos;utilisateur de consulter régulièrement les CGU afin de prendre connaissance des
                éventuelles modifications.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: '#CCFF00' }}>
                Durée
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Les présentes CGU sont conclues pour une durée indéterminée à compter de la
                première utilisation de la Plateforme par l&apos;utilisateur.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: '#CCFF00' }}>
                Droit applicable et juridiction compétente
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Les présentes CGU sont régies par le droit belge. En cas de litige, et à défaut de
                résolution amiable, les tribunaux belges seront seuls compétents.
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
