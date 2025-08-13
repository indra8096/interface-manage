import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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