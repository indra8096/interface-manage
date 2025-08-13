import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Créer des templates de cartes de panel
    const panelTemplates = [
      {
        name: 'Formation Cybersécurité',
        type: 'coverage' as const,
        category: 'defensive' as const,
        description: 'Formation obligatoire pour tous les employés',
        priority: 'Moyenne'
      },
      {
        name: 'Pentest Infrastructure',
        type: 'coverage' as const,
        category: 'offensive' as const,
        description: 'Tests de pénétration sur l\'infrastructure',
        priority: 'Haute'
      },
      {
        name: 'Configuration Switches',
        type: 'infrastructure' as const,
        category: 'general' as const,
        description: 'Configuration des switches réseau',
        priority: 'Moyenne'
      },
      {
        name: 'Certification ISO 27001',
        type: 'compliance' as const,
        category: 'defensive' as const,
        description: 'Certification de sécurité ISO 27001',
        priority: 'Haute'
      }
    ];

    // Créer des templates de services
    const serviceTemplates = [
      {
        name: 'Firewall',
        description: 'Système de protection réseau avec filtrage de trafic',
        category: 'defensive' as const,
        icon: '🛡️',
        defaultScore: 8,
        defaultImportance: 'Haute'
      },
      {
        name: 'IDS/IPS',
        description: 'Détection et prévention d\'intrusions',
        category: 'defensive' as const,
        icon: '🔍',
        defaultScore: 9,
        defaultImportance: 'Haute'
      },
      {
        name: 'VPN',
        description: 'Réseau privé virtuel sécurisé',
        category: 'defensive' as const,
        icon: '🔒',
        defaultScore: 7,
        defaultImportance: 'Moyenne'
      },
      {
        name: 'Antivirus',
        description: 'Protection contre les logiciels malveillants',
        category: 'defensive' as const,
        icon: '🦠',
        defaultScore: 6,
        defaultImportance: 'Moyenne'
      },
      {
        name: 'Sauvegarde',
        description: 'Système de sauvegarde automatisé',
        category: 'general' as const,
        icon: '💾',
        defaultScore: 8,
        defaultImportance: 'Haute'
      },
      {
        name: 'Scan de Vulnérabilités',
        description: 'Analyse des vulnérabilités système',
        category: 'offensive' as const,
        icon: '🔬',
        defaultScore: 9,
        defaultImportance: 'Haute'
      }
    ];

    // Créer les templates de cartes de panel
    const createdPanelTemplates = [];
    for (const templateData of panelTemplates) {
      const template = await prisma.panelCardTemplate.create({
        data: templateData
      });
      createdPanelTemplates.push(template);

      // Créer des instances pour toutes les entreprises existantes
      const companies = await prisma.company.findMany();
      for (const company of companies) {
        await prisma.panelCardInstance.create({
          data: {
            templateId: template.id,
            companyId: company.id,
            total: 0,
            completed: 0,
            equipmentCount: 0,
            status: 'En cours',
            isActive: true
          }
        });
      }
    }

    // Créer les templates de services
    const createdServiceTemplates = [];
    for (const templateData of serviceTemplates) {
      const template = await prisma.serviceTemplate.create({
        data: templateData
      });
      createdServiceTemplates.push(template);
    }

    return NextResponse.json({ 
      message: 'Templates d\'exemple créés avec succès',
      panelTemplates: createdPanelTemplates.length,
      serviceTemplates: createdServiceTemplates.length,
      companies: (await prisma.company.findMany()).length
    });
  } catch (error) {
    console.error('Erreur lors de la création des templates d\'exemple:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création des templates d\'exemple' },
      { status: 500 }
    );
  }
}
