import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID manquant' },
        { status: 400 }
      );
    }

    // Récupérer la session Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });

    if (!session.subscription) {
      return NextResponse.json(
        { error: 'Aucun abonnement trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les détails de l'entreprise
    const company = await prisma.company.findFirst({
      where: { stripeCustomerId: session.customer as string },
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
      billingCycle: session.metadata?.billingCycle,
      status: company.subscription?.status,
      managementAdmin: managementAdmin ? {
        email: managementAdmin.email,
        name: managementAdmin.name,
        // Note: Le mot de passe n'est pas retourné pour des raisons de sécurité
        // Il est envoyé par email uniquement
      } : null,
      credentialsGenerated: !!managementAdmin, // Indique si les identifiants ont été générés
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
