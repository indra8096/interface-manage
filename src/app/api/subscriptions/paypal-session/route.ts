import { NextRequest, NextResponse } from 'next/server';
import { getPayPalSubscription } from '@/lib/paypal';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('subscription_id');

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID manquant' },
        { status: 400 }
      );
    }

    // Récupérer la souscription PayPal
    const paypalSubscription = await getPayPalSubscription(subscriptionId);

    if (!paypalSubscription) {
      return NextResponse.json(
        { error: 'Aucune souscription trouvée' },
        { status: 404 }
      );
    }

    // Récupérer les détails de l'entreprise
    const company = await prisma.company.findFirst({
      where: { paypalCustomerId: paypalSubscription.subscriber?.email_address },
      include: { subscription: true },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Entreprise non trouvée' },
        { status: 404 }
      );
    }

    // Récupérer l'utilisateur management admin
    const managementAdmin = await prisma.user.findFirst({
      where: { 
        companyId: company.id,
        role: 'MANAGEMENT_ADMIN'
      },
    });

    return NextResponse.json({
      companyName: company.name,
      email: company.email,
      plan: company.subscription?.plan,
      status: company.subscription?.status,
      managementAdmin: managementAdmin ? {
        email: managementAdmin.email,
        name: managementAdmin.name,
      } : null,
      credentialsGenerated: !!managementAdmin,
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la session PayPal:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
