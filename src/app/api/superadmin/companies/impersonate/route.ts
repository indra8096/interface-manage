import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Vérifier que c'est un super admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (decoded.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { adminId, companyId } = await request.json();

    if (!adminId || !companyId) {
      return NextResponse.json({ error: 'adminId et companyId requis' }, { status: 400 });
    }

    // Récupérer l'administrateur de l'entreprise
    const admin = await prisma.user.findFirst({
      where: {
        id: parseInt(adminId),
        companyId: parseInt(companyId),
        role: 'COMPANY_ADMIN'
      },
      include: {
        company: true
      }
    });

    if (!admin) {
      return NextResponse.json({ error: 'Administrateur non trouvé' }, { status: 404 });
    }

    // Créer un nouveau token pour l'administrateur
    const adminToken = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: 'COMPANY_ADMIN',
        companyId: admin.companyId,
        itRole: admin.itRole,
        name: admin.name
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      token: adminToken,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        itRole: admin.itRole,
        name: admin.name,
        companyId: admin.companyId
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'impersonation:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
