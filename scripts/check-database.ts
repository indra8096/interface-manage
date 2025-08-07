import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Vérification de la base de données...\n');
    
    // Vérifier les entreprises
    const companies = await prisma.company.findMany({
      include: {
        users: true,
        tasks: true
      }
    });
    
    console.log('📊 ENTREPRISES:');
    companies.forEach(company => {
      console.log(`  🏢 ${company.name} (ID: ${company.id})`);
      console.log(`    👥 Utilisateurs: ${company.users.length}`);
      company.users.forEach(user => {
        console.log(`      - ${user.email} (${user.role})`);
      });
      console.log(`    📋 Tâches: ${company.tasks.length}`);
      console.log('');
    });
    
    // Vérifier tous les utilisateurs
    const allUsers = await prisma.user.findMany({
      include: {
        company: true
      }
    });
    
    console.log('👥 TOUS LES UTILISATEURS:');
    allUsers.forEach(user => {
      const companyName = user.company ? user.company.name : 'Aucune société';
      console.log(`  - ${user.email} (${user.role}) - Société: ${companyName}`);
    });
    
    console.log('\n📈 STATISTIQUES:');
    console.log(`  Total entreprises: ${companies.length}`);
    console.log(`  Total utilisateurs: ${allUsers.length}`);
    console.log(`  Super Admins: ${allUsers.filter(u => u.role === 'SUPER_ADMIN').length}`);
    console.log(`  Company Admins: ${allUsers.filter(u => u.role === 'COMPANY_ADMIN').length}`);
    console.log(`  Company Users: ${allUsers.filter(u => u.role === 'COMPANY_USER').length}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase(); 