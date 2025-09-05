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
    if (!user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Récupérer les instances de cartes pour l'entreprise de l'utilisateur
    const instances = await prisma.panelCardInstance.findMany({
      where: { 
        companyId: user.companyId,
        isActive: true
      },
      include: {
        template: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Formater les données pour être compatibles avec l'interface existante
    const panelCards = instances.map(instance => ({
      id: instance.id,
      name: instance.template.name,
      type: instance.template.type,
      category: instance.template.category,
      description: instance.template.description,
      priority: instance.template.priority,
      total: instance.total,
      completed: instance.completed,
      equipmentCount: instance.equipmentCount,
      status: instance.status,
      certificationDate: instance.certificationDate,
      nextAudit: instance.nextAudit,
      deadline: instance.deadline,
      isActive: instance.isActive
    }));

    return NextResponse.json({ panelCards });
  } catch (error) {
    console.error('Erreur lors de la récupération des cartes de panel:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des cartes de panel' },
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
    if (!user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Seuls les COMPANY_ADMIN peuvent créer de nouvelles cartes
    if (user.role !== 'COMPANY_ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      name, 
      type, 
      category, 
      total, 
      completed, 
      equipmentCount, 
      status, 
      certificationDate, 
      nextAudit, 
      priority, 
      description, 
      deadline 
    } = body;

    // Validation des données
    if (!name || !type || !category) {
      return NextResponse.json({ error: 'Nom, type et catégorie requis' }, { status: 400 });
    }

    // Créer d'abord le template
    const template = await prisma.panelCardTemplate.create({
      data: {
        name,
        type,
        category,
        description: description || '',
        priority: priority || 'Moyenne',
        isActive: true
      }
    });

    // Créer l'instance pour l'entreprise de l'admin
    const instance = await prisma.panelCardInstance.create({
      data: {
        templateId: template.id,
        companyId: user.companyId!,
        total: total || 0,
        completed: completed || 0,
        equipmentCount: equipmentCount || 0,
        status: status || '',
        certificationDate: certificationDate || '',
        nextAudit: nextAudit || '',
        deadline: deadline || '',
        isActive: true
      },
      include: {
        template: true
      }
    });

    // Retourner la carte créée
    return NextResponse.json({ 
      message: 'Carte de panel créée avec succès',
      panelCard: {
        id: instance.id,
        name: instance.template.name,
        type: instance.template.type,
        category: instance.template.category,
        description: instance.template.description,
        priority: instance.template.priority,
        total: instance.total,
        completed: instance.completed,
        equipmentCount: instance.equipmentCount,
        status: instance.status,
        certificationDate: instance.certificationDate,
        nextAudit: instance.nextAudit,
        deadline: instance.deadline,
        isActive: instance.isActive
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la carte de panel:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la carte de panel' },
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
    if (!user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, total, completed, equipmentCount, status, certificationDate, nextAudit, deadline, description, priority } = body;

    // Récupérer d'abord l'instance pour obtenir le templateId
    const instance = await prisma.panelCardInstance.findUnique({
      where: { 
        id: parseInt(id),
        companyId: user.companyId // Sécurité : s'assurer que l'utilisateur modifie sa propre entreprise
      },
      include: {
        template: true
      }
    });

    if (!instance) {
      return NextResponse.json({ error: 'Carte non trouvée' }, { status: 404 });
    }

    // Mettre à jour le template (nom, description, priorité)
    if (name || description !== undefined || priority !== undefined) {
      await prisma.panelCardTemplate.update({
        where: { id: instance.templateId },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(priority !== undefined && { priority })
        }
      });
    }

    // Mettre à jour l'instance de la carte
    const updatedInstance = await prisma.panelCardInstance.update({
      where: { 
        id: parseInt(id),
        companyId: user.companyId
      },
      data: {
        total,
        completed,
        equipmentCount,
        status,
        certificationDate,
        nextAudit,
        deadline
      },
      include: {
        template: true
      }
    });

    return NextResponse.json({ 
      message: 'Carte mise à jour avec succès',
      panelCard: {
        id: updatedInstance.id,
        name: updatedInstance.template.name,
        type: updatedInstance.template.type,
        category: updatedInstance.template.category,
        description: updatedInstance.template.description,
        priority: updatedInstance.template.priority,
        total: updatedInstance.total,
        completed: updatedInstance.completed,
        equipmentCount: updatedInstance.equipmentCount,
        status: updatedInstance.status,
        certificationDate: updatedInstance.certificationDate,
        nextAudit: updatedInstance.nextAudit,
        deadline: updatedInstance.deadline,
        isActive: updatedInstance.isActive
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la carte:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la carte' },
      { status: 500 }
    );
  }
}
