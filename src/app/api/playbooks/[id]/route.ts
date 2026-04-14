/**
 * Playbooks [id] API Route - GET, PATCH, DELETE
 * 
 * GET: جلب نموذج واحد بالتفاصيل الكاملة
 * PATCH: تحديث نموذج موجود
 * DELETE: حذف ناعم (Soft Delete) للنموذج
 * 
 * Protection:
 * - Session verification via getAuthUser()
 * - Ownership verification (403 on non-ownership)
 * - Soft delete filter (deletedAt: null)
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'

// Response helper for consistent JSON structure
const jsonResponse = (success: boolean, data?: unknown, error?: string, status: number = 200) => {
  const response: Record<string, unknown> = { success }; if (data) response["data"] = data; if (error) response["error"] = error; return NextResponse.json(response, { status })
}

// ============================================
// GET /api/playbooks/[id]
// جلب نموذج واحد بالتفاصيل الكاملة
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

    // 2. جلب النموذج مع فلتر Soft Delete
    const playbook = await db.playbook.findFirst({
      where: { 
        id,
        userId: user.userId,
        deletedAt: null  // فقط النماذج غير المحذوفة
      },
      include: {
        // الصفقات المرتبطة (غير المحذوفة)
        trades: {
          where: { deletedAt: null },
          select: {
            id: true,
            symbol: true,
            type: true,
            status: true,
            entryPrice: true,
            exitPrice: true,
            profitLoss: true,
            openedAt: true,
            closedAt: true,
            stopLoss: true,
            takeProfit: true,
            quantity: true,
            lotSize: true
          },
          orderBy: { openedAt: 'desc' },
          take: 20
        }
      }
    })

    if (!playbook) {
      return jsonResponse(false, undefined, 'النموذج غير موجود', 404)
    }

    // 3. تحويل JSON fields إلى arrays
    let confluencesArray: string[] = []
    let killZonesArray: string[] = []

    try {
      if (playbook.confluences) {
        confluencesArray = JSON.parse(playbook.confluences)
      }
    } catch (e) {
      console.error('[API_ERR] Parse confluences:', e)
    }

    try {
      if (playbook.killZones) {
        killZonesArray = JSON.parse(playbook.killZones)
      }
    } catch (e) {
      console.error('[API_ERR] Parse killZones:', e)
    }

    // 4. بناء الاستجابة
    const responseData = {
      id: playbook.id,
      name: playbook.name,
      description: playbook.description,
      setupName: playbook.setupName,
      imageUrl: playbook.imageUrl,
      confluences: confluencesArray,
      killZones: killZonesArray,
      hardRules: playbook.hardRules,
      category: playbook.category,
      timeframe: playbook.timeframe,
      entryRules: playbook.entryRules,
      exitRules: playbook.exitRules,
      riskRules: playbook.riskRules,
      isActive: playbook.isActive,
      stats: {
        totalTrades: playbook.totalTrades,
        winningTrades: playbook.winningTrades,
        losingTrades: playbook.losingTrades,
        profitLoss: playbook.profitLoss,
        winRate: playbook.winRate,
        avgRRR: playbook.avgRRR
      },
      trades: playbook.trades,
      createdAt: playbook.createdAt,
      updatedAt: playbook.updatedAt
    }

    return jsonResponse(true, responseData)

  } catch (error) {
    console.error('[API_ERR] GET /api/playbooks/[id]:', error)
    return jsonResponse(false, undefined, 'خطأ داخلي في الخادم', 500)
  }
}

// ============================================
// PATCH /api/playbooks/[id]
// تحديث نموذج موجود (PATCH للأجزاء فقط)
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
    const existing = await db.playbook.findFirst({
      where: { 
        id,
        userId: user.userId,
        deletedAt: null  // لا يمكن تعديل نموذج محذوف
      },
      select: { userId: true }
    })

    if (!existing) {
      return jsonResponse(false, undefined, 'النموذج غير موجود', 404)
    }

    // 3. معالجة البيانات
    const updateData: Record<string, unknown> = {}
    
    // الحقول النصية
    if (data.name !== undefined) updateData.name = data.name?.trim()
    if (data.description !== undefined) updateData.description = data.description?.trim() || null
    if (data.setupName !== undefined) updateData.setupName = data.setupName?.trim() || null
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl?.trim() || null
    if (data.hardRules !== undefined) updateData.hardRules = data.hardRules?.trim() || null
    if (data.category !== undefined) updateData.category = data.category
    if (data.timeframe !== undefined) updateData.timeframe = data.timeframe
    if (data.entryRules !== undefined) updateData.entryRules = data.entryRules?.trim() || null
    if (data.exitRules !== undefined) updateData.exitRules = data.exitRules?.trim() || null
    if (data.riskRules !== undefined) updateData.riskRules = data.riskRules?.trim() || null
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    // JSON fields
    if (data.confluences !== undefined) {
      updateData.confluences = Array.isArray(data.confluences) 
        ? JSON.stringify(data.confluences) 
        : (data.confluences || null)
    }
    if (data.killZones !== undefined) {
      updateData.killZones = Array.isArray(data.killZones) 
        ? JSON.stringify(data.killZones) 
        : (data.killZones || null)
    }

    // 4. تنفيذ التحديث
    const playbook = await db.playbook.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        updatedAt: true
      }
    })

    return jsonResponse(true, playbook)

  } catch (error) {
    console.error('[API_ERR] PATCH /api/playbooks/[id]:', error)
    return jsonResponse(false, undefined, 'خطأ داخلي في الخادم', 500)
  }
}

// ============================================
// PUT /api/playbooks/[id]
// تحديث نموذج كامل (للتوافقية)
// ============================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // إعادة استخدام PATCH
  return PATCH(request, { params })
}

// ============================================
// DELETE /api/playbooks/[id]
// حذف ناعم (Soft Delete) للنموذج
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
    const existing = await db.playbook.findFirst({
      where: { 
        id,
        userId: user.userId,
        deletedAt: null  // لا يمكن حذف نموذج محذوف مسبقاً
      },
      select: { 
        userId: true,
        name: true,
        totalTrades: true
      }
    })

    if (!existing) {
      return jsonResponse(false, undefined, 'النموذج غير موجود', 404)
    }

    // 3. التحقق من الصلاحيات
    if (existing.userId !== user.userId) {
      return jsonResponse(false, undefined, 'غير مصرح - لا يمكنك حذف هذا النموذج', 403)
    }

    // 4. تنفيذ Soft Delete على النموذج
    await db.playbook.update({
      where: { id },
      data: { 
        deletedAt: new Date(),
        isActive: false
      }
    })

    // 5. Soft Delete للصفقات المرتبطة بهذا النموذج
    await db.trade.updateMany({
      where: { 
        playbookId: id,
        deletedAt: null
      },
      data: { 
        deletedAt: new Date()
      }
    })

    return jsonResponse(true, { 
      message: 'تم حذف النموذج بنجاح',
      playbookName: existing.name,
      deletedTrades: existing.totalTrades
    })

  } catch (error) {
    console.error('[API_ERR] DELETE /api/playbooks/[id]:', error)
    return jsonResponse(false, undefined, 'خطأ داخلي في الخادم', 201)
  }
}
