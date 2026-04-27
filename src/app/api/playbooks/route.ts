export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';


/**
 * Playbooks API Route - GET & POST
 * 
 * GET: جلب جميع النماذج غير المحذوفة مع Rate Limiting
 * POST: إنشاء نموذج جديد
 * 
 * Protection:
 * - Session verification via getAuthUser()
 * - Soft delete filter (deletedAt: null)
 * - Rate limiting via centralized rate-limiter with headers
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'
import { Prisma } from '@prisma/client'
import { rateLimit, getRateLimitKey, getClientIp, getRateLimitHeaders } from '@/lib/rate-limiter'

// Response helper for consistent JSON structure with rate limit headers
const jsonResponse = (
  success: boolean, 
  data?: unknown, 
  error?: string, 
  status: number = 200,
  rateLimitInfo?: { limit: number; remaining: number; resetAt: number }
) => {
  const response: Record<string, unknown> = { success }; 
  if (data) response["data"] = data; 
  if (error) response["error"] = error;
  
  const headers = rateLimitInfo 
    ? getRateLimitHeaders(rateLimitInfo.limit, rateLimitInfo.remaining, rateLimitInfo.resetAt)
    : undefined;
  
  return NextResponse.json(response, { status, headers })
}

// ============================================
// GET /api/playbooks
// جلب جميع النماذج غير المحذوفة
// ============================================
export async function GET(request: NextRequest) {
  try {
    // 1. تحقق من الجلسة
    const user = await getAuthUser(request)
    if (!user) {
      return jsonResponse(false, undefined, 'غير مصرح - يجب تسجيل الدخول', 401)
    }

    // 2. Rate Limiting
    const ip = getClientIp(request)
    const rl = rateLimit(getRateLimitKey(user.userId, 'api_call', ip), 'api_call')
    if (!rl.success) {
      return jsonResponse(false, null, `تم تجاوز حد الطلبات. حاول مرة أخرى بعد ${rl.retryAfter} ثواني`, 429)
    }

    // 3. استخراج معاملات الفلترة
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const timeframe = searchParams.get('timeframe')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    // 4. بناء شروط البحث
    const where: Record<string, unknown> = { 
      userId: user.userId,
      deletedAt: null  // فقط النماذج غير المحذوفة
    }
    
    if (category) where.category = category
    if (timeframe) where.timeframe = timeframe
    if (!includeInactive) where.isActive = true

    // 5. جلب النماذج
    const playbooks = await db.playbook.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        setupName: true,
        imageUrl: true,
        category: true,
        timeframe: true,
        isActive: true,
        totalTrades: true,
        winningTrades: true,
        losingTrades: true,
        profitLoss: true,
        winRate: true,
        avgRRR: true,
        createdAt: true,
        updatedAt: true,
        //不包括 rules و JSON fields للحفاظ على الأداء
      },
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // 6. إرجاع النتيجة مع headers للـ Rate Limit
    const response = jsonResponse(true, playbooks.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      setupName: p.setupName,
      imageUrl: p.imageUrl,
      category: p.category,
      timeframe: p.timeframe,
      isActive: p.isActive,
      stats: {
        totalTrades: p.totalTrades,
        winningTrades: p.winningTrades,
        losingTrades: p.losingTrades,
        profitLoss: p.profitLoss,
        winRate: p.winRate,
        avgRRR: p.avgRRR
      },
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    })))

    // إضافة Rate Limit headers
    response.headers.set('X-RateLimit-Limit', '5')
    response.headers.set('X-RateLimit-Remaining', rl.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rl.resetAt.toString())

    return response

  } catch (error) {
    console.error('[API_ERR] GET /api/playbooks:', error)
    return jsonResponse(false, undefined, 'خطأ داخلي في الخادم', 500)
  }
}

// ============================================
// POST /api/playbooks
// إنشاء نموذج جديد
// ============================================
export async function POST(request: NextRequest) {
  try {
    // 1. تحقق من الجلسة
    const user = await getAuthUser(request)
    if (!user) {
      return jsonResponse(false, undefined, 'غير مصرح - يجب تسجيل الدخول', 401)
    }

    // 2. Rate Limiting على إنشاء playbook
    const ip = getClientIp(request)
    const rl = rateLimit(getRateLimitKey(user.userId, 'create_playbook', ip), 'create_playbook')
    if (!rl.success) {
      return jsonResponse(false, null, `تم تجاوز حد الطلبات. حاول مرة أخرى بعد ${rl.retryAfter} ثواني`, 429)
    }

    // 3. قراءة البيانات
    const body = await request.json()
    const { 
      name, 
      description, 
      setupName,
      imageUrl,
      confluences,
      killZones,
      hardRules,
      category,
      timeframe,
      entryRules,
      exitRules,
      riskRules,
      isActive 
    } = body

    // 4. التحقق من الاسم
    if (!name || !name.trim()) {
      return jsonResponse(false, undefined, 'اسم النموذج مطلوب', 400)
    }

    // 5. إنشاء النموذج
    const playbook = await db.playbook.create({
      data: {
        userId: user.userId,
        name: name.trim(),
        description: description?.trim() || null,
        setupName: setupName?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        // معالجة JSON fields
        confluences: Array.isArray(confluences) ? JSON.stringify(confluences) : (confluences || null),
        killZones: Array.isArray(killZones) ? JSON.stringify(killZones) : (killZones || null),
        hardRules: hardRules?.trim() || null,
        category: category || 'smc',
        timeframe: timeframe || 'H1',
        entryRules: entryRules?.trim() || null,
        exitRules: exitRules?.trim() || null,
        riskRules: riskRules?.trim() || null,
        isActive: isActive ?? true,
        // إحصائيات أولية
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        profitLoss: 0,
        winRate: null,
        avgRRR: null
      },
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    })

    // 6. إرجاع النجاح
    return jsonResponse(true, { 
      id: playbook.id,
      name: playbook.name 
    }, undefined, 201)

  } catch (error) {
    // 7. معالجة خطأ التكرار (P2002)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        console.error('[API_ERR] POST /api/playbooks - Duplicate')
        return jsonResponse(false, undefined, 'نموذج مكرر بهذا الاسم', 409)
      }
    }
    
    console.error('[API_ERR] POST /api/playbooks:', error)
    return jsonResponse(false, undefined, 'خطأ داخلي في الخادم', 500)
  }
}

// ============================================
// PUT /api/playbooks
// تحديث نموذج موجود
// ============================================
export async function PUT(request: NextRequest) {
  try {
    // 1. تحقق من الجلسة
    const user = await getAuthUser(request)
    if (!user) {
      return jsonResponse(false, undefined, 'غير مصرح - يجب تسجيل الدخول', 401)
    }

    // 2. قراءة البيانات
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return jsonResponse(false, undefined, 'معرف النموذج مطلوب', 400)
    }

    // 3. التحقق من الملكية والحالة
    const existing = await db.playbook.findFirst({
      where: { 
        id,
        userId: user.userId,
        deletedAt: null  // لا يمكن تعديل نموذج محذوف
      }
    })

    if (!existing) {
      return jsonResponse(false, undefined, 'النموذج غير موجود', 404)
    }

    // 4. معالجة JSON fields
    const processedUpdates: Record<string, unknown> = { ...updates }
    
    if (updates.confluences !== undefined) {
      processedUpdates.confluences = Array.isArray(updates.confluences) 
        ? JSON.stringify(updates.confluences) 
        : (updates.confluences || null)
    }
    if (updates.killZones !== undefined) {
      processedUpdates.killZones = Array.isArray(updates.killZones) 
        ? JSON.stringify(updates.killZones) 
        : (updates.killZones || null)
    }

    // 5. تحديث النموذج
    const playbook = await db.playbook.update({
      where: { id },
      data: processedUpdates,
      select: {
        id: true,
        name: true,
        updatedAt: true
      }
    })

    return jsonResponse(true, playbook)

  } catch (error) {
    console.error('[API_ERR] PUT /api/playbooks:', error)
    return jsonResponse(false, undefined, 'خطأ داخلي في الخادم', 500)
  }
}

// ============================================
// DELETE /api/playbooks
// حذف ناعم (Soft Delete) للنموذج
// ============================================
export async function DELETE(request: NextRequest) {
  try {
    // 1. تحقق من الجلسة
    const user = await getAuthUser(request)
    if (!user) {
      return jsonResponse(false, undefined, 'غير مصرح - يجب تسجيل الدخول', 401)
    }

    // 2. استخراج معرف النموذج
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return jsonResponse(false, undefined, 'معرف النموذج مطلوب', 400)
    }

    // 3. التحقق من الملكية والحالة
    const existing = await db.playbook.findFirst({
      where: { 
        id,
        userId: user.userId,
        deletedAt: null  // لا يمكن حذف نموذج محذوف مسبقاً
      },
      select: { 
        userId: true,
        name: true 
      }
    })

    if (!existing) {
      return jsonResponse(false, undefined, 'النموذج غير موجود', 404)
    }

    // 4. التحقق من الصلاحيات
    if (existing.userId !== user.userId) {
      return jsonResponse(false, undefined, 'غير مصرح - لا يمكنك حذف هذا النموذج', 403)
    }

    // 5. تنفيذ Soft Delete
    await db.playbook.update({
      where: { id },
      data: { 
        deletedAt: new Date(),
        isActive: false
      }
    })

    return jsonResponse(true, { 
      message: 'تم حذف النموذج بنجاح',
      playbookName: existing.name 
    })

  } catch (error) {
    console.error('[API_ERR] DELETE /api/playbooks:', error)
    return jsonResponse(false, undefined, 'خطأ داخلي في الخادم', 500)
  }
}
