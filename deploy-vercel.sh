#!/bin/bash

# 🚀 Script de déploiement Vercel - Interface Manage
# Usage: ./deploy-vercel.sh

echo "🚀 Déploiement Vercel - Interface Manage"
echo "========================================"

# Vérifier si Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé"
    echo "📦 Installation de Vercel CLI..."
    npm install -g vercel
fi

# Vérifier si on est connecté à Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Connexion à Vercel..."
    vercel login
fi

# Build du projet
echo "🔨 Build du projet..."
npm run build

# Vérifier si le build a réussi
if [ $? -eq 0 ]; then
    echo "✅ Build réussi"
else
    echo "❌ Erreur lors du build"
    exit 1
fi

# Déploiement
echo "🚀 Déploiement en cours..."
vercel --prod

echo "🎉 Déploiement terminé !"
echo "📱 Votre application est maintenant en ligne"
echo "🔗 Page vitrine: https://your-domain.vercel.app/vitrine"
echo "🔗 Application: https://your-domain.vercel.app" 