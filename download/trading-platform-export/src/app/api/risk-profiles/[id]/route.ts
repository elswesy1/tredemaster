import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch a single risk profile by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const profile = await db.riskProfile.findUnique({
      where: { id },
    })
    
    if (!profile) {
      return NextResponse.json({ error: 'Risk profile not found' }, { status: 404 })
    }
    
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching risk profile:', error)
    return NextResponse.json({ error: 'Failed to fetch risk profile' }, { status: 500 })
  }
}

// PUT - Update a risk profile
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      isActive,
    } = body

    const profile = await db.riskProfile.update({
      where: { id },
      data: {
        name,
        description,
        riskTolerance,
        riskDegree,
        maxDailyLoss: maxDailyLoss !== undefined ? parseFloat(maxDailyLoss) : null,
        maxWeeklyLoss: maxWeeklyLoss !== undefined ? parseFloat(maxWeeklyLoss) : null,
        maxMonthlyLoss: maxMonthlyLoss !== undefined ? parseFloat(maxMonthlyLoss) : null,
        maxDrawdown: maxDrawdown !== undefined ? parseFloat(maxDrawdown) : null,
        maxPositionSize: maxPositionSize !== undefined ? parseFloat(maxPositionSize) : null,
        maxRiskPerTrade: maxRiskPerTrade !== undefined ? parseFloat(maxRiskPerTrade) : null,
        maxCorrelatedTrades: maxCorrelatedTrades !== undefined ? parseInt(maxCorrelatedTrades) : null,
        maxLeverage: maxLeverage !== undefined ? parseFloat(maxLeverage) : null,
        stopLossRequired,
        takeProfitRequired,
        riskRewardMin: riskRewardMin !== undefined ? parseFloat(riskRewardMin) : null,
        isConfigured,
        isActive,
      },
    })
    
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error updating risk profile:', error)
    return NextResponse.json({ error: 'Failed to update risk profile' }, { status: 500 })
  }
}

// DELETE - Delete a risk profile
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.riskProfile.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting risk profile:', error)
    return NextResponse.json({ error: 'Failed to delete risk profile' }, { status: 500 })
  }
}
