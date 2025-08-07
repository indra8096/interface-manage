import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  userId: number;
  role: string;
  companyId?: number;
  email: string;
}

export async function verifyToken(req: NextRequest): Promise<AuthUser | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as AuthUser;
    return decoded;
  } catch (error) {
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