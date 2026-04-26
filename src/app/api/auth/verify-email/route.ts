export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';


import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { setAuthCookie, createToken } from '@/lib/auth-simple'

// GET /api/auth/verify-email?token=xxx&email=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      return NextResponse.redirect(
        new URL('/verify-email?error=missing-params', request.url)
      )
    }

    // البحث عن المستخدم
    const user = await prisma.user.findUnique({
      where: { email },
      include: { subscription: true }
    })

    if (!user) {
      return NextResponse.redirect(
        new URL('/verify-email?error=user-not-found', request.url)
      )
    }

    // التحقق من الرمز
    if (user.verifyToken !== token) {
      return NextResponse.redirect(
        new URL('/verify-email?error=invalid-token', request.url)
      )
    }

    // التحقق من صلاحية الرمز
    if (user.verifyTokenExpiry && new Date() > user.verifyTokenExpiry) {
      return NextResponse.redirect(
        new URL('/verify-email?error=expired-token', request.url)
      )
    }

    // تحديث المستخدم
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verifyToken: null,
        verifyTokenExpiry: null,
      }
    })

    // إنشاء token للجلسة
    const authToken = await createToken({ userId: user.id, email: user.email })
    await setAuthCookie(authToken)

    // إعادة التوجيه للصفحة الرئيسية مع رسالة نجاح
    return NextResponse.redirect(
      new URL('/verify-email?success=true', request.url)
    )

  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.redirect(
      new URL('/verify-email?error=server-error', request.url)
    )
  }
}

// POST /api/auth/verify-email (لإعادة إرسال الرمز)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مؤكد بالفعل' },
        { status: 400 }
      )
    }

    // إعادة التوجيه لـ send-verification API
    return NextResponse.redirect(
      new URL('/api/auth/send-verification', request.url)
    )

  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ' },
      { status: 500 }
    )
  }
}