import { prisma } from '../../../lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { 
  validateEmail, 
  validatePassword, 
  sanitizeString, 
  logSecurityEvent,
  validateCompanyName
} from '../../../lib/security';
import { verifySuperAdmin } from '../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    // === VÉRIFICATION DES PERMISSIONS ===
    const authResult = await verifySuperAdmin(req);
    if (!authResult.success) {
      logSecurityEvent('user_creation_unauthorized', { 
        ip: req.headers.get('x-forwarded-for') || 'unknown' 
      }, 'warn');
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const body = await req.json();
    
    // === VALIDATION ET SANITISATION DES DONNÉES ===
    const { email, password, role, companyName } = {
      email: sanitizeString(body.email || '', 254),
      password: body.password || '',
      role: sanitizeString(body.role || '', 50),
      companyName: sanitizeString(body.companyName || '', 100)
    };

    // === VALIDATION DES CHAMPS OBLIGATOIRES ===
    if (!email || !password || !role) {
      return NextResponse.json({ 
        error: 'Email, mot de passe et rôle sont obligatoires' 
      }, { status: 400 });
    }

    // === VALIDATION STRICTE DE L'EMAIL ===
    if (!validateEmail(email)) {
      logSecurityEvent('user_creation_invalid_email', { 
        email, 
        adminId: authResult.user?.id 
      }, 'warn');
      return NextResponse.json({ 
        error: 'Format d\'email invalide',
        field: 'email'
      }, { status: 400 });
    }

    // === VALIDATION RENFORCÉE DU MOT DE PASSE ===
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      logSecurityEvent('user_creation_weak_password', { 
        email, 
        adminId: authResult.user?.id,
        errors: passwordValidation.errors
      }, 'warn');
      return NextResponse.json({ 
        error: 'Mot de passe trop faible',
        details: passwordValidation.errors,
        field: 'password'
      }, { status: 400 });
    }

    // === VALIDATION DU RÔLE ===
    const validRoles = ['COMPANY_ADMIN', 'COMPANY_USER'] as const;
    if (!validRoles.includes(role as 'COMPANY_ADMIN' | 'COMPANY_USER')) {
      return NextResponse.json({ 
        error: 'Rôle invalide. Rôles autorisés: COMPANY_ADMIN, COMPANY_USER',
        field: 'role'
      }, { status: 400 });
    }

    // === VALIDATION DU NOM D'ENTREPRISE ===
    if (companyName && !validateCompanyName(companyName)) {
      return NextResponse.json({ 
        error: 'Nom d\'entreprise invalide',
        field: 'companyName'
      }, { status: 400 });
    }

    // === VÉRIFICATION DE L'EXISTENCE DE L'EMAIL ===
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return NextResponse.json({ 
        error: 'Un utilisateur avec cet email existe déjà',
        field: 'email'
      }, { status: 409 });
    }

    // === CRÉATION DE L'ENTREPRISE SI NÉCESSAIRE ===
    let companyId: number | null = null;
    
    if (companyName) {
      let company = await prisma.company.findFirst({
        where: { name: companyName }
      });

      if (!company) {
        company = await prisma.company.create({
          data: { name: companyName }
        });
        logSecurityEvent('company_created', { 
          companyName, 
          adminId: authResult.user?.id 
        }, 'info');
      }
      
      companyId = company.id;
    }

    // === HACHAGE SÉCURISÉ DU MOT DE PASSE ===
    const hashedPassword = await bcrypt.hash(password, 12);

    // === CRÉATION DE L'UTILISATEUR ===
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role as 'COMPANY_ADMIN' | 'COMPANY_USER',
        companyId
      },
      include: {
        company: true
      }
    });

    // === LOG DE SÉCURITÉ ===
    logSecurityEvent('user_created', { 
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      adminId: authResult.user?.id
    }, 'info');

    // === RÉPONSE DE SUCCÈS ===
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        companyName: user.company?.name,
        createdAt: user.createdAt
      },
      message: 'Utilisateur créé avec succès'
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    
    logSecurityEvent('user_creation_error', { 
      error: errorMessage
    }, 'error');

    return NextResponse.json({ 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // === VÉRIFICATION DES PERMISSIONS ===
    const authResult = await verifySuperAdmin(req);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // === RÉCUPÉRATION DES UTILISATEURS ===
    const users = await prisma.user.findMany({
      include: {
        company: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        companyName: user.company?.name,
        createdAt: user.createdAt
      }))
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json({ 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
} 