import { prisma } from '../../../../lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { 
  validateEmail, 
  sanitizeString, 
  logSecurityEvent
} from '../../../../lib/security';
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
    const body = await req.json();
    

    
    // === VALIDATION CSRF ===
    const csrfToken = body._csrf;
    if (!csrfToken) {
      logSecurityEvent('login_csrf_missing', { ip: 'unknown' }, 'warn');
      return NextResponse.json({ error: 'Token CSRF manquant' }, { status: 403 });
    }
    
    // Sanitisation des entrées
    const { email, password } = {
      email: sanitizeString(body.email || '', 254),
      password: body.password || ''
    };
    
    // Validation des entrées
    if (!email || !password) {
      logSecurityEvent('login_attempt_invalid', { 
        email: email ? 'provided' : 'missing',
        ip: 'unknown'
      }, 'warn');
      return NextResponse.json({ error: 'Champs manquants ou invalides' }, { status: 400 });
    }
    
    // Validation du format email avec protection renforcée
    if (!validateEmail(email)) {
      logSecurityEvent('login_attempt_invalid_email', { 
        email, 
        ip: 'unknown'
      }, 'warn');
      return NextResponse.json({ error: 'Format d\'email invalide' }, { status: 400 });
    }
    

    
    console.log('🔍 Tentative de connexion:', { 
      email, 
      password: password ? '***' : 'undefined',
      ip: 'unknown'
    });
    
    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase().trim() },
      include: {
        company: true
      }
    });
    
    console.log('👤 Utilisateur trouvé:', user ? { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    } : 'null');
    
    if (!user) {
      // Délai artificiel pour éviter l'énumération d'utilisateurs
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
      logSecurityEvent('login_attempt_user_not_found', { 
        email, 
        ip: 'unknown'
      }, 'warn');
      console.log('❌ Utilisateur non trouvé');
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
    }
    
    const valid = await bcrypt.compare(password, user.password);
    console.log('🔐 Vérification mot de passe:', valid);
    
    if (!valid) {
      // Délai artificiel pour éviter l'énumération de mots de passe
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
      logSecurityEvent('login_attempt_invalid_password', { 
        email, 
        userId: user.id, 
        ip: 'unknown'
      }, 'warn');
      console.log('❌ Mot de passe incorrect');
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
    }
    
    // === CONNEXION RÉUSSIE ===
    logSecurityEvent('login_success', { 
      email, 
      userId: user.id, 
      role: user.role, 
      ip: 'unknown'
    }, 'info');
    
    // Générer un JWT avec les informations de l'utilisateur
    const secret = getJwtSecret();
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        companyId: user.companyId,
        email: user.email,
        iat: Math.floor(Date.now() / 1000), // Timestamp d'émission
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // Expiration 7 jours
        jti: crypto.randomBytes(16).toString('hex'), // JWT ID unique
        clientIP: 'unknown' // IP de connexion pour traçabilité
      },
      secret,
      { 
        expiresIn: '7d',
        issuer: 'interface-manage',
        audience: 'web-app'
      }
    );
    
    // Headers de sécurité
    const response = NextResponse.json({ 
      token, 
      role: user.role,
      companyId: user.companyId,
      companyName: user.company?.name,
      email: user.email,
      expiresIn: 7 * 24 * 60 * 60 // 7 jours en secondes
    });
    
    // Cookies sécurisés avec protection CSRF
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 jours
      path: '/'
    });
    
    // Headers de sécurité supplémentaires
    response.headers.set('X-Auth-Status', 'success');
    response.headers.set('X-User-Role', user.role);
    response.headers.set('X-User-Id', user.id.toString());
    
    return response;
    
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    logSecurityEvent('login_error', { 
      error: errorMessage,
      ip: 'unknown'
    }, 'error');
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
} 