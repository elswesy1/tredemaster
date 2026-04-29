export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';


// ⚠️ هذا الكود للتطوير فقط

import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { SignJWT } from 'jose'
import { rateLimit, getRateLimitKey, getClientIp } from '@/lib/rate-limiter'
import { getRequiredEnv } from '@/lib/env-fallback'

// التحقق من صحة البريد الإلكتروني
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// التحقق من قوة كلمة المرور
function isStrongPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('يجب أن تحتوي على حرف كبير واحد على الأقل')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('يجب أن تحتوي على حرف صغير واحد على الأقل')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('يجب أن تحتوي على رقم واحد على الأقل')
  }
  
  return { valid: errors.length === 0, errors }
}

export async function POST(request: NextRequest) {
  try {
    // ⚠️ Rate Limiting - حماية من الهجمات
    const ip = getClientIp(request)
    const rl = rateLimit(getRateLimitKey(null, 'register', ip), 'register')
    if (!rl.success) {
      return NextResponse.json(
        { error: 'عدد محاولات كثيرة، حاول بعد ' + rl.retryAfter + ' ثانية' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      )
    }

    const body = await request.json()
    const { name, email, password } = body

    // التحقق من وجود البيانات
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    // التحقق من صحة البريد
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني غير صالح' },
        { status: 400 }
      )
    }

    // التحقق من قوة كلمة المرور
    const passwordCheck = isStrongPassword(password)
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: 'كلمة المرور ضعيفة', details: passwordCheck.errors },
        { status: 400 }
      )
    }

    // التحقق من عدم وجود المستخدم
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      // ⚠️ لا نكشف أن البريد مسجل لأسباب أمنية
      return NextResponse.json(
        { error: 'حدث خطأ أثناء التسجيل' },
        { status: 400 }
      )
    }

    // تشفير كلمة المرور
    const hashedPassword = await hash(password, 12)

    // توليد token التحقق
    const verifyToken = await new SignJWT({ email: email.toLowerCase() })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(new TextEncoder().encode(getRequiredEnv('NEXTAUTH_SECRET')))

    // إنشاء المستخدم
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        verifyToken,
        emailVerified: null,
        role: 'trader',
        isActive: true,
      }
    })

    // إنشاء اشتراك مجاني تلقائي
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: 'free',
        status: 'active',
      }
    })

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verifyToken}`

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح! تحقق من بريدك الإلكتروني',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      verificationUrl: verificationUrl
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التسجيل' },
      { status: 500 }
    )
  }
}