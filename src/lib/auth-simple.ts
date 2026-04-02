import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

const secretKey = process.env.NEXTAUTH_SECRET || 'trademaster-super-secret-key-2024'
const key = new TextEncoder().encode(secretKey)

// إنشاء JWT Token
export async function createToken(payload: { userId: string; email: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // صلاحية 7 أيام
    .sign(key)
}

// التحقق من JWT Token
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key)
    return payload as { userId: string; email: string }
  } catch {
    return null
  }
}

// تسجيل نشاط الدخول
export async function logLoginActivity(
  userId: string,
  ipAddress: string | null,
  userAgent: string | null,
  successful: boolean,
  method: string = 'password'
) {
  try {
    await prisma.loginHistory.create({
      data: {
        userId,
        ipAddress,
        userAgent,
        successful,
        method,
      }
    })
  } catch (error) {
    console.error('Error logging login activity:', error)
  }
}

// تسجيل الدخول
export async function loginUser(
  email: string,
  password: string,
  ipAddress?: string | null,
  userAgent?: string | null
) {
  // البحث عن المستخدم
  const user = await prisma.user.findUnique({
    where: { email },
    include: { subscription: true }
  })

  if (!user || !user.password) {
    // تسجيل محاولة فاشلة
    if (user) {
      await logLoginActivity(user.id, ipAddress || null, userAgent || null, false, 'password')
    }
    return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }
  }

  // التحقق من تأكيد البريد الإلكتروني
  // نتجاوز التحقق إذا لم يتم إعداد إعدادات SMTP
  const smtpConfigured = process.env.SMTP_USER && process.env.SMTP_PASS
  if (!user.emailVerified && smtpConfigured) {
    return { error: 'يرجى تأكيد بريدك الإلكتروني أولاً', requiresVerification: true, email: user.email }
  }
  
  // إذا لم يتم تأكيد الإيميل ولم يتم إعداد SMTP، نعتبر الإيميل مؤكد تلقائياً
  if (!user.emailVerified && !smtpConfigured) {
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() }
    })
  }

  // التحقق من كلمة المرور
  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    // تسجيل محاولة فاشلة
    await logLoginActivity(user.id, ipAddress || null, userAgent || null, false, 'password')
    return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }
  }

  // تحديث آخر تسجيل دخول
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  })

  // تسجيل نجاح الدخول
  await logLoginActivity(user.id, ipAddress || null, userAgent || null, true, 'password')

  // إنشاء Token
  const token = await createToken({ userId: user.id, email: user.email })

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.subscription?.plan || 'free'
    },
    token
  }
}

// تسجيل مستخدم جديد
export async function registerUser(
  name: string,
  email: string,
  password: string,
  ipAddress?: string | null,
  userAgent?: string | null
) {
  // التحقق من وجود المستخدم
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    return { error: 'البريد الإلكتروني مستخدم بالفعل' }
  }

  // تشفير كلمة المرور
  const hashedPassword = await bcrypt.hash(password, 12)

  // إنشاء المستخدم
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'trader',
      isActive: true,
    }
  })

  // إنشاء اشتراك تجريبي (14 يوم Pro)
  const trialEnd = new Date()
  trialEnd.setDate(trialEnd.getDate() + 14)

  await prisma.subscription.create({
    data: {
      userId: user.id,
      plan: 'pro',
      status: 'active',
      endDate: trialEnd
    }
  })

  // إنشاء محفظة افتراضية
  await prisma.portfolio.create({
    data: {
      userId: user.id,
      name: 'المحفظة الرئيسية',
      description: 'محفظة التداول الافتراضية',
      totalValue: 0,
      cashBalance: 0,
      investedAmount: 0,
      profitLoss: 0,
      profitLossPercent: 0,
    }
  })

  // تسجيل أول دخول
  await logLoginActivity(user.id, ipAddress || null, userAgent || null, true, 'register')

  // إنشاء Token
  const token = await createToken({ userId: user.id, email: user.email })

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: 'pro'
    },
    token
  }
}

// الحصول على المستخدم الحالي
export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    return null
  }

  const payload = await verifyToken(token)
  if (!payload) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { subscription: true }
  })

  if (!user) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.subscription?.plan || 'free'
  }
}

// الحصول على سجل تسجيلات الدخول
export async function getLoginHistory(userId: string, limit: number = 10) {
  try {
    const history = await prisma.loginHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    return history
  } catch (error) {
    console.error('Error fetching login history:', error)
    return []
  }
}

// تسجيل الخروج
export async function logoutUser() {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}

// تعيين cookie للمصادقة
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 أيام
  })
}

// Helper للحصول على IP من الطلب
export function getClientIP(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || null
}

// Helper للحصول على User Agent
export function getUserAgent(request: Request): string | null {
  return request.headers.get('user-agent')
}
