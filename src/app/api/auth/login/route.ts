import { prisma } from '../../../../lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Validation stricte du secret JWT
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'dev-secret' || secret.length < 32) {
    throw new Error('JWT_SECRET non configuré ou trop faible. Configurez une clé secrète d\'au moins 32 caractères.');
  }
  return secret;
}

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Début de la route de connexion');
    
    const body = await req.json();
    console.log('📦 Body reçu:', { email: body.email, password: body.password ? '***' : 'undefined' });
    
    // Validation des entrées
    if (!body.email || !body.password) {
      console.log('❌ Champs manquants');
      return NextResponse.json({ error: 'Champs manquants ou invalides' }, { status: 400 });
    }
    
    const { email, password } = {
      email: body.email.toLowerCase().trim(),
      password: body.password
    };
    
    console.log('🔍 Tentative de connexion pour:', email);
    
    // Rechercher l'utilisateur
    const user = await prisma.user.findUnique({ 
      where: { email: email },
      include: {
        company: true
      }
    });
    
    console.log('👤 Utilisateur trouvé:', user ? { id: user.id, email: user.email, role: user.role } : 'null');
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
    }
    
    // Vérifier le mot de passe
    const valid = await bcrypt.compare(password, user.password);
    console.log('🔐 Vérification mot de passe:', valid);
    
    if (!valid) {
      console.log('❌ Mot de passe incorrect');
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
    }
    
    console.log('✅ Connexion réussie pour:', user.email);
    
    // Générer le JWT
    const secret = getJwtSecret();
    const u = user as unknown as { itRole?: string; name?: string };
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        itRole: u.itRole,
        name: u.name,
        companyId: user.companyId,
        email: user.email,
        jti: crypto.randomBytes(16).toString('hex')
      },
      secret,
      { 
        expiresIn: '7d',
        issuer: 'interface-manage',
        audience: 'web-app'
      }
    );
    
    // Réponse de succès
    const response = NextResponse.json({ 
      token, 
      role: user.role,
      itRole: u.itRole,
      name: u.name,
      companyId: user.companyId,
      companyName: user.company?.name,
      email: user.email,
      expiresIn: 7 * 24 * 60 * 60
    });
    
    // Cookie sécurisé
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    });
    
    console.log('🎉 JWT généré et cookie défini');
    return response;
    
  } catch (error) {
    console.error('❌ Erreur lors de la connexion:', error);
    return NextResponse.json({ 
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 