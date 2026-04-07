/**
 * Authentication Middleware for TradeMaster
 * حماية API routes والتأكد من هوية المستخدم
 */

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { verifyToken } from './auth-simple'

// المسارات التي لا تحتاج مصادقة
const publicPaths = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-email',
  '/api/auth/send-verification',
  '/api/auth/verify-reset',
  '/api/health',
]

// المسارات التي تحتاج مصادقة
const protectedPaths = [
  '/api/dashboard',
  '/api/trades',
  '/api/portfolios',
  '/api/accounts',
  '/api/journal',
  '/api/psychology',
  '/api/risk',
  '/api/strategies',
  '/api/statistics',
  '/api/subscription',
  '/api/plans',
  '/api/audits',
  '/api/ai-chat',
]

/**
 * التحقق من أن المسار محمي
 */
function isProtectedPath(pathname: string): boolean {
  return protectedPaths.some(p => pathname.startsWith(p))
}

/**
 * التحقق من أن المسار عام
 */
function isPublicPath(pathname: string): boolean {
  return publicPaths.some(p => pathname === p)
}

/**
 * Middleware للمصادقة
 */
export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // تخطي المسارات العامة
  if (isPublicPath(pathname)) {
    return null
  }
  
  // التحقق من المسارات المحمية
  if (isProtectedPath(pathname)) {
    try {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      })
      
      if (!token) {
        return NextResponse.json(
          { 
            error: 'غير مصرح', 
            message: 'يجب تسجيل الدخول للوصول لهذه البيانات',
            code: 'UNAUTHORIZED'
          },
          { status: 401 }
        )
      }
      
      // إضافة معلومات المستخدم للـ headers
      const response = NextResponse.next()
      response.headers.set('x-user-id', token.id as string)
      response.headers.set('x-user-email', token.email as string)
      
      return response
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json(
        { error: 'خطأ في المصادقة' },
        { status: 500 }
      )
    }
  }
  
  return null
}

/**
 * التحقق من ملكية المورد
 */
export async function verifyOwnership(
  request: NextRequest,
  resourceUserId: string
): Promise<boolean> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })
  
  if (!token) return false
  
  return token.id === resourceUserId
}

/**
 * الحصول على معرف المستخدم من الطلب
 */
export async function getUserId(request: NextRequest): Promise<string | null> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })
  
  return token?.id as string | null
}

/**
 * Helper للحصول على المستخدم الكامل
 */
export async function getCurrentUser(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })
  
  if (!token) return null
  
  return {
    id: token.id as string,
    email: token.email as string,
    name: token.name as string,
  }
}

/**
 * الحصول على المستخدم مع userId (للتوافقية مع الكود القديم)
 * يدعم نظامين: next-auth و jose token
 */
export async function getAuthUser(request: NextRequest) {
  // أولاً: محاولة الحصول على token من cookies (نظام jose)
  const cookieStore = request.cookies
  const sessionToken = cookieStore.get('auth-token')?.value
  
  if (sessionToken) {
    const payload = await verifyToken(sessionToken)
    if (payload) {
      return {
        userId: payload.userId,
        email: payload.email,
      }
    }
  }
  
  // ثانياً: محاولة استخدام next-auth (fallback)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })
  
  if (!token) return null
  
  return {
    userId: token.id as string,
    email: token.email as string,
    name: token.name as string,
  }
}