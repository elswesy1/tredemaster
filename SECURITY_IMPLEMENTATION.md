# 🔐 خطة أمان TradeMaster

## 1. أمان قاعدة البيانات

### Prisma Schema Security
```prisma
// إضافة حقول التشفير
model User {
  // ... existing fields ...
  
  // تشفير البيانات الحساسة
  encryptedPassword String?  // بدلاً من password مباشرة
  encryptedPhone    String?
  
  // Two-Factor Authentication
  twoFactorSecret   String?    // مشفر
  twoFactorEnabled  Boolean    @default(false)
  backupCodes       String[]   // مشفرة
  
  // Security Metadata
  lastPasswordChange DateTime?
  passwordHistory    String[]  // آخر 5 كلمات مرور
  securityQuestions  Json?
}

model TradingAccount {
  // ... existing fields ...
  
  // تشفير بيانات الحساب
  encryptedApiKey    String?
  encryptedApiSecret String?
  encryptedPassword  String?
  
  // Security
  ipAddressWhitelist String[]  // عناوين IP المسموحة
  sessionTimeout     Int       @default(30) // بالدقائق
}

model PaymentMethod {
  id                String   @id @default(cuid())
  userId            String
  
  // لا نخزن بيانات البطاقة أبداً
  stripePaymentId   String   @unique  // مرجع Stripe فقط
  last4             String            // آخر 4 أرقام فقط
  brand             String            // Visa, Mastercard
  expiryMonth       Int
  expiryYear        Int
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## 2. API Security

### Rate Limiting
```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const loginRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"), // 5 محاولات كل 15 دقيقة
  analytics: true,
  prefix: "trademaster:login",
})

export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 طلب/دقيقة
  analytics: true,
  prefix: "trademaster:api",
})
```

### Input Validation
```typescript
// src/lib/validation.ts
import { z } from "zod"

export const loginSchema = z.object({
  email: z.string()
    .email("Invalid email format")
    .max(255)
    .transform(email => email.toLowerCase().trim()),
    
  password: z.string()
    .min(12, "Password must be at least 12 characters")
    .max(128)
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[a-z]/, "Must contain lowercase")
    .regex(/[0-9]/, "Must contain number")
    .regex(/[^A-Za-z0-9]/, "Must contain special character"),
    
  totpCode: z.string()
    .length(6)
    .regex(/^[0-9]+$/)
    .optional(),
})

export const tradeSchema = z.object({
  symbol: z.string().max(20),
  type: z.enum(["buy", "sell"]),
  quantity: z.number().positive().max(1000000),
  price: z.number().positive().max(1000000),
  stopLoss: z.number().positive().optional(),
  takeProfit: z.number().positive().optional(),
})
```

## 3. Session Security

```typescript
// src/lib/session.ts
import { getIronSession } from "iron-session"
import { cookies } from "next/headers"

export interface SessionData {
  userId: string
  email: string
  role: string
  twoFactorVerified: boolean
  createdAt: Date
  expiresAt: Date
  ipAddress?: string
  userAgent?: string
}

export const sessionOptions = {
  password: process.env.SESSION_SECRET!, // 32+ chars
  cookieName: "trademaster_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 60 * 60 * 24 * 7, // أسبوع
    path: "/",
  },
}

export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}
```

## 4. CSRF Protection

```typescript
// src/middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { randomBytes } from "crypto"

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Generate CSRF token
  const csrfToken = request.cookies.get("csrf_token")?.value
  
  if (!csrfToken) {
    const newToken = randomBytes(32).toString("hex")
    response.cookies.set("csrf_token", newToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    })
  }
  
  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  
  return response
}
```

## 5. Audit Logging

```typescript
// src/lib/audit.ts
import { prisma } from "./db"

interface AuditLogData {
  userId: string
  action: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

export async function createAuditLog(data: AuditLogData) {
  return prisma.auditLog.create({
    data: {
      userId: data.userId,
      action: data.action,
      details: data.details,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    },
  })
}

// أنواع الأحداث
export const AUDIT_EVENTS = {
  // Authentication
  LOGIN_SUCCESS: "auth.login.success",
  LOGIN_FAILED: "auth.login.failed",
  LOGOUT: "auth.logout",
  REGISTER: "auth.register",
  PASSWORD_CHANGE: "auth.password.change",
  
  // Trading
  TRADE_OPEN: "trade.open",
  TRADE_CLOSE: "trade.close",
  TRADE_MODIFY: "trade.modify",
  
  // Account
  ACCOUNT_CREATE: "account.create",
  ACCOUNT_UPDATE: "account.update",
  ACCOUNT_DELETE: "account.delete",
  
  // Payment
  PAYMENT_INITIATED: "payment.initiated",
  PAYMENT_SUCCESS: "payment.success",
  PAYMENT_FAILED: "payment.failed",
  
  // Security
  TWO_FACTOR_ENABLED: "security.2fa.enabled",
  TWO_FACTOR_DISABLED: "security.2fa.disabled",
  SUSPICIOUS_ACTIVITY: "security.suspicious",
}
```

## 6. Environment Variables (Required)

```bash
# .env.example

# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="your-32-char-secret-here"
NEXTAUTH_URL="https://trademaster.app"

# Session
SESSION_SECRET="your-32-char-session-secret"

# Encryption
ENCRYPTION_KEY="your-32-char-encryption-key"

# Rate Limiting
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
SMTP_HOST="smtp.sendgrid.net"
SMTP_USER="apikey"
SMTP_PASS="..."
EMAIL_FROM="noreply@trademaster.app"
```

## 7. Security Checklist

- [ ] HTTPS Everywhere
- [ ] HTTP Strict Transport Security (HSTS)
- [ ] Content Security Policy (CSP)
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Permissions-Policy
- [ ] Input Validation on all endpoints
- [ ] Rate Limiting
- [ ] Session Management
- [ ] Two-Factor Authentication
- [ ] Password Hashing (bcrypt)
- [ ] SQL Injection Prevention (Prisma)
- [ ] XSS Prevention
- [ ] CSRF Protection
- [ ] Audit Logging
- [ ] Error Handling (no sensitive data)
- [ ] Dependency Scanning
- [ ] Regular Security Audits
