import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    
    // Préparer les données à mettre à jour
    const updateData: {
      status?: string;
      name?: string;
      description?: string;
      score?: number;
      importance?: string;
      dueDate?: Date | null;
      assignedTo?: string;
    } = {}
    
    // Gérer le statut
    if (body.status && ['completed', 'warning', 'error'].includes(body.status)) {
      updateData.status = body.status
    }
    
    // Gérer les autres champs
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.score !== undefined) updateData.score = body.score
    if (body.importance !== undefined) updateData.importance = body.importance
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
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