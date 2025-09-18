import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_PLANS } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { 
      companyData, 
      plan, 
      billingCycle, 
      paymentMethod 
    } = await request.json();

    // Validation des données
    if (!companyData || !plan || !billingCycle || !paymentMethod) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    // Vérifier que le plan existe
    if (!STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS]) {
      return NextResponse.json(
        { error: 'Plan invalide' },
        { status: 400 }
      );
    }

    // Créer l'entreprise en base de données
    const company = await prisma.company.create({
      data: {
        name: companyData.companyName,
        email: companyData.contactEmail,
        contactName: companyData.contactName,
        phone: companyData.phone || null,
        address: companyData.address,
        city: companyData.city,
        postalCode: companyData.postalCode,
        country: companyData.country,
      },
    });

    // Créer un client Stripe
    const customer = await stripe.customers.create({
      email: companyData.contactEmail,
      name: companyData.companyName,
      metadata: {
        companyId: company.id.toString(),
      },
    });

    // Mettre à jour l'entreprise avec l'ID client Stripe
    await prisma.company.update({
      where: { id: company.id },
      data: { stripeCustomerId: customer.id },
    });

    // Créer une session Stripe Checkout
    const priceId = STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS][billingCycle as 'monthly' | 'yearly'];
    
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/souscrire`,
      metadata: {
        companyId: company.id.toString(),
        plan,
        billingCycle,
      },
    });

    // Retourner l'ID de session pour la redirection
    return NextResponse.json({
      success: true,
      sessionId: session.id,
      companyId: company.id,
    });

  } catch (error) {
    console.error('Erreur lors de la création de la souscription:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
