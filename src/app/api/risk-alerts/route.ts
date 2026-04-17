import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'
import { logAudit, AuditAction } from '@/lib/audit'

// GET - Fetch risk alerts for authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const riskProfileId = searchParams.get('riskProfileId')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const where: Record<string, unknown> = { 
      userId: user.userId,
      deletedAt: null 
    }
    if (riskProfileId) {
      where.riskProfileId = riskProfileId
    }
    if (unreadOnly) {
      where.isRead = false
    }

    const alerts = await db.riskAlert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('[RISK_ALERTS_GET]', error)
    return NextResponse.json({ error: 'Failed to fetch risk alerts' }, { status: 500 })
  }
}

// PUT - Mark alert as read
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول' }, { status: 401 })
    }

    const body = await request.json()
    const { alertId, isRead, isResolved } = body

    if (!alertId) {
      return NextResponse.json({ error: 'alertId matches required' }, { status: 400 })
    }

    // Check ownership
    const existing = await db.riskAlert.findFirst({
      where: { id: alertId, userId: user.userId, deletedAt: null }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Risk alert not found' }, { status: 404 })
    }

    const alert = await db.riskAlert.update({
      where: { id: alertId },
      data: {
        isRead: isRead ?? true,
        isResolved: isResolved ?? false,
        resolvedAt: isResolved ? new Date() : null,
      },
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.SETTINGS_UPDATED,
      details: { alertId, action: 'update' }
    })

    return NextResponse.json(alert)
  } catch (error) {
    console.error('[RISK_ALERTS_PUT]', error)
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 })
  }
}

// DELETE - Delete alert
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const alertId = searchParams.get('alertId')

    if (!alertId) {
      return NextResponse.json({ error: 'alertId is required' }, { status: 400 })
    }

    // Check ownership
    const existing = await db.riskAlert.findFirst({
      where: { id: alertId, userId: user.userId, deletedAt: null }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Risk alert not found' }, { status: 404 })
    }

    await db.riskAlert.update({
      where: { id: alertId },
      data: { deletedAt: new Date() }
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.SETTINGS_UPDATED,
      details: { alertId, action: 'soft-delete' }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[RISK_ALERTS_DELETE]', error)
    return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 })
  }
}
