import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début de l\'initialisation de la base de données...')

  // Créer une entreprise
  const company = await prisma.company.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Société Test',
    },
  })
  console.log('🏢 Entreprise créée:', company)

  // Créer un super admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@example.com' },
    update: {},
    create: {
      email: 'superadmin@example.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // "password"
      role: 'SUPER_ADMIN',
    },
  })
  console.log('👑 Super Admin créé:', superAdmin)

  // Créer un admin d'entreprise
  const companyAdmin = await prisma.user.upsert({
    where: { email: 'admin@societe1.com' },
    update: {},
    create: {
      email: 'admin@societe1.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // "password"
      role: 'COMPANY_ADMIN',
      companyId: company.id,
    },
  })
  console.log('👨‍💼 Admin d\'entreprise créé:', companyAdmin)

  // Créer un utilisateur d'entreprise
  const companyUser = await prisma.user.upsert({
    where: { email: 'user@societe1.com' },
    update: {},
    create: {
      email: 'user@societe1.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // "password"
      role: 'COMPANY_USER',
      companyId: company.id,
    },
  })
  console.log('👤 Utilisateur d\'entreprise créé:', companyUser)

  // Créer quelques tâches de test
  const task1 = await prisma.task.create({
    data: {
      name: 'Tâche de test 1',
      description: 'Description de la première tâche de test',
      score: 7,
      category: 'general',
      importance: 'Haute',
      companyId: company.id,
    },
  })
  console.log('📋 Tâche 1 créée:', task1)

  const task2 = await prisma.task.create({
    data: {
      name: 'Tâche de test 2',
      description: 'Description de la deuxième tâche de test',
      score: 5,
      category: 'defensive',
      importance: 'Moyenne',
      companyId: company.id,
    },
  })
  console.log('📋 Tâche 2 créée:', task2)

  console.log('✅ Initialisation de la base de données terminée avec succès!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de l\'initialisation:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
