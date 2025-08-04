import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const email = 'admin@example.com';
  const password = 'admin123';
  const hashed = await bcrypt.hash(password, 10);
  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashed,
      role: 'admin',
    },
  });
  console.log('Admin créé :', admin);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); }); 