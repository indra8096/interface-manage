import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Récupérer toutes les entreprises
    const companies = await prisma.company.findMany();
    
    if (companies.length === 0) {
      return NextResponse.json({ error: 'Aucune entreprise trouvée' }, { status: 404 });
    }

    // Créer des cartes de panel d'exemple pour chaque entreprise
    const sampleCards = [
      {
        name: 'Formation Cybersécurité',
        type: 'coverage',
        category: 'defensive',
        total: 30,
        completed: 10,
        priority: 'Moyenne',
        description: 'Formation obligatoire pour tous les employés',
        deadline: '2024-12-31',
        status: 'En cours'
      },
      {
        name: 'Pentest Infrastructure',
        type: 'coverage',
        category: 'offensive',
        total: 5,
        completed: 1,
        priority: 'Haute',
        description: 'Tests de pénétration sur l\'infrastructure',
        deadline: '2024-11-30',
        status: 'En cours'
      },
      {
        name: 'Configuration Switches',
        type: 'infrastructure',
        category: 'general',
        equipmentCount: 15,
        status: 'Sécurisé',
        priority: 'Moyenne',
        description: 'Configuration des switches réseau'
      },
      {
        name: 'Certification ISO 27001',
        type: 'compliance',
        category: 'defensive',
        status: 'EN COURS',
        certificationDate: '2024-06-15',
        nextAudit: '2025-06-15',
        priority: 'Haute',
        description: 'Certification de sécurité ISO 27001'
      }
    ];

    // Créer d'abord les templates de cartes
    const templates = await Promise.all(
      sampleCards.map(async (cardData) => {
        return await prisma.panelCardTemplate.create({
          data: {
            name: cardData.name,
            type: cardData.type as any,
            category: cardData.category as any,
            description: cardData.description,
            priority: cardData.priority,
            isActive: true
          }
        });
      })
    );

    // Créer ensuite les instances pour chaque entreprise
    for (const company of companies) {
      for (const template of templates) {
        await prisma.panelCardInstance.create({
          data: {
            templateId: template.id,
            companyId: company.id,
            total: 0,
            completed: 0,
            equipmentCount: 0,
            status: 'Normal',
            certificationDate: null,
            nextAudit: null,
            deadline: null,
            isActive: true
          }
        });
      }
    }

    return NextResponse.json({ 
      message: 'Cartes de panel d\'exemple créées',
      createdCount: templates.length * companies.length, // Total de cartes créées
      cards: templates // On retourne les templates créés
    });
  } catch (error) {
    console.error('Erreur lors de la création des cartes d\'exemple:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création des cartes d\'exemple' },
      { status: 500 }
    );
  }
}
