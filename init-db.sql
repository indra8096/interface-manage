-- Création de la base de données (seulement si elle n'existe pas)
SELECT 'CREATE DATABASE taskmanager'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'taskmanager')\gexec

-- Connexion à la base de données
\c taskmanager;

-- Création de la table des tâches (seulement si elle n'existe pas)
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'warning',
    score INTEGER NOT NULL DEFAULT 5,
    importance VARCHAR(50) DEFAULT 'Moyenne',
    due_date TIMESTAMP,
    assigned_to VARCHAR(255),
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table des utilisateurs (seulement si elle n'existe pas)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion de données de test (seulement si la table est vide)
INSERT INTO tasks (name, description, status, score, importance, category) 
SELECT * FROM (VALUES
    ('Sécuriser les accès réseau', 'Mise en place de la sécurité réseau', 'warning', 8, 'Élevée', 'defensive'),
    ('Configurer le pare-feu', 'Configuration du pare-feu d''entreprise', 'error', 9, 'Élevée', 'defensive'),
    ('Mettre à jour les antivirus', 'Mise à jour des logiciels antivirus', 'completed', 6, 'Moyenne', 'defensive'),
    ('Optimiser les performances', 'Optimisation des performances système', 'warning', 7, 'Moyenne', 'general'),
    ('Gérer les sauvegardes', 'Gestion des sauvegardes automatiques', 'completed', 5, 'Faible', 'general'),
    ('Maintenir les systèmes', 'Maintenance préventive des systèmes', 'warning', 6, 'Moyenne', 'general'),
    ('Analyser les vulnérabilités', 'Analyse des vulnérabilités système', 'error', 9, 'Élevée', 'offensive'),
    ('Tester la pénétration', 'Tests de pénétration réseau', 'warning', 8, 'Élevée', 'offensive'),
    ('Auditer la sécurité', 'Audit de sécurité complet', 'completed', 7, 'Moyenne', 'offensive')
) AS v(name, description, status, score, importance, category)
WHERE NOT EXISTS (SELECT 1 FROM tasks LIMIT 1);

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