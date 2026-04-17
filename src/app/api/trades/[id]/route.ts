export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';


import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch a single trade
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const trade = await db.trade.findUnique({
      where: { id },
    })

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    return NextResponse.json(trade)
  } catch (error) {
    console.error('Error fetching trade:', error)
    return NextResponse.json({ error: 'Failed to fetch trade' }, { status: 500 })
  }
}

// PUT - Update a trade
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
      strategy,
      profitLoss,
    } = body

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
    if (strategy !== undefined) updateData.strategy = strategy
    if (profitLoss !== undefined) updateData.profitLoss = profitLoss
    
    // If closing the trade, set closedAt
    if (status === 'closed') {
      updateData.closedAt = new Date()
    }

    const trade = await db.trade.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(trade)
  } catch (error) {
    console.error('Error updating trade:', error)
    return NextResponse.json({ error: 'Failed to update trade' }, { status: 500 })
  }
}

// DELETE - Delete a trade
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.trade.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting trade:', error)
    return NextResponse.json({ error: 'Failed to delete trade' }, { status: 500 })
  }
}
