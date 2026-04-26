import { NextResponse } from 'next/server';

interface RateLimitConfig {
  limit: number;        // عدد الطلبات المسموح بها
  window: number;       // النافذة الزمنية بالثواني
}

interface RateLimitResult {
  success: boolean;
  limit: number;           // ADD THIS
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

// In-memory store (للإنتاج استخدم Redis)
const store = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  config: RateLimitConfig | string = 'default'
): RateLimitResult {
  const now = Date.now();
  
  // إعدادات افتراضية حسب نوع العملية
  const configs: Record<string, RateLimitConfig> = {
    default: { limit: 100, window: 60 },           // 100 طلب/دقيقة
    create_account: { limit: 3, window: 3600 },    // 3 حسابات/ساعة
    login: { limit: 5, window: 900 },              // 5 محاولات/15 دقيقة
    create_trade: { limit: 50, window: 60 },       // 50 صفقة/دقيقة
    create_playbook: { limit: 20, window: 60 },    // 20 playbook/دقيقة
    password_reset: { limit: 3, window: 3600 },    // 3 محاولات/ساعة
    api_call: { limit: 1000, window: 3600 },       // 1000 طلب/ساعة
    psychology_log_create: { limit: 30, window: 60 }, // 30 سجل/دقيقة
    journal_create: { limit: 30, window: 60 },     // 30 يومية/دقيقة
    risk_profile_create: { limit: 10, window: 60 }, // 10 ملفات مخاطر/دقيقة
    register: { limit: 3, window: 3600 },          // 3 تسجيل/ساعة
    ai_analysis: { limit: 20, window: 60 },        // 20 تحليل/دقيقة
    ai_chat: { limit: 30, window: 60 },            // 30 محادثة/دقيقة
  };
  
  const effectiveConfig = typeof config === 'string' 
    ? configs[config] || configs.default 
    : config;
  
  const record = store.get(key);
  
  // إنشاء سجل جديد أو تحديث القديم
  if (!record || now > record.resetAt) {
    const resetAt = now + (effectiveConfig.window * 1000);
    store.set(key, { count: 1, resetAt });
    
    return {
      success: true,
      limit: effectiveConfig.limit,
      remaining: effectiveConfig.limit - 1,
      resetAt,
    };
  }
  
  // التحقق من تجاوز الحد
  if (record.count >= effectiveConfig.limit) {
    return {
      success: false,
      limit: effectiveConfig.limit,
      remaining: 0,
      resetAt: record.resetAt,
      retryAfter: Math.ceil((record.resetAt - now) / 1000),
    };
  }
  
  // زيادة العداد
  record.count++;
  
  return {
    success: true,
    limit: effectiveConfig.limit,
    remaining: effectiveConfig.limit - record.count,
    resetAt: record.resetAt,
  };
}

// Helper لإنشاء key فريد للمستخدم/IP
export function getRateLimitKey(
  userId: string | null,
  action: string,
  ip?: string | null
): string {
  const identifier = userId || ip || 'anonymous';
  return `${action}:${identifier}`;
}

// Helper للتحقق من Rate Limit وإرجاع Response مناسب
export function checkRateLimit(
  userId: string | null,
  action: string,
  config: RateLimitConfig | string = 'default',
  ip?: string | null
): { success: boolean; response?: NextResponse; remaining: number } {
  const key = getRateLimitKey(userId, action, ip);
  const result = rateLimit(key, config);
  
  if (!result.success) {
    return {
      success: false,
      remaining: 0,
      response: NextResponse.json(
        { 
          error: 'Too many requests', 
          retryAfter: result.retryAfter,
          message: 'تم تجاوز الحد المسموح، يرجى المحاولة لاحقاً'
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(result.retryAfter || 60),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(result.resetAt),
          }
        }
      ),
    };
  }
  
  return { success: true, remaining: result.remaining };
}

// تنظيف الـ store بشكل دوري (كل ساعة)
if (typeof global !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of store.entries()) {
      if (now > value.resetAt) {
        store.delete(key);
      }
    }
  }, 3600000); // كل ساعة
}

// Helper للحصول على IP من Request
export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  return null;
}

// Helper لإنشاء Rate Limit Headers
export function getRateLimitHeaders(
  limit: number,
  remaining: number,
  resetAt: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(resetAt).toISOString(),
  };
}
