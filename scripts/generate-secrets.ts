#!/usr/bin/env tsx

/**
 * Script de génération de clés seccurisées pour la production
 * Usage: npm run generate-secrets
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

console.log('🔐 Génération de clés secrètes sécurisées...\n');

// Générer une clé JWT sécurisée
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('✅ JWT_SECRET généré:');
console.log(jwtSecret);
console.log();

// Générer une clé de chiffrement pour les cookies
const cookieSecret = crypto.randomBytes(32).toString('hex');
console.log('✅ COOKIE_SECRET généré:');
console.log(cookieSecret);
console.log();

// Générer une clé API
const apiKey = crypto.randomBytes(32).toString('base64url');
console.log('✅ API_KEY généré:');
console.log(apiKey);
console.log();

// Générer une clé de monitoring
const monitoringKey = crypto.randomBytes(24).toString('base64url');
console.log('✅ MONITORING_API_KEY généré:');
console.log(monitoringKey);
console.log();

// Créer le contenu du fichier .env.local
const envContent = `# Configuration de sécurité générée automatiquement
# Généré le: ${new Date().toISOString()}

# === SÉCURITÉ CRITIQUE ===
JWT_SECRET=${jwtSecret}
COOKIE_SECRET=${cookieSecret}

# === BASE DE DONNÉES ===
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# === ENVIRONNEMENT ===
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://votre-domaine.com

# === SÉCURITÉ SUPPLÉMENTAIRE ===
API_KEY=${apiKey}
MONITORING_API_KEY=${monitoringKey}

# === VÉRIFICATION GOOGLE ===
GOOGLE_SITE_VERIFICATION=votre_code_verification_ici

# === LOGGING ET MONITORING ===
LOG_SERVICE_URL=https://votre-service-logging.com

# === RATE LIMITING ===
MAX_LOGIN_ATTEMPTS=5
LOGIN_ATTEMPT_WINDOW=900000

# === SESSION ===
SESSION_DURATION=604800

# === CORS ===
ALLOWED_ORIGINS=https://votre-domaine.com,https://www.votre-domaine.com

# === INSTRUCTIONS ===
# 1. Vérifiez que ce fichier n'est PAS dans Git
# 2. Stockez ces clés de manière sécurisée
# 3. Changez ces clés régulièrement
# 4. Utilisez HTTPS en production
`;

// Vérifier si .env.local existe déjà
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log('⚠️  Le fichier .env.local existe déjà!');
  console.log('Voulez-vous le remplacer? (y/N)');
  
  // En mode non-interactif, créer un fichier .env.local.new
  const newEnvPath = path.join(process.cwd(), '.env.local.new');
  fs.writeFileSync(newEnvPath, envContent);
  console.log(`\n📝 Nouveau fichier créé: .env.local.new`);
  console.log('Renommez-le en .env.local après vérification');
} else {
  // Créer le fichier .env.local
  fs.writeFileSync(envPath, envContent);
  console.log('📝 Fichier .env.local créé avec succès!');
}

console.log('\n🔒 INSTRUCTIONS DE SÉCURITÉ:');
console.log('1. Vérifiez que .env.local est dans votre .gitignore');
console.log('2. Stockez ces clés de manière sécurisée');
console.log('3. Changez ces clés régulièrement');
console.log('4. Utilisez HTTPS en production');
console.log('5. Surveillez vos logs de sécurité');
console.log('\n✅ Génération terminée!');
