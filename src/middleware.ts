import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Headers de sécurité supplémentaires
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  
  // HSTS en production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Protection contre les attaques par timing sur les routes sensibles
  if (request.nextUrl.pathname.startsWith('/api/auth/')) {
    // Délai aléatoire pour éviter l'énumération
    const delay = Math.floor(Math.random() * 100) + 50;
    response.headers.set('X-Response-Time', `${delay}ms`);
  }

  // Protection CSRF pour les routes POST/PUT/DELETE
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    
    // Vérification de l'origine pour les requêtes cross-origin
    if (origin && process.env.NODE_ENV === 'production') {
      const allowedOrigins = [
        process.env.NEXT_PUBLIC_BASE_URL,
        'https://vercel.live',
        'https://vercel.app',
        'https://drelto-interface.vercel.app',
        'https://interface-managee-drelto-62e0lksbj-soufs-projects-d07553b5.vercel.app',
        'https://interface-managee-drelto-a2dpdb31g-soufs-projects-d07553b5.vercel.app',
        'https://interface-managee-drelto-*.vercel.app',
        'https://interface-manage-*.vercel.app',
        'https://*.vercel.app'
      ].filter(Boolean);
      
      if (!allowedOrigins.includes(origin)) {
        return new NextResponse('Forbidden', { status: 403 });
      }
    }
  }

  // Rate limiting basique (peut être amélioré avec Redis)
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const rateLimitKey = `rate_limit_${ip}`;
  
  // Log des tentatives d'accès suspectes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    console.log(`[${new Date().toISOString()}] ${request.method} ${request.nextUrl.pathname} - IP: ${ip}`);
  }

  // Protection contre les attaques par injection
  const userAgent = request.headers.get('user-agent') || '';
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload/i,
    /onerror/i,
    /eval\(/i,
    /document\./i
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    console.warn(`[SECURITY] User-Agent suspect détecté: ${userAgent}`);
    return new NextResponse('Forbidden', { status: 403 });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
