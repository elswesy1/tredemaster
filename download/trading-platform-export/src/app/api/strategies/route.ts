import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all strategies
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const userId = searchParams.get('userId')

    const where: Record<string, unknown> = {}
    if (category) where.category = category
    if (userId) where.userId = userId

    const strategies = await db.strategy.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(strategies)
  } catch (error) {
    console.error('Error fetching strategies:', error)
    return NextResponse.json({ error: 'Failed to fetch strategies' }, { status: 500 })
  }
}

// POST - Create a new strategy
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      category,
      timeframe,
      entryRules,
      exitRules,
      riskRules,
      userId,
    } = body

    if (!name) {
      return NextResponse.json({ error: 'Strategy name is required' }, { status: 400 })
    }

    const strategy = await db.strategy.create({
      data: {
        name,
        description,
        category: category || 'technical',
        timeframe,
        entryRules,
        exitRules,
        riskRules,
        userId: userId || 'default-user',
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        profitLoss: 0,
      },
    })
    return NextResponse.json(strategy, { status: 201 })
  } catch (error) {
    console.error('Error creating strategy:', error)
    return NextResponse.json({ error: 'Failed to create strategy' }, { status: 500 })
  }
}

// PUT - Update a strategy
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Strategy ID is required' }, { status: 400 })
    }

    const strategy = await db.strategy.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json(strategy)
  } catch (error) {
    console.error('Error updating strategy:', error)
    return NextResponse.json({ error: 'Failed to update strategy' }, { status: 500 })
  }
}

// DELETE - Delete a strategy
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Strategy ID is required' }, { status: 400 })
    }

    await db.strategy.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting strategy:', error)
    return NextResponse.json({ error: 'Failed to delete strategy' }, { status: 500 })
  }
}
