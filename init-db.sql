-- Création de la base de données
CREATE DATABASE taskmanager;

-- Connexion à la base de données
\c taskmanager;

-- Création de la table des tâches
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'warning',
    score INTEGER NOT NULL DEFAULT 5,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertion de données de test
INSERT INTO tasks (name, status, score, category) VALUES
('Sécuriser les accès réseau', 'warning', 8, 'defensive'),
('Configurer le pare-feu', 'error', 9, 'defensive'),
('Mettre à jour les antivirus', 'completed', 6, 'defensive'),
('Optimiser les performances', 'warning', 7, 'general'),
('Gérer les sauvegardes', 'completed', 5, 'general'),
('Maintenir les systèmes', 'warning', 6, 'general'),
('Analyser les vulnérabilités', 'error', 9, 'offensive'),
('Tester la pénétration', 'warning', 8, 'offensive'),
('Auditer la sécurité', 'completed', 7, 'offensive');

-- Création d'un index pour améliorer les performances
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_status ON tasks(status);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 