#!/bin/bash

# Script de démarrage automatique pour l'interface de gestion de tâches
# Ce script peut être ajouté au démarrage automatique du système

echo "🚀 Démarrage de l'interface de gestion de tâches..."

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker d'abord."
    exit 1
fi

# Vérifier si Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez installer Docker Compose d'abord."
    exit 1
fi

# Aller dans le répertoire de l'application
cd "$(dirname "$0")"

# Arrêter les conteneurs existants s'ils tournent
echo "🛑 Arrêt des conteneurs existants..."
docker-compose down

# Construire et démarrer les conteneurs
echo "🔨 Construction et démarrage des conteneurs..."
docker-compose up --build -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 10

# Vérifier le statut des conteneurs
echo "📊 Statut des conteneurs :"
docker-compose ps

# Afficher les logs pour vérifier que tout fonctionne
echo "📋 Logs des services :"
docker-compose logs --tail=20

echo "✅ Interface de gestion de tâches démarrée avec succès !"
echo "🌐 Accédez à l'application sur : http://localhost:3000"
echo "🗄️  Base de données PostgreSQL sur : localhost:5432"
echo ""
echo "📝 Commandes utiles :"
echo "  - Arrêter : docker-compose down"
echo "  - Voir les logs : docker-compose logs -f"
echo "  - Redémarrer : docker-compose restart" 