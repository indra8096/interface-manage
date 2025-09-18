const clientId = process.env.PAYPAL_CLIENT_ID!;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
const mode = process.env.PAYPAL_MODE as 'sandbox' | 'live';

if (!clientId || !clientSecret) {
  console.warn('PayPal credentials are not set - PayPal functionality will be limited');
}

export const PAYPAL_MODE = mode;
export const PAYPAL_CLIENT_ID = clientId;
export const PAYPAL_CLIENT_SECRET = clientSecret;

// Configuration PayPal
export const PAYPAL_CONFIG = {
  clientId,
  clientSecret,
  environment: mode === 'live' ? 'production' : 'sandbox',
  baseUrl: mode === 'live' 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com'
};

// Plans PayPal (à créer dans le dashboard PayPal)
export const PAYPAL_PLANS = {
  starter: {
    monthly: 'P-starter-monthly', // À remplacer par vos vrais plan IDs
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
} as const;

export type PayPalPlan = keyof typeof PAYPAL_PLANS;

// Fonctions utilitaires PayPal
export async function getPayPalAccessToken(): Promise<string> {
  const response = await fetch(`${PAYPAL_CONFIG.baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-Language': 'en_US',
      'Authorization': `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`Erreur PayPal: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

export async function createPayPalSubscription(planId: string, customerEmail: string, companyName: string) {
  const accessToken = await getPayPalAccessToken();
  
  const subscriptionData = {
    plan_id: planId,
    subscriber: {
      email_address: customerEmail,
      name: {
        given_name: companyName,
        surname: 'Company'
      }
    },
    application_context: {
      brand_name: 'Drelto',
      locale: 'fr-FR',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'SUBSCRIBE_NOW',
      payment_method: {
        payer_selected: 'PAYPAL',
        payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
      },
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/souscrire`
    }
  };

  const response = await fetch(`${PAYPAL_CONFIG.baseUrl}/v1/billing/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'PayPal-Request-Id': `subscription-${Date.now()}`,
    },
    body: JSON.stringify(subscriptionData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Erreur création souscription PayPal: ${JSON.stringify(errorData)}`);
  }

  return await response.json();
}

export async function getPayPalSubscription(subscriptionId: string) {
  const accessToken = await getPayPalAccessToken();
  
  const response = await fetch(`${PAYPAL_CONFIG.baseUrl}/v1/billing/subscriptions/${subscriptionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur récupération souscription PayPal: ${response.status}`);
  }

  return await response.json();
}
export type BillingCycle = 'monthly' | 'yearly';
