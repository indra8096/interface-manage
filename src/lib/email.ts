import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailData {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

export async function sendEmail({ to, subject, template, data }: EmailData) {
  const html = getEmailTemplate(template, data);
  
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Erreur envoi email:', error);
    throw error;
  }
}

function getEmailTemplate(template: string, data: Record<string, any>): string {
  switch (template) {
    case 'welcome':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: white; padding: 20px; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #CCFF00; font-size: 28px; margin: 0;">Bienvenue sur Drelto !</h1>
            <p style="color: #999; margin: 10px 0;">Votre plateforme de gestion d'abonnements</p>
          </div>
          
          <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #CCFF00; margin-top: 0;">Votre compte a été créé avec succès</h2>
            <p>Bonjour ${data.contactName || 'Cher client'},</p>
            <p>Votre entreprise <strong style="color: #CCFF00;">${data.companyName}</strong> a été créée avec succès et votre abonnement est maintenant actif.</p>
          </div>

          <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #CCFF00; margin-top: 0;">Vos identifiants de connexion :</h3>
            <div style="background: #1a1a1a; padding: 15px; border-radius: 5px; border-left: 4px solid #CCFF00;">
              <p style="margin: 5px 0;"><strong>Email :</strong> <span style="color: #CCFF00;">${data.email}</span></p>
              <p style="margin: 5px 0;"><strong>Mot de passe temporaire :</strong> <span style="color: #CCFF00; font-family: monospace; background: #333; padding: 2px 6px; border-radius: 3px;">${data.tempPassword}</span></p>
            </div>
            <p style="color: #ff6b6b; font-size: 14px; margin: 10px 0 0 0;">⚠️ Nous vous recommandons de changer votre mot de passe lors de votre première connexion.</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/login" style="background: linear-gradient(45deg, #CCFF00, #9933FF); color: black; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 10px;">Se connecter maintenant</a>
            <br>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/billing" style="background: transparent; color: #CCFF00; padding: 10px 20px; text-decoration: none; border: 2px solid #CCFF00; border-radius: 8px; display: inline-block; margin: 10px;">Gérer la facturation</a>
          </div>

          <div style="border-top: 1px solid #333; padding-top: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 12px;">
            <p>Cet email a été envoyé automatiquement. Ne répondez pas à cet email.</p>
            <p>Drelto - Plateforme de gestion d'abonnements</p>
          </div>
        </div>
      `;

    case 'payment-success':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #CCFF00;">Paiement confirmé</h1>
          <p>Bonjour ${data.contactName},</p>
          <p>Votre paiement pour le plan <strong>${data.plan}</strong> a été confirmé.</p>
          <p>Montant : <strong>${data.amount}€</strong></p>
          <p>Votre abonnement est maintenant actif.</p>
        </div>
      `;

    case 'payment-failed':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ff4444;">Échec de paiement</h1>
          <p>Bonjour ${data.contactName},</p>
          <p>Le paiement pour votre abonnement <strong>${data.plan}</strong> a échoué.</p>
          <p>Veuillez mettre à jour vos informations de paiement pour éviter la suspension de votre compte.</p>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/billing" style="background: #CCFF00; color: black; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Gérer la facturation</a>
        </div>
      `;

    default:
      return '<p>Email template non trouvé</p>';
  }
}
