import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'
import { logAudit, AuditAction } from '@/lib/audit'

// GET - Fetch all trading rules for authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const active = searchParams.get('active')

    const where: Record<string, unknown> = { 
      userId: user.userId,
      deletedAt: null 
    }
    if (category) where.category = category
    if (active !== null) where.active = active === 'true'

    const rules = await db.tradingRule.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(rules)
  } catch (error) {
    console.error('[RULES_GET]', error)
    return NextResponse.json({ error: 'Failed to fetch trading rules' }, { status: 500 })
  }
}

// POST - Create a new trading rule for authenticated user
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, category } = body

    const rule = await db.tradingRule.create({
      data: {
        name,
        description: description || '',
        category: category || 'entry',
        compliance: 100,
        violations: 0,
        violationCost: 0,
        active: true,
        userId: user.userId,
      },
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.SETTINGS_UPDATED,
      details: { ruleId: rule.id, name: rule.name }
    })

    return NextResponse.json(rule, { status: 201 })
  } catch (error) {
    console.error('[RULES_POST]', error)
    return NextResponse.json({ error: 'Failed to create trading rule' }, { status: 500 })
  }
}

// PUT - Update a trading rule
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Rule ID is required' }, { status: 400 })
    }

    // Check if rule exists and belongs to user
    const existingRule = await db.tradingRule.findFirst({
      where: { id, userId: user.userId, deletedAt: null },
    })

    if (!existingRule) {
      return NextResponse.json({ error: 'Trading rule not found' }, { status: 404 })
    }

    const rule = await db.tradingRule.update({
      where: { id },
      data: updates,
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.SETTINGS_UPDATED,
      details: { ruleId: id, action: 'update' }
    })

    return NextResponse.json(rule)
  } catch (error) {
    console.error('[RULES_PUT]', error)
    return NextResponse.json({ error: 'Failed to update trading rule' }, { status: 500 })
  }
}

// DELETE - Delete a trading rule
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Rule ID is required' }, { status: 400 })
    }

    // Check if rule exists and belongs to user
    const existingRule = await db.tradingRule.findFirst({
      where: { id, userId: user.userId, deletedAt: null },
    })

    if (!existingRule) {
      return NextResponse.json({ error: 'Trading rule not found' }, { status: 404 })
    }

    await db.tradingRule.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.SETTINGS_UPDATED,
      details: { ruleId: id, action: 'soft-delete' }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[RULES_DELETE]', error)
    return NextResponse.json({ error: 'Failed to delete trading rule' }, { status: 500 })
  }
}
