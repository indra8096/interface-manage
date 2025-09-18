# Configuration des Méthodes de Paiement

## Configuration Stripe

### 1. Compte Stripe
- Créer un compte sur [https://dashboard.stripe.com](https://dashboard.stripe.com)
- Activer le mode test ou live selon vos besoins
- Récupérer les clés API dans les paramètres du développeur

### 2. Variables d'environnement
```env
# Clés Stripe (obtenez-les sur https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_votre_clé_secrète_stripe_ici
STRIPE_PUBLISHABLE_KEY=pk_test_votre_clé_publique_stripe_ici
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_webhook_stripe_ici
```

### 3. Configuration des produits et prix
- Dans le dashboard Stripe, créer les produits correspondant aux plans
- Créer les prix pour chaque plan (mensuel/annuel)
- Mettre à jour les IDs dans `src/lib/stripe.ts` :

```typescript
export const STRIPE_PLANS = {
  starter: {
    monthly: 'price_starter_monthly_id', // Remplacer par vos vrais IDs
    yearly: 'price_starter_yearly_id',
  },
  professional: {
    monthly: 'price_professional_monthly_id',
    yearly: 'price_professional_yearly_id',
  },
  enterprise: {
    monthly: 'price_enterprise_monthly_id',
    yearly: 'price_enterprise_yearly_id',
  },
};
```

### 4. Configuration du webhook
- Dans le dashboard Stripe, aller dans "Webhooks"
- Créer un endpoint pointant vers : `https://votre-domaine.com/api/subscriptions/webhook`
- Sélectionner les événements : `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Copier le secret du webhook dans `STRIPE_WEBHOOK_SECRET`

### 5. Compte bancaire de destination
- Dans le dashboard Stripe, aller dans "Payouts"
- Ajouter votre compte bancaire de destination
- Configurer la fréquence des virements (quotidien, hebdomadaire, mensuel)
- Stripe gère automatiquement les transferts vers votre compte bancaire

## Configuration PayPal

### 1. Compte PayPal Business
- Créer un compte PayPal Business sur [https://www.paypal.com/business](https://www.paypal.com/business)
- Vérifier votre compte et vos informations bancaires
- Activer l'API PayPal dans le dashboard développeur

### 2. Variables d'environnement
```env
# Clés PayPal (obtenez-les sur https://developer.paypal.com)
PAYPAL_CLIENT_ID=votre_client_id_paypal_ici
PAYPAL_CLIENT_SECRET=votre_client_secret_paypal_ici
PAYPAL_MODE=sandbox # ou 'live' pour la production
```

### 3. Configuration des plans d'abonnement
- Dans le dashboard PayPal, créer les plans d'abonnement
- Mettre à jour les IDs dans `src/lib/paypal.ts` :

```typescript
export const PAYPAL_PLANS = {
  starter: {
    monthly: 'P-starter-monthly', // Remplacer par vos vrais plan IDs
    yearly: 'P-starter-yearly',
  },
  professional: {
    monthly: 'P-professional-monthly',
    yearly: 'P-professional-yearly',
  },
  enterprise: {
    monthly: 'P-enterprise-monthly',
    yearly: 'P-enterprise-yearly',
  },
};
```

### 4. Configuration du webhook PayPal
- Dans le dashboard PayPal, aller dans "Webhooks"
- Créer un endpoint pointant vers : `https://votre-domaine.com/api/subscriptions/paypal-webhook`
- Sélectionner les événements : `BILLING.SUBSCRIPTION.ACTIVATED`, `BILLING.SUBSCRIPTION.CANCELLED`, `PAYMENT.SALE.COMPLETED`

### 5. Compte bancaire de destination
- Dans le dashboard PayPal, aller dans "Account Settings" > "Bank accounts and cards"
- Ajouter votre compte bancaire de destination
- PayPal gère automatiquement les transferts vers votre compte bancaire

## Configuration Email

### 1. Service SMTP
```env
# Configuration SMTP pour les emails automatiques
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_mot_de_passe_application
```

### 2. Alternatives SMTP
- **Gmail** : Utiliser un mot de passe d'application
- **SendGrid** : Service professionnel d'envoi d'emails
- **Mailgun** : Alternative populaire
- **Amazon SES** : Service AWS

## Sécurité

### 1. Variables d'environnement
- Ne jamais commiter le fichier `.env.local`
- Utiliser des clés différentes pour test/production
- Changer régulièrement les clés secrètes

### 2. Validation des webhooks
- Toujours vérifier les signatures des webhooks
- Utiliser HTTPS en production
- Loguer tous les événements de paiement

### 3. Gestion des erreurs
- Implémenter des retry policies
- Surveiller les échecs de paiement
- Notifier les administrateurs en cas de problème

## Test

### 1. Mode Test
- Utiliser les clés de test pour le développement
- Tester avec les cartes de test Stripe
- Utiliser le sandbox PayPal

### 2. Mode Production
- Vérifier tous les webhooks
- Tester avec de vrais petits montants
- Surveiller les logs de production

## Support

En cas de problème :
1. Vérifier les logs de l'application
2. Consulter les dashboards Stripe/PayPal
3. Vérifier la configuration des webhooks
4. Tester avec les outils de debug fournis
