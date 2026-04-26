import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit, getRateLimitKey, getClientIp } from '@/lib/rate-limiter';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Content Security Policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https: blob:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://api.neon.tech https://*.vercel.app;
    frame-ancestors 'none';
  `.replace(/\s{2,}/g, ' ').trim();
  
  response.headers.set('Content-Security-Policy', cspHeader);
  
  const path = request.nextUrl.pathname;
  const ip = getClientIp(request) || 'unknown';

  // Rate limiting للـ API routes فقط
  if (path.startsWith('/api/')) {
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
            'X-RateLimit-Limit': '1000',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(limit.resetAt).toISOString(),
            'Content-Security-Policy': cspHeader,
          }
        }
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
