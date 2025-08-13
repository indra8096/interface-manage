import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est SUPER_ADMIN
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Récupérer tous les templates de cartes de services prédéfinis
    const panelCardTemplates = await prisma.panelCardTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    // Récupérer tous les templates de services prédéfinis
    const serviceTemplates = await prisma.serviceTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    // Récupérer les vraies cartes de services prédéfinis des entreprises
    const companies = await prisma.company.findMany({
      include: {
        panelCardInstances: {
          include: {
            template: true
          }
        },
        tasks: {
          where: {
            category: {
              in: ['defensive', 'general', 'offensive']
            }
          },
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            score: true,
            importance: true,
            status: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    // Combiner toutes les vraies cartes des entreprises
    const allCards = [
      ...panelCardTemplates.map(template => ({
        ...template,
        type: 'template',
        isRealCard: true
      })),
      ...serviceTemplates.map(template => ({
        ...template,
        type: 'service',
        isRealCard: true
      })),
      ...companies.flatMap(company => [
        ...company.panelCardInstances.map(instance => ({
          id: instance.id,
          name: instance.template.name,
          description: instance.template.description || '',
          category: instance.template.category || 'general',
          type: instance.template.type,
          isActive: instance.isActive,
          createdAt: instance.createdAt,
          updatedAt: instance.updatedAt,
          company: { id: company.id, name: company.name },
          isInstance: true,
          isRealCard: true
        })),
        ...company.tasks.map(task => ({
          id: task.id + 10000,
          name: task.name,
          description: task.description || '',
          category: task.category as 'defensive' | 'general' | 'offensive',
          icon: '🛡️',
          defaultScore: task.score,
          defaultImportance: task.importance,
          isActive: task.status !== 'completed',
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          company: { id: company.id, name: company.name },
          isTaskService: true,
          isRealCard: true
        }))
      ])
    ];

    // Récupérer aussi les statistiques globales de toutes les entreprises
    const companiesStats = await prisma.company.findMany({
      include: {
        _count: {
          select: {
            users: true,
            tasks: true
          }
        }
      }
    });

    return NextResponse.json({ 
      cards: allCards,
      globalStats: {
        totalCompanies: companiesStats.length,
        totalUsers: companiesStats.reduce((sum, company) => sum + company._count.users, 0),
        totalTasks: companiesStats.reduce((sum, company) => sum + company._count.tasks, 0)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des cartes globales:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des cartes globales' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est SUPER_ADMIN
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, category, type, priority } = body;

    // Validation des données
    if (!name || !category || !type) {
      return NextResponse.json({ error: 'Nom, catégorie et type requis' }, { status: 400 });
    }

    // Créer le nouveau template de carte
    const card = await prisma.panelCardTemplate.create({
      data: {
        name,
        description: description || '',
        category,
        type,
        priority: priority || 'Moyenne',
        isActive: true,
      }
    });

    return NextResponse.json({ card });
  } catch (error) {
    console.error('Erreur lors de la création de la carte globale:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la carte globale' },
      { status: 500 }
    );
  }
} 