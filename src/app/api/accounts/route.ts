import { revalidateTag } from 'next/cache'
/**
 * Accounts API Route - GET & POST
 * 
 * GET: جلب جميع الحسابات غير المحذوفة للمستخدم الحالي
 * POST: إنشاء حساب جديد مع منع التكرار
 * 
 * Protection:
 * - Session verification via getAuthUser()
 * - Soft delete filter (deletedAt: null)
 * - Duplicate prevention (P2002 error handling)
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'
import { Prisma } from '@prisma/client'

// Response helper for consistent JSON structure
const jsonResponse = (success: boolean, data?: unknown, error?: string, status: number = 200) => {
  const response: Record<string, unknown> = { success }; if (data) response["data"] = data; if (error) response["error"] = error; return NextResponse.json(response, { status })
}

// ============================================
// GET /api/accounts
// جلب جميع الحسابات غير المحذوفة للمستخدم الحالي
// ============================================
export async function GET(request: NextRequest) {
  try {
    // 1. تحقق من الجلسة
    const user = await getAuthUser(request)
    // Rate limit check
    const { rateLimit } = await import('@/lib/rate-limiter');
    const limit = rateLimit(user.userId, 'create_account');
    if (!limit.success) return NextResponse.json({ error: 'Too many requests', retryAfter: limit.retryAfter }, { status: 429 });
    if (!user) {
      return jsonResponse(false, undefined, 'غير مصرح - يجب تسجيل الدخول', 401)
    }

    // 2. جلب الحسابات مع فلتر Soft Delete
    const accounts = await db.tradingAccount.findMany({
      where: { 
        userId: user.userId,
        deletedAt: null  // فقط الحسابات غير المحذوفة
      },
      include: {
        portfolio: {
          select: { 
            id: true,
            name: true 
          }
        },
        trades: {
          where: { 
            deletedAt: null  // فقط الصفقات غير المحذوفة
          },
          select: {
            id: true,
            symbol: true,
            status: true,
            profitLoss: true
          }
        },
        _count: {
          select: { 
            trades: {
              where: { deletedAt: null }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return jsonResponse(true, accounts)
    
  } catch (error) {
    console.error('[API_ERR] GET /api/accounts:', error)
    return jsonResponse(false, undefined, 'خطأ داخلي في الخادم', 500)
  }
}

// ============================================
// POST /api/accounts
// إنشاء حساب جديد مع منع التكرار
// ============================================
export async function POST(request: NextRequest) {
  try {
    // 1. تحقق من الجلسة
    const user = await getAuthUser(request)
    // Rate limit check
    const { rateLimit } = await import('@/lib/rate-limiter');
    const limit = rateLimit(user.userId, 'create_account');
    if (!limit.success) return NextResponse.json({ error: 'Too many requests', retryAfter: limit.retryAfter }, { status: 429 });
    if (!user) {
      return jsonResponse(false, undefined, 'غير مصرح - يجب تسجيل الدخول', 401)
    }

    // 2. قراءة البيانات
    const data = await request.json()
    
    // 3. التحقق من الحقول المطلوبة
    if (!data.name || !data.name.trim()) {
      return jsonResponse(false, undefined, 'اسم الحساب مطلوب', 400)
    }

    // 4. محاولة إنشاء الحساب
    const account = await db.tradingAccount.create({
      data: {
        userId: user.userId,
        name: data.name.trim(),
        broker: data.broker || data.platform || null,
        platform: data.platform || data.broker || null,
        accountNumber: data.accountNumber || null,
        accountType: data.accountType || data.type || 'broker',
        currency: data.currency || 'USD',
        balance: parseFloat(data.balance) || 0,
        equity: parseFloat(data.equity) || 0,
        portfolioId: data.portfolioId || null,
        // الحقول الجديدة للحسابات المتصلة
        connectionMethod: data.connectionMethod || 'manual',
        connectionStatus: 'disconnected',
        isActive: true
      }
    })

    // 5. إرجاع النجاح
    return jsonResponse(true, { id: account.id }, undefined, 201)

  } catch (error) {
    // 6. معالجة خطأ التكرار (P2002 - Unique constraint violation)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const meta = error.meta as { target?: string[] }
        const target = meta?.target?.join(', ') || 'حقل فريد'
        console.error('[API_ERR] POST /api/accounts - Duplicate:', target)
        return jsonResponse(false, undefined, 'حساب مكرر على هذه المنصة', 409)
      }
    }
    
    console.error('[API_ERR] POST /api/accounts:', error)
    return jsonResponse(false, undefined, 'خطأ داخلي في الخادم', 500)
  }
}

// ============================================
// PUT /api/accounts
// تحديث حساب موجود (للتوافقية مع الواجهة القديمة)
// ============================================
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    // Rate limit check
    const { rateLimit } = await import('@/lib/rate-limiter');
    const limit = rateLimit(user.userId, 'create_account');
    if (!limit.success) return NextResponse.json({ error: 'Too many requests', retryAfter: limit.retryAfter }, { status: 429 });
    if (!user) {
      return jsonResponse(false, undefined, 'غير مصرح - يجب تسجيل الدخول', 401)
    }

    const data = await request.json()

    if (!data.id) {
      return jsonResponse(false, undefined, 'معرف الحساب مطلوب', 400)
    }

    // التحقق من الملكية وحساب غير محذوف
    const existingAccount = await db.tradingAccount.findFirst({
      where: { 
        id: data.id,
        deletedAt: null  // لا يمكن تعديل حساب محذوف
      },
      select: { userId: true }
    })

    if (!existingAccount) {
      return jsonResponse(false, undefined, 'الحساب غير موجود', 404)
    }

    if (existingAccount.userId !== user.userId) {
      return jsonResponse(false, undefined, 'غير مصرح - لا يمكنك تعديل هذا الحساب', 403)
    }

    const account = await db.tradingAccount.update({
      where: { id: data.id },
      data: {
        name: data.name,
        broker: data.broker,
        accountNumber: data.accountNumber,
        balance: parseFloat(data.balance) || 0,
        equity: parseFloat(data.equity) || 0,
        lastSync: new Date()
      }
    })

    return jsonResponse(true, { account })

  } catch (error) {
    console.error('[API_ERR] PUT /api/accounts:', error)
    return jsonResponse(false, undefined, 'خطأ داخلي في الخادم', 500)
  }
}

// ============================================
// DELETE /api/accounts (query param version)
// حذف ناعم (Soft Delete) للحساب
// ============================================
export async function DELETE(request: NextRequest) {
  try {
    // 1. تحقق من الجلسة
    const user = await getAuthUser(request)
    // Rate limit check
    const { rateLimit } = await import('@/lib/rate-limiter');
    const limit = rateLimit(user.userId, 'create_account');
    if (!limit.success) return NextResponse.json({ error: 'Too many requests', retryAfter: limit.retryAfter }, { status: 429 });
    if (!user) {
      return jsonResponse(false, undefined, 'غير مصرح - يجب تسجيل الدخول', 401)
    }

    // 2. استخراج معرف الحساب
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return jsonResponse(false, undefined, 'معرف الحساب مطلوب', 400)
    }

    // 3. التحقق من الملكية والحالة
    const existingAccount = await db.tradingAccount.findFirst({
      where: { 
        id,
        deletedAt: null  // لا يمكن حذف حساب محذوف مسبقاً
      },
      select: { userId: true }
    })

    if (!existingAccount) {
      return jsonResponse(false, undefined, 'الحساب غير موجود', 404)
    }

    // 4. التحقق من الصلاحيات
    if (existingAccount.userId !== user.userId) {
      return jsonResponse(false, undefined, 'غير مصرح - لا يمكنك حذف هذا الحساب', 403)
    }

    // 5. تنفيذ Soft Delete
    await db.tradingAccount.update({
      where: { id },
      data: { 
        deletedAt: new Date(),
        isActive: false
      }
    })

    return jsonResponse(true)

  } catch (error) {
    console.error('[API_ERR] DELETE /api/accounts:', error)
    return jsonResponse(false, undefined, 'خطأ داخلي في الخادم', 500)
  }
}
