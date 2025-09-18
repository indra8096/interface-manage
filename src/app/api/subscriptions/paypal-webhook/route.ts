import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { generateUserPassword } from '@/lib/password-generator';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventType = body.event_type;
    const resource = body.resource;

    console.log('🔔 Webhook PayPal reçu:', eventType);

    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        const subscriptionId = resource.id;
        
        console.log('✅ Souscription PayPal activée:', subscriptionId);
        
        // Mettre à jour le statut de l'abonnement
        await prisma.subscription.update({
          where: { paypalSubscriptionId: subscriptionId },
          data: { status: 'active' },
        });

        // Récupérer les informations de l'entreprise
        const subscription = await prisma.subscription.findUnique({
          where: { paypalSubscriptionId: subscriptionId },
          include: { company: true },
        });

        if (subscription && subscription.company.email) {
          console.log('🏢 Entreprise trouvée:', subscription.company.name);
          
          // Vérifier si un utilisateur MANAGEMENT_ADMIN existe déjà pour cette entreprise
          let managementAdmin = await prisma.user.findFirst({
            where: { 
              companyId: subscription.company.id,
              role: 'MANAGEMENT_ADMIN'
            },
          });

          // Si aucun utilisateur MANAGEMENT_ADMIN n'existe, en créer un
          if (!managementAdmin) {
            console.log('👤 Création de l\'utilisateur MANAGEMENT_ADMIN...');
            
            const tempPassword = generateUserPassword(12);
            const hashedPassword = await bcrypt.hash(tempPassword, 10);
            
            managementAdmin = await prisma.user.create({
              data: {
                email: subscription.company.email,
                password: hashedPassword,
                role: 'MANAGEMENT_ADMIN',
                companyId: subscription.company.id,
                itRole: 'IT_MANAGER',
                name: subscription.company.contactName || subscription.company.name,
              },
            });
            
            console.log('✅ Utilisateur MANAGEMENT_ADMIN créé:', managementAdmin.email);
            
            // Envoyer l'email avec les identifiants
            await sendEmail({
              to: subscription.company.email,
              subject: 'Bienvenue sur Drelto - Vos identifiants de connexion',
              template: 'welcome',
              data: {
                companyName: subscription.company.name,
                contactName: subscription.company.contactName,
                email: managementAdmin.email,
                tempPassword: tempPassword,
                plan: subscription.plan,
              },
            });
            
            console.log('📧 Email avec identifiants envoyé à:', subscription.company.email);
          } else {
            console.log('👤 Utilisateur MANAGEMENT_ADMIN existe déjà:', managementAdmin.email);
            
            // Envoyer un email de confirmation de paiement simple
            await sendEmail({
              to: subscription.company.email,
              subject: 'Paiement confirmé - Drelto',
              template: 'payment-success',
              data: {
                companyName: subscription.company.name,
                plan: subscription.plan,
              },
            });
          }
        }
        break;
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED': {
        const subscriptionId = resource.id;
        
        console.log('❌ Souscription PayPal annulée:', subscriptionId);
        
        await prisma.subscription.update({
          where: { paypalSubscriptionId: subscriptionId },
          data: { status: 'canceled' },
        });
        break;
      }

      case 'BILLING.SUBSCRIPTION.SUSPENDED': {
        const subscriptionId = resource.id;
        
        console.log('⏸️ Souscription PayPal suspendue:', subscriptionId);
        
        await prisma.subscription.update({
          where: { paypalSubscriptionId: subscriptionId },
          data: { status: 'past_due' },
        });
        break;
      }

      case 'PAYMENT.SALE.COMPLETED': {
        const subscriptionId = resource.billing_agreement_id;
        
        console.log('💰 Paiement PayPal complété pour:', subscriptionId);
        
        // Mettre à jour le statut de l'abonnement
        await prisma.subscription.update({
          where: { paypalSubscriptionId: subscriptionId },
          data: { status: 'active' },
        });
        break;
      }

      case 'PAYMENT.SALE.DENIED': {
        const subscriptionId = resource.billing_agreement_id;
        
        console.log('❌ Paiement PayPal refusé pour:', subscriptionId);
        
        await prisma.subscription.update({
          where: { paypalSubscriptionId: subscriptionId },
          data: { status: 'past_due' },
        });
        break;
      }

      default:
        console.log(`Événement PayPal non géré: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erreur lors du traitement du webhook PayPal:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
