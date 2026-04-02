import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch a single psychology log
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const log = await db.psychologyLog.findUnique({
      where: { id },
    })

    if (!log) {
      return NextResponse.json({ error: 'Psychology log not found' }, { status: 404 })
    }

    return NextResponse.json(log)
  } catch (error) {
    console.error('Error fetching psychology log:', error)
    return NextResponse.json({ error: 'Failed to fetch psychology log' }, { status: 500 })
  }
}

// PUT - Update a psychology log
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    } = body

    const log = await db.psychologyLog.update({
      where: { id },
      data: {
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
      },
    })

    return NextResponse.json(log)
  } catch (error) {
    console.error('Error updating psychology log:', error)
    return NextResponse.json({ error: 'Failed to update psychology log' }, { status: 500 })
  }
}

// DELETE - Delete a psychology log
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.psychologyLog.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting psychology log:', error)
    return NextResponse.json({ error: 'Failed to delete psychology log' }, { status: 500 })
  }
}
