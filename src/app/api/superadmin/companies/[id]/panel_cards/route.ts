import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification et le rôle
    const user = await verifyToken(request);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const companyId = parseInt(id);
    
    if (isNaN(companyId)) {
      return NextResponse.json({ error: 'ID de société invalide' }, { status: 400 });
    }

    // Récupérer les instances de cartes de l'entreprise
    const panelCardInstances = await prisma.panelCardInstance.findMany({
      where: { 
        companyId: companyId 
      },
      include: {
        template: true
      },
      orderBy: { 
        createdAt: 'desc' 
      }
    });

    // Transformer les données pour correspondre au format attendu
    const panelCards = panelCardInstances.map(instance => ({
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
    console.error('Erreur lors de la récupération des cartes de panel de l\'entreprise:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des cartes de panel' },
      { status: 500 }
    );
  }
}
