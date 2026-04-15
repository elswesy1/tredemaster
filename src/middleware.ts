import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limiter';

export function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  const path = request.nextUrl.pathname;

  // Rate limiting للـ API routes فقط
  if (path.startsWith('/api/')) {
    // تحديد نوع العملية حسب المسار
    let action = 'api_call';
    
    if (path.includes('/auth/login')) {
      action = 'login';
    } else if (path.includes('/auth/register') || path.includes('/auth/signup')) {
      action = 'register';
    } else if (path.includes('/auth/forgot-password') || path.includes('/auth/send-password-reset')) {
      action = 'password_reset';
    } else if (path.includes('/accounts') && request.method === 'POST') {
      action = 'create_account';
    } else if (path.includes('/playbooks') && request.method === 'POST') {
      action = 'create_playbook';
    } else if (path.includes('/trades') && request.method === 'POST') {
      action = 'create_trade';
    } else if (path.includes('/psychology') && request.method === 'POST') {
      action = 'psychology_log_create';
    } else if (path.includes('/journal') && request.method === 'POST') {
      action = 'journal_create';
    } else if (path.includes('/risk-profiles') && request.method === 'POST') {
      action = 'risk_profile_create';
    } else if (path.includes('/ai-analysis') || path.includes('/ai-chat')) {
      action = 'ai_analysis';
    }

    const key = getRateLimitKey(null, action, ip);
    const limit = rateLimit(key, action);

    // إضافة headers للـ response
    const response = limit.success 
      ? NextResponse.next()
      : NextResponse.json(
          { 
            error: 'Too many requests',
            message: 'تم تجاوز الحد المسموح، يرجى المحاولة لاحقاً',
            retryAfter: limit.retryAfter 
          },
          { status: 429 }
        );

    // إضافة Rate Limit headers
    response.headers.set('X-RateLimit-Limit', limit.success ? '1000' : '0');
    response.headers.set('X-RateLimit-Remaining', limit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(limit.resetAt).toISOString());
    
    if (limit.retryAfter) {
      response.headers.set('Retry-After', limit.retryAfter.toString());
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
