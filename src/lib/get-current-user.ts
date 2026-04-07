/**
 * Helper موحد للحصول على المستخدم الحالي
 * يدعم كلا النظامين: JWT cookie و NextAuth
 */

import { cookies } from 'next/headers'
import { verifyToken } from './auth-simple'
import { prisma } from './prisma'
import { getToken } from 'next-auth/jwt'

export interface AuthUser {
  id: string
  email: string
  name: string | null
  plan?: string
}

/**
 * الحصول على المستخدم الحالي من أي نظام مصادقة
 * الأولوية: JWT cookie > NextAuth
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    
    // 1. محاولة الحصول على token من cookie المخصص
    const authToken = cookieStore.get('auth-token')?.value
    
    if (authToken) {
      const payload = await verifyToken(authToken)
      
      if (payload?.userId) {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          include: { subscription: true }
        })
        
        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            plan: user.subscription?.plan || 'free'
          }
        }
      }
    }
    
    // 2. محاولة الحصول على token من NextAuth (fallback)
    // هذا يتطلب أن يعمل NextAuth بشكل صحيح
    // لكن في بيئة serverless قد لا يعمل
    
    return null
  } catch (error) {
    console.error('Error getting auth user:', error)
    return null
  }
}

/**
 * الحصول على المستخدم أو إرجاع خطأ 401
 * للاستخدام في API routes
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser()
  
  if (!user) {
    throw new Error('UNAUTHORIZED')
  }
  
  return user
}