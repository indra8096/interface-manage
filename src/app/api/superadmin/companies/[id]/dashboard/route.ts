import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifySuperAdmin(req);
  if (!user) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
  }

  const { id } = await params;
  const companyId = Number(id);

  if (!companyId) {
    return NextResponse.json({ error: 'ID d\'entreprise invalide' }, { status: 400 });
  }

  try {
    // Récupérer l'entreprise avec ses utilisateurs
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true
          }
        },
        tasks: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!company) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 });
    }

    // Récupérer les cartes globales de cette société spécifique
    const globalCards = await prisma.globalCard.findMany({
      where: { 
        companyId: companyId,
        isActive: true 
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      company,
      globalCards,
      stats: {
        totalUsers: company.users.length,
        totalTasks: company.tasks.length,
        globalCardsCount: globalCards.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du dashboard:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 