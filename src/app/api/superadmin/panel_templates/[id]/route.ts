import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification et les permissions
    const user = await verifyToken(request);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = params;
    const templateId = parseInt(id);
    const body = await request.json();
    const { 
      name, 
      type, 
      description, 
      total, 
      completed, 
      equipmentCount, 
      status, 
      certificationDate, 
      nextAudit, 
      deadline 
    } = body;

    // Mettre à jour le template de panel de suivi
    const updatedTemplate = await prisma.panelCardTemplate.update({
      where: { id: templateId },
      data: {
        name,
        type,
        category: 'defensive', // Valeur par défaut temporaire
        description
      }
    });

    // Mettre à jour toutes les instances de ce template
    await prisma.panelCardInstance.updateMany({
      where: { templateId: templateId },
      data: {
        total: total || 0,
        completed: completed || 0,
        equipmentCount: equipmentCount || 0,
        status: status || '',
        certificationDate: certificationDate || '',
        nextAudit: nextAudit || '',
        deadline: deadline || ''
      }
    });

    return NextResponse.json({ 
      message: 'Template mis à jour avec succès',
      template: updatedTemplate 
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du template:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification et les permissions
    const user = await verifyToken(request);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = params;
    const templateId = parseInt(id);

    // Supprimer toutes les instances de ce template d'abord
    await prisma.panelCardInstance.deleteMany({
      where: { templateId: templateId }
    });

    // Puis supprimer le template
    await prisma.panelCardTemplate.delete({
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
