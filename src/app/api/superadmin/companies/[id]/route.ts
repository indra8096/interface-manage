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

    // Attendre params dans Next.js 15
    const { id } = await params;
    const companyId = parseInt(id);
    
    if (isNaN(companyId)) {
      return NextResponse.json({ error: 'ID de société invalide' }, { status: 400 });
    }

    // Récupérer la société avec ses utilisateurs
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        },
        _count: {
          select: {
            users: true,
            tasks: true
          }
        }
      }
    });

    if (!company) {
      return NextResponse.json({ error: 'Société non trouvée' }, { status: 404 });
    }

    return NextResponse.json({ 
      company: {
        id: company.id,
        name: company.name,
        createdAt: company.createdAt,
        users: company.users,
        _count: company._count
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des détails de la société:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des détails de la société' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification et le rôle
    const user = await verifyToken(request);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }

    // Attendre params dans Next.js 15
    const { id } = await params;
    const companyId = parseInt(id);
    
    if (isNaN(companyId)) {
      return NextResponse.json({ error: 'ID de société invalide' }, { status: 400 });
    }

    // Vérifier que la société existe
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return NextResponse.json({ error: 'Société non trouvée' }, { status: 404 });
    }

    // Récupérer les comptes avant suppression
    const usersCount = await prisma.user.count({
      where: { companyId: companyId }
    });

    const tasksCount = await prisma.task.count({
      where: { companyId: companyId }
    });

    const panelCardsCount = await prisma.panelCardInstance.count({
      where: { companyId: companyId }
    });

    // Supprimer la société et toutes ses données associées
    // D'abord supprimer les PanelCardInstances pour éviter la contrainte de clé étrangère
    await prisma.panelCardInstance.deleteMany({
      where: { companyId: companyId }
    });

    // Ensuite supprimer la société (les autres relations seront supprimées automatiquement)
    await prisma.company.delete({
      where: { id: companyId }
    });

    return NextResponse.json({ 
      message: 'Société supprimée avec succès',
      deletedCompany: {
        id: company.id,
        name: company.name,
        usersCount: usersCount,
        tasksCount: tasksCount,
        panelCardsCount: panelCardsCount
      }
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la société:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la société' },
      { status: 500 }
    );
  }
}
