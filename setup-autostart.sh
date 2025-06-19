#!/bin/bash

# Script de configuration du démarrage automatique
# Ce script configure l'application pour se lancer automatiquement au démarrage

echo "🔧 Configuration du démarrage automatique..."

# Vérifier si l'utilisateur est root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Ce script doit être exécuté en tant que root (sudo)"
    exit 1
fi

# Obtenir le chemin absolu du répertoire actuel
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
START_SCRIPT="$SCRIPT_DIR/start.sh"

# Créer le fichier de service systemd
cat > /etc/systemd/system/task-manager.service << EOF
[Unit]
Description=Task Manager Interface
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
User=indra
WorkingDirectory=$SCRIPT_DIR
ExecStart=$START_SCRIPT
RemainAfterExit=yes
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Rendre le script de démarrage exécutable
chmod +x "$START_SCRIPT"

# Recharger systemd
systemctl daemon-reload

# Activer le service
systemctl enable task-manager.service

echo "✅ Service configuré avec succès !"
echo ""
echo "📋 Commandes utiles :"
echo "  - Démarrer le service : sudo systemctl start task-manager.service"
echo "  - Arrêter le service : sudo systemctl stop task-manager.service"
echo "  - Voir le statut : sudo systemctl status task-manager.service"
echo "  - Voir les logs : sudo journalctl -u task-manager.service -f"
echo "  - Désactiver le service : sudo systemctl disable task-manager.service"
echo ""
echo "🚀 Le service se lancera automatiquement au prochain redémarrage de votre machine." 