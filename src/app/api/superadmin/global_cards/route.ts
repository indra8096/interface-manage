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
    const cards = await prisma.globalCard.findMany({
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

    // Récupérer aussi les tâches qui servent de services prédéfinis pour chaque entreprise
    const taskServices = await prisma.task.findMany({
      where: {
        category: {
          in: ['defensive', 'general', 'offensive']
        }
      },
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

    // Combiner les cartes globales avec les tâches-services
    const allCards = [
      ...cards,
      ...taskServices.map(task => ({
        id: task.id + 10000, // ID unique pour éviter les conflits
        name: task.name,
        description: task.description || '',
        category: task.category as 'defensive' | 'general' | 'offensive',
        icon: '🛡️',
        defaultScore: task.score,
        defaultImportance: task.importance,
        isActive: task.status !== 'completed',
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        company: task.company,
        isTaskService: true // Marqueur pour identifier les services basés sur des tâches
      }))
    ];

    // Récupérer aussi les statistiques globales de toutes les entreprises
    const companies = await prisma.company.findMany({
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
        totalCompanies: companies.length,
        totalUsers: companies.reduce((sum, company) => sum + company._count.users, 0),
        totalTasks: companies.reduce((sum, company) => sum + company._count.tasks, 0)
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