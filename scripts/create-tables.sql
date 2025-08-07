-- Créer la table companies si elle n'existe pas
CREATE TABLE IF NOT EXISTS "companies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- Créer la table global_cards si elle n'existe pas
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

-- Ajouter la colonne company_id à la table users si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'company_id') THEN
        ALTER TABLE "users" ADD COLUMN "company_id" INTEGER;
    END IF;
END $$;

-- Ajouter la colonne company_id à la table tasks si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'company_id') THEN
        ALTER TABLE "tasks" ADD COLUMN "company_id" INTEGER;
    END IF;
END $$;

-- Ajouter les contraintes de clé étrangère si elles n'existent pas
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