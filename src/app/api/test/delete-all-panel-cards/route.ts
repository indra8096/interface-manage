import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Supprimer toutes les cartes de panel
    const deletedCards = await prisma.panelCard.deleteMany({});

    return NextResponse.json({ 
      message: 'Toutes les cartes de panel ont été supprimées',
      deletedCount: deletedCards.count
    });
  } catch (error) {
    console.error('Erreur lors de la suppression des cartes de panel:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression des cartes de panel' },
      { status: 500 }
    );
  }
}
