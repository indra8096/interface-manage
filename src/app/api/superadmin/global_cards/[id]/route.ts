import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import jwt from 'jsonwebtoken';

// Middleware pour vérifier le token et le rôle
async function verifySuperAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as any;
    if (decoded.role !== 'SUPER_ADMIN') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

// PUT - Mettre à jour une carte globale
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifySuperAdmin(req);
  if (!user) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
  }

  const { id } = await params;
  const cardId = Number(id);

  if (!cardId) {
    return NextResponse.json({ error: 'ID de carte invalide' }, { status: 400 });
  }

  try {
    const { title, description, category, content, isActive } = await req.json();

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (content !== undefined) updateData.content = content;
    if (isActive !== undefined) updateData.isActive = isActive;

    const globalCard = await prisma.globalCard.update({
      where: { id: cardId },
      data: updateData
    });

    return NextResponse.json({ globalCard });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la carte globale:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer une carte globale
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifySuperAdmin(req);
  if (!user) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
  }

  const { id } = await params;
  const cardId = Number(id);

  if (!cardId) {
    return NextResponse.json({ error: 'ID de carte invalide' }, { status: 400 });
  }

  try {
    await prisma.globalCard.delete({
      where: { id: cardId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de la carte globale:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 