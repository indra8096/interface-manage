import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Si c'est un Super Admin, il peut voir toutes les tâches
    if (user.role === 'SUPER_ADMIN') {
      const tasks = await prisma.task.findMany({
        include: {
          company: {
            select: { id: true, name: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return NextResponse.json(tasks);
    }

    // Si c'est un admin ou utilisateur de société, il ne peut voir que les tâches de sa société
    if (user.role === 'COMPANY_ADMIN' || user.role === 'COMPANY_USER') {
      if (!user.companyId) {
        return NextResponse.json({ error: 'Aucune société associée' }, { status: 403 });
      }

      const tasks = await prisma.task.findMany({
        where: {
          companyId: user.companyId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return NextResponse.json(tasks);
    }

    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });

  } catch (error) {
    console.error('Erreur lors de la récupération des tâches:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des tâches' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Seuls les Super Admin et Company Admin peuvent créer des tâches
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'COMPANY_ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const body = await request.json()
    const { name, category, score = 5, description = '', importance = 'Moyenne', dueDate = null, assignedTo = '' } = body

    if (!name || !category) {
      return NextResponse.json(
        { error: 'Nom et catégorie requis' },
        { status: 400 }
      )
    }

    // Déterminer la société pour la nouvelle tâche
    let companyId = null;
    if (user.role === 'COMPANY_ADMIN') {
      // L'admin de société ne peut créer que des tâches dans sa société
      companyId = user.companyId;
    } else if (user.role === 'SUPER_ADMIN') {
      // Le Super Admin peut spécifier une société ou créer sans société
      companyId = request.nextUrl.searchParams.get('companyId') ? 
        parseInt(request.nextUrl.searchParams.get('companyId')!) : null;
    }

    const task = await prisma.task.create({
      data: {
        name,
        category,
        score,
        description,
        importance,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedTo,
        status: 'warning',
        companyId
      }
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de la tâche:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la tâche' },
      { status: 500 }
    )
  }
} 