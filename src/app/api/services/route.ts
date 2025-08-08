import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer tous les templates de services actifs
    const serviceTemplates = await prisma.serviceTemplate.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    // Convertir les templates en format ServiceCard
    const services = serviceTemplates.map(template => ({
      id: template.id.toString(),
      name: template.name,
      description: template.description,
      category: template.category,
      icon: template.icon,
      defaultScore: template.defaultScore,
      defaultImportance: template.defaultImportance
    }));

    return NextResponse.json({ services });
  } catch (error) {
    console.error('Erreur lors de la récupération des services:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification et les permissions
    const user = await verifyToken(request);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, category, icon, defaultScore, defaultImportance } = body;

    // Créer un nouveau template de service
    const newTemplate = await prisma.serviceTemplate.create({
      data: {
        name,
        description,
        category,
        icon,
        defaultScore,
        defaultImportance,
        isActive: true
      }
    });

    return NextResponse.json({ 
      message: 'Template créé avec succès',
      template: newTemplate 
    });
  } catch (error) {
    console.error('Erreur lors de la création du template:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Vérifier l'authentification et les permissions
    const user = await verifyToken(request);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, description, category, icon, defaultScore, defaultImportance } = body;

    // Mettre à jour le template de service
    const updatedTemplate = await prisma.serviceTemplate.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        category,
        icon,
        defaultScore,
        defaultImportance
      }
    });

    return NextResponse.json({ 
      message: 'Template mis à jour avec succès',
      template: updatedTemplate 
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du template:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
