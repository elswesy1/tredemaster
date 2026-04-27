import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit, getRateLimitKey, getClientIp } from '@/lib/rate-limiter';

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  
  // Content Security Policy - Updated to allow Google Fonts and Vercel
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://*.vercel.app;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net;
    font-src 'self' https://fonts.gstatic.com https://*.vercel.app data:;
    img-src 'self' data: https: blob: https://*.vercel.app;
    connect-src 'self' https://api.neon.tech https://*.vercel.app https://fonts.googleapis.com https://fonts.gstatic.com;
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();
  
  response.headers.set('Content-Security-Policy', cspHeader);
  
  const path = request.nextUrl.pathname;
  
  // Rate limiting للـ API routes فقط
  if (path.startsWith('/api/')) {
    const ip = getClientIp(request) || 'unknown';
    const key = getRateLimitKey(null, ip, 'api_call');
    const limit = rateLimit(key, 'api_call');

    if (!limit.success) {
      return NextResponse.json(
        { 
          error: 'Too many requests', 
          retryAfter: limit.retryAfter,
          message: 'تم تجاوز حد الطلبات المسموح' 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(limit.retryAfter || 60),
            'X-RateLimit-Limit': '1000',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(limit.resetAt).toISOString(),
          }
        }
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|icons).*)',
  ],
};
