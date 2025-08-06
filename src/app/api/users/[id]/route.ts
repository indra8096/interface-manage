import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
  const { email, password, role } = await req.json();
  const data: { email?: string; password?: string; role?: string } = {};
  if (email) data.email = email;
  if (password) data.password = await bcrypt.hash(password, 10);
  if (role) data.role = role;
  const user = await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ success: true, user });
} 