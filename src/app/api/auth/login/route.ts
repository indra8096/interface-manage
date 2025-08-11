import { prisma } from '../../../../lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  console.log('🔍 Tentative de connexion:', { email, password: password ? '***' : 'undefined' });
  
  if (!email || !password) {
    console.log('❌ Champs manquants');
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  }
  
  const user = await prisma.user.findUnique({ 
    where: { email },
    include: {
      company: true
    }
  });
  
  console.log('👤 Utilisateur trouvé:', user ? { id: user.id, email: user.email, role: user.role } : 'null');
  
  if (!user) {
    console.log('❌ Utilisateur non trouvé');
    return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 401 });
  }
  
  const valid = await bcrypt.compare(password, user.password);
  console.log('🔐 Vérification mot de passe:', valid);
  
  if (!valid) {
    console.log('❌ Mot de passe incorrect');
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
  }
  
  // Générer un JWT avec les informations de l'utilisateur
  const token = jwt.sign(
    { 
      id: user.id, 
      role: user.role,
      companyId: user.companyId,
      email: user.email
    },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );
  
  return NextResponse.json({ 
    token, 
    role: user.role,
    companyId: user.companyId,
    companyName: user.company?.name,
    email: user.email
  });
} 