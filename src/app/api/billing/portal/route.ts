import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Récupérer l'ID de l'entreprise depuis le token JWT ou la session
    const companyId = 1; // À remplacer par la logique d'authentification

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company || !company.stripeCustomerId) {
      return NextResponse.json(
        { error: 'Client Stripe non trouvé' },
        { status: 404 }
      );
    }

    // Créer une session du portail client Stripe
    const session = await stripe.billingPortal.sessions.create({
      customer: company.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing`,
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Erreur lors de la création du portail:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
