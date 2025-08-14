import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export async function initSuperAdmin() {
  try {
    // Créer la première entreprise
    const company = await prisma.company.create({
      data: {
        name: 'Risk Horizon',
      },
    });

    // Créer le Super Admin avec les nouvelles informations
    const superAdminPassword = await bcrypt.hash('Pv:76IdrTo/', 12); // Hash renforcé avec 12 rounds
    const superAdmin = await prisma.user.create({
      data: {
        email: 'guillaume.rosin@risk-horizon.be',
        password: superAdminPassword,
        role: 'SUPER_ADMIN',
      },
    });

    // Créer un admin de l'entreprise
    const adminPassword = await bcrypt.hash('admin123', 10);
    const companyAdmin = await prisma.user.create({
      data: {
        email: 'admin@risk-horizon.be',
        password: adminPassword,
        role: 'COMPANY_ADMIN',
        companyId: company.id,
      },
    });

    // Créer un utilisateur de l'entreprise
    const userPassword = await bcrypt.hash('user123', 10);
    const companyUser = await prisma.user.create({
      data: {
        email: 'user@risk-horizon.be',
        password: userPassword,
        role: 'COMPANY_USER',
        companyId: company.id,
      },
    });

    console.log('✅ Super Admin initialisé avec succès !');
    console.log('📧 Super Admin:', superAdmin.email, '| Mot de passe: Pv:76IdrTo/');
    console.log('📧 Admin Entreprise:', companyAdmin.email, '| Mot de passe: admin123');
    console.log('📧 Utilisateur Entreprise:', companyUser.email, '| Mot de passe: user123');
    console.log('🏢 Entreprise créée:', company.name);

    return { company, superAdmin, companyAdmin, companyUser };
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    throw error;
  }
} 