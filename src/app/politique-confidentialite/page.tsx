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
              Politique de Confidentialité
            </h1>
            <p className="text-xl text-gray-300">
              Conformément au RGPD et à la législation belge en vigueur
            </p>
          </div>

          <div className="glass-effect rounded-2xl p-8 border border-gray-700 space-y-8">
            <div>
              <p className="text-gray-300 leading-relaxed">
                Chez Drelto ASBL, nous faisons tout pour protéger vos données personnelles. Nous respectons les dispositions du Règlement général sur la protection des données (RGPD).
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: 'var(--theme-primary)' }}>
                Quel est l&apos;objectif de cette politique de confidentialité ?
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Cette politique explique comment nous collectons et utilisons vos données personnelles lorsque vous utilisez notre site web interface-managee-drelto.vercel.app et ses sous-domaines. Elle vous informe également sur la manière dont vos données personnelles sont traitées par Drelto ASBL.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: 'var(--theme-primary)' }}>
                Que signifient les termes utilisés dans notre politique de confidentialité ?
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-karla-bold mb-2" style={{ color: '#CCFF00' }}>Qu&apos;est-ce qu&apos;une donnée personnelle ?</h3>
                  <p className="text-gray-300">C&apos;est toute information permettant d&apos;identifier une personne physique, directement ou indirectement comme le nom, prénom, numéro de téléphone, date de naissance, adresse...</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-karla-bold mb-2" style={{ color: '#CCFF00' }}>Qu&apos;est-ce qu&apos;un responsable de traitement ?</h3>
                  <p className="text-gray-300">C&apos;est la personne ou l&apos;entreprise qui décide pourquoi et comment vos données personnelles sont utilisées.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-karla-bold mb-2" style={{ color: '#CCFF00' }}>Que signifie personne concernée ?</h3>
                  <p className="text-gray-300">Il s&apos;agit de vous, la personne dont les données personnelles sont collectées et traitées via notre site web.</p>
                </div>
              </div>
              
              <p className="text-gray-300 mt-4">
                Les termes ci-dessus s&apos;appliquent de la même manière au singulier et au pluriel. Dans cette politique de confidentialité, les termes « nous », « notre » et « nos » font référence à Drelto ASBL.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: 'var(--theme-primary)' }}>
                Qui est le responsable de traitement ?
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Drelto ASBL est responsable de traitement de vos données personnelles.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: 'var(--theme-primary)' }}>
                Quelle est l&apos;adresse postale du responsable de traitement ?
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Drelto ASBL, Rue Cuesmes 199, 7012 MONS.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: 'var(--theme-primary)' }}>
                Comment utilisons-nous vos données personnelles ?
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-600">
                  <thead>
                    <tr className="bg-gray-800">
                      <th className="border border-gray-600 p-3 text-left text-sm font-karla-bold" style={{ color: '#CCFF00' }}>Nom du traitement</th>
                      <th className="border border-gray-600 p-3 text-left text-sm font-karla-bold" style={{ color: '#CCFF00' }}>Pourquoi utilisons-nous vos données personnelles ?</th>
                      <th className="border border-gray-600 p-3 text-left text-sm font-karla-bold" style={{ color: '#CCFF00' }}>Quelles sont les données personnelles que nous collectons ?</th>
                      <th className="border border-gray-600 p-3 text-left text-sm font-karla-bold" style={{ color: '#CCFF00' }}>Sur quelle base légale ?</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300 text-sm">
                    <tr>
                      <td className="border border-gray-600 p-3">Connexion à la plateforme Drelto</td>
                      <td className="border border-gray-600 p-3">Pour gérer votre accès et vous fournir les services de la plateforme</td>
                      <td className="border border-gray-600 p-3">Nom, prénom, email, mot de passe</td>
                      <td className="border border-gray-600 p-3">Votre consentement ou pour exécuter un contrat</td>
                    </tr>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3">Gestion des tâches et services</td>
                      <td className="border border-gray-600 p-3">Pour assurer le bon fonctionnement de la plateforme de gestion d&apos;infrastructure</td>
                      <td className="border border-gray-600 p-3">Données de connexion, actions effectuées sur la plateforme</td>
                      <td className="border border-gray-600 p-3">Exécution du contrat de service</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-600 p-3">Gestion des demandes d&apos;exercice de droits</td>
                      <td className="border border-gray-600 p-3">Accuser réception des demandes, demander des informations supplémentaires si besoin</td>
                      <td className="border border-gray-600 p-3">Nom, prénom, email, type de demande, copie de documents d&apos;identité</td>
                      <td className="border border-gray-600 p-3">Respect de nos obligations légales</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <p className="text-gray-300 mt-4">
                Lorsque nous vous demandons des données personnelles, nous précisons si elles sont obligatoires ou facultatives au moment de la collecte. Cette indication est marquée par un astérisque (*). Si vous ne complétez pas un champ obligatoire, cela pourrait empêcher le traitement de votre demande.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: 'var(--theme-primary)' }}>
                A qui sont transmises vos données personnelles ?
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Drelto ASBL peut partager vos données personnelles avec des tiers dans les situations suivantes :
              </p>
              
              <div className="overflow-x-auto mt-4">
                <table className="w-full border-collapse border border-gray-600">
                  <thead>
                    <tr className="bg-gray-800">
                      <th className="border border-gray-600 p-3 text-left text-sm font-karla-bold" style={{ color: '#CCFF00' }}>Finalités de traitement</th>
                      <th className="border border-gray-600 p-3 text-left text-sm font-karla-bold" style={{ color: '#CCFF00' }}>Durée de conservation</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300 text-sm">
                    <tr>
                      <td className="border border-gray-600 p-3">Gestion des comptes utilisateurs</td>
                      <td className="border border-gray-600 p-3">Tant que le compte est actif, puis 3 ans après la dernière connexion</td>
                    </tr>
                    <tr className="bg-gray-800/50">
                      <td className="border border-gray-600 p-3">Gestion des droits des personnes</td>
                      <td className="border border-gray-600 p-3">Pendant l&apos;année de la demande, plus 5 ans supplémentaires. Les documents d&apos;identité seront supprimés au maximum 1 an après réception de la demande.</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-600 p-3">Données de connexion et d&apos;utilisation</td>
                      <td className="border border-gray-600 p-3">3 ans à partir de la dernière connexion puis archivées à titre probatoire pendant 2 ans</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <p className="text-gray-300 mt-4">
                Après ces périodes de conservation, vos données personnelles seront soit supprimées, soit anonymisées.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: 'var(--theme-primary)' }}>
                Quels sont vos droits concernant vos données personnelles ?
              </h2>
              <p className="text-gray-300 mb-4">Conformément au RGPD, vous avez plusieurs droits sur vos données personnelles.</p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-600 p-4 rounded-lg">
                    <h3 className="font-karla-bold mb-2" style={{ color: '#CCFF00' }}>Droit d&apos;accès</h3>
                    <p className="text-gray-300 text-sm">Vous pouvez demander quelles données personnelles nous avons sur vous et comment nous les utilisons. Vous pouvez aussi demander une copie de vos données personnelles.</p>
                  </div>
                  
                  <div className="border border-gray-600 p-4 rounded-lg">
                    <h3 className="font-karla-bold mb-2" style={{ color: '#CCFF00' }}>Droit de rectification</h3>
                    <p className="text-gray-300 text-sm">Si vos données personnelles sont incorrectes ou incomplètes, vous pouvez nous demander de les corriger.</p>
                  </div>
                  
                  <div className="border border-gray-600 p-4 rounded-lg">
                    <h3 className="font-karla-bold mb-2" style={{ color: '#CCFF00' }}>Droit à l&apos;effacement</h3>
                    <p className="text-gray-300 text-sm">Vous pouvez demander la suppression de vos données personnelles dans certains cas spécifiques.</p>
                  </div>
                  
                  <div className="border border-gray-600 p-4 rounded-lg">
                    <h3 className="font-karla-bold mb-2" style={{ color: '#CCFF00' }}>Droit à la limitation du traitement</h3>
                    <p className="text-gray-300 text-sm">Vous pouvez demander à restreindre l&apos;utilisation de vos données personnelles dans certaines conditions.</p>
                  </div>
                  
                  <div className="border border-gray-600 p-4 rounded-lg">
                    <h3 className="font-karla-bold mb-2" style={{ color: '#CCFF00' }}>Droit d&apos;opposition</h3>
                    <p className="text-gray-300 text-sm">Vous pouvez vous opposer au traitement de vos données personnelles si cela repose sur nos intérêts légitimes.</p>
                  </div>
                  
                  <div className="border border-gray-600 p-4 rounded-lg">
                    <h3 className="font-karla-bold mb-2" style={{ color: '#CCFF00' }}>Droit de retirer votre consentement</h3>
                    <p className="text-gray-300 text-sm">Si vous avez consenti au traitement de vos données, vous pouvez retirer ce consentement à tout moment.</p>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-300 mt-6">
                Pour en savoir plus sur ces droits, vous pouvez consulter le site de l&apos;Autorité de protection des données (APD) : <a href="https://www.autoriteprotectiondonnees.be/citoyen/vie-privee/quels-sont-mes-droits-" className="text-[#CCFF00] hover:underline" target="_blank" rel="noopener noreferrer">https://www.autoriteprotectiondonnees.be/citoyen/vie-privee/quels-sont-mes-droits-</a>
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: 'var(--theme-primary)' }}>
                Comment exercer vos droits ?
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Pour exercer vos droits, envoyez-nous un courrier à : Drelto ASBL, Rue Cuesmes 199, 7012 MONS.
              </p>
              <p className="text-gray-300 mt-2">
                Ou par e-mail : <strong>guillaume.richard@drelto.be</strong>
              </p>
              <p className="text-gray-300 mt-2">
                Nous pourrions vous demander une preuve d&apos;identité pour traiter votre demande.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: 'var(--theme-primary)' }}>
                Quel est notre délai de réponse ?
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Nous répondrons dans un délai d&apos;un mois. Si votre demande n&apos;est pas claire, nous pourrons vous demander plus d&apos;informations. Si vous avez des préoccupations sur la manière dont nous gérons vos données personnelles, vous pouvez contacter l&apos;Autorité de protection des données à :
              </p>
              <div className="mt-3 text-gray-300">
                <p>Rue de la Presse, 35, 1000 Bruxelles</p>
                <p>+32 (0)2 274 48 00 <a href="mailto:contact@apd-gba.be" className="text-[#CCFF00] hover:underline">contact@apd-gba.be</a></p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: 'var(--theme-primary)' }}>
                Comment protégeons-nous vos données personnelles ?
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Nous prenons la sécurité de vos données très au sérieux. Pour cela, nous avons mis en place des protections solides afin de prévenir tout accès non autorisé, modification, fuites ou destructions de vos données personnelles.
              </p>
              <p className="text-gray-300 mt-3">
                Toutes les données que vous nous envoyez sont conservées sur des serveurs sécurisés, que ce soit les nôtres ou ceux de nos partenaires, et se trouvent dans l&apos;Espace Économique Européen (EEE).
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: 'var(--theme-primary)' }}>
                La politique de confidentialité peut-elle évoluer ?
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Oui, nous pouvons modifier cette politique de confidentialité. Si des changements importants affectent vos droits, nous vous informerons et publierons la version mise à jour sur notre site web.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-karla-bold mb-4" style={{ color: 'var(--theme-primary)' }}>
                Comment nous contacter ?
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Si vous avez des questions sur cette politique de confidentialité, n&apos;hésitez pas à nous contacter :
              </p>
              <div className="mt-3 text-gray-300">
                <p>Par e-mail : <strong>guillaume.richard@drelto.be</strong></p>
                <p>Par courrier : Drelto ASBL, Rue Cuesmes 199, 7012 MONS</p>
              </div>
            </div>

            <div className="text-center pt-6 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                <strong>Dernière mise à jour :</strong> 26 août 2025
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

