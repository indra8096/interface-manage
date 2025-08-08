import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est SUPER_ADMIN
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { name, description, category, icon, defaultScore, defaultImportance, isActive } = body;

    // Validation des données
    if (!name || !category) {
      return NextResponse.json({ error: 'Nom et catégorie requis' }, { status: 400 });
    }

    // Vérifier que la carte existe
    const existingCard = await prisma.globalCard.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingCard) {
      return NextResponse.json({ error: 'Carte non trouvée' }, { status: 404 });
    }

    // Mettre à jour la carte
    const card = await prisma.globalCard.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description: description || '',
        category,
        icon: icon || '🛡️',
        defaultScore: defaultScore || 5,
        defaultImportance: defaultImportance || 'Moyenne',
        isActive: isActive !== undefined ? isActive : true,
      }
    });

    return NextResponse.json({ card });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la carte globale:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la carte globale' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est SUPER_ADMIN
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { id } = await context.params;

    // Vérifier que la carte existe
    const existingCard = await prisma.globalCard.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingCard) {
      return NextResponse.json({ error: 'Carte non trouvée' }, { status: 404 });
    }

    // Supprimer la carte
    await prisma.globalCard.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de la carte globale:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la carte globale' },
      { status: 500 }
    );
  }
} 