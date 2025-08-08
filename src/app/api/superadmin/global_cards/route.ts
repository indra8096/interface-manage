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

    // Récupérer toutes les cartes de services prédéfinis de toutes les entreprises
    const globalCards = await prisma.globalCard.findMany({
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Récupérer les vraies cartes de services prédéfinis des entreprises
    const companies = await prisma.company.findMany({
      include: {
        globalCards: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            icon: true,
            defaultScore: true,
            defaultImportance: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
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
      ...globalCards,
      ...companies.flatMap(company => [
        ...company.globalCards.map(card => ({
          ...card,
          company: { id: company.id, name: company.name },
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
    const { name, description, category, icon, defaultScore, defaultImportance } = body;

    // Validation des données
    if (!name || !category) {
      return NextResponse.json({ error: 'Nom et catégorie requis' }, { status: 400 });
    }

    // Créer la nouvelle carte globale
    const card = await prisma.globalCard.create({
      data: {
        name,
        description: description || '',
        category,
        icon: icon || '🛡️',
        defaultScore: defaultScore || 5,
        defaultImportance: defaultImportance || 'Moyenne',
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