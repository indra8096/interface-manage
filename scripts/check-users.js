const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Vérification des utilisateurs existants...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        companyId: true
      }
    });
    
    console.log('📊 Utilisateurs trouvés:', users.length);
    users.forEach(user => {
      console.log(`👤 ID: ${user.id} | Email: ${user.email} | Rôle: ${user.role} | Company ID: ${user.companyId || 'N/A'}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
