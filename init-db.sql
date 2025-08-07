-- Création de la base de données (seulement si elle n'existe pas)
SELECT 'CREATE DATABASE taskmanager'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'taskmanager')\gexec

-- Connexion à la base de données
\c taskmanager;

-- Création des tables
CREATE TABLE IF NOT EXISTS "companies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'COMPANY_USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" INTEGER,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_email_key" UNIQUE ("email")
);

CREATE TABLE IF NOT EXISTS "tasks" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'warning',
    "score" INTEGER NOT NULL DEFAULT 5,
    "importance" TEXT NOT NULL DEFAULT 'Moyenne',
    "dueDate" TIMESTAMP(3),
    "assignedTo" TEXT,
    "category" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "company_id" INTEGER,
    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

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

-- Ajout des contraintes de clé étrangère
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_fkey" 
    FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "tasks" ADD CONSTRAINT "tasks_company_id_fkey" 
    FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Insertion des données initiales
INSERT INTO "companies" ("name") VALUES ('Société 1') ON CONFLICT DO NOTHING;

-- Récupération de l'ID de la société
DO $$
DECLARE
    company_id INTEGER;
BEGIN
    SELECT id INTO company_id FROM companies WHERE name = 'Société 1' LIMIT 1;
    
    -- Création du Super Admin
    INSERT INTO "users" ("email", "password", "role") 
    VALUES ('superadmin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'SUPER_ADMIN')
    ON CONFLICT (email) DO NOTHING;
    
    -- Création de l'admin de l'entreprise
    INSERT INTO "users" ("email", "password", "role", "company_id") 
    VALUES ('admin@societe1.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'COMPANY_ADMIN', company_id)
    ON CONFLICT (email) DO NOTHING;
    
    -- Création de l'utilisateur de l'entreprise
    INSERT INTO "users" ("email", "password", "role", "company_id") 
    VALUES ('user@societe1.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'COMPANY_USER', company_id)
    ON CONFLICT (email) DO NOTHING;
END $$;

-- Création d'un index pour améliorer les performances (seulement s'il n'existe pas)
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour automatiquement updated_at (seulement s'il n'existe pas)
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 