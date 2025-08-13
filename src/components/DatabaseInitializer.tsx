'use client';

import { useEffect } from 'react';

export default function DatabaseInitializer() {
  useEffect(() => {
    // Initialiser la base de données au démarrage de l'application
    const initializeDB = async () => {
      try {
        console.log('🔍 Initialisation de la base de données...');
        const response = await fetch('/api/init-database', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ Base de données initialisée:', result.message);
        } else {
          console.warn('⚠️ Erreur lors de l\'initialisation de la base');
        }
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de la base:', error);
      }
    };

    // Exécuter l'initialisation
    initializeDB();
  }, []);

  // Ce composant ne rend rien visuellement
  return null;
}
