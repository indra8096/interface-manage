import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification et les permissions
    const user = await verifyToken(request);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer tous les templates de panel de suivi avec leurs instances
    const templates = await prisma.panelCardTemplate.findMany({
      include: {
        instances: {
          include: {
            company: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Erreur lors de la récupération des templates:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification et les permissions
    const user = await verifyToken(request);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Données reçues:', body);
    
    const { 
      name, 
      type, 
      category,
      description, 
      total, 
      completed, 
      equipmentCount, 
      status, 
      certificationDate, 
      nextAudit, 
      deadline 
    } = body;

    console.log('Category extraite:', category);

    // Validation des champs requis
    if (!name || !type || !category) {
      console.log('Validation échouée - name:', name, 'type:', type, 'category:', category);
      return NextResponse.json({ 
        error: 'Les champs name, type et category sont requis' 
      }, { status: 400 });
    }

    // Créer le template de panel de suivi
    const template = await prisma.panelCardTemplate.create({
      data: {
        name,
        type,
        category,
        description,
        isActive: true
      }
    });

    // Créer automatiquement des instances pour toutes les entreprises existantes
    const companies = await prisma.company.findMany();
    for (const company of companies) {
      await prisma.panelCardInstance.create({
        data: {
          templateId: template.id,
          companyId: company.id,
          total: total || 0,
          completed: completed || 0,
          equipmentCount: equipmentCount || 0,
          status: status || '',
          certificationDate: certificationDate || '',
          nextAudit: nextAudit || '',
          deadline: deadline || '',
          isActive: true
        }
      });
    }

    return NextResponse.json({ 
      message: 'Template créé avec succès',
      template 
    });
  } catch (error) {
    console.error('Erreur lors de la création du template:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, type, category, description, priority } = body;

    const template = await prisma.panelCardTemplate.update({
      where: { id: parseInt(id) },
      data: {
        name,
        type,
        category,
        description,
        priority
      }
    });

    return NextResponse.json({ 
      message: 'Template mis à jour avec succès',
      template
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du template:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du template' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    // Supprimer toutes les instances de ce template
    await prisma.panelCardInstance.deleteMany({
      where: { templateId: parseInt(id) }
    });

    // Supprimer le template
    await prisma.panelCardTemplate.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ 
      message: 'Template supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du template:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du template' },
      { status: 500 }
    );
  }
}
