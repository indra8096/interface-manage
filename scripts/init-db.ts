import { initSuperAdmin } from '../src/lib/init-super-admin';

async function main() {
  console.log('🚀 Initialisation de la base de données...');
  
  try {
    await initSuperAdmin();
    console.log('✅ Base de données initialisée avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

main(); 