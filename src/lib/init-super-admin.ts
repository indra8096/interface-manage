import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export async function initSuperAdmin() {
  try {
    // Créer la première entreprise
    const company = await prisma.company.create({
      data: {
        name: 'Société 1',
      },
    });

    // Créer le Super Admin
    const superAdminPassword = await bcrypt.hash('superadmin123', 10);
    const superAdmin = await prisma.user.create({
      data: {
        email: 'superadmin@example.com',
        password: superAdminPassword,
        role: 'SUPER_ADMIN',
      },
    });

    // Créer un admin de l'entreprise
    const adminPassword = await bcrypt.hash('admin123', 10);
    const companyAdmin = await prisma.user.create({
      data: {
        email: 'admin@societe1.com',
        password: adminPassword,
        role: 'COMPANY_ADMIN',
        companyId: company.id,
      },
    });

    // Créer un utilisateur de l'entreprise
    const userPassword = await bcrypt.hash('user123', 10);
    const companyUser = await prisma.user.create({
      data: {
        email: 'user@societe1.com',
        password: userPassword,
        role: 'COMPANY_USER',
        companyId: company.id,
      },
    });

    console.log('✅ Super Admin initialisé avec succès !');
    console.log('📧 Super Admin:', superAdmin.email, '| Mot de passe: superadmin123');
    console.log('📧 Admin Entreprise:', companyAdmin.email, '| Mot de passe: admin123');
    console.log('📧 Utilisateur Entreprise:', companyUser.email, '| Mot de passe: user123');
    console.log('🏢 Entreprise créée:', company.name);

    return { company, superAdmin, companyAdmin, companyUser };
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    throw error;
  }
} 