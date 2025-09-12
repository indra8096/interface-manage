# Interface de Gestion de Tâches

## À propos de l'application

Cette application web est une interface de gestion de tâches spécialement conçue pour organiser et suivre des activités de cybersécurité. Elle permet de catégoriser les tâches selon leur nature (défensive, générale ou offensive), de leur attribuer des niveaux d'importance et de suivre leur progression avec des statuts visuels clairs.

L'interface offre une expérience utilisateur moderne et intuitive pour gérer efficacement un workflow de cybersécurité, avec une persistance des données et un déploiement simplifié via Docker.

## Fonctionnalités

- **Gestion des tâches** par catégories (Défensif, Général, Offensive)
- **Statuts visuels** (Complété, Avertissement, Erreur)
- **Scores d'importance** (1-10)
- **Interface responsive** et moderne
- **Persistance des données** avec PostgreSQL

## Technologies utilisées

- **Frontend** : Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend** : Next.js API Routes
- **Base de données** : PostgreSQL
- **ORM** : Prisma
- **Conteneurisation** : Docker & Docker Compose
- **Animations** : Framer Motion



## Structure de la base de données

### Table `tasks`
- `id` : Identifiant unique (SERIAL PRIMARY KEY)
- `name` : Nom de la tâche (VARCHAR)
- `status` : Statut (completed/warning/error)
- `score` : Score d'importance (1-10)
- `category` : Catégorie (defensive/general/offensive)
- `created_at` : Date de création
- `updated_at` : Date de modification



### Ajout de nouvelles catégories
1. Modifier `src/components/TaskColumn.tsx`
2. Ajouter la nouvelle catégorie dans `categoryColors` et `categoryTitles`
3. Mettre à jour `src/components/AddTaskModal.tsx`



## Notes de développement

- L'application utilise Prisma comme ORM
- Les données sont persistées dans un volume Docker
- L'application redémarre automatiquement en cas de crash
- Le build est optimisé pour la production avec Next.js standalone
