import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log('🧪 Test de la logique de login...');
    
    const email = 'superadmin@example.com';
    const password = 'superadmin123';
    
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    
    // Étape 1: Trouver l'utilisateur
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { company: true }
    });
    
    console.log('👤 Utilisateur trouvé:', user ? 'OUI' : 'NON');
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }
    
    console.log('📋 Détails utilisateur:');
    console.log('  - ID:', user.id);
    console.log('  - Email:', user.email);
    console.log('  - Role:', user.role);
    console.log('  - Company ID:', user.companyId);
    console.log('  - Company:', user.company);
    
    // Étape 2: Vérifier le mot de passe
    const valid = await bcrypt.compare(password, user.password);
    console.log('🔐 Mot de passe valide:', valid);
    
    if (!valid) {
      console.log('❌ Mot de passe incorrect');
      return;
    }
    
    console.log('✅ Authentification réussie !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin(); 