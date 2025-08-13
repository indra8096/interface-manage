import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function updateAdminPassword() {
  try {
    console.log('🔐 Mise à jour du mot de passe super admin...');
    
    // Nouveau mot de passe qui respecte toutes les règles
    const newPassword = 'SuperAdmin123!';
    
    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Mettre à jour le super admin
    const updatedUser = await prisma.user.update({
      where: { email: 'superadmin@example.com' },
      data: { password: hashedPassword }
    });
    
    console.log('✅ Mot de passe mis à jour avec succès !');
    console.log('📧 Email:', updatedUser.email);
    console.log('🔑 Nouveau mot de passe:', newPassword);
    console.log('⚠️  IMPORTANT: Notez ce mot de passe !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminPassword();
