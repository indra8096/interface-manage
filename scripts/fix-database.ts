import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDatabase() {
  try {
    console.log('🔧 Correction de la base de données...');
    
    // Créer la table companies
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "companies" (
        "id" SERIAL NOT NULL,
        "name" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('✅ Table companies créée');
    
    // Créer la table global_cards
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "global_cards" (
        "id" SERIAL NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "category" TEXT NOT NULL,
        "content" JSONB NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "global_cards_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('✅ Table global_cards créée');
    
    // Ajouter la colonne company_id à users
    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'company_id') THEN
          ALTER TABLE "users" ADD COLUMN "company_id" INTEGER;
        END IF;
      END $$;
    `);
    console.log('✅ Colonne company_id ajoutée à users');
    
    // Ajouter la colonne company_id à tasks
    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'company_id') THEN
          ALTER TABLE "tasks" ADD COLUMN "company_id" INTEGER;
        END IF;
      END $$;
    `);
    console.log('✅ Colonne company_id ajoutée à tasks');
    
    // Ajouter les contraintes de clé étrangère
    await prisma.$executeRawUnsafe(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'users_company_id_fkey') THEN
          ALTER TABLE "users" ADD CONSTRAINT "users_company_id_fkey" 
          FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'tasks_company_id_fkey') THEN
          ALTER TABLE "tasks" ADD CONSTRAINT "tasks_company_id_fkey" 
          FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
      END $$;
    `);
    console.log('✅ Contraintes de clé étrangère ajoutées');
    
    // Vérifier que les tables existent maintenant
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('📋 Tables existantes:', tables);
    
    // Tester l'accès aux tables
    try {
      await prisma.$queryRaw`SELECT COUNT(*) as count FROM companies`;
      console.log('✅ Table companies accessible');
    } catch (error) {
      console.log('❌ Table companies non accessible:', error);
    }
    
    try {
      const users = await prisma.user.findMany();
      console.log('✅ Table users accessible, nombre d\'utilisateurs:', users.length);
    } catch (error) {
      console.log('❌ Table users non accessible:', error);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDatabase(); 