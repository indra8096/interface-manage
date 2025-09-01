import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifySuperAdmin } from '../../../../lib/auth';
import bcrypt from 'bcryptjs';

// GET - Récupérer toutes les entreprises
export async function GET(req: NextRequest) {
  try {
    const authResult = await verifySuperAdmin(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: {
            users: true,
            tasks: true
          }
        },
        users: {
          where: {
            role: 'COMPANY_ADMIN'
          },
          select: {
            email: true,
            role: true
          },
          take: 1
        }
      }
    });

    // Transformer les données pour inclure l'admin
    const companiesWithAdmin = companies.map(company => ({
      ...company,
      admin: company.users[0] || null
    }));

    return NextResponse.json({ companies: companiesWithAdmin });
  } catch (error) {
    console.error('Erreur lors de la récupération des entreprises:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// POST - Créer une nouvelle entreprise
export async function POST(req: NextRequest) {
  try {
    const authResult = await verifySuperAdmin(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { name, adminEmail, adminPassword, adminItRole, adminName } = await req.json();

    // Validation des données
    if (!name || !adminEmail || !adminPassword) {
      return NextResponse.json({ 
        error: 'Tous les champs sont requis: nom de l\'entreprise, email admin, mot de passe admin' 
      }, { status: 400 });
    }

    // Vérifier si l'email admin existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingUser) {
      return NextResponse.json({ 
        error: 'Un utilisateur avec cet email existe déjà' 
      }, { status: 400 });
    }

    // Vérifier si le nom de l'entreprise existe déjà
    const existingCompany = await prisma.company.findFirst({
      where: { name }
    });

    if (existingCompany) {
      return NextResponse.json({ 
        error: 'Une entreprise avec ce nom existe déjà' 
      }, { status: 400 });
    }

    // Créer l'entreprise et l'admin dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Créer l'entreprise
      const company = await tx.company.create({
        data: {
          name: name.trim()
        }
      });

      // 2. Créer l'administrateur de l'entreprise
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const admin = await tx.user.create({
        data: {
          email: adminEmail.trim(),
          password: hashedPassword,
          role: 'COMPANY_ADMIN',
          companyId: company.id,
          itRole: adminItRole || 'IT_ADMIN',
          name: adminName || null
        }
      });

      return { company, admin };
    });

    console.log(`✅ Nouvelle entreprise créée: ${result.company.name} avec admin: ${result.admin.email}`);

    return NextResponse.json({
      message: 'Entreprise créée avec succès',
      company: {
        id: result.company.id,
        name: result.company.name,
        adminEmail: result.admin.email
      }
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'entreprise:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
} 