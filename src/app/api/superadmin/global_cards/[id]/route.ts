import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const body = await request.json();
    const { name, description, category, type, priority, isActive } = body;

    // Vérifier que la carte existe
    const existingCard = await prisma.panelCardTemplate.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingCard) {
      return NextResponse.json({ error: 'Carte non trouvée' }, { status: 404 });
    }

    // Mettre à jour la carte
    const card = await prisma.panelCardTemplate.update({
      where: { id: parseInt(id) },
      data: {
        name: name || existingCard.name,
        description: description !== undefined ? description : existingCard.description,
        category: category || existingCard.category,
        type: type || existingCard.type,
        priority: priority || existingCard.priority,
        isActive: isActive !== undefined ? isActive : existingCard.isActive,
      }
    });

    return NextResponse.json({ card });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la carte:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la carte' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Vérifier que la carte existe
    const existingCard = await prisma.panelCardTemplate.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingCard) {
      return NextResponse.json({ error: 'Carte non trouvée' }, { status: 404 });
    }

    // Supprimer la carte
    await prisma.panelCardTemplate.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: 'Carte supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la carte:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la carte' },
      { status: 500 }
    );
  }
} 