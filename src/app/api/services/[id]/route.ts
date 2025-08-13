import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const templateId = parseInt(id);

    const template = await prisma.serviceTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      return NextResponse.json({ error: 'Template non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Erreur lors de la récupération du template:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const templateId = parseInt(id);

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
