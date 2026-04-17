export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';


import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all setups
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: Record<string, unknown> = {}
    if (category) where.category = category

    const setups = await db.setup.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(setups)
  } catch (error) {
    console.error('Error fetching setups:', error)
    return NextResponse.json({ error: 'Failed to fetch setups' }, { status: 500 })
  }
}

// POST - Create a new setup
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      category,
      timeframe,
      conditions,
      entryRules,
      exitRules,
      stopLossRules,
      takeProfitRules,
      riskReward,
      successRate,
      notes,
      userId,
    } = body

    const setup = await db.setup.create({
      data: {
        name,
        description,
        category,
        timeframe,
        conditions,
        entryRules,
        exitRules,
        stopLossRules,
        takeProfitRules,
        riskReward,
        successRate,
        notes,
        userId: userId || 'default-user',
      },
    })
    return NextResponse.json(setup, { status: 201 })
    revalidateTag('setups')
  } catch (error) {
    console.error('Error creating setup:', error)
    return NextResponse.json({ error: 'Failed to create setup' }, { status: 500 })
  }
}
