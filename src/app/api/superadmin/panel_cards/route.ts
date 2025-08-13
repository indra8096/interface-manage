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

    // Récupérer UNIQUEMENT les vraies cartes de panel des entreprises
    const companies = await prisma.company.findMany({
      include: {
        panelCardInstances: {
          select: {
            id: true,
            name: true,
            type: true,
            total: true,
            completed: true,
            equipmentCount: true,
            status: true,
            certificationDate: true,
            nextAudit: true,
            priority: true,
            description: true,
            deadline: true,
            category: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    // Récupérer UNIQUEMENT les vraies cartes de panel des entreprises
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allCards = companies.flatMap((company: any) => 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      company.panelCardInstances.map((card: any) => ({
        ...card,
        company: { id: company.id, name: company.name },
        isRealCard: true
      }))
    );

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        totalUsers: companiesStats.reduce((sum: any, company: any) => sum + company._count.users, 0),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        totalTasks: companiesStats.reduce((sum: any, company: any) => sum + company._count.tasks, 0)
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
    if (!name || !type) {
      return NextResponse.json({ error: 'Nom et type requis' }, { status: 400 });
    }

    // Récupérer toutes les entreprises pour propager la carte
    const companies = await prisma.company.findMany();

    // Créer la carte de panel pour chaque entreprise
    const createdCards = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      companies.map((company: any) => 
        prisma.panelCardInstance.create({
          data: {
            name,
            type,
            category: category || 'defensive',
            total: total || 0,
            completed: completed || 0,
            equipmentCount: equipmentCount || 0,
            status: status || 'Normal',
            certificationDate: certificationDate ? new Date(certificationDate) : null,
            nextAudit: nextAudit ? new Date(nextAudit) : null,
            priority: priority || 'Moyenne',
            description: description || '',
            deadline: deadline ? new Date(deadline) : null,
            isActive: true,
            companyId: company.id
          }
        })
      )
    );

    return NextResponse.json({ 
      message: 'Carte de panel créée pour toutes les entreprises',
      cards: createdCards
    });
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
    const { 
      id, 
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
    if (!id || !name || !type) {
      return NextResponse.json({ error: 'ID, nom et type requis' }, { status: 400 });
    }

    // Mettre à jour la carte de panel
    const updatedCard = await prisma.panelCardInstance.update({
      where: { id: parseInt(id) },
      data: {
        name,
        type,
        category: category || 'defensive',
        total: total || 0,
        completed: completed || 0,
        equipmentCount: equipmentCount || 0,
        status: status || 'Normal',
        certificationDate: certificationDate ? new Date(certificationDate) : null,
        nextAudit: nextAudit ? new Date(nextAudit) : null,
        priority: priority || 'Moyenne',
        description: description || '',
        deadline: deadline ? new Date(deadline) : null,
        isActive: true
      }
    });

    return NextResponse.json({ 
      message: 'Carte de panel mise à jour',
      card: updatedCard
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la carte de panel:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la carte de panel' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    // Supprimer la carte de panel
    await prisma.panelCardInstance.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ 
      message: 'Carte de panel supprimée'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la carte de panel:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la carte de panel' },
      { status: 500 }
    );
  }
}
