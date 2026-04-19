import { NextRequest, NextResponse } from 'next/server'
import { verify2FACode, setAuthCookie, verifyToken, createToken } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// التحقق من كود 2FA وإتمام تسجيل الدخول
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, tempToken } = body

    if (!code || !tempToken) {
      return NextResponse.json(
        { error: 'كود التحقق والتوكن المؤقت مطلوبان' },
        { status: 400 }
      )
    }

    // التحقق من التوكن المؤقت
    const payload = await verifyToken(tempToken)
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'انتهت صلاحية الجلسة، يرجى إعادة محاولة تسجيل الدخول' },
        { status: 401 }
      )
    }

    const userId = payload.userId

    // التحقق من الكود
    const result = await verify2FACode(userId, code)
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // جلب بيانات المستخدم لإتمام الدخول
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    // إنشاء Token نهائي
    const finalToken = await createToken({ userId: user.id, email: user.email })

    // تعيين cookie للمصادقة
    await setAuthCookie(finalToken)

    return NextResponse.json({
      success: true,
      message: 'تم التحقق بنجاح',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.subscription?.plan || 'free'
      }
    })
  } catch (error) {
    console.error('2FA verification error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التحقق من الكود' },
      { status: 500 }
    )
  }
}
