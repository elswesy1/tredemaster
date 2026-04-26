export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'
import { Prisma } from '@prisma/client'
import { rateLimit, getRateLimitKey, getClientIp, getRateLimitHeaders } from '@/lib/rate-limiter'
import { logAudit, AuditAction } from '@/lib/audit'

/**
 * Accounts API Route - GET & POST
 * 
 * GET: جلب جميع الحسابات غير المحذوفة للمستخدم الحالي
 * POST: إنشاء حساب جديد مع منع التكرار
 */

// Response helper for consistent JSON structure with rate limit headers
const jsonResponse = (
  success: boolean,
  data?: unknown,
  error?: string,
  status: number = 200,
  rateLimitInfo?: { limit: number; remaining: number; resetAt: number }
) => {
  const response: any = { success };
  if (data) response["data"] = data;
  if (error) response["error"] = error;

  const headers = rateLimitInfo
    ? getRateLimitHeaders(rateLimitInfo.limit, rateLimitInfo.remaining, rateLimitInfo.resetAt)
    : new Headers();

  return NextResponse.json(response, { status, headers })
}

// ============================================
// GET /api/accounts
// جلب جميع الحسابات غير المحذوفة للمستخدم الحالي
// ============================================
export async function GET(request: NextRequest) {
  try {
    // 1. تحقق من الجلسة
    const user = await getAuthUser(request)

    if (!user) {
      return jsonResponse(false, undefined, 'غير مصرح - يجب تسجيل الدخول', 401)
    }

    // ✅ Rate Limiting على GET
    const ip = getClientIp(request)
    const limit = rateLimit(getRateLimitKey(user.userId, 'accounts_get', ip), 'accounts_get')
    if (!limit.success) return jsonResponse(false, undefined, 'Too many requests', 429, limit)

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

    return jsonResponse(true, accounts, undefined, 200, limit)

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

    if (!user) {
      return jsonResponse(false, undefined, 'غير مصرح - يجب تسجيل الدخول', 401)
    }

    // ✅ Rate Limiting
    const limit = rateLimit(getRateLimitKey(user.userId, 'accounts_create'), 'accounts_create');
    if (!limit.success) return jsonResponse(false, undefined, 'Too many requests', 429, limit);

    // 2. قراءة البيانات
    const data = await request.json()

    // 3. التحقق من الحقول المطلوبة
    if (!data.name || !data.name.trim()) {
      return jsonResponse(false, undefined, 'اسم الحساب مطلوب', 400, limit)
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
        connectionMethod: data.connectionMethod || 'manual',
        connectionStatus: 'disconnected',
        isActive: true
      }
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.ACCOUNT_CREATED,
      details: { accountId: account.id, name: account.name }
    })

    // 5. إرجاع النجاح
    return jsonResponse(true, account, undefined, 201, limit)

  } catch (error) {
    // 6. معالجة خطأ التكرار (P2002 - Unique constraint violation)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return jsonResponse(false, undefined, 'حساب مكرر على هذه المنصة', 409)
      }
    }

    console.error('[API_ERR] POST /api/accounts:', error)
    return jsonResponse(false, undefined, 'خطأ داخلي في الخادم', 500)
  }
}

// ============================================
// PUT /api/accounts
// تحديث حساب موجود (للتوافقية)
// ============================================
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return jsonResponse(false, undefined, 'غير مصرح - يجب تسجيل الدخول', 401)
    }

    const limit = rateLimit(getRateLimitKey(user.userId, 'accounts_update'), 'accounts_update');
    if (!limit.success) return jsonResponse(false, undefined, 'Too many requests', 429, limit);

    const data = await request.json()

    if (!data.id) {
      return jsonResponse(false, undefined, 'معرف الحساب مطلوب', 400, limit)
    }

    // التحقق من الملكية وحساب غير محذوف
    const existingAccount = await db.tradingAccount.findFirst({
      where: {
        id: data.id,
        userId: user.userId,
        deletedAt: null
      }
    })

    if (!existingAccount) {
      return jsonResponse(false, undefined, 'الحساب غير موجود', 404, limit)
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

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.ACCOUNT_UPDATED,
      details: { accountId: data.id, action: 'update' }
    })

    return jsonResponse(true, account, undefined, 200, limit)

  } catch (error) {
    console.error('[API_ERR] PUT /api/accounts:', error)
    return jsonResponse(false, undefined, 'خطأ داخلي في الخادم', 500)
  }
}

// ============================================
// DELETE /api/accounts
// حذف ناعم (Soft Delete) للحساب
// ============================================
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return jsonResponse(false, undefined, 'غير مصرح - يجب تسجيل الدخول', 401)
    }

    const limit = rateLimit(getRateLimitKey(user.userId, 'accounts_delete'), 'accounts_delete');
    if (!limit.success) return jsonResponse(false, undefined, 'Too many requests', 429, limit);

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return jsonResponse(false, undefined, 'معرف الحساب مطلوب', 400, limit)
    }

    const existingAccount = await db.tradingAccount.findFirst({
      where: {
        id,
        userId: user.userId,
        deletedAt: null
      }
    })

    if (!existingAccount) {
      return jsonResponse(false, undefined, 'الحساب غير موجود', 404, limit)
    }

    await db.tradingAccount.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false
      }
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.ACCOUNT_DELETED,
      details: { accountId: id, action: 'soft-delete' }
    })

    return jsonResponse(true, { success: true }, undefined, 200, limit)

  } catch (error) {
    console.error('[API_ERR] DELETE /api/accounts:', error)
    return jsonResponse(false, undefined, 'خطأ داخلي في الخادم', 500)
  }
}
