import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all trading rules
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const active = searchParams.get('active')

    const where: Record<string, unknown> = {}
    if (category) where.category = category
    if (active !== null) where.active = active === 'true'

    const rules = await db.tradingRule.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(rules)
  } catch (error) {
    console.error('Error fetching trading rules:', error)
    return NextResponse.json({ error: 'Failed to fetch trading rules' }, { status: 500 })
  }
}

// POST - Create a new trading rule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, category, userId } = body

    const rule = await db.tradingRule.create({
      data: {
        name,
        description: description || '',
        category: category || 'entry',
        compliance: 100,
        violations: 0,
        violationCost: 0,
        active: true,
        userId: userId || 'default-user',
      },
    })
    return NextResponse.json(rule, { status: 201 })
    revalidateTag('rules')
  } catch (error) {
    console.error('Error creating trading rule:', error)
    return NextResponse.json({ error: 'Failed to create trading rule' }, { status: 500 })
  }
}

// PUT - Update a trading rule
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Rule ID is required' }, { status: 400 })
    }

    const rule = await db.tradingRule.update({
      where: { id },
      data: updates,
    })
    return NextResponse.json(rule)
  } catch (error) {
    console.error('Error updating trading rule:', error)
    return NextResponse.json({ error: 'Failed to update trading rule' }, { status: 500 })
  }
}

// DELETE - Delete a trading rule
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Rule ID is required' }, { status: 400 })
    }

    await db.tradingRule.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting trading rule:', error)
    return NextResponse.json({ error: 'Failed to delete trading rule' }, { status: 500 })
  }
}
