import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set - Stripe functionality will be limited');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2025-08-27.basil',
  typescript: true,
});

export const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_dummy';
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy';

// Plans Stripe (à créer dans le dashboard Stripe)
export const STRIPE_PLANS = {
  starter: {
    monthly: 'price_starter_monthly', // À remplacer par vos vrais price IDs
    yearly: 'price_starter_yearly',
  },
  professional: {
    monthly: 'price_professional_monthly',
    yearly: 'price_professional_yearly',
  },
  enterprise: {
    monthly: 'price_enterprise_monthly',
    yearly: 'price_enterprise_yearly',
  },
} as const;

export type StripePlan = keyof typeof STRIPE_PLANS;
export type BillingCycle = 'monthly' | 'yearly';
