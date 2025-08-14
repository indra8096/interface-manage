import crypto from 'crypto';

/**
 * Utilitaires de sécurité pour la validation et sanitisation des entrées
 */

// Patterns de validation
const VALIDATION_PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  username: /^[a-zA-Z0-9_-]{3,20}$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  time: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  integer: /^-?\d+$/,
  decimal: /^-?\d*\.?\d+$/,
  hex: /^[0-9a-fA-F]+$/,
  base64: /^[A-Za-z0-9+/]*={0,2}$/
};



// === VALIDATION ET SANITISATION RENFORCÉES ===

/**
 * Validation stricte des emails avec protection contre les injections
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  
  // Protection contre les injections SQL et XSS
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /expression\s*\(/gi,
    /eval\s*\(/gi,
    /union\s+select/gi,
    /drop\s+table/gi,
    /insert\s+into/gi,
    /delete\s+from/gi,
    /update\s+set/gi,
    /exec\s*\(/gi,
    /xp_cmdshell/gi
  ];

  // Vérifier les patterns dangereux
  for (const pattern of dangerousPatterns) {
    if (pattern.test(email)) {
      console.warn('🚨 Tentative d\'injection détectée dans l\'email:', email);
      return false;
    }
  }

  // Validation email standard
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validation renforcée des mots de passe
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Mot de passe requis');
    return { isValid: false, errors };
  }

  // Protection contre les injections
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /union\s+select/gi,
    /drop\s+table/gi,
    /exec\s*\(/gi
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(password)) {
      console.warn('🚨 Tentative d\'injection détectée dans le mot de passe');
      errors.push('Mot de passe contient des caractères interdits');
      return { isValid: false, errors };
    }
  }

  if (password.length < 8) errors.push('Minimum 8 caractères');
  if (password.length > 128) errors.push('Maximum 128 caractères');
  if (!/[A-Z]/.test(password)) errors.push('Au moins une majuscule');
  if (!/[a-z]/.test(password)) errors.push('Au moins une minuscule');
  if (!/\d/.test(password)) errors.push('Au moins un chiffre');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Au moins un caractère spécial');

  return { isValid: errors.length === 0, errors };
}

/**
 * Sanitisation renforcée des chaînes avec protection XSS
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') return '';
  
  // Protection XSS - Échapper les caractères dangereux
  let sanitized = input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/\\/g, '&#x5C;')
    .replace(/\$/g, '&#x24;')
    .replace(/%/g, '&#x25;')
    .replace(/`/g, '&#x60;');

  // Supprimer les scripts et événements dangereux
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/expression\s*\(/gi, '')
    .replace(/eval\s*\(/gi, '');

  // Limiter la longueur
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized.trim();
}

/**
 * Valide un nom d'utilisateur
 */
export function validateUsername(username: string): boolean {
  if (!username || typeof username !== 'string') return false;
  return VALIDATION_PATTERNS.username.test(username.trim());
}

/**
 * Validation des noms d'entreprise avec protection
 */
export function validateCompanyName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  
  const sanitized = sanitizeString(name, 100);
  
  // Patterns dangereux pour les noms d'entreprise
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /union\s+select/gi,
    /drop\s+table/gi
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(sanitized)) return false;
  }

  return sanitized.length >= 2 && sanitized.length <= 100;
}

/**
 * Validation des URLs avec protection
 */
export function validateURL(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  // Protection contre les injections
  const dangerousPatterns = [
    /javascript:/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(url)) return false;
  }

  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}

/**
 * Valide un numéro de téléphone
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  return VALIDATION_PATTERNS.phone.test(phone.replace(/\s/g, ''));
}

/**
 * Valide une date
 */
export function validateDate(date: string): boolean {
  if (!date || typeof date !== 'string') return false;
  if (!VALIDATION_PATTERNS.date.test(date)) return false;
  
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime()) && dateObj.getTime() > 0;
}

/**
 * Valide un entier
 */
export function validateInteger(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  return VALIDATION_PATTERNS.integer.test(value.trim());
}

/**
 * Valide un nombre décimal
 */
export function validateDecimal(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  return VALIDATION_PATTERNS.decimal.test(value.trim());
}

/**
 * Génère un token CSRF sécurisé
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Génère un token sécurisé
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Valide un token CSRF
 */
export function validateCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(storedToken));
}

/**
 * Nettoie un objet en appliquant la sanitisation à toutes les chaînes
 */
export function sanitizeObject(obj: Record<string, unknown>, maxLength: number = 1000): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value, maxLength);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>, maxLength);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item, maxLength) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Vérifie si une chaîne contient du contenu suspect
 */
export function containsSuspiciousContent(input: string): boolean {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /data:text\/html/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /document\./i,
    /window\./i,
    /alert\s*\(/i,
    /confirm\s*\(/i,
    /prompt\s*\(/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(input));
}

// === PROTECTION CONTRE LES ATTAQUES PAR FORCE BRUTE ===

const loginAttempts = new Map<string, { count: number; lastAttempt: number; blockedUntil: number }>();

export function checkLoginAttempts(identifier: string, maxAttempts: number = 5, blockDuration: number = 900000): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier);

  if (!attempts) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now, blockedUntil: 0 });
    return true;
  }

  // Vérifier si l'utilisateur est bloqué
  if (now < attempts.blockedUntil) {
    logSecurityEvent('login_blocked', { identifier, blockedUntil: attempts.blockedUntil }, 'warn');
    return false;
  }

  // Réinitialiser si le délai est écoulé
  if (now - attempts.lastAttempt > 300000) { // 5 minutes
    attempts.count = 1;
    attempts.lastAttempt = now;
    attempts.blockedUntil = 0;
  } else {
    attempts.count++;
    attempts.lastAttempt = now;
  }

  // Bloquer si trop de tentatives
  if (attempts.count >= maxAttempts) {
    attempts.blockedUntil = now + blockDuration;
    logSecurityEvent('login_blocked_permanently', { identifier, attempts: attempts.count }, 'warn');
  }

  return attempts.count < maxAttempts;
}

// === LOGGING DE SÉCURITÉ ===

export function logSecurityEvent(
  event: string, 
  details: Record<string, unknown>, 
  level: 'info' | 'warn' | 'error' = 'info'
): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event,
    level,
    details,
    ip: process.env.REMOTE_ADDR || 'unknown',
    userAgent: process.env.HTTP_USER_AGENT || 'unknown'
  };

  console.log(`🔒 [${level.toUpperCase()}] ${event}:`, JSON.stringify(logEntry, null, 2));
  
  // Ici vous pourriez ajouter l'envoi vers un service de logging externe
  // comme Sentry, LogRocket, ou un service personnalisé
}
