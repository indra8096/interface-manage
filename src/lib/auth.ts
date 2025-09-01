import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: number;
  email: string;
  role: string;
  itRole?: string;
  name?: string;
  companyId?: number;
}

// Interface pour le token JWT décodé
interface DecodedToken {
  userId?: number;
  id?: number;
  email: string;
  role: string;
  itRole?: string;
  name?: string;
  companyId?: number;
  iat?: number;
  exp?: number;
}

// Validation stricte du secret JWT
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'dev-secret' || secret.length < 32) {
    throw new Error('JWT_SECRET non configuré ou trop faible. Configurez une clé secrète d\'au moins 32 caractères.');
  }
  return secret;
}

export async function verifyToken(reqOrToken: NextRequest | string): Promise<AuthUser | null> {
  let token: string;
  
  if (typeof reqOrToken === 'string') {
    // Si c'est une chaîne, c'est directement le token
    token = reqOrToken;
  } else {
    // Si c'est un NextRequest, extraire le token du header
    const authHeader = reqOrToken.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    token = authHeader.substring(7);
  }

  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as DecodedToken;
    
    // Validation des données décodées
    if (!decoded.userId && !decoded.id) {
      throw new Error('Token invalide: ID utilisateur manquant');
    }
    
    return {
      id: (decoded.userId || decoded.id)!,
      email: decoded.email,
      role: decoded.role,
      itRole: decoded.itRole,
      name: decoded.name,
      companyId: decoded.companyId
    };
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    return null;
  }
}

export async function verifyRole(req: NextRequest, allowedRoles: string[]): Promise<AuthUser | null> {
  const user = await verifyToken(req);
  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }
  return user;
}

export async function verifySuperAdmin(req: NextRequest): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const user = await verifyRole(req, ['SUPER_ADMIN']);
  if (!user) {
    return { success: false, error: 'Accès non autorisé - Super Admin requis' };
  }
  return { success: true, user };
}

export async function verifyCompanyAccess(req: NextRequest, companyId?: number): Promise<AuthUser | null> {
  const user = await verifyToken(req);
  if (!user) return null;

  // Super Admin peut accéder à tout
  if (user.role === 'SUPER_ADMIN') return user;

  // Les autres rôles doivent appartenir à l'entreprise
  if (user.companyId === companyId) return user;

  return null;
} 