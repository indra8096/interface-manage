import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// Modifier un utilisateur
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    // Vérifier l'authentification et le rôle
    const user = await verifyToken(request);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }

    // Attendre params dans Next.js 15
    const { id, userId } = await params;
    const companyId = parseInt(id);
    const userIdInt = parseInt(userId);
    
    if (isNaN(companyId) || isNaN(userIdInt)) {
      return NextResponse.json({ error: 'IDs invalides' }, { status: 400 });
    }

    const body = await request.json();
    const { email, role } = body;

    // Validation des données
    if (!email || !role) {
      return NextResponse.json({ error: 'Email et rôle requis' }, { status: 400 });
    }

    // Vérifier que la société existe
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return NextResponse.json({ error: 'Société non trouvée' }, { status: 404 });
    }

    // Vérifier que l'utilisateur existe et appartient à cette société
    const existingUser = await prisma.user.findFirst({
      where: { 
        id: userIdInt,
        companyId: companyId
      }
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Vérifier que l'email n'est pas déjà utilisé par un autre utilisateur
    const emailConflict = await prisma.user.findFirst({
      where: { 
        email,
        id: { not: userIdInt },
        companyId: companyId
      }
    });

    if (emailConflict) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé par un autre utilisateur' }, { status: 400 });
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userIdInt },
      data: {
        email,
        role: role as 'COMPANY_ADMIN' | 'COMPANY_USER'
      }
    });

    return NextResponse.json({ 
      message: 'Utilisateur modifié avec succès',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        companyId: updatedUser.companyId
      }
    });

  } catch (error) {
    console.error('Erreur lors de la modification de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modification de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// Supprimer un utilisateur
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    // Vérifier l'authentification et le rôle
    const user = await verifyToken(request);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }

    // Attendre params dans Next.js 15
    const { id, userId } = await params;
    const companyId = parseInt(id);
    const userIdInt = parseInt(userId);
    
    if (isNaN(companyId) || isNaN(userIdInt)) {
      return NextResponse.json({ error: 'IDs invalides' }, { status: 400 });
    }

    // Vérifier que la société existe
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return NextResponse.json({ error: 'Société non trouvée' }, { status: 404 });
    }

    // Vérifier que l'utilisateur existe et appartient à cette société
    const existingUser = await prisma.user.findFirst({
      where: { 
        id: userIdInt,
        companyId: companyId
      }
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Supprimer l'utilisateur
    await prisma.user.delete({
      where: { id: userIdInt }
    });

    return NextResponse.json({ 
      message: 'Utilisateur supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    );
  }
}
