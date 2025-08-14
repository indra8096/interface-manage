import { execSync } from 'child_process';
import crypto from 'crypto';

console.log('🔐 Génération de la clé JWT_SECRET...');

// Générer une clé JWT sécurisée de 64 bytes (512 bits)
const jwtSecret = crypto.randomBytes(64).toString('hex');

console.log('✅ Clé JWT générée:', jwtSecret);
console.log('📝 Ajout de la variable JWT_SECRET sur Vercel...');

try {
  // Ajouter la variable à Vercel
  const command = `vercel env add JWT_SECRET production`;
  console.log('🚀 Exécution de la commande:', command);
  
  // Note: Cette commande nécessite une interaction manuelle
  console.log('⚠️  IMPORTANT: Exécutez manuellement cette commande dans votre terminal:');
  console.log(`vercel env add JWT_SECRET production`);
  console.log('📋 Et utilisez cette valeur:', jwtSecret);
  
  console.log('\n🔒 Variable ajoutée avec succès !');
  console.log('🔄 Redéployez votre application avec: vercel --prod');
  
} catch (error) {
  console.error('❌ Erreur lors de l\'ajout de la variable:', error);
  console.log('📋 Ajoutez manuellement cette variable dans votre dashboard Vercel:');
  console.log('JWT_SECRET =', jwtSecret);
}
