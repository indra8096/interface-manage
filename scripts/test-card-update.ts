import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Test de mise à jour de carte...')

  try {
    // Trouver une carte existante pour l'entreprise AZUS
    const existingInstance = await prisma.panelCardInstance.findFirst({
      where: { companyId: 2 },
      include: { template: true }
    })

    if (!existingInstance) {
      console.log('❌ Aucune instance de carte trouvée pour l\'entreprise AZUS')
      return
    }

    console.log('📋 Instance trouvée:', existingInstance)

    // Mettre à jour le nom et la description du template
    const updatedTemplate = await prisma.panelCardTemplate.update({
      where: { id: existingInstance.templateId },
      data: {
        name: `Carte mise à jour - ${Date.now()}`,
        description: `Description mise à jour le ${new Date().toLocaleString()}`
      }
    })

    console.log('✅ Template mis à jour:', updatedTemplate)

    // Mettre à jour l'instance
    const updatedInstance = await prisma.panelCardInstance.update({
      where: { id: existingInstance.id },
      data: {
        total: 15,
        completed: 10,
        status: 'MIS À JOUR'
      },
      include: { template: true }
    })

    console.log('✅ Instance mise à jour:', updatedInstance)

    console.log('🎯 Test terminé avec succès!')
    console.log('📝 Maintenant, connectez-vous à l\'interface admin et vérifiez que:')
    console.log('   1. La carte apparaît avec le nouveau nom dans le panel de suivis')
    console.log('   2. Si elle est affichée dans "indicateur et suivis", elle se met à jour aussi')

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
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
