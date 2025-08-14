/**
 * Utilitaires de sécurité pour la validation et sanitisation des entrées
 */
import * as crypto from 'crypto';

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

// Caractères dangereux à filtrer
const DANGEROUS_CHARS = [
  '<', '>', '"', "'", '&', 'javascript:', 'vbscript:', 'data:', 'onload', 'onerror',
  'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset'
];

/**
 * Valide et sanitise une chaîne de caractères
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  // Limiter la longueur
  if (input.length > maxLength) {
    input = input.substring(0, maxLength);
  }

  // Supprimer les caractères dangereux
  let sanitized = input;
  DANGEROUS_CHARS.forEach(char => {
    sanitized = sanitized.replace(new RegExp(char, 'gi'), '');
  });

  // Encoder les caractères HTML
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  return sanitized.trim();
}

/**
 * Valide un email
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return VALIDATION_PATTERNS.email.test(email.trim());
}

/**
 * Valide un mot de passe
 */
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!password || password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial (@$!%*?&)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Valide un nom d'utilisateur
 */
export function validateUsername(username: string): boolean {
  if (!username || typeof username !== 'string') return false;
  return VALIDATION_PATTERNS.username.test(username.trim());
}

/**
 * Valide une URL
 */
export function validateUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return VALIDATION_PATTERNS.url.test(url.trim());
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
 * Valide un token CSRF
 */
export function validateCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false;
  return token === storedToken;
}

/**
 * Nettoie un objet en appliquant la sanitisation à toutes les chaînes
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T, maxLength: number = 1000): T {
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
  
  return sanitized as T;
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

/**
 * Log de sécurité
 */
export function logSecurityEvent(event: string, details: Record<string, unknown>, level: 'info' | 'warn' | 'error' = 'info'): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    event,
    details,
    ip: process.env.REMOTE_ADDR || 'unknown',
    userAgent: process.env.HTTP_USER_AGENT || 'unknown'
  };
  
  console.log(`[SECURITY-${level.toUpperCase()}] ${JSON.stringify(logEntry)}`);
  
  // En production, vous pourriez envoyer ces logs à un service externe
  if (process.env.NODE_ENV === 'production') {
    // TODO: Implémenter l'envoi vers un service de logging sécurisé
  }
}
