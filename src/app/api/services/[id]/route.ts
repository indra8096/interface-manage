import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification et les permissions
    const user = await verifyToken(request);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const templateId = parseInt(id);

    // Supprimer le template de service
    await prisma.serviceTemplate.delete({
      where: { id: templateId }
    });

    return NextResponse.json({ 
      message: 'Template supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du template:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 