import { execSync } from 'child_process';

console.log('🔓 Script de déblocage IP...');

// Récupérer l'IP actuelle
try {
  const ip = execSync('curl -s ifconfig.me', { encoding: 'utf8' }).trim();
  console.log('📍 Votre IP actuelle:', ip);
  
  console.log('\n🚨 Si votre IP est bloquée, voici les solutions :');
  console.log('1. ⏰ Attendez 5 minutes (nouveau délai)');
  console.log('2. 🌐 Changez de connexion (4G, autre WiFi)');
  console.log('3. 🔄 Redémarrez votre routeur');
  
  console.log('\n💡 Pour tester la connexion :');
  console.log('1. Attendez 5 minutes');
  console.log('2. Essayez de vous connecter avec :');
  console.log('   📧 Email: guillaume.rosin@risk-horizon.be');
  console.log('   🔑 Mot de passe: Pv:76IdrTo/');
  
} catch (error) {
  console.log('❌ Impossible de récupérer votre IP');
  console.log('💡 Solutions de déblocage :');
  console.log('1. ⏰ Attendez 5 minutes');
  console.log('2. 🌐 Changez de connexion internet');
  console.log('3. 🔄 Redémarrez votre routeur');
}
