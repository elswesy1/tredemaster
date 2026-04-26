import { NextRequest, NextResponse } from 'next/server'
import { loginUser, setAuthCookie, getClientIP, getUserAgent } from '@/lib/auth-simple'
import { rateLimit, getRateLimitKey, getClientIp, getRateLimitHeaders } from '@/lib/rate-limiter'

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(request: NextRequest) {
  try {
    // ✅ Rate Limiting على تسجيل الدخول
    const ip = getClientIp(request)
    const rl = rateLimit(getRateLimitKey(null, 'login', ip), 'login')
    
    if (!rl.success) {
      return NextResponse.json(
        { error: 'عدد محاولات كثيرة، حاول بعد ' + rl.retryAfter + ' ثانية' },
        { 
          status: 429,
          headers: getRateLimitHeaders(5, 0, rl.resetAt)
        }
      )
    }
    
    const body = await request.json()
    const { email, password } = body

    // التحقق من البيانات
    if (!email || !password) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      )
    }

    // الحصول على معلومات الجهاز
    const ipAddress = getClientIP(request)
    const userAgent = getUserAgent(request)

    // تسجيل الدخول
    const result = await loginUser(email, password, ipAddress, userAgent)

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      )
    }

    // التحقق من تفعيل 2FA
    if (result.twoFactorRequired) {
      return NextResponse.json({
        success: true,
        twoFactorRequired: true,
        tempToken: result.tempToken,
        message: 'يجب إدخال كود المصادقة الثنائية'
      })
    }

    // تعيين cookie للمصادقة
    await setAuthCookie(result.token!)

    return NextResponse.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      user: result.user
    }, {
      headers: getRateLimitHeaders(5, rl.remaining, rl.resetAt)
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الدخول' },
      { status: 500 }
    )
  }
}