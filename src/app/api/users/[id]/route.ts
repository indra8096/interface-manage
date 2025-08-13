import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { verifyToken } from '../../../../lib/auth';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Vérifier l'authentification
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: idParam } = await params;
    const id = Number(idParam);
    if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 });

    // Vérifier que l'utilisateur à supprimer existe
    const userToDelete = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, companyId: true }
    });

    if (!userToDelete) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Règles de sécurité
    if (user.role === 'SUPER_ADMIN') {
      // Le Super Admin peut supprimer n'importe qui sauf lui-même
      if (userToDelete?.id === user.userId) {
        return NextResponse.json({ error: 'Vous ne pouvez pas vous supprimer vous-même' }, { status: 403 });
      }
    } else if (user.role === 'COMPANY_ADMIN') {
      // L'admin de société ne peut supprimer que les utilisateurs de sa société
      if (userToDelete.companyId !== user.companyId) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
      }
      // L'admin ne peut pas supprimer d'autres administrateurs
      if (userToDelete.role === 'COMPANY_ADMIN') {
        return NextResponse.json({ error: 'Vous ne pouvez pas supprimer d\'autres administrateurs' }, { status: 403 });
      }
      // L'admin ne peut pas supprimer le Super Admin
      if (userToDelete.role === 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
      }
    } else {
      // Les utilisateurs normaux ne peuvent supprimer personne
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Vérifier l'authentification
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: idParam } = await params;
    const id = Number(idParam);
    if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 });

    // Vérifier que l'utilisateur à modifier existe
    const userToUpdate = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, companyId: true }
    });

    if (!userToUpdate) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Règles de sécurité
    if (user.role === 'SUPER_ADMIN') {
      // Le Super Admin peut modifier n'importe qui
    } else if (user.role === 'COMPANY_ADMIN') {
      // L'admin de société ne peut modifier que les utilisateurs de sa société
      if (userToUpdate.companyId !== user.companyId) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
      }
      // L'admin ne peut pas modifier le Super Admin
      if (userToUpdate.role === 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
      }
    } else {
      // Les utilisateurs normaux ne peuvent modifier personne
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { email, password, role } = await req.json();
    const data: { email?: string; password?: string; role?: string } = {};
    
    if (email) data.email = email;
    if (password) data.password = await bcrypt.hash(password, 10);
    if (role) data.role = role;

    const updatedUser = await prisma.user.update({ 
      where: { id }, 
      data,
      select: { id: true, email: true, role: true }
    });
    
    return NextResponse.json({ success: true, user: updatedUser });

  } catch (error) {
    console.error('Erreur lors de la modification de l\'utilisateur:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
} 