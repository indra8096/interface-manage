import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params
    const body = await request.json()
    
    // Vérifier que la tâche existe et appartient à la bonne société
    const existingTask = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, companyId: true }
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Tâche non trouvée' }, { status: 404 });
    }

    // Règles de sécurité
    if (user.role === 'SUPER_ADMIN') {
      // Le Super Admin peut modifier n'importe quelle tâche
    } else if (user.role === 'COMPANY_ADMIN' || user.role === 'COMPANY_USER') {
      // Les autres ne peuvent modifier que les tâches de leur société
      if (existingTask.companyId !== user.companyId) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }
    
    // Préparer les données à mettre à jour
    const updateData: {
      status?: 'completed' | 'warning' | 'error';
      name?: string;
      description?: string;
      score?: number;
      importance?: string;
      dueDate?: string | null;
      assignedTo?: string;
    } = {}
    
    // Gérer le statut
    if (body.status && ['completed', 'warning', 'error'].includes(body.status)) {
      updateData.status = body.status as 'completed' | 'warning' | 'error'
    }
    
    // Gérer les autres champs
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.score !== undefined) updateData.score = body.score
    if (body.importance !== undefined) updateData.importance = body.importance
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate || null
    if (body.assignedTo !== undefined) updateData.assignedTo = body.assignedTo

    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: updateData
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la tâche:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la tâche' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;

    // Vérifier que la tâche existe et appartient à la bonne société
    const existingTask = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, companyId: true }
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Tâche non trouvée' }, { status: 404 });
    }

    // Règles de sécurité
    if (user.role === 'SUPER_ADMIN') {
      // Le Super Admin peut supprimer n'importe quelle tâche
    } else if (user.role === 'COMPANY_ADMIN') {
      // L'admin de société ne peut supprimer que les tâches de sa société
      if (existingTask.companyId !== user.companyId) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
      }
    } else {
      // Les utilisateurs normaux ne peuvent supprimer aucune tâche
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    await prisma.task.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de la tâche:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la tâche' },
      { status: 500 }
    );
  }
} 