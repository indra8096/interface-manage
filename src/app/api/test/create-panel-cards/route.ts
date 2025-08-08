import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Trouver l'entreprise AZUS
    const azusCompany = await prisma.company.findFirst({
      where: { name: 'AZUS' }
    });

    if (!azusCompany) {
      return NextResponse.json({ error: 'Entreprise AZUS non trouvée' }, { status: 404 });
    }

    // Créer des cartes de panel de test pour AZUS
    const testCards = [
      {
        name: 'Formation Cybersécurité',
        type: 'coverage',
        category: 'defensive',
        total: 30,
        completed: 10,
        priority: 'Moyenne',
        description: 'Formation obligatoire pour tous les employés',
        deadline: '2024-12-31',
        isActive: true,
        companyId: azusCompany.id
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
        isActive: true,
        companyId: azusCompany.id
      },
      {
        name: 'Configuration Switches',
        type: 'infrastructure',
        category: 'general',
        equipmentCount: 15,
        status: 'Sécurisé',
        priority: 'Moyenne',
        description: 'Configuration des switches réseau',
        isActive: true,
        companyId: azusCompany.id
      },
      {
        name: 'Audit Serveurs',
        type: 'infrastructure',
        category: 'defensive',
        equipmentCount: 8,
        status: 'À vérifier',
        priority: 'Haute',
        description: 'Audit de sécurité des serveurs',
        isActive: true,
        companyId: azusCompany.id
      },
      {
        name: 'Maintenance Firewalls',
        type: 'infrastructure',
        category: 'defensive',
        equipmentCount: 5,
        status: 'Critique',
        priority: 'Haute',
        description: 'Maintenance des firewalls',
        isActive: true,
        companyId: azusCompany.id
      },
      {
        name: 'Configuration Routers',
        type: 'infrastructure',
        category: 'general',
        equipmentCount: 5,
        status: 'Normal',
        priority: 'Moyenne',
        description: 'Configuration des routeurs',
        isActive: true,
        companyId: azusCompany.id
      },
      {
        name: 'Certification ISO 27001',
        type: 'compliance',
        category: 'defensive',
        status: 'EN COURS',
        certificationDate: '2024-06-15',
        nextAudit: '2025-06-15',
        priority: 'Haute',
        description: 'Certification de sécurité ISO 27001',
        isActive: true,
        companyId: azusCompany.id
      },
      {
        name: 'Audit de Conformité RGPD',
        type: 'compliance',
        category: 'defensive',
        status: 'CONFORME',
        certificationDate: '2024-03-20',
        nextAudit: '2025-03-20',
        priority: 'Moyenne',
        description: 'Audit de conformité RGPD',
        isActive: true,
        companyId: azusCompany.id
      },
      {
        name: 'Mise à jour des politiques de sécurité',
        type: 'recommendation',
        category: 'defensive',
        priority: 'Haute',
        description: 'Mise à jour des politiques de sécurité selon les nouvelles normes',
        deadline: '2024-10-31',
        isActive: true,
        companyId: azusCompany.id
      },
      {
        name: 'Formation des administrateurs',
        type: 'recommendation',
        category: 'general',
        priority: 'Moyenne',
        description: 'Formation spécialisée pour les administrateurs système',
        deadline: '2024-09-30',
        isActive: true,
        companyId: azusCompany.id
      }
    ];

    // Créer les cartes
    const createdCards = await Promise.all(
      testCards.map(card => prisma.panelCard.create({ data: card }))
    );

    return NextResponse.json({ 
      message: 'Cartes de panel de test créées pour AZUS',
      cards: createdCards
    });
  } catch (error) {
    console.error('Erreur lors de la création des cartes de test:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création des cartes de test' },
      { status: 500 }
    );
  }
}
