import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function debugUser() {
  try {
    console.log('🔍 Débogage de l\'utilisateur superadmin...');
    
    // Récupérer l'utilisateur superadmin
    const user = await prisma.user.findUnique({
      where: { email: 'superadmin@example.com' },
      include: {
        company: true
      }
    });
    
    if (!user) {
      console.log('❌ Utilisateur superadmin non trouvé');
      return;
    }
    
    console.log('👤 Utilisateur trouvé:');
    console.log('  - ID:', user.id);
    console.log('  - Email:', user.email);
    console.log('  - Role:', user.role);
    console.log('  - Company ID:', user.companyId);
    console.log('  - Company:', user.company);
    console.log('  - Password hash:', user.password.substring(0, 20) + '...');
    
    // Tester le mot de passe
    const testPassword = 'superadmin123';
    const isValid = await bcrypt.compare(testPassword, user.password);
    console.log('  - Mot de passe valide:', isValid);
    
    // Tester avec l'API de login
    console.log('\n🧪 Test de l\'API de login...');
    
    const testData = {
      email: user.email,
      password: testPassword
    };
    
    console.log('  - Données envoyées:', testData);
    
    // Simuler la logique de l'API
    const foundUser = await prisma.user.findUnique({ 
      where: { email: testData.email },
      include: { company: true }
    });
    
    if (!foundUser) {
      console.log('  ❌ Utilisateur non trouvé dans l\'API');
    } else {
      console.log('  ✅ Utilisateur trouvé dans l\'API');
      const passwordValid = await bcrypt.compare(testData.password, foundUser.password);
      console.log('  - Mot de passe valide dans l\'API:', passwordValid);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugUser(); 