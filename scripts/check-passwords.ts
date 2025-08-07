import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkAndFixPasswords() {
  try {
    console.log('🔍 Vérification des mots de passe...');
    
    // Récupérer tous les utilisateurs
    const users = await prisma.user.findMany();
    console.log(`📋 Nombre d'utilisateurs trouvés: ${users.length}`);
    
    for (const user of users) {
      console.log(`\n👤 Utilisateur: ${user.email} (${user.role})`);
      
      // Tester les mots de passe connus
      const testPasswords = ['superadmin123', 'admin123', 'user123'];
      let passwordFound = false;
      
      for (const testPassword of testPasswords) {
        const isValid = await bcrypt.compare(testPassword, user.password);
        if (isValid) {
          console.log(`✅ Mot de passe trouvé: ${testPassword}`);
          passwordFound = true;
          break;
        }
      }
      
      if (!passwordFound) {
        console.log(`❌ Aucun mot de passe connu ne correspond`);
        
        // Recréer le mot de passe selon le rôle
        let newPassword = '';
        if (user.role === 'SUPER_ADMIN') {
          newPassword = 'superadmin123';
        } else if (user.role === 'COMPANY_ADMIN') {
          newPassword = 'admin123';
        } else {
          newPassword = 'user123';
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword }
        });
        
        console.log(`🔄 Mot de passe mis à jour: ${newPassword}`);
      }
    }
    
    console.log('\n✅ Vérification terminée !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndFixPasswords(); 