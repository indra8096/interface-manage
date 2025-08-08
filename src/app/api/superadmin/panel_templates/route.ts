import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const templates = await prisma.panelCardTemplate.findMany({
      where: { isActive: true },
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
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const { name, type, category, description, priority } = body;

    // Créer le template
    const template = await prisma.panelCardTemplate.create({
      data: {
        name,
        type,
        category,
        description,
        priority: priority || 'Moyenne'
      }
    });

    // Récupérer toutes les entreprises
    const companies = await prisma.company.findMany();

    // Créer une instance pour chaque entreprise
    const instances = [];
    for (const company of companies) {
      const instance = await prisma.panelCardInstance.create({
        data: {
          templateId: template.id,
          companyId: company.id,
          total: 0,
          completed: 0,
          equipmentCount: 0,
          status: 'En cours',
          isActive: true
        }
      });
      instances.push(instance);
    }

    return NextResponse.json({ 
      message: 'Template créé avec succès',
      template,
      instancesCreated: instances.length
    });
  } catch (error) {
    console.error('Erreur lors de la création du template:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du template' },
      { status: 500 }
    );
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
