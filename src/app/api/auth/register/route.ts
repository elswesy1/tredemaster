import { NextRequest, NextResponse } from 'next/server'
import { registerUser, setAuthCookie, getClientIP, getUserAgent } from '@/lib/auth-simple'
import { z } from 'zod'

// مخطط التحقق من البيانات
const registerSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .regex(/[A-Z]/, 'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل')
    .regex(/[a-z]/, 'كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل')
    .regex(/[0-9]/, 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل')
    .regex(/[^A-Za-z0-9]/, 'كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // التحقق من البيانات
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'بيانات غير صحيحة', details: result.error.errors },
        { status: 400 }
      )
    }

    const { name, email, password } = result.data

    // الحصول على معلومات الجهاز
    const ipAddress = getClientIP(request)
    const userAgent = getUserAgent(request)

    // تسجيل المستخدم
    const registerResult = await registerUser(name, email, password, ipAddress, userAgent)

    if (registerResult.error) {
      return NextResponse.json(
        { error: registerResult.error },
        { status: 400 }
      )
    }

    // تعيين cookie للمصادقة
    await setAuthCookie(registerResult.token!)

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      user: registerResult.user
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التسجيل' },
      { status: 500 }
    )
  }
}
