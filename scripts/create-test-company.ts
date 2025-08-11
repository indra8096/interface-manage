import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🏢 Création d\'une deuxième société de test...')

  // Créer une deuxième entreprise
  const company2 = await prisma.company.create({
    data: {
      name: 'Société Test 2',
    },
  })
  console.log('🏢 Deuxième entreprise créée:', company2)

  // Créer un admin pour la deuxième entreprise
  const admin2 = await prisma.user.create({
    data: {
      email: 'admin@societe2.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // "password"
      role: 'COMPANY_ADMIN',
      companyId: company2.id,
    },
  })
  console.log('👨‍💼 Admin de la deuxième entreprise créé:', admin2)

  // Créer quelques tâches pour la deuxième entreprise
  const task3 = await prisma.task.create({
    data: {
      name: 'Tâche Société 2 - 1',
      description: 'Description de la première tâche de la société 2',
      score: 6,
      category: 'offensive',
      importance: 'Basse',
      companyId: company2.id,
    },
  })
  console.log('📋 Tâche 1 de la société 2 créée:', task3)

  const task4 = await prisma.task.create({
    data: {
      name: 'Tâche Société 2 - 2',
      description: 'Description de la deuxième tâche de la société 2',
      score: 8,
      category: 'defensive',
      importance: 'Très Haute',
      companyId: company2.id,
    },
  })
  console.log('📋 Tâche 2 de la société 2 créée:', task4)

  console.log('✅ Deuxième société de test créée avec succès!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de la création:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
