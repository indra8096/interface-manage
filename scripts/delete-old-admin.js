const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteOldAdmin() {
  try {
    console.log('🗑️ Suppression de l\'ancien Super Admin...');
    
    // Supprimer l'utilisateur superadmin@example.com
    const deletedUser = await prisma.user.delete({
      where: {
        email: 'superadmin@example.com'
      }
    });
    
    console.log('✅ Ancien Super Admin supprimé avec succès !');
    console.log('📧 Email supprimé:', deletedUser.email);
    console.log('👤 ID utilisateur supprimé:', deletedUser.id);
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteOldAdmin();
