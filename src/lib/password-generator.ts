import crypto from 'crypto';

/**
 * Génère un mot de passe aléatoire robuste
 * @param length Longueur du mot de passe (défaut: 16)
 * @returns Mot de passe sécurisé
 */
export function generateSecurePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  
  // S'assurer qu'on a au moins un caractère de chaque type
  let password = '';
  password += uppercase[crypto.randomInt(0, uppercase.length)];
  password += lowercase[crypto.randomInt(0, lowercase.length)];
  password += numbers[crypto.randomInt(0, numbers.length)];
  password += symbols[crypto.randomInt(0, symbols.length)];
  
  // Remplir le reste avec des caractères aléatoires
  for (let i = password.length; i < length; i++) {
    password += allChars[crypto.randomInt(0, allChars.length)];
  }
  
  // Mélanger le mot de passe
  return password.split('').sort(() => crypto.randomInt(0, 2) - 1).join('');
}

/**
 * Génère un mot de passe plus simple pour les utilisateurs (sans symboles)
 * @param length Longueur du mot de passe (défaut: 12)
 * @returns Mot de passe utilisateur
 */
export function generateUserPassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  
  const allChars = uppercase + lowercase + numbers;
  
  // S'assurer qu'on a au moins un caractère de chaque type
  let password = '';
  password += uppercase[crypto.randomInt(0, uppercase.length)];
  password += lowercase[crypto.randomInt(0, lowercase.length)];
  password += numbers[crypto.randomInt(0, numbers.length)];
  
  // Remplir le reste avec des caractères aléatoires
  for (let i = password.length; i < length; i++) {
    password += allChars[crypto.randomInt(0, allChars.length)];
  }
  
  // Mélanger le mot de passe
  return password.split('').sort(() => crypto.randomInt(0, 2) - 1).join('');
}
