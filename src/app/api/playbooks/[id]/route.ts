import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'

// GET - Fetch a single playbook
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const playbook = await db.playbook.findFirst({
      where: { id, userId: user.userId },
    })

    if (!playbook) {
      return NextResponse.json({ error: 'Playbook not found' }, { status: 404 })
    }

    return NextResponse.json(playbook)
  } catch (error) {
    console.error('Error fetching playbook:', error)
    return NextResponse.json({ error: 'Failed to fetch playbook' }, { status: 500 })
  }
}

// PUT - Update a playbook
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Verify ownership
    const existing = await db.playbook.findFirst({
      where: { id, userId: user.userId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Playbook not found' }, { status: 404 })
    }

    // Process JSON fields if they're arrays
    const updates = { ...body }
    if (updates.confluences && Array.isArray(updates.confluences)) {
      updates.confluences = JSON.stringify(updates.confluences)
    }
    if (updates.killZones && Array.isArray(updates.killZones)) {
      updates.killZones = JSON.stringify(updates.killZones)
    }

    const playbook = await db.playbook.update({
      where: { id },
      data: {
        name: updates.name,
        description: updates.description,
        setupName: updates.setupName,
        imageUrl: updates.imageUrl,
        confluences: updates.confluences,
        killZones: updates.killZones,
        hardRules: updates.hardRules,
        category: updates.category,
        timeframe: updates.timeframe,
        entryRules: updates.entryRules,
        exitRules: updates.exitRules,
        riskRules: updates.riskRules,
        isActive: updates.isActive,
      },
    })

    return NextResponse.json(playbook)
  } catch (error) {
    console.error('Error updating playbook:', error)
    return NextResponse.json({ error: 'Failed to update playbook' }, { status: 500 })
  }
}

// DELETE - Delete a playbook
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const existing = await db.playbook.findFirst({
      where: { id, userId: user.userId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Playbook not found' }, { status: 404 })
    }

    await db.playbook.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting playbook:', error)
    return NextResponse.json({ error: 'Failed to delete playbook' }, { status: 500 })
  }
}