import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { generateUserPassword } from '@/lib/password-generator';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Signature manquante' },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Erreur de vérification webhook:', err);
    return NextResponse.json(
      { error: 'Signature invalide' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription;
        
        console.log('💰 Paiement réussi pour la souscription:', subscriptionId);
        
        // Mettre à jour le statut de l'abonnement
        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscriptionId },
          data: { status: 'active' },
        });

        // Récupérer les informations de l'entreprise
        const subscription = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscriptionId },
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
                amount: invoice.amount_paid / 100,
              },
            });
            
            console.log('📧 Email avec identifiants envoyé à:', subscription.company.email);
            
            // Stocker les identifiants temporairement pour la page de succès
            // (optionnel: on peut aussi les retourner via l'API de session)
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
                amount: invoice.amount_paid / 100,
              },
            });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription;
        
        // Mettre à jour le statut de l'abonnement
        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscriptionId },
          data: { status: 'past_due' },
        });

        // Récupérer les informations de l'entreprise
        const subscription = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscriptionId },
          include: { company: true },
        });

        if (subscription && subscription.company.email) {
          // Envoyer un email d'échec de paiement
          await sendEmail({
            to: subscription.company.email,
            subject: 'Échec de paiement - Drelto',
            template: 'payment-failed',
            data: {
              companyName: subscription.company.name,
              plan: subscription.plan,
            },
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        
        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        
        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: { status: 'canceled' },
        });
        break;
      }

      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erreur lors du traitement du webhook:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
