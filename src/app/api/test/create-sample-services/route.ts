import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Supprimer tous les templates existants
    await prisma.serviceTemplate.deleteMany({});

    // Créer les services prédéfinis
    const predefinedServices = [
      // Services défensifs
      {
        name: 'Firewall',
        description: 'Système de protection réseau avec filtrage de trafic',
        category: 'defensive' as const,
        icon: '🛡️',
        defaultScore: 8,
        defaultImportance: 'Élevée',
        isActive: true
      },
      {
        name: 'IDS/IPS',
        description: 'Détection et prévention d\'intrusions',
        category: 'defensive' as const,
        icon: '🔍',
        defaultScore: 9,
        defaultImportance: 'Élevée',
        isActive: true
      },
      {
        name: 'VPN',
        description: 'Réseau privé virtuel sécurisé',
        category: 'defensive' as const,
        icon: '🔒',
        defaultScore: 7,
        defaultImportance: 'Moyenne',
        isActive: true
      },
      {
        name: 'Antivirus',
        description: 'Protection contre les logiciels malveillants',
        category: 'defensive' as const,
        icon: '🦠',
        defaultScore: 6,
        defaultImportance: 'Moyenne',
        isActive: true
      },
      {
        name: 'Sauvegarde',
        description: 'Système de sauvegarde automatisé',
        category: 'defensive' as const,
        icon: '💾',
        defaultScore: 8,
        defaultImportance: 'Élevée',
        isActive: true
      },

      // Services généraux
      {
        name: 'Monitoring',
        description: 'Surveillance des systèmes et services',
        category: 'general' as const,
        icon: '📊',
        defaultScore: 7,
        defaultImportance: 'Moyenne',
        isActive: true
      },
      {
        name: 'Sauvegarde Générale',
        description: 'Sauvegarde des données critiques',
        category: 'general' as const,
        icon: '💿',
        defaultScore: 8,
        defaultImportance: 'Élevée',
        isActive: true
      },
      {
        name: 'Maintenance',
        description: 'Maintenance préventive des systèmes',
        category: 'general' as const,
        icon: '🔧',
        defaultScore: 5,
        defaultImportance: 'Moyenne',
        isActive: true
      },
      {
        name: 'Documentation',
        description: 'Documentation technique et procédures',
        category: 'general' as const,
        icon: '📋',
        defaultScore: 6,
        defaultImportance: 'Moyenne',
        isActive: true
      },
      {
        name: 'Formation',
        description: 'Formation des équipes',
        category: 'general' as const,
        icon: '🎓',
        defaultScore: 7,
        defaultImportance: 'Moyenne',
        isActive: true
      },

      // Services offensifs
      {
        name: 'Pentest',
        description: 'Tests de pénétration et audit de sécurité',
        category: 'offensive' as const,
        icon: '⚔️',
        defaultScore: 9,
        defaultImportance: 'Élevée',
        isActive: true
      },
      {
        name: 'Scan de Vulnérabilités',
        description: 'Analyse des vulnérabilités système',
        category: 'offensive' as const,
        icon: '🔍',
        defaultScore: 8,
        defaultImportance: 'Élevée',
        isActive: true
      },
      {
        name: 'Red Team',
        description: 'Simulation d\'attaques avancées',
        category: 'offensive' as const,
        icon: '🎯',
        defaultScore: 10,
        defaultImportance: 'Élevée',
        isActive: true
      },
      {
        name: 'Ingénierie Sociale',
        description: 'Tests de sensibilisation utilisateurs',
        category: 'offensive' as const,
        icon: '🎭',
        defaultScore: 7,
        defaultImportance: 'Moyenne',
        isActive: true
      },
      {
        name: 'Forensics',
        description: 'Analyse forensique et investigation',
        category: 'offensive' as const,
        icon: '🔬',
        defaultScore: 8,
        defaultImportance: 'Élevée',
        isActive: true
      }
    ];

    // Créer tous les services dans la base de données
    const createdServices = await prisma.serviceTemplate.createMany({
      data: predefinedServices
    });

    return NextResponse.json({
      message: 'Services prédéfinis créés avec succès',
      count: createdServices.count,
      services: predefinedServices
    });

  } catch (error) {
    console.error('Erreur lors de la création des services prédéfinis:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création des services prédéfinis' },
      { status: 500 }
    );
  }
}
