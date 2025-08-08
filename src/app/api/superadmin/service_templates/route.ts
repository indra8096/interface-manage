import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const templates = await prisma.serviceTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Erreur lors de la récupération des templates de services:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des templates de services' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, category, icon, defaultScore, defaultImportance } = body;

    const template = await prisma.serviceTemplate.create({
      data: {
        name,
        description,
        category,
        icon: icon || '🛡️',
        defaultScore: defaultScore || 0,
        defaultImportance: defaultImportance || 'Moyenne'
      }
    });

    return NextResponse.json({ 
      message: 'Template de service créé avec succès',
      template
    });
  } catch (error) {
    console.error('Erreur lors de la création du template de service:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du template de service' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, description, category, icon, defaultScore, defaultImportance } = body;

    const template = await prisma.serviceTemplate.update({
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
      message: 'Template de service mis à jour avec succès',
      template
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du template de service:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du template de service' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    await prisma.serviceTemplate.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ 
      message: 'Template de service supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du template de service:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du template de service' },
      { status: 500 }
    );
  }
}
