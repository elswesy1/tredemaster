export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * Accounts [id] API Route - GET, PATCH, DELETE
 * 
 * GET: جلب حساب واحد بالتفاصيل
 * PATCH: تحديث حساب موجود
 * DELETE: حذف ناعم (Soft Delete) للحساب
 * 
 * Protection:
 * - Session verification via getAuthUser()
 * - Ownership verification (403 on non-ownership)
 * - Soft delete filter (deletedAt: null)
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'
import { logAudit, AuditAction } from '@/lib/audit'

// Response helper for consistent JSON structure
const jsonResponse = (success: boolean, data?: unknown, error?: string, status: number = 200) => {
  const response: any = { success }
  if (data) {
    response['data'] = data
  }
  if (error) {
    response['error'] = error
  }
  return NextResponse.json(response, { status })
}

// ============================================
// GET /api/accounts/[id]
// جلب حساب واحد بالتفاصيل
// ============================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. تحقق من الجلسة
    const user = await getAuthUser(request)
    if (!user) {
      return jsonResponse(false, undefined, 'غير مصرح - يجب تسجيل الدخول', 401)
    }

    const { id } = await params

    // 2. جلب الحساب مع فلتر Soft Delete
    const account = await db.tradingAccount.findFirst({
      where: { 
        id,
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
        riskProfiles: {
          where: { deletedAt: null },
          select: {
            id: true,
            name: true,
            riskTolerance: true,
            maxDailyLoss: true
          }
        },
        trades: {
          where: { deletedAt: null },
          select: {
            id: true,
            symbol: true,
            type: true,
            status: true,
            profitLoss: true,
            openedAt: true,
            closedAt: true
          },
          orderBy: { openedAt: 'desc' },
          take: 10
        },
        _count: {
          select: { 
            trades: {
              where: { deletedAt: null }
            }
          }
        }
      }
    })

    if (!account) {
      return jsonResponse(false, undefined, 'الحساب غير موجود', 404)
    }

    return jsonResponse(true, account)

  } catch (error) {
    console.error('[API_ERR] GET /api/accounts/[id]:', error)
    return jsonResponse(false, undefined, 'خطأ داخلي في الخادم', 500)
  }
}

// ============================================
// PATCH /api/accounts/[id]
// تحديث حساب موجود (PATCH للأجزاء فقط)
// ============================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. تحقق من الجلسة
    const user = await getAuthUser(request)
    if (!user) {
      return jsonResponse(false, undefined, 'غير مصرح - يجب تسجيل الدخول', 401)
    }

    const { id } = await params
    const data = await request.json()

    // 2. التحقق من الملكية والحالة
    const existingAccount = await db.tradingAccount.findFirst({
      where: { 
        id,
        userId: user.userId,
        deletedAt: null  // لا يمكن تعديل حساب محذوف
      }
    })

    if (!existingAccount) {
      return jsonResponse(false, undefined, 'الحساب غير موجود', 404)
    }

    // 3. بناء بيانات التحديث
    const updateData: Record<string, any> = {}
    
    if (data.name) updateData.name = data.name
    if (data.broker) updateData.broker = data.broker
    if (data.platform) updateData.platform = data.platform
    if (data.accountNumber) updateData.accountNumber = data.accountNumber
    if (data.balance !== undefined) updateData.balance = parseFloat(data.balance) || 0
    if (data.equity !== undefined) updateData.equity = parseFloat(data.equity) || 0
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    
    // تحديث وقت آخر مزامنة
    updateData.lastSync = new Date()

    // 4. تنفيذ التحديث
    const account = await db.tradingAccount.update({
      where: { id },
      data: updateData
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.ACCOUNT_UPDATED,
      details: { accountId: id, action: 'update' }
    })

    return jsonResponse(true, { account })

  } catch (error) {
    console.error('[API_ERR] PATCH /api/accounts/[id]:', error)
    return jsonResponse(false, undefined, 'خطأ داخلي في الخادم', 500)
  }
}

// ============================================
// PUT /api/accounts/[id]
// تحديث حساب كامل (للتوافقية)
// ============================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // إعادة استخدام PATCH
  return PATCH(request, { params })
}

// ============================================
// DELETE /api/accounts/[id]
// حذف ناعم (Soft Delete) للحساب
// ============================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. تحقق من الجلسة
    const user = await getAuthUser(request)
    if (!user) {
      return jsonResponse(false, undefined, 'غير مصرح - يجب تسجيل الدخول', 401)
    }

    const { id } = await params

    // 2. التحقق من الملكية والحالة
    const existingAccount = await db.tradingAccount.findFirst({
      where: { 
        id,
        userId: user.userId,
        deletedAt: null  // لا يمكن حذف حساب محذوف مسبقاً
      },
      select: { 
        userId: true,
        name: true 
      }
    })

    if (!existingAccount) {
      return jsonResponse(false, undefined, 'الحساب غير موجود', 404)
    }

    // 3. التحقق من الصلاحيات (تأكيد إضافي)
    if (existingAccount.userId !== user.userId) {
      return jsonResponse(false, undefined, 'غير مصرح - لا يمكنك حذف هذا الحساب', 403)
    }

    // 4. تنفيذ Soft Delete على الحساب
    await db.tradingAccount.update({
      where: { id },
      data: { 
        deletedAt: new Date(),
        isActive: false,
        connectionStatus: 'disconnected'
      }
    })

    // 5. Soft Delete للملفات المرتبطة (Risk Profiles)
    await db.riskProfile.updateMany({
      where: { accountId: id, deletedAt: null },
      data: { 
        deletedAt: new Date(),
        isActive: false
      }
    })

    // 6. Soft Delete للصفقات المرتبطة
    await db.trade.updateMany({
      where: { 
        accountId: id,
        deletedAt: null
      },
      data: { 
        deletedAt: new Date()
      }
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.ACCOUNT_DELETED,
      details: { accountId: id, name: existingAccount.name, action: 'soft-delete' }
    })

    return jsonResponse(true, { 
      message: 'تم حذف الحساب بنجاح',
      accountName: existingAccount.name 
    })

  } catch (error) {
    console.error('[API_ERR] DELETE /api/accounts/[id]:', error)
    return jsonResponse(false, undefined, 'خطأ داخلي في الخادم', 500)
  }
}
