import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'

// GET - Fetch all playbooks for the user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: Record<string, unknown> = { userId: user.userId }
    if (category) where.category = category

    const playbooks = await db.playbook.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(playbooks)
  } catch (error) {
    console.error('Error fetching playbooks:', error)
    return NextResponse.json({ error: 'Failed to fetch playbooks' }, { status: 500 })
  }
}

// POST - Create a new playbook
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      name, 
      description, 
      setupName,
      imageUrl,
      confluences,
      killZones,
      hardRules,
      category,
      timeframe,
      entryRules,
      exitRules,
      riskRules,
      isActive 
    } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Playbook name is required' }, { status: 400 })
    }

    const playbook = await db.playbook.create({
      data: {
        userId: user.userId,
        name: name.trim(),
        description: description || null,
        setupName: setupName || null,
        imageUrl: imageUrl || null,
        confluences: confluences || null,  // Already JSON string from frontend
        killZones: killZones || null,      // Already JSON string from frontend
        hardRules: hardRules || null,
        category: category || null,
        timeframe: timeframe || null,
        entryRules: entryRules || null,
        exitRules: exitRules || null,
        riskRules: riskRules || null,
        isActive: isActive ?? true,
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        profitLoss: 0,
      },
    })

    return NextResponse.json(playbook, { status: 201 })
  } catch (error) {
    console.error('Error creating playbook:', error)
    return NextResponse.json({ error: 'Failed to create playbook' }, { status: 500 })
  }
}

// PUT - Update a playbook
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Playbook ID is required' }, { status: 400 })
    }

    // Verify ownership
    const existing = await db.playbook.findFirst({
      where: { id, userId: user.userId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Playbook not found' }, { status: 404 })
    }

    // Process JSON fields if they're arrays
    if (updates.confluences && Array.isArray(updates.confluences)) {
      updates.confluences = JSON.stringify(updates.confluences)
    }
    if (updates.killZones && Array.isArray(updates.killZones)) {
      updates.killZones = JSON.stringify(updates.killZones)
    }

    const playbook = await db.playbook.update({
      where: { id },
      data: updates,
    })

    return NextResponse.json(playbook)
  } catch (error) {
    console.error('Error updating playbook:', error)
    return NextResponse.json({ error: 'Failed to update playbook' }, { status: 500 })
  }
}

// DELETE - Delete a playbook
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Playbook ID is required' }, { status: 400 })
    }

    // Verify ownership
    const existing = await db.playbook.findFirst({
      where: { id, userId: user.userId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Playbook not found' }, { status: 404 })
    }

    await db.playbook.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting playbook:', error)
    return NextResponse.json({ error: 'Failed to delete playbook' }, { status: 500 })
  }
}