import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'
import { logAudit, AuditAction } from '@/lib/audit'

// GET - Fetch a single trade for authenticated user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول' }, { status: 401 })
    }

    const { id } = await params
    const trade = await db.trade.findFirst({
      where: { 
        id, 
        userId: user.userId,
        deletedAt: null 
      },
    })

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    return NextResponse.json(trade)
  } catch (error) {
    console.error('[TRADE_GET_BY_ID]', error)
    return NextResponse.json({ error: 'Failed to fetch trade' }, { status: 500 })
  }
}

// PUT - Update a trade
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const {
      symbol,
      type,
      status,
      entryPrice,
      exitPrice,
      quantity,
      stopLoss,
      takeProfit,
      notes,
      playbookId,
      profitLoss,
    } = body

    // Check ownership
    const existing = await db.trade.findFirst({
      where: { id, userId: user.userId, deletedAt: null }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (symbol !== undefined) updateData.symbol = symbol
    if (type !== undefined) updateData.type = type
    if (status !== undefined) updateData.status = status
    if (entryPrice !== undefined) updateData.entryPrice = entryPrice
    if (exitPrice !== undefined) updateData.exitPrice = exitPrice
    if (quantity !== undefined) updateData.quantity = quantity
    if (stopLoss !== undefined) updateData.stopLoss = stopLoss
    if (takeProfit !== undefined) updateData.takeProfit = takeProfit
    if (notes !== undefined) updateData.notes = notes
    if (playbookId !== undefined) updateData.playbookId = playbookId
    if (profitLoss !== undefined) updateData.profitLoss = profitLoss
    
    // If closing the trade, set closedAt
    if (status === 'closed') {
      updateData.closedAt = new Date()
    }

    const trade = await db.trade.update({
      where: { id },
      data: updateData,
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.SETTINGS_UPDATED,
      details: { tradeId: id, action: 'update' }
    })

    return NextResponse.json(trade)
  } catch (error) {
    console.error('[TRADE_PUT]', error)
    return NextResponse.json({ error: 'Failed to update trade' }, { status: 500 })
  }
}

// DELETE - Delete a trade
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول' }, { status: 401 })
    }

    const { id } = await params

    // Check ownership
    const existing = await db.trade.findFirst({
      where: { id, userId: user.userId, deletedAt: null }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    await db.trade.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.SETTINGS_UPDATED,
      details: { tradeId: id, action: 'soft-delete' }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[TRADE_DELETE]', error)
    return NextResponse.json({ error: 'Failed to delete trade' }, { status: 500 })
  }
}
