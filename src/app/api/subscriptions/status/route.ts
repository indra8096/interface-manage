import { NextRequest, NextResponse } from 'next/server';
import { checkSubscriptionStatus, checkUserLimit } from '@/lib/subscription';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Récupérer l'ID de l'entreprise depuis le token JWT ou la session
    // Pour l'instant, on utilise un paramètre de test
    const companyId = 1; // À remplacer par la logique d'authentification

    const subscription = await checkSubscriptionStatus(companyId);
    const userLimit = await checkUserLimit(companyId);

    return NextResponse.json({
      ...subscription,
      currentUsers: userLimit.currentUsers,
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du statut:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
