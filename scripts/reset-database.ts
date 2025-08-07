import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    console.log('🔄 Réinitialisation de la base de données...');
    
    // Supprimer toutes les données existantes
    console.log('🗑️ Suppression des données existantes...');
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
    await prisma.company.deleteMany();
    await prisma.globalCard.deleteMany();
    
    console.log('✅ Données supprimées avec succès');
    
    // Créer seulement le Super Admin
    console.log('👑 Création du Super Admin...');
    
    const hashedPassword = await bcrypt.hash('superadmin123', 10);
    
    const superAdmin = await prisma.user.create({
      data: {
        email: 'superadmin@example.com',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        companyId: null // Le Super Admin n'appartient à aucune société
      }
    });
    
    console.log('✅ Super Admin créé avec succès:');
    console.log('  - Email: superadmin@example.com');
    console.log('  - Mot de passe: superadmin123');
    console.log('  - ID:', superAdmin.id);
    console.log('  - Rôle: SUPER_ADMIN');
    
    console.log('\n🎉 Base de données réinitialisée avec succès !');
    console.log('📝 Le Super Admin peut maintenant créer de nouvelles sociétés depuis son dashboard.');
    
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase(); 