import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function updateSuperAdmin() {
  try {
    console.log('🔐 Mise à jour du Super Admin...');
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: 'guillaume.rosin@risk-horizon.be' }
    });
    
    if (existingUser) {
      console.log('👤 Utilisateur existant trouvé, mise à jour du mot de passe...');
      
      // Mettre à jour le mot de passe
      const newPassword = await bcrypt.hash('Pv:76IdrTo/', 12);
      
      await prisma.user.update({
        where: { email: 'guillaume.rosin@risk-horizon.be' },
        data: {
          password: newPassword,
          role: 'SUPER_ADMIN'
        }
      });
      
      console.log('✅ Mot de passe du Super Admin mis à jour !');
    } else {
      console.log('👤 Création du nouveau Super Admin...');
      
      // Créer le nouvel utilisateur
      const newPassword = await bcrypt.hash('Pv:76IdrTo/', 12);
      
      await prisma.user.create({
        data: {
          email: 'guillaume.rosin@risk-horizon.be',
          password: newPassword,
          role: 'SUPER_ADMIN'
        }
      });
      
      console.log('✅ Nouveau Super Admin créé !');
    }
    
    // Mettre à jour ou créer l'entreprise Risk Horizon
    const existingCompany = await prisma.company.findFirst({
      where: { name: 'Risk Horizon' }
    });
    
    if (!existingCompany) {
      console.log('🏢 Création de l\'entreprise Risk Horizon...');
      
      await prisma.company.create({
        data: {
          name: 'Risk Horizon'
        }
      });
      
      console.log('✅ Entreprise Risk Horizon créée !');
    } else {
      console.log('🏢 Entreprise Risk Horizon déjà existante');
    }
    
    console.log('\n🎉 Mise à jour terminée avec succès !');
    console.log('📧 Super Admin: guillaume.rosin@risk-horizon.be');
    console.log('🔑 Mot de passe: Pv:76IdrTo/');
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSuperAdmin();
