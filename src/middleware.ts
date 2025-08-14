import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// === CONFIGURATION DE SÉCURITÉ ===
const SECURITY_HEADERS = {
  // Protection XSS
  'X-XSS-Protection': '1; mode=block',
  // Protection contre le clickjacking
  'X-Frame-Options': 'DENY',
  // Protection contre le MIME sniffing
  'X-Content-Type-Options': 'nosniff',
  // Protection contre les attaques de référence
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Politique de sécurité du contenu (CSP)
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  // Permissions Policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  // HSTS (HTTPS Strict Transport Security)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
};

// === RÈGLES DE SÉCURITÉ ===
const SECURITY_RULES = {
  // Routes sensibles qui nécessitent une authentification
  protectedRoutes: [
    '/dashboard',
    '/admin',
    '/superadmin',
    '/api/auth/verify-password',
    '/api/users',
    '/api/services',
    '/api/tasks'
  ],
  
  // Routes publiques autorisées
  publicRoutes: [
    '/',
    '/login',
    '/api/auth/login',
    '/favicon.ico',
    '/_next',
    '/api/test'
  ],
  
  // Patterns d'injection à bloquer
  blockedPatterns: [
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
    /xp_cmdshell/gi,
    /alert\s*\(/gi,
    /confirm\s*\(/gi,
    /prompt\s*\(/gi
  ]
};

// === FONCTIONS DE SÉCURITÉ ===

/**
 * Vérifie si une route est protégée
 */
function isProtectedRoute(pathname: string): boolean {
  return SECURITY_RULES.protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
}

/**
 * Vérifie si une route est publique
 */
function isPublicRoute(pathname: string): boolean {
  return SECURITY_RULES.publicRoutes.some(route => 
    pathname.startsWith(route)
  );
}

/**
 * Détecte les tentatives d'injection
 */
function detectInjection(url: string, headers: Headers): boolean {
  const userAgent = headers.get('user-agent') || '';
  const referer = headers.get('referer') || '';
  
  // Vérifier l'URL
  for (const pattern of SECURITY_RULES.blockedPatterns) {
    if (pattern.test(url)) {
      console.warn('🚨 Tentative d\'injection détectée dans l\'URL:', url);
      return true;
    }
  }
  
  // Vérifier le User-Agent
  for (const pattern of SECURITY_RULES.blockedPatterns) {
    if (pattern.test(userAgent)) {
      console.warn('🚨 Tentative d\'injection détectée dans User-Agent:', userAgent);
      return true;
    }
  }
  
  // Vérifier le Referer
  for (const pattern of SECURITY_RULES.blockedPatterns) {
    if (pattern.test(referer)) {
      console.warn('🚨 Tentative d\'injection détectée dans Referer:', referer);
      return true;
    }
  }
  
  return false;
}

/**
 * Vérifie l'authentification via le token JWT
 */
function verifyAuthToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cookieToken = request.cookies.get('auth-token')?.value;
  
  if (!authHeader && !cookieToken) {
    return false;
  }
  
  // Ici vous pourriez ajouter une vérification JWT plus poussée
  // Pour l'instant, on vérifie juste la présence du token
  return true;
}

// === MIDDLEWARE PRINCIPAL ===

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const startTime = Date.now();
  
  // === VÉRIFICATIONS DE SÉCURITÉ ===
  
  // 1. Détection d'injection
  if (detectInjection(pathname, request.headers)) {
    console.warn('🚨 Tentative d\'injection bloquée:', {
      pathname,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });
    
    return new NextResponse('Forbidden - Tentative d\'injection détectée', {
      status: 403,
      headers: {
        'Content-Type': 'text/plain',
        'X-Blocked-Reason': 'injection-detected'
      }
    });
  }
  
  // 2. Vérification des routes protégées
  if (isProtectedRoute(pathname)) {
    if (!verifyAuthToken(request)) {
      console.warn('🚨 Tentative d\'accès non autorisé:', {
        pathname,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      });
      
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // 3. Blocage des tentatives d'accès aux fichiers sensibles
  if (pathname.includes('.env') || 
      pathname.includes('.git') || 
      pathname.includes('package.json') ||
      pathname.includes('node_modules')) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  
  // === APPLICATION DES HEADERS DE SÉCURITÉ ===
  
  const response = NextResponse.next();
  
  // Ajouter tous les headers de sécurité
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Headers de sécurité supplémentaires
  response.headers.set('X-Request-ID', crypto.randomUUID());
  response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);
  
  // === LOGGING DE SÉCURITÉ ===
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`🔒 [MIDDLEWARE] ${request.method} ${pathname} - ${response.status} - ${Date.now() - startTime}ms`);
  }
  
  return response;
}

// === CONFIGURATION DU MIDDLEWARE ===

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
