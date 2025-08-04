import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true },
    orderBy: { id: 'asc' },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  }
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 409 });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashed, role: 'user' },
    select: { id: true, email: true, role: true },
  });
  return NextResponse.json(user);
} 