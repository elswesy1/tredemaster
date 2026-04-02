import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth-simple'

// الحصول على المستخدم من الطلب
export async function getAuthUser(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    return null
  }

  const payload = await verifyToken(token)
  return payload
}

// التحقق من المصادقة - يستخدم في API routes
export async function withAuth(
  request: NextRequest,
  handler: (userId: string, email: string) => Promise<NextResponse>
) {
  const user = await getAuthUser(request)

  if (!user) {
    return NextResponse.json(
      { error: 'غير مصرح - يجب تسجيل الدخول' },
      { status: 401 }
    )
  }

  return handler(user.userId, user.email)
}

// التحقق من ملكية المورد - المستخدم لا يمكنه الوصول لموارد مستخدم آخر
export async function withResourceAuth(
  request: NextRequest,
  resourceUserId: string,
  handler: () => Promise<NextResponse>
) {
  const user = await getAuthUser(request)

  if (!user) {
    return NextResponse.json(
      { error: 'غير مصرح - يجب تسجيل الدخول' },
      { status: 401 }
    )
  }

  // التحقق من أن المستخدم يملك المورد
  if (user.userId !== resourceUserId) {
    return NextResponse.json(
      { error: 'غير مصرح - لا يمكنك الوصول لهذا المورد' },
      { status: 403 }
    )
  }

  return handler()
}

// Helper للحصول على userId من الطلب
export async function requireAuth(request: NextRequest): Promise<{ userId: string; email: string } | NextResponse> {
  const user = await getAuthUser(request)

  if (!user) {
    return NextResponse.json(
      { error: 'غير مصرح' },
      { status: 401 }
    )
  }

  return user
}
