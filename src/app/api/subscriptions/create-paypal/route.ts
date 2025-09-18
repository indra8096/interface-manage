import { NextRequest, NextResponse } from 'next/server';
import { createPayPalSubscription, PAYPAL_PLANS } from '@/lib/paypal';
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
    if (!PAYPAL_PLANS[plan as keyof typeof PAYPAL_PLANS]) {
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

    // Créer l'abonnement en base de données (en attente)
    const subscription = await prisma.subscription.create({
      data: {
        companyId: company.id,
        plan: plan,
        status: 'pending',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
      },
    });

    // Obtenir l'ID du plan PayPal
    const planId = PAYPAL_PLANS[plan as keyof typeof PAYPAL_PLANS][billingCycle as 'monthly' | 'yearly'];
    
    // Créer la souscription PayPal
    const paypalSubscription = await createPayPalSubscription(
      planId,
      companyData.contactEmail,
      companyData.companyName
    );

    // Mettre à jour l'abonnement avec l'ID PayPal
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { paypalSubscriptionId: paypalSubscription.id },
    });

    // Mettre à jour l'entreprise avec l'ID client PayPal
    await prisma.company.update({
      where: { id: company.id },
      data: { paypalCustomerId: paypalSubscription.subscriber?.email_address },
    });

    // Retourner l'URL d'approbation PayPal
    const approvalUrl = paypalSubscription.links?.find((link: any) => link.rel === 'approve')?.href;

    if (!approvalUrl) {
      return NextResponse.json(
        { error: 'URL d\'approbation PayPal non trouvée' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      approvalUrl: approvalUrl,
      subscriptionId: paypalSubscription.id,
      companyId: company.id,
    });

  } catch (error) {
    console.error('Erreur lors de la création de la souscription PayPal:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
