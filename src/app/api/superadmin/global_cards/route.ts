import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import jwt from 'jsonwebtoken';

// Middleware pour vérifier le token et le rôle
async function verifySuperAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as any;
    if (decoded.role !== 'SUPER_ADMIN') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

// GET - Récupérer toutes les cartes globales
export async function GET(req: NextRequest) {
  const user = await verifySuperAdmin(req);
  if (!user) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
  }

  try {
    const globalCards = await prisma.globalCard.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ globalCards });
  } catch (error) {
    console.error('Erreur lors de la récupération des cartes globales:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer une nouvelle carte globale
export async function POST(req: NextRequest) {
  const user = await verifySuperAdmin(req);
  if (!user) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
  }

  try {
    const { title, description, category, content } = await req.json();

    if (!title || !category) {
      return NextResponse.json({ error: 'Titre et catégorie requis' }, { status: 400 });
    }

    const globalCard = await prisma.globalCard.create({
      data: {
        title,
        description,
        category,
        content: content || {},
        isActive: true
      }
    });

    return NextResponse.json({ globalCard }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la carte globale:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 