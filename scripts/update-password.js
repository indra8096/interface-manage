const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updatePassword() {
  try {
    console.log('🔄 Mise à jour du mot de passe...');
    
    // Hash du nouveau mot de passe
    const newPassword = await bcrypt.hash('Pv:76IdrTo/', 10);
    
    // Mettre à jour le mot de passe de guillaume.rosin@risk-horizon.be
    const updatedUser = await prisma.user.update({
      where: {
        email: 'guillaume.rosin@risk-horizon.be'
      },
      data: {
        password: newPassword
      }
    });
    
    console.log('✅ Mot de passe mis à jour avec succès !');
    console.log('📧 Email:', updatedUser.email);
    console.log('🔐 Nouveau mot de passe: Pv:76IdrTo/');
    console.log('👤 ID utilisateur:', updatedUser.id);
    console.log('🎭 Rôle:', updatedUser.role);
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePassword();
