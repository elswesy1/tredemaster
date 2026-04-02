import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all trades
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const symbol = searchParams.get('symbol')

    const where: Record<string, unknown> = {}
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

// POST - Create a new trade
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      symbol,
      type,
      entryPrice,
      quantity,
      stopLoss,
      takeProfit,
      notes,
      userId,
      portfolioId,
      accountId,
      strategy,
    } = body

    const trade = await db.trade.create({
      data: {
        symbol,
        type,
        entryPrice,
        quantity,
        stopLoss,
        takeProfit,
        notes,
        strategy,
        userId: userId || 'default-user',
        portfolioId,
        accountId,
      },
    })
    return NextResponse.json(trade, { status: 201 })
  } catch (error) {
    console.error('Error creating trade:', error)
    return NextResponse.json({ error: 'Failed to create trade' }, { status: 500 })
  }
}

// DELETE - Delete a trade
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Trade ID is required' }, { status: 400 })
    }

    await db.trade.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting trade:', error)
    return NextResponse.json({ error: 'Failed to delete trade' }, { status: 500 })
  }
}
