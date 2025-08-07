import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Initialisation de la base de données...');
  
  try {
    // Créer la première entreprise
    const company = await prisma.company.create({
      data: {
        name: 'Société 1',
      },
    });
    console.log('✅ Entreprise créée:', company.name);

    // Créer le Super Admin
    const superAdminPassword = await bcrypt.hash('superadmin123', 10);
    const superAdmin = await prisma.user.create({
      data: {
        email: 'superadmin@example.com',
        password: superAdminPassword,
        role: 'SUPER_ADMIN',
      },
    });
    console.log('✅ Super Admin créé:', superAdmin.email);

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
    console.log('✅ Admin Entreprise créé:', companyAdmin.email);

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
    console.log('✅ Utilisateur Entreprise créé:', companyUser.email);

    // Créer quelques tâches de test
    const tasks = await Promise.all([
      prisma.task.create({
        data: {
          name: 'Sécuriser les accès réseau',
          description: 'Mise en place de la sécurité réseau',
          status: 'warning',
          score: 8,
          importance: 'Élevée',
          category: 'defensive',
          companyId: company.id,
        },
      }),
      prisma.task.create({
        data: {
          name: 'Configurer le pare-feu',
          description: 'Configuration du pare-feu d\'entreprise',
          status: 'error',
          score: 9,
          importance: 'Élevée',
          category: 'defensive',
          companyId: company.id,
        },
      }),
      prisma.task.create({
        data: {
          name: 'Mettre à jour les antivirus',
          description: 'Mise à jour des logiciels antivirus',
          status: 'completed',
          score: 6,
          importance: 'Moyenne',
          category: 'defensive',
          companyId: company.id,
        },
      }),
    ]);

    console.log('✅ Tâches de test créées:', tasks.length);

    console.log('\n🎉 Base de données initialisée avec succès !');
    console.log('\n📧 Comptes créés:');
    console.log('   Super Admin:', superAdmin.email, '| Mot de passe: superadmin123');
    console.log('   Admin Entreprise:', companyAdmin.email, '| Mot de passe: admin123');
    console.log('   Utilisateur Entreprise:', companyUser.email, '| Mot de passe: user123');
    console.log('🏢 Entreprise:', company.name);

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main(); 