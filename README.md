# Interface de Gestion de Tâches

Une interface moderne de gestion de tâches développée avec Next.js, React, TypeScript et PostgreSQL.

## 🚀 Fonctionnalités

- **Gestion des tâches** par catégories (Défensif, Général, Offensive)
- **Statuts visuels** (Complété, Avertissement, Erreur)
- **Scores d'importance** (1-10)
- **Interface responsive** et moderne
- **Persistance des données** avec PostgreSQL
- **Déploiement Docker** automatisé

## 🛠️ Technologies utilisées

- **Frontend** : Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend** : Next.js API Routes
- **Base de données** : PostgreSQL
- **ORM** : Prisma
- **Conteneurisation** : Docker & Docker Compose
- **Animations** : Framer Motion

## 📋 Prérequis

- Docker
- Docker Compose

## 🚀 Déploiement rapide

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd 20.interface-manage
```

### 2. Démarrer l'application
```bash
# Rendre le script exécutable
chmod +x start.sh

# Démarrer l'application
./start.sh
```

### 3. Accéder à l'application
Ouvrez votre navigateur et allez sur : http://localhost:3000

## 🔧 Configuration automatique au démarrage

Pour que l'application se lance automatiquement au démarrage de votre machine :

### Sur Linux (systemd)

1. Créer un service systemd :
```bash
sudo nano /etc/systemd/system/task-manager.service
```

2. Ajouter le contenu suivant :
```ini
[Unit]
Description=Task Manager Interface
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
User=indra
WorkingDirectory=/home/indra/01.programmation/20.interface-manage
ExecStart=/home/indra/01.programmation/20.interface-manage/start.sh
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

3. Activer le service :
```bash
sudo systemctl daemon-reload
sudo systemctl enable task-manager.service
sudo systemctl start task-manager.service
```

### Vérifier le statut
```bash
sudo systemctl status task-manager.service
```

## 📊 Structure de la base de données

### Table `tasks`
- `id` : Identifiant unique (SERIAL PRIMARY KEY)
- `name` : Nom de la tâche (VARCHAR)
- `status` : Statut (completed/warning/error)
- `score` : Score d'importance (1-10)
- `category` : Catégorie (defensive/general/offensive)
- `created_at` : Date de création
- `updated_at` : Date de modification

## 🎨 Personnalisation

### Couleurs
Les couleurs peuvent être modifiées dans `tailwind.config.ts` :
- **Défensif** : Bleu (#2563eb)
- **Général** : Vert (#16a34a)
- **Offensive** : Rouge (#dc2626)

### Ajout de nouvelles catégories
1. Modifier `src/components/TaskColumn.tsx`
2. Ajouter la nouvelle catégorie dans `categoryColors` et `categoryTitles`
3. Mettre à jour `src/components/AddTaskModal.tsx`

## 🔍 Commandes utiles

```bash
# Voir les logs en temps réel
docker-compose logs -f

# Arrêter l'application
docker-compose down

# Redémarrer l'application
docker-compose restart

# Voir le statut des conteneurs
docker-compose ps

# Accéder à la base de données
docker-compose exec db psql -U taskuser -d taskmanager

# Sauvegarder la base de données
docker-compose exec db pg_dump -U taskuser taskmanager > backup.sql

# Restaurer la base de données
docker-compose exec -T db psql -U taskuser -d taskmanager < backup.sql
```

## 🐛 Dépannage

### L'application ne démarre pas
1. Vérifier que Docker est en cours d'exécution
2. Vérifier les logs : `docker-compose logs`
3. Vérifier que les ports 3000 et 5432 sont disponibles

### Problèmes de base de données
1. Redémarrer le conteneur de base de données : `docker-compose restart db`
2. Vérifier les logs de la base de données : `docker-compose logs db`

### Problèmes de persistance
1. Vérifier que le volume `postgres_data` existe : `docker volume ls`
2. Recréer le volume si nécessaire : `docker volume rm postgres_data`

## 📝 Notes de développement

- L'application utilise Prisma comme ORM
- Les données sont persistées dans un volume Docker
- L'application redémarre automatiquement en cas de crash
- Le build est optimisé pour la production avec Next.js standalone

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails. 