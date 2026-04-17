import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'
import { logAudit, AuditAction } from '@/lib/audit'

// GET - Fetch a single risk profile by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول' }, { status: 401 })
    }

    const { id } = await params
    const profile = await db.riskProfile.findFirst({
      where: { 
        id, 
        userId: user.userId,
        deletedAt: null 
      },
    })
    
    if (!profile) {
      return NextResponse.json({ error: 'Risk profile not found' }, { status: 404 })
    }
    
    return NextResponse.json(profile)
  } catch (error) {
    console.error('[RISK_PROFILE_GET_BY_ID]', error)
    return NextResponse.json({ error: 'Failed to fetch risk profile' }, { status: 500 })
  }
}

// PUT - Update a risk profile
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول' }, { status: 401 })
    }

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

    // Check ownership
    const existing = await db.riskProfile.findFirst({
      where: { id, userId: user.userId, deletedAt: null }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Risk profile not found' }, { status: 404 })
    }

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

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.SETTINGS_UPDATED,
      details: { profileId: id, action: 'update' }
    })
    
    return NextResponse.json(profile)
  } catch (error) {
    console.error('[RISK_PROFILE_PUT]', error)
    return NextResponse.json({ error: 'Failed to update risk profile' }, { status: 500 })
  }
}

// DELETE - Delete a risk profile
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول' }, { status: 401 })
    }

    const { id } = await params

    // Check ownership
    const existing = await db.riskProfile.findFirst({
      where: { id, userId: user.userId, deletedAt: null }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Risk profile not found' }, { status: 404 })
    }

    await db.riskProfile.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.SETTINGS_UPDATED,
      details: { profileId: id, action: 'soft-delete' }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[RISK_PROFILE_DELETE]', error)
    return NextResponse.json({ error: 'Failed to delete risk profile' }, { status: 500 })
  }
}
