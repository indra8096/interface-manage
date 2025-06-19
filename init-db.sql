-- Création de la base de données (seulement si elle n'existe pas)
SELECT 'CREATE DATABASE taskmanager'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'taskmanager')\gexec

-- Connexion à la base de données
\c taskmanager;

-- Création de la table des tâches (seulement si elle n'existe pas)
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'warning',
    score INTEGER NOT NULL DEFAULT 5,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion de données de test (seulement si la table est vide)
INSERT INTO tasks (name, status, score, category) 
SELECT * FROM (VALUES
    ('Sécuriser les accès réseau', 'warning', 8, 'defensive'),
    ('Configurer le pare-feu', 'error', 9, 'defensive'),
    ('Mettre à jour les antivirus', 'completed', 6, 'defensive'),
    ('Optimiser les performances', 'warning', 7, 'general'),
    ('Gérer les sauvegardes', 'completed', 5, 'general'),
    ('Maintenir les systèmes', 'warning', 6, 'general'),
    ('Analyser les vulnérabilités', 'error', 9, 'offensive'),
    ('Tester la pénétration', 'warning', 8, 'offensive'),
    ('Auditer la sécurité', 'completed', 7, 'offensive')
) AS v(name, status, score, category)
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