import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🎴 Création de cartes de panel de test...')

  try {
    // Créer quelques templates de cartes
    const template1 = await prisma.panelCardTemplate.create({
      data: {
        name: 'Carte de test 1',
        type: 'coverage',
        category: 'defensive',
        description: 'Description de la première carte de test',
        priority: 'Haute',
        isActive: true
      }
    })
    console.log('📋 Template 1 créé:', template1)

    const template2 = await prisma.panelCardTemplate.create({
      data: {
        name: 'Carte de test 2',
        type: 'infrastructure',
        category: 'general',
        description: 'Description de la deuxième carte de test',
        priority: 'Moyenne',
        isActive: true
      }
    })
    console.log('📋 Template 2 créé:', template2)

    const template3 = await prisma.panelCardTemplate.create({
      data: {
        name: 'Carte de test 3',
        type: 'compliance',
        category: 'offensive',
        description: 'Description de la troisième carte de test',
        priority: 'Basse',
        isActive: true
      }
    })
    console.log('📋 Template 3 créé:', template3)

    // Créer des instances pour la société AZUS (ID: 2)
    const instance1 = await prisma.panelCardInstance.create({
      data: {
        templateId: template1.id,
        companyId: 2, // Utiliser l'ID de l'entreprise AZUS
        total: 10,
        completed: 7,
        status: 'EN COURS',
        isActive: true
      }
    })
    console.log('🏢 Instance 1 créée:', instance1)

    const instance2 = await prisma.panelCardInstance.create({
      data: {
        templateId: template2.id,
        companyId: 2, // Utiliser l'ID de l'entreprise AZUS
        equipmentCount: 5,
        status: 'Normal',
        isActive: true
      }
    })
    console.log('🏢 Instance 2 créée:', instance2)

    const instance3 = await prisma.panelCardInstance.create({
      data: {
        templateId: template3.id,
        companyId: 2, // Utiliser l'ID de l'entreprise AZUS
        status: 'EN COURS',
        certificationDate: '2023',
        nextAudit: 'Décembre 2024',
        isActive: true
      }
    })
    console.log('🏢 Instance 3 créée:', instance3)

    console.log('✅ Cartes de panel de test créées avec succès!')
  } catch (error) {
    console.error('❌ Erreur lors de la création des cartes:', error)
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
