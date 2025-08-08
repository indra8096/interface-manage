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

    // Récupérer toutes les cartes du panneau de toutes les entreprises
    const panelCards = await prisma.panelCard.findMany({
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

    // Récupérer les vraies données de suivi des entreprises (tâches par catégorie)
    const companies = await prisma.company.findMany({
      include: {
        tasks: {
          select: {
            id: true,
            name: true,
            status: true,
            category: true,
            score: true,
            importance: true,
            createdAt: true
          }
        }
      }
    });

    // Créer des cartes de suivi intelligentes basées sur les vraies données
    const intelligentCards = companies.flatMap(company => {
      const tasks = company.tasks;
      
      // Cartes de couverture par catégorie
      const coverageCards = ['defensive', 'general', 'offensive'].map(category => {
        const categoryTasks = tasks.filter(task => task.category === category);
        const completed = categoryTasks.filter(task => task.status === 'completed').length;
        const total = categoryTasks.length;
        
        return {
          id: company.id * 1000 + category.charCodeAt(0),
          name: `Couverture ${category.charAt(0).toUpperCase() + category.slice(1)}`,
          type: 'coverage' as const,
          total,
          completed,
          category,
          isActive: true,
          company: { id: company.id, name: company.name },
          isIntelligent: true
        };
      });

      // Carte d'infrastructure basée sur les tâches d'équipement
      const infrastructureTasks = tasks.filter(task => 
        task.name.toLowerCase().includes('équipement') || 
        task.name.toLowerCase().includes('infrastructure')
      );
      
      const infrastructureCard = {
        id: company.id * 1000 + 100,
        name: 'Infrastructure & Équipements',
        type: 'infrastructure' as const,
        total: infrastructureTasks.length,
        completed: infrastructureTasks.filter(task => task.status === 'completed').length,
        category: 'general',
        isActive: true,
        company: { id: company.id, name: company.name },
        isIntelligent: true
      };

      // Carte de conformité basée sur les tâches de certification
      const complianceTasks = tasks.filter(task => 
        task.name.toLowerCase().includes('audit') || 
        task.name.toLowerCase().includes('certification') ||
        task.name.toLowerCase().includes('conformité')
      );
      
      const complianceCard = {
        id: company.id * 1000 + 200,
        name: 'Conformité & Certification',
        type: 'compliance' as const,
        total: complianceTasks.length,
        completed: complianceTasks.filter(task => task.status === 'completed').length,
        category: 'defensive',
        isActive: true,
        company: { id: company.id, name: company.name },
        isIntelligent: true
      };

      return [...coverageCards, infrastructureCard, complianceCard];
    });

    // Combiner les cartes de panneau existantes avec les cartes intelligentes
    const allCards = [...panelCards, ...intelligentCards];

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
    console.error('Erreur lors de la récupération des cartes du panneau:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des cartes du panneau' },
      { status: 500 }
    );
  }
}
