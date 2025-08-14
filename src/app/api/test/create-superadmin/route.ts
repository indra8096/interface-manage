import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Vérifier si le super admin existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: 'guillaume.rosin@risk-horizon.be' }
    });

    if (existingUser) {
      return NextResponse.json({ 
        message: 'Le super admin existe déjà',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          role: existingUser.role
        }
      });
    }

    // Créer une entreprise par défaut si elle n'existe pas
    let defaultCompany = await prisma.company.findFirst({
      where: { name: 'Default Company' }
    });

    if (!defaultCompany) {
      defaultCompany = await prisma.company.create({
        data: { name: 'Default Company' }
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('Pv:76IdrTo/', 10);

    // Créer le super admin
    const superAdmin = await prisma.user.create({
      data: {
        email: 'guillaume.rosin@risk-horizon.be',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        companyId: defaultCompany.id
      }
    });

    return NextResponse.json({ 
      message: 'Super admin créé avec succès',
      user: {
        id: superAdmin.id,
        email: superAdmin.email,
        role: superAdmin.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création du super admin:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du super admin' },
      { status: 500 }
    );
  }
}
