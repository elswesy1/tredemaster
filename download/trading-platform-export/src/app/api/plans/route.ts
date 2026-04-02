import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all trading plans
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (type) where.type = type
    if (status) where.status = status

    const plans = await db.tradingPlan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(plans)
  } catch (error) {
    console.error('Error fetching trading plans:', error)
    return NextResponse.json({ error: 'Failed to fetch trading plans' }, { status: 500 })
  }
}

// POST - Create a new trading plan
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      type,
      goals,
      rules,
      strategies,
      riskRules,
      maxTrades,
      maxRisk,
      startDate,
      endDate,
      userId,
    } = body

    const plan = await db.tradingPlan.create({
      data: {
        title,
        description,
        type: type || 'daily',
        goals,
        rules,
        strategies,
        riskRules,
        maxTrades,
        maxRisk,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        userId: userId || 'default-user',
      },
    })
    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    console.error('Error creating trading plan:', error)
    return NextResponse.json({ error: 'Failed to create trading plan' }, { status: 500 })
  }
}
