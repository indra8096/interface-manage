import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('🔍 Test de connexion à la base de données...');
    
    // Test de connexion simple
    await prisma.$connect();
    console.log('✅ Connexion réussie');
    
    // Vérifier les tables existantes
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('📋 Tables existantes:', tables);
    
    // Tester si la table companies existe
    try {
      const companies = await prisma.company.findMany();
      console.log('✅ Table companies accessible, nombre d\'entreprises:', companies.length);
    } catch (error) {
      console.log('❌ Table companies non accessible:', error);
    }
    
    // Tester si la table users existe
    try {
      const users = await prisma.user.findMany();
      console.log('✅ Table users accessible, nombre d\'utilisateurs:', users.length);
    } catch (error) {
      console.log('❌ Table users non accessible:', error);
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase(); 