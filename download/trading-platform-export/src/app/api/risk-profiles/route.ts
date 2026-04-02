import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all risk profiles
export async function GET() {
  try {
    const profiles = await db.riskProfile.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(profiles)
  } catch (error) {
    console.error('Error fetching risk profiles:', error)
    return NextResponse.json({ error: 'Failed to fetch risk profiles' }, { status: 500 })
  }
}

// POST - Create a new risk profile
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      riskTolerance,
      riskDegree,
      maxDailyLoss,
      maxWeeklyLoss,
      maxMonthlyLoss,
      maxDrawdown,
      maxPositionSize,
      maxRiskPerTrade,
      maxCorrelatedTrades,
      maxLeverage,
      stopLossRequired,
      takeProfitRequired,
      riskRewardMin,
      isConfigured,
      accountId,
      accountName,
      accountType,
      userId,
    } = body

    const profile = await db.riskProfile.create({
      data: {
        name,
        description,
        riskTolerance: riskTolerance || 'moderate',
        riskDegree: riskDegree || 5,
        maxDailyLoss: maxDailyLoss !== undefined ? parseFloat(maxDailyLoss) : null,
        maxWeeklyLoss: maxWeeklyLoss !== undefined ? parseFloat(maxWeeklyLoss) : null,
        maxMonthlyLoss: maxMonthlyLoss !== undefined ? parseFloat(maxMonthlyLoss) : null,
        maxDrawdown: maxDrawdown !== undefined ? parseFloat(maxDrawdown) : null,
        maxPositionSize: maxPositionSize !== undefined ? parseFloat(maxPositionSize) : null,
        maxRiskPerTrade: maxRiskPerTrade !== undefined ? parseFloat(maxRiskPerTrade) : null,
        maxCorrelatedTrades: maxCorrelatedTrades !== undefined ? parseInt(maxCorrelatedTrades) : null,
        maxLeverage: maxLeverage !== undefined ? parseFloat(maxLeverage) : null,
        stopLossRequired: stopLossRequired || false,
        takeProfitRequired: takeProfitRequired || false,
        riskRewardMin: riskRewardMin !== undefined ? parseFloat(riskRewardMin) : null,
        isConfigured: isConfigured || false,
        accountId: accountId || null,
        accountName: accountName || null,
        accountType: accountType || null,
        userId: userId || 'default-user',
      },
    })
    return NextResponse.json(profile, { status: 201 })
  } catch (error) {
    console.error('Error creating risk profile:', error)
    return NextResponse.json({ error: 'Failed to create risk profile' }, { status: 500 })
  }
}
