import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { verifyToken } from '../../../lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    console.log('🔍 GET /api/users - User connecté:', {
      userId: user.id,
      role: user.role,
      companyId: user.companyId
    });

    // Si c'est un Super Admin, il peut voir tous les utilisateurs
    if (user.role === 'SUPER_ADMIN') {
      const users = await prisma.user.findMany({
        select: { id: true, email: true, role: true, companyId: true },
        orderBy: { id: 'asc' },
      });
      return NextResponse.json(users);
    }

    // Si c'est un admin de société, il ne peut voir que les utilisateurs de sa société
    if (user.role === 'COMPANY_ADMIN' && user.companyId) {
      console.log('🔍 COMPANY_ADMIN cherche les utilisateurs pour companyId:', user.companyId);
      
      const users = await prisma.user.findMany({
        where: { 
          companyId: user.companyId,
          role: { not: 'SUPER_ADMIN' } // Exclure le Super Admin
        },
        select: { id: true, email: true, role: true },
        orderBy: { id: 'asc' },
      });
      
      console.log('✅ Utilisateurs trouvés pour cette société:', users);
      return NextResponse.json(users);
    }

    // Si c'est un utilisateur normal, il ne peut voir que lui-même
    if (user.role === 'COMPANY_USER') {
      const userData = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, email: true, role: true },
      });
      return NextResponse.json([userData]);
    }

    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Seuls les Super Admin et Company Admin peuvent créer des utilisateurs
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'COMPANY_ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { email, password, role = 'COMPANY_USER' } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    }

    // Vérifier si l'email existe déjà
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 409 });
    }

    // Déterminer la société pour le nouvel utilisateur
    let companyId = null;
    if (user.role === 'COMPANY_ADMIN') {
      // L'admin de société ne peut créer que des utilisateurs dans sa société
      companyId = user.companyId;
    } else if (user.role === 'SUPER_ADMIN') {
      // Le Super Admin peut spécifier une société ou créer sans société
      companyId = req.nextUrl.searchParams.get('companyId') ? 
        parseInt(req.nextUrl.searchParams.get('companyId')!) : null;
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { 
        email, 
        password: hashed, 
        role,
        companyId
      },
      select: { id: true, email: true, role: true },
    });

    return NextResponse.json(newUser);

  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
} 