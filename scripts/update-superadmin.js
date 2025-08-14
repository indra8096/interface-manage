const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateSuperAdmin() {
  try {
    console.log('🔄 Mise à jour du Super Admin...');
    
    // Hash du nouveau mot de passe
    const newPassword = await bcrypt.hash('Pv:76IdrTo/', 10);
    
    // Mettre à jour l'utilisateur superadmin@example.com
    const updatedUser = await prisma.user.update({
      where: {
        email: 'superadmin@example.com'
      },
      data: {
        email: 'guillaume.rosin@risk-horizon.be',
        password: newPassword
      }
    });
    
    console.log('✅ Super Admin mis à jour avec succès !');
    console.log('📧 Nouvel email:', updatedUser.email);
    console.log('🔐 Nouveau mot de passe: Pv:76IdrTo/');
    console.log('👤 ID utilisateur:', updatedUser.id);
    console.log('🎭 Rôle:', updatedUser.role);
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSuperAdmin();
