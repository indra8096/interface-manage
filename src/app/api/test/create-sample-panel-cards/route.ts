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

    const createdCards = [];
    
    for (const company of companies) {
      for (const cardData of sampleCards) {
        const card = await prisma.panelCard.create({
          data: {
            ...cardData,
            companyId: company.id,
            isActive: true
          }
        });
        createdCards.push(card);
      }
    }

    return NextResponse.json({ 
      message: 'Cartes de panel d\'exemple créées',
      createdCount: createdCards.length,
      cards: createdCards
    });
  } catch (error) {
    console.error('Erreur lors de la création des cartes d\'exemple:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création des cartes d\'exemple' },
      { status: 500 }
    );
  }
}
