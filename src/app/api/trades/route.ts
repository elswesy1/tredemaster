export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';


import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'
import { logAudit, AuditAction } from '@/lib/audit'
import { rateLimit, getRateLimitKey } from '@/lib/rate-limiter'

// GET - Fetch trades for authenticated user only
export async function GET(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح - يجب تسجيل الدخول' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const symbol = searchParams.get('symbol')

    // فلترة حسب المستخدم فقط - لا يمكن رؤية صفقات مستخدم آخر
    const where: Record<string, unknown> = { 
      userId: user.userId,
      deletedAt: null 
    }
    if (status) where.status = status
    if (symbol) where.symbol = symbol

    const trades = await db.trade.findMany({
      where,
      orderBy: { openedAt: 'desc' },
    })
    return NextResponse.json(trades)
  } catch (error) {
    console.error('Error fetching trades:', error)
    return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 })
  }
}

// POST - Create a new trade for authenticated user
export async function POST(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح - يجب تسجيل الدخول' },
        { status: 401 }
      )
    }

    // ✅ استخدام rateLimit بشكل صحيح
    const rl1 = rateLimit(getRateLimitKey(user.userId, 'trade_create'), 'create_trade')
    if (!rl1.success) return NextResponse.json({ error: "Too many requests", retryAfter: rl1.retryAfter }, { status: 429 })

    const body = await request.json()
    const {
      symbol,
      type,
      entryPrice,
      quantity,
      stopLoss,
      takeProfit,
      notes,
      portfolioId,
      accountId,
      strategy,
    } = body

    // إنشاء الصفقة للمستخدم الحالي فقط
    const trade = await db.trade.create({
      data: {
        symbol,
        type,
        entryPrice,
        quantity,
        stopLoss,
        takeProfit,
        notes,
        strategy: (strategy && !String(strategy).includes('-')) ? strategy : null,
        playbookId: (strategy && String(strategy).includes('-')) ? strategy : null,
        userId: user.userId,
        portfolioId,
        accountId,
      },
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.TRADE_CREATED,
      details: { tradeId: trade.id, symbol: trade.symbol }
    })

    revalidateTag('trades', 'max')
    return NextResponse.json(trade, { status: 201 })
  } catch (error) {
    console.error('Error creating trade:', error)
    return NextResponse.json({ error: 'Failed to create trade' }, { status: 500 })
  }
}

// DELETE - Delete a trade (only if owned by user)
export async function DELETE(request: NextRequest) {
  try {
    // التحقق من المصادقة
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
      return NextResponse.json({ error: 'Trade ID is required' }, { status: 400 })
    }

    // التحقق من أن الصفقة مملوكة للمستخدم
    const trade = await db.trade.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!trade) {
      return NextResponse.json({ error: 'الصفقة غير موجودة' }, { status: 404 })
    }

    if (trade.userId !== user.userId) {
      return NextResponse.json(
        { error: 'غير مصرح - لا يمكنك حذف هذه الصفقة' },
        { status: 403 }
      )
    }

    await db.trade.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.TRADE_DELETED,
      details: { tradeId: id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting trade:', error)
    return NextResponse.json({ error: 'Failed to delete trade' }, { status: 500 })
  }
}