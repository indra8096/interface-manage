import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { verifyToken } from '../../../lib/auth';

// GET - Récupérer les cartes globales de la société de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Si c'est un Super Admin, il peut voir toutes les cartes
    if (user.role === 'SUPER_ADMIN') {
      const panelCardTemplates = await prisma.panelCardTemplate.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ globalCards: panelCardTemplates });
    }

    // Si c'est un admin ou utilisateur de société, il ne voit que les cartes de sa société
    if (user.companyId) {
      const panelCardInstances = await prisma.panelCardInstance.findMany({
        where: { 
          companyId: user.companyId,
          isActive: true
        },
        include: {
          template: true
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ globalCards: panelCardInstances });
    }

    return NextResponse.json({ globalCards: [] });

  } catch (error) {
    console.error('Erreur lors de la récupération des cartes globales:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer une nouvelle carte globale pour la société
export async function POST(req: NextRequest) {
  try {
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Seuls les Super Admin et Company Admin peuvent créer des cartes
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'COMPANY_ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { title, description, category, content, type } = await req.json();

    if (!title || !category || !type) {
      return NextResponse.json({ error: 'Titre, catégorie et type requis' }, { status: 400 });
    }

    // Créer d'abord le template
    const panelCardTemplate = await prisma.panelCardTemplate.create({
      data: {
        name: title,
        description: description || '',
        category: category,
        type: type,
        isActive: true
      }
    });

    // Déterminer la société pour l'instance
    let companyId = null;
    if (user.role === 'COMPANY_ADMIN') {
      companyId = user.companyId;
    } else if (user.role === 'SUPER_ADMIN') {
      // Le Super Admin peut spécifier une société ou créer sans société
      companyId = req.nextUrl.searchParams.get('companyId') ? 
        parseInt(req.nextUrl.searchParams.get('companyId')!) : null;
    }

    // Créer l'instance pour la société si spécifiée
    let panelCardInstance = null;
    if (companyId) {
      panelCardInstance = await prisma.panelCardInstance.create({
        data: {
          templateId: panelCardTemplate.id,
          companyId: companyId,
          isActive: true
        }
      });
    }

    return NextResponse.json({ 
      globalCard: panelCardTemplate,
      instance: panelCardInstance 
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création de la carte globale:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 