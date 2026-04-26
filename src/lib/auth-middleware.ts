/**
 * Authentication Middleware for TradeMaster
 * حماية API routes والتأكد من هوية المستخدم
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from './auth-simple'
import { prisma } from './prisma'
import { auth } from './auth'

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
  '/api/trading-accounts',
  '/api/sessions',
  '/api/rules',
  '/api/setups',
  '/api/risk-profiles',
  '/api/risk-alerts',
  '/api/risk-usage',
  '/api/risk-check',
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
 * Helper داخلي للحصول على token من cookies
 */
async function getTokenFromCookies(request?: NextRequest): Promise<{ userId: string; email: string } | null> {
  try {
    let token: string | undefined
    
    // 1. محاولة الحصول على token من request cookies
    if (request) {
      token = request.cookies.get('auth-token')?.value
    }
    
    // 2. محاولة الحصول على token من next/headers cookies
    if (!token) {
      const cookieStore = await cookies()
      token = cookieStore.get('auth-token')?.value
    }
    
    if (!token) {
      return null
    }
    
    // التحقق من الـ token
    const payload = await verifyToken(token)
    
    if (!payload?.userId) {
      return null
    }
    
    return {
      userId: payload.userId,
      email: payload.email,
    }
  } catch (error) {
    console.error('getTokenFromCookies error:', error)
    return null
  }
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
    const tokenData = await getTokenFromCookies(request)
    
    if (!tokenData) {
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
    response.headers.set('x-user-id', tokenData.userId)
    response.headers.set('x-user-email', tokenData.email)
    
    return response
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
  const tokenData = await getTokenFromCookies(request)
  
  if (!tokenData) return false
  
  return tokenData.userId === resourceUserId
}

/**
 * الحصول على معرف المستخدم من الطلب
 */
export async function getUserId(request: NextRequest): Promise<string | null> {
  const tokenData = await getTokenFromCookies(request)
  return tokenData?.userId || null
}

/**
 * Helper للحصول على المستخدم الكامل
 */
export async function getCurrentUser(request: NextRequest) {
  const tokenData = await getTokenFromCookies(request)
  
  if (!tokenData) return null
  
  const user = await prisma.user.findUnique({
    where: { id: tokenData.userId },
    select: { id: true, email: true, name: true }
  })
  
  return user
}

/**
 * الحصول على المستخدم مع userId (للتوافقية مع الكود القديم)
 * يدعم نظامين: jose token cookie
 */
export async function getAuthUser(
  request?: NextRequest
): Promise<{ userId: string; email: string; name?: string } | null> {
  try {
    const session = await auth()

    if (session?.user?.id && session.user.email) {
      return {
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name || undefined,
      }
    }

    const tokenData = await getTokenFromCookies(request)

    if (!tokenData) return null

    const user = await prisma.user.findUnique({
      where: { id: tokenData.userId },
      select: { id: true, email: true, name: true },
    })

    if (!user) return null

    return {
      userId: user.id,
      email: user.email,
      name: user.name || undefined,
    }
  } catch (error) {
    console.error('[Auth Middleware Error]:', error)
    return null
  }
}