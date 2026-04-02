import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all psychology logs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const where: Record<string, unknown> = {}
    if (type) where.type = type

    const logs = await db.psychologyLog.findMany({
      where,
      orderBy: { date: 'desc' },
    })
    return NextResponse.json(logs)
  } catch (error) {
    console.error('Error fetching psychology logs:', error)
    return NextResponse.json({ error: 'Failed to fetch psychology logs' }, { status: 500 })
  }
}

// POST - Create a new psychology log
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      type,
      tradeId,
      emotion,
      emotionIntensity,
      trigger,
      reaction,
      outcome,
      copingStrategy,
      lessons,
      recommendations,
      stress,
      discipline,
      patience,
      confidence,
      notes,
      userId,
    } = body

    const log = await db.psychologyLog.create({
      data: {
        type: type || 'check-in',
        tradeId,
        emotion,
        emotionIntensity,
        trigger,
        reaction,
        outcome,
        copingStrategy,
        lessons,
        recommendations,
        stress,
        discipline,
        patience,
        confidence,
        notes,
        userId: userId || 'default-user',
      },
    })
    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    console.error('Error creating psychology log:', error)
    return NextResponse.json({ error: 'Failed to create psychology log' }, { status: 500 })
  }
}
