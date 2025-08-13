import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkSuperAdmin() {
  try {
    console.log('🔍 Vérification de l\'utilisateur superadmin...');
    
    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: 'superadmin@example.com' }
    });
    
    if (!user) {
      console.log('❌ Utilisateur superadmin non trouvé !');
      console.log('🔧 Création de l\'utilisateur superadmin...');
      
      const hashedPassword = await bcrypt.hash('superadmin123', 10);
      const superAdmin = await prisma.user.create({
        data: {
          email: 'superadmin@example.com',
          password: hashedPassword,
          role: 'SUPER_ADMIN'
        }
      });
      
      console.log('✅ Super Admin créé avec succès !');
      console.log('📧 Email:', superAdmin.email);
      console.log('🔑 Mot de passe: superadmin123');
      console.log('👑 Rôle:', superAdmin.role);
      console.log('🆔 ID:', superAdmin.id);
      
    } else {
      console.log('✅ Utilisateur superadmin trouvé !');
      console.log('📧 Email:', user.email);
      console.log('👑 Rôle:', user.role);
      console.log('🆔 ID:', user.id);
      console.log('📅 Créé le:', user.createdAt);
      
      // Tester le mot de passe
      console.log('\n🔐 Test des mots de passe...');
      
      const testPasswords = ['superadmin123', 'password', 'admin123'];
      
      for (const testPassword of testPasswords) {
        const isValid = await bcrypt.compare(testPassword, user.password);
        console.log(`🔑 "${testPassword}": ${isValid ? '✅ VALIDE' : '❌ INVALIDE'}`);
      }
    }
    
    // Vérifier le nombre total d'utilisateurs
    const totalUsers = await prisma.user.count();
    console.log(`\n📊 Total d'utilisateurs dans la base: ${totalUsers}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSuperAdmin();
