import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export async function initDatabase() {
  try {
    console.log('🔍 Initialisation automatique de la base de données...');
    
    // Vérifier si la base de données est vide
    const userCount = await prisma.user.count();
    console.log(`📊 Nombre d'utilisateurs dans la base: ${userCount}`);
    
    if (userCount === 0) {
      console.log('🆕 Base de données vide, création des données initiales...');
      
      // Créer le Super Admin
      const superAdminPassword = await bcrypt.hash('superadmin123', 10);
      const superAdmin = await prisma.user.create({
        data: {
          email: 'superadmin@example.com',
          password: superAdminPassword,
          role: 'SUPER_ADMIN'
        }
      });
      
      console.log('✅ Super Admin créé:', superAdmin.email);
      
      // Créer une entreprise par défaut
      const company = await prisma.company.create({
        data: {
          name: 'Entreprise par défaut'
        }
      });
      
      console.log('✅ Entreprise créée:', company.name);
      
      // Créer un admin d'entreprise
      const adminPassword = await bcrypt.hash('admin123', 10);
      const companyAdmin = await prisma.user.create({
        data: {
          email: 'admin@entreprise.com',
          password: adminPassword,
          role: 'COMPANY_ADMIN',
          companyId: company.id
        }
      });
      
      console.log('✅ Admin d\'entreprise créé:', companyAdmin.email);
      
      console.log('🎉 Base de données initialisée avec succès !');
      console.log('🔑 Identifiants de connexion:');
      console.log('   - Super Admin: superadmin@example.com / superadmin123');
      console.log('   - Admin Entreprise: admin@entreprise.com / admin123');
      
    } else {
      console.log('✅ Base de données déjà initialisée');
      
      // Vérifier que le superadmin existe
      const superAdmin = await prisma.user.findUnique({
        where: { email: 'superadmin@example.com' }
      });
      
      if (!superAdmin) {
        console.log('⚠️ Super Admin manquant, création...');
        const superAdminPassword = await bcrypt.hash('superadmin123', 10);
        await prisma.user.create({
          data: {
            email: 'superadmin@example.com',
            password: superAdminPassword,
            role: 'SUPER_ADMIN'
          }
        });
        console.log('✅ Super Admin créé');
      } else {
        console.log('✅ Super Admin existe déjà');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base:', error);
    // Ne pas faire échouer l'application si l'initialisation échoue
  }
}
