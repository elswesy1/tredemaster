import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all journal entries
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const where: Record<string, unknown> = {}
    if (type) where.type = type

    const entries = await db.tradingJournal.findMany({
      where,
      orderBy: { date: 'desc' },
    })
    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching journal entries:', error)
    return NextResponse.json({ error: 'Failed to fetch journal entries' }, { status: 500 })
  }
}

// POST - Create a new journal entry
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      type,
      title,
      marketCondition,
      sentiment,
      keyLevels,
      plannedTrades,
      actualTrades,
      lessons,
      mistakes,
      improvements,
      mood,
      energy,
      focus,
      confidence,
      notes,
      userId,
      date,
    } = body

    const entry = await db.tradingJournal.create({
      data: {
        type: type || 'daily',
        title,
        marketCondition,
        sentiment,
        keyLevels,
        plannedTrades,
        actualTrades,
        lessons,
        mistakes,
        improvements,
        mood,
        energy,
        focus,
        confidence,
        notes,
        userId: userId || 'default-user',
        date: date ? new Date(date) : new Date(),
      },
    })
    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Error creating journal entry:', error)
    return NextResponse.json({ error: 'Failed to create journal entry' }, { status: 500 })
  }
}
