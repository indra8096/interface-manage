import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Supprimer tous les templates existants
    await prisma.panelCardInstance.deleteMany({});
    await prisma.panelCardTemplate.deleteMany({});

    // Cartes par défaut basées sur CategoryDetailsPanel
    const defaultTemplates = [
      // COUVERTURE
      {
        name: 'Formation Cybersécurité',
        type: 'coverage' as const,
        category: 'defensive' as const,
        description: 'Formation de sensibilisation à la cybersécurité pour les employés',
        instanceData: {
          total: 30,
          completed: 10
        }
      },
      {
        name: 'Pentest Infrastructure',
        type: 'coverage' as const,
        category: 'defensive' as const,
        description: 'Test de pénétration sur l\'infrastructure réseau',
        instanceData: {
          total: 5,
          completed: 1
        }
      },
      
      // INFRASTRUCTURE
      {
        name: 'Configuration Switches',
        type: 'infrastructure' as const,
        category: 'defensive' as const,
        description: 'Configuration et sécurisation des switches réseau',
        instanceData: {
          equipmentCount: 15,
          status: 'Sécurisé'
        }
      },
      {
        name: 'Audit Serveurs',
        type: 'infrastructure' as const,
        category: 'defensive' as const,
        description: 'Audit de sécurité des serveurs actifs',
        instanceData: {
          equipmentCount: 8,
          status: 'À vérifier'
        }
      },
      {
        name: 'Maintenance Firewalls',
        type: 'infrastructure' as const,
        category: 'defensive' as const,
        description: 'Maintenance et mise à jour des firewalls',
        instanceData: {
          equipmentCount: 3,
          status: 'Critique'
        }
      },
      {
        name: 'Configuration Routers',
        type: 'infrastructure' as const,
        category: 'defensive' as const,
        description: 'Configuration et optimisation des routeurs',
        instanceData: {
          equipmentCount: 5,
          status: 'Normal'
        }
      },
      
      // CONFORMITÉ
      {
        name: 'Audit ISO 27001',
        type: 'compliance' as const,
        category: 'defensive' as const,
        description: 'Audit de conformité ISO 27001',
        instanceData: {
          status: 'CONFORME',
          certificationDate: '2023',
          nextAudit: 'Décembre 2024'
        }
      },
      {
        name: 'Mise en conformité NIS2',
        type: 'compliance' as const,
        category: 'defensive' as const,
        description: 'Mise en conformité avec la directive NIS2',
        instanceData: {
          status: 'EN COURS',
          certificationDate: '',
          nextAudit: 'Octobre 2024'
        }
      },
      {
        name: 'Vérification RGPD',
        type: 'compliance' as const,
        category: 'defensive' as const,
        description: 'Vérification de la conformité RGPD',
        instanceData: {
          status: 'CONFORME',
          certificationDate: '',
          nextAudit: 'Mars 2024'
        }
      },
      
      // RECOMMANDATIONS
      {
        name: 'Formation Cybersécurité Étendue',
        type: 'recommendation' as const,
        category: 'defensive' as const,
        description: 'Étendre la formation cybersécurité aux 20 personnes restantes',
        instanceData: {
          deadline: '2 mois'
        }
      },
      {
        name: 'Pentest Serveurs Restants',
        type: 'recommendation' as const,
        category: 'defensive' as const,
        description: 'Effectuer des pentests sur les 4 serveurs restants',
        instanceData: {
          deadline: '3 mois'
        }
      },
      {
        name: 'Mise à jour Documentation',
        type: 'recommendation' as const,
        category: 'defensive' as const,
        description: 'Mettre à jour la documentation de sécurité',
        instanceData: {
          deadline: '6 mois'
        }
      }
    ];

    // Créer les templates
    const createdTemplates = [];
    for (const templateData of defaultTemplates) {
      const template = await prisma.panelCardTemplate.create({
        data: {
          name: templateData.name,
          type: templateData.type,
          category: templateData.category,
          description: templateData.description,
          isActive: true
        }
      });
      createdTemplates.push({ template, instanceData: templateData.instanceData });
    }

    // Créer des instances pour toutes les entreprises existantes
    const companies = await prisma.company.findMany();
    const createdInstances = [];
    
    for (const { template, instanceData } of createdTemplates) {
      for (const company of companies) {
        const instance = await prisma.panelCardInstance.create({
          data: {
            templateId: template.id,
            companyId: company.id,
            total: instanceData.total || 0,
            completed: instanceData.completed || 0,
            equipmentCount: instanceData.equipmentCount || 0,
            status: instanceData.status || '',
            certificationDate: instanceData.certificationDate || '',
            nextAudit: instanceData.nextAudit || '',
            deadline: instanceData.deadline || '',
            isActive: true
          }
        });
        createdInstances.push(instance);
      }
    }

    return NextResponse.json({
      message: 'Templates de panel de suivi créés avec succès',
      templatesCreated: createdTemplates.length,
      instancesCreated: createdInstances.length,
      templates: createdTemplates.map(({ template }) => template)
    });

  } catch (error) {
    console.error('Erreur lors de la création des templates:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
