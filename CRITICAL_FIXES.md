# 🚨 إصلاحات حرجة لمشروع TradeMaster

## 1. تحديث متغيرات البيئة في Vercel

### اذهب إلى:
```
https://vercel.com/elswesy1s-projects/tredemaster/settings/environment-variables
```

### أضف المتغيرات التالية:
```bash
# استخدم قيم جديدة قوية
NEXTAUTH_SECRET=<generate-new-strong-secret>
ENCRYPTION_KEY=<generate-new-32-char-key>
DATABASE_URL=<your-neon-connection-string>
DIRECT_URL=<your-neon-connection-string>
```

---

## 2. تفعيل المصادقة الثنائية (2FA)

### الملف: `src/lib/two-factor.ts`
```typescript
import { authenticator } from 'otplib'
import QRCode from 'qrcode'
import { prisma } from './prisma'

export async function setup2FA(userId: string, email: string) {
  const secret = authenticator.generateSecret()
  
  // حفظ السر مشفراً
  await prisma.twoFactorAuth.create({
    data: {
      userId,
      secret: encrypt(secret),
      enabled: false,
      backupCodes: generateBackupCodes()
    }
  })
  
  const otpauth = authenticator.keyuri(email, 'TradeMaster', secret)
  const qrCode = await QRCode.toDataURL(otpauth)
  
  return { qrCode, secret }
}

export function verify2FA(token: string, secret: string): boolean {
  return authenticator.verify({ token, secret: decrypt(secret) })
}
```

---

## 3. إضافة Security Headers

### الملف: `next.config.js` (أضف)
```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ]
  }
}
```

---

## 4. Content Security Policy

### أضف في `src/middleware.ts`
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Content Security Policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https: blob:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://api.neon.tech;
    frame-ancestors 'none';
  `.replace(/\s{2,}/g, ' ').trim()
  
  response.headers.set('Content-Security-Policy', cspHeader)
  
  return response
}
```

---

## 5. تحديث الـ Dependencies

```bash
# تحديث Next.js للإصدار الآمن
npm install next@latest react@latest react-dom@latest

# تحديث الـ Audit fixes
npm audit fix --force
```

---

## 6. ترقية Rate Limiting إلى Redis

### استخدم Upstash (مجاني للمشاريع الصغيرة)
```bash
npm install @upstash/ratelimit @upstash/redis
```

### الملف: `src/lib/rate-limit.ts`
```typescript
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const loginRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
  prefix: "trademaster:login",
})

export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "trademaster:api",
})
```

---

## ✅ Checklist بعد الإصلاح

- [ ] تحديث جميع المتغيرات السرية في Vercel
- [ ] تفعيل 2FA
- [ ] إضافة Security Headers
- [ ] إضافة CSP
- [ ] تحديث Dependencies
- [ ] ترقية Rate Limiting إلى Redis
- [ ] اختبار penetrations testing
- [ ] تفعيل Logging & Monitoring
