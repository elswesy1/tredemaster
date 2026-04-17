import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'
import { logAudit, AuditAction } from '@/lib/audit'
import { checkRateLimit } from '@/lib/rate-limiter'

// GET - Fetch playbooks for authenticated user
async function getPlaybooksHandler(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح - يجب تسجيل الدخول' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: Record<string, unknown> = { 
      userId: user.userId,
      deletedAt: null 
    }
    if (category) where.category = category

    const playbooks = await db.playbook.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(playbooks)
  } catch (error) {
    console.error('[PLAYBOOK_GET]', error)
    return NextResponse.json({ error: 'Failed to fetch playbooks' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // 1. تحقق من Rate Limit أولاً
  const limit = checkRateLimit(request, {
    windowMs: 60 * 1000,
    maxRequests: 5,
    message: 'لقد تجاوزت حد الطلبات المسموح به (5 طلبات في الدقيقة)'
  });

  // 2. إذا تم تجاوز الحد، أعد خطأ 429
if (!limit.success) {
  const retryAfter = Math.ceil((limit.resetTime - Date.now()) / 1000);
  
  return NextResponse.json(
    { 
      error: 'Too many requests. Please try again later.',
      retryAfter: retryAfter
    },
    { 
      status: 429,
      headers: {
        'X-RateLimit-Remaining': String(limit.remaining),
        'X-RateLimit-Reset': new Date(limit.resetTime).toISOString(),
        'Retry-After': String(retryAfter)
      }
    }
  );
}

  // 3. إذا نجح، نفذ الدالة الأصلية
  return getPlaybooksHandler(request);
}

// POST - Create a new playbook for authenticated user
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح - يجب تسجيل الدخول' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      category,
      timeframe,
      entryRules,
      exitRules,
      riskRules,
      setupName,
      rulesChecklist,
      setupScreenshotUrl,
    } = body

    if (!name) {
      return NextResponse.json({ error: 'Playbook name is required' }, { status: 400 })
    }

    const playbook = await db.playbook.create({
      data: {
        name,
        description,
        category: category || 'technical',
        timeframe,
        entryRules,
        exitRules,
        riskRules,
        setupName,
        rulesChecklist: rulesChecklist ? JSON.stringify(rulesChecklist) : null,
        setupScreenshotUrl,
        userId: user.userId,
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        profitLoss: 0,
      },
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.PLAYBOOK_CREATED,
      details: { playbookId: playbook.id, name: playbook.name }
    })

    return NextResponse.json(playbook, { status: 201 })
  } catch (error) {
    console.error('[PLAYBOOK_POST]', error)
    return NextResponse.json({ error: 'Failed to create playbook' }, { status: 500 })
  }
}

// PUT - Update a playbook
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح - يجب تسجيل الدخول' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, rulesChecklist, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Playbook ID is required' }, { status: 400 })
    }

    const existing = await db.playbook.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!existing) {
      return NextResponse.json({ error: 'الكتيب غير موجود' }, { status: 404 })
    }

    if (existing.userId !== user.userId) {
      return NextResponse.json(
        { error: 'غير مصرح - لا يمكنك تعديل هذا الكتيب' },
        { status: 403 }
      )
    }

    const data: any = { ...updateData }
    if (rulesChecklist !== undefined) {
      data.rulesChecklist = rulesChecklist ? JSON.stringify(rulesChecklist) : null
    }

    const playbook = await db.playbook.update({
      where: { id },
      data,
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.PLAYBOOK_UPDATED,
      details: { playbookId: id, name: playbook.name }
    })

    return NextResponse.json(playbook)
  } catch (error) {
    console.error('[PLAYBOOK_PUT]', error)
    return NextResponse.json({ error: 'Failed to update playbook' }, { status: 500 })
  }
}

// DELETE - Delete a playbook
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح - يجب تسجيل الدخول' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Playbook ID is required' }, { status: 400 })
    }

    const existing = await db.playbook.findUnique({
      where: { id },
      select: { userId: true, name: true }
    })

    if (!existing) {
      return NextResponse.json({ error: 'الكتيب غير موجود' }, { status: 404 })
    }

    if (existing.userId !== user.userId) {
      return NextResponse.json(
        { error: 'غير مصرح - لا يمكنك حذف هذا الكتيب' },
        { status: 403 }
      )
    }

    await db.playbook.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.PLAYBOOK_DELETED,
      details: { playbookId: id, name: existing.name }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PLAYBOOK_DELETE]', error)
    return NextResponse.json({ error: 'Failed to delete playbook' }, { status: 500 })
  }
}
