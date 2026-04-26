export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';


import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch risk usage for a profile
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const riskProfileId = searchParams.get('riskProfileId')
    const period = searchParams.get('period') || 'today' // today, week, month

    if (!riskProfileId) {
      return NextResponse.json({ error: 'riskProfileId is required' }, { status: 400 })
    }

    const now = new Date()
    let startDate = new Date()

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate.setDate(startDate.getDate() - startDate.getDay())
        startDate.setHours(0, 0, 0, 0)
        break
      case 'month':
        startDate.setDate(1)
        startDate.setHours(0, 0, 0, 0)
        break
    }

    const usage = await db.riskUsage.findFirst({
      where: {
        riskProfileId,
        date: { gte: startDate },
      },
    })

    // Get recent trades for this profile
    const trades = await db.trade.findMany({
      where: {
        userId: 'default-user',
        openedAt: { gte: startDate },
      },
      orderBy: { openedAt: 'desc' },
      take: 50,
    })

    // Calculate risk by symbol
    const riskBySymbol: Record<string, number> = {}
    for (const trade of trades) {
      if (!riskBySymbol[trade.symbol]) {
        riskBySymbol[trade.symbol] = 0
      }
      // Simplified risk calculation
      const tradeRisk = trade.stopLoss
        ? Math.abs(trade.entryPrice - trade.stopLoss) * trade.quantity * trade.lotSize
        : 0
      riskBySymbol[trade.symbol] += tradeRisk
    }

    return NextResponse.json({
      usage,
      riskBySymbol,
      period,
      startDate,
      endDate: now,
    })
  } catch (error) {
    console.error('Error fetching risk usage:', error)
    return NextResponse.json({ error: 'Failed to fetch risk usage' }, { status: 500 })
  }
}

// POST - Update risk usage (called after trade)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      riskProfileId,
      tradeResult, // profit/loss amount
      symbol,
      userId = 'default-user',
    } = body

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find or create today's usage record
    let usage = await db.riskUsage.findFirst({
      where: {
        riskProfileId,
        date: today,
      },
    })

    if (usage) {
      // Update existing record
      usage = await db.riskUsage.update({
        where: { id: usage.id },
        data: {
          dailyLoss: usage.dailyLoss + (tradeResult < 0 ? Math.abs(tradeResult) : 0),
          dailyTrades: usage.dailyTrades + 1,
          weeklyLoss: usage.weeklyLoss + (tradeResult < 0 ? Math.abs(tradeResult) : 0),
          weeklyTrades: usage.weeklyTrades + 1,
          monthlyLoss: usage.monthlyLoss + (tradeResult < 0 ? Math.abs(tradeResult) : 0),
          monthlyTrades: usage.monthlyTrades + 1,
          updatedAt: new Date(),
        },
      })
    } else {
      // Create new record
      usage = await db.riskUsage.create({
        data: {
          userId,
          riskProfileId,
          date: today,
          dailyLoss: tradeResult < 0 ? Math.abs(tradeResult) : 0,
          dailyTrades: 1,
          weeklyLoss: tradeResult < 0 ? Math.abs(tradeResult) : 0,
          weeklyTrades: 1,
          monthlyLoss: tradeResult < 0 ? Math.abs(tradeResult) : 0,
          monthlyTrades: 1,
        },
      })
    }

    return NextResponse.json(usage)
  } catch (error) {
    console.error('Error updating risk usage:', error)
    return NextResponse.json({ error: 'Failed to update risk usage' }, { status: 500 })
  }
}

// PUT - Update open trades count
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { riskProfileId, openTrades, totalExposure } = body

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let usage = await db.riskUsage.findFirst({
      where: {
        riskProfileId,
        date: today,
      },
    })

    if (usage) {
      usage = await db.riskUsage.update({
        where: { id: usage.id },
        data: {
          openTrades: openTrades || 0,
          totalExposure: totalExposure || 0,
        },
      })
    } else {
      usage = await db.riskUsage.create({
        data: {
          userId: 'default-user',
          riskProfileId,
          date: today,
          openTrades: openTrades || 0,
          totalExposure: totalExposure || 0,
        },
      })
    }

    return NextResponse.json(usage)
  } catch (error) {
    console.error('Error updating open trades:', error)
    return NextResponse.json({ error: 'Failed to update open trades' }, { status: 500 })
  }
}