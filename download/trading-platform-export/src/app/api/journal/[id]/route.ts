import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// DELETE - Delete a journal entry by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if entry exists
    const existingEntry = await db.tradingJournal.findUnique({
      where: { id },
    })

    if (!existingEntry) {
      return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 })
    }

    // Delete the entry
    await db.tradingJournal.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Journal entry deleted successfully' })
  } catch (error) {
    console.error('Error deleting journal entry:', error)
    return NextResponse.json({ error: 'Failed to delete journal entry' }, { status: 500 })
  }
}

// GET - Fetch a single journal entry by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const entry = await db.tradingJournal.findUnique({
      where: { id },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 })
    }

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error fetching journal entry:', error)
    return NextResponse.json({ error: 'Failed to fetch journal entry' }, { status: 500 })
  }
}

// PUT - Update a journal entry by ID
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Check if entry exists
    const existingEntry = await db.tradingJournal.findUnique({
      where: { id },
    })

    if (!existingEntry) {
      return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 })
    }

    const updatedEntry = await db.tradingJournal.update({
      where: { id },
      data: {
        ...body,
        date: body.date ? new Date(body.date) : undefined,
      },
    })

    return NextResponse.json(updatedEntry)
  } catch (error) {
    console.error('Error updating journal entry:', error)
    return NextResponse.json({ error: 'Failed to update journal entry' }, { status: 500 })
  }
}
