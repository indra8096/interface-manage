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
    const { id, total, completed, equipmentCount, status, certificationDate, nextAudit, deadline } = body;

    // Mettre à jour l'instance de la carte
    const instance = await prisma.panelCardInstance.update({
      where: { 
        id: parseInt(id),
        companyId: user.companyId // Sécurité : s'assurer que l'utilisateur modifie sa propre entreprise
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
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la carte:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la carte' },
      { status: 500 }
    );
  }
}
