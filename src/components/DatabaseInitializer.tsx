'use client';

import { useEffect } from 'react';
import { initDatabase } from '@/lib/init-database';

export default function DatabaseInitializer() {
  useEffect(() => {
    // Initialiser la base de données au démarrage de l'application
    const initializeDB = async () => {
      try {
        await initDatabase();
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base:', error);
      }
    };

    // Exécuter l'initialisation
    initializeDB();
  }, []);

  // Ce composant ne rend rien visuellement
  return null;
}
