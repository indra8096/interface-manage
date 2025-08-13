import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Créer un nouvel utilisateur
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification et le rôle
    const user = await verifyToken(request);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }

    const { id } = params;
    const companyId = parseInt(id);
    
    if (isNaN(companyId)) {
      return NextResponse.json({ error: 'ID de société invalide' }, { status: 400 });
    }

    const body = await request.json();
    const { email, password, role } = body;

    // Validation des données
    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Email, mot de passe et rôle requis' }, { status: 400 });
    }

    // Vérifier que la société existe
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return NextResponse.json({ error: 'Société non trouvée' }, { status: 404 });
    }

    // Vérifier que l'email n'est pas déjà utilisé
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role as 'COMPANY_ADMIN' | 'COMPANY_USER',
        companyId: companyId
      }
    });

    return NextResponse.json({ 
      message: 'Utilisateur créé avec succès',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        companyId: newUser.companyId
      }
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}
