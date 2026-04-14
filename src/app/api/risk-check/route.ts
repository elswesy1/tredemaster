import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Check risk before placing a trade
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      riskProfileId,
      symbol,
      tradeType, // buy, sell
      entryPrice,
      stopLoss,
      takeProfit,
      quantity,
      lotSize = 1,
      accountBalance = 10000, // رصيد الحساب
      userId = 'default-user',
    } = body

    // Get the risk profile
    const profile = await db.riskProfile.findUnique({
      where: { id: riskProfileId },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Risk profile not found' }, { status: 404 })
    }

    // Calculate risk metrics
    const riskAmount = stopLoss
      ? Math.abs(entryPrice - stopLoss) * quantity * lotSize * 100000 // For forex (pip value)
      : 0

    const rewardAmount = takeProfit
      ? Math.abs(takeProfit - entryPrice) * quantity * lotSize * 100000
      : 0

    const riskPercent = (riskAmount / accountBalance) * 100
    const rewardPercent = (rewardAmount / accountBalance) * 100
    const riskRewardRatio = riskAmount > 0 ? rewardAmount / riskAmount : 0

    // Get today's risk usage
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const usage = await db.riskUsage.findFirst({
      where: {
        riskProfileId,
        date: { gte: today },
      },
    })

    const currentDailyLoss = usage?.dailyLoss || 0
    const currentWeeklyLoss = usage?.weeklyLoss || 0
    const currentMonthlyLoss = usage?.monthlyLoss || 0
    const currentOpenTrades = usage?.openTrades || 0

    // Run risk checks
    const violations: string[] = []
    const warnings: string[] = []

    // 1. Check daily loss limit
    if (profile.maxDailyLoss) {
      const newDailyLoss = currentDailyLoss + riskAmount
      if (newDailyLoss > profile.maxDailyLoss) {
        violations.push(`تجاوز حد الخسارة اليومي: $${newDailyLoss.toFixed(2)} > $${profile.maxDailyLoss}`)
      } else if (newDailyLoss > profile.maxDailyLoss * 0.8) {
        warnings.push(`اقتراب من حد الخسارة اليومي: ${((newDailyLoss / profile.maxDailyLoss) * 100).toFixed(1)}%`)
      }
    }

    // 2. Check weekly loss limit
    if (profile.maxWeeklyLoss) {
      const newWeeklyLoss = currentWeeklyLoss + riskAmount
      if (newWeeklyLoss > profile.maxWeeklyLoss) {
        violations.push(`تجاوز حد الخسارة الأسبوعي: $${newWeeklyLoss.toFixed(2)} > $${profile.maxWeeklyLoss}`)
      }
    }

    // 3. Check monthly loss limit
    if (profile.maxMonthlyLoss) {
      const newMonthlyLoss = currentMonthlyLoss + riskAmount
      if (newMonthlyLoss > profile.maxMonthlyLoss) {
        violations.push(`تجاوز حد الخسارة الشهري: $${newMonthlyLoss.toFixed(2)} > $${profile.maxMonthlyLoss}`)
      }
    }

    // 4. Check risk per trade
    if (profile.maxRiskPerTrade) {
      if (riskPercent > profile.maxRiskPerTrade) {
        violations.push(`نسبة المخاطرة للصفقة مرتفعة: ${riskPercent.toFixed(2)}% > ${profile.maxRiskPerTrade}%`)
      } else if (riskPercent > profile.maxRiskPerTrade * 0.8) {
        warnings.push(`نسبة المخاطرة قريبة من الحد: ${riskPercent.toFixed(2)}%`)
      }
    }

    // 5. Check position size
    if (profile.maxPositionSize) {
      const positionPercent = (quantity * lotSize / (accountBalance / 100000)) * 100
      if (positionPercent > profile.maxPositionSize) {
        violations.push(`حجم المركز كبير: ${positionPercent.toFixed(2)}% > ${profile.maxPositionSize}%`)
      }
    }

    // 6. Check stop loss requirement
    if (profile.stopLossRequired && !stopLoss) {
      violations.push('وقف الخسارة مطلوب ولكن لم يتم تحديده')
    }

    // 7. Check take profit requirement
    if (profile.takeProfitRequired && !takeProfit) {
      violations.push('جني الأرباح مطلوب ولكن لم يتم تحديده')
    }

    // 8. Check risk/reward ratio
    if (profile.riskRewardMin && riskRewardRatio < profile.riskRewardMin) {
      warnings.push(`نسبة المخاطرة/العائد منخفضة: 1:${riskRewardRatio.toFixed(2)} < 1:${profile.riskRewardMin}`)
    }

    // 9. Check leverage
    if (profile.maxLeverage) {
      const effectiveLeverage = (quantity * lotSize * entryPrice) / accountBalance
      if (effectiveLeverage > profile.maxLeverage) {
        violations.push(`الرافعة المالية مرتفعة: ${effectiveLeverage.toFixed(2)}x > ${profile.maxLeverage}x`)
      }
    }

    // Determine if passed
    const passed = violations.length === 0

    // Save risk check
    const riskCheck = await db.riskCheck.create({
      data: {
        userId,
        riskProfileId,
        symbol,
        tradeType,
        entryPrice: parseFloat(entryPrice),
        stopLoss: stopLoss ? parseFloat(stopLoss) : null,
        takeProfit: takeProfit ? parseFloat(takeProfit) : null,
        quantity: parseFloat(quantity),
        lotSize: parseFloat(lotSize),
        riskAmount,
        riskPercent,
        rewardAmount,
        riskRewardRatio,
        passed,
        violations: violations.length > 0 ? JSON.stringify(violations) : null,
        warnings: warnings.length > 0 ? JSON.stringify(warnings) : null,
      },
    })

    // Generate alerts for violations
    if (violations.length > 0) {
      for (const violation of violations) {
        await db.riskAlert.create({
          data: {
            userId,
            riskProfileId,
            type: 'daily_limit',
            severity: 'critical',
            title: 'انتهاك قاعدة المخاطر',
            message: violation,
            currentValue: riskAmount,
            limitValue: profile.maxDailyLoss,
            percentage: profile.maxDailyLoss ? (riskAmount / profile.maxDailyLoss) * 100 : null,
          },
        })
      }
    }

    return NextResponse.json({
      passed,
      violations,
      warnings,
      riskCheck,
      riskMetrics: {
        riskAmount,
        riskPercent,
        rewardAmount,
        rewardPercent,
        riskRewardRatio,
        currentDailyLoss,
        currentWeeklyLoss,
        currentMonthlyLoss,
        currentOpenTrades,
      },
      profileLimits: {
        maxDailyLoss: profile.maxDailyLoss,
        maxWeeklyLoss: profile.maxWeeklyLoss,
        maxMonthlyLoss: profile.maxMonthlyLoss,
        maxRiskPerTrade: profile.maxRiskPerTrade,
        maxPositionSize: profile.maxPositionSize,
        riskRewardMin: profile.riskRewardMin,
      },
    })
  } catch (error) {
    console.error('Error checking risk:', error)
    return NextResponse.json({ error: 'Failed to check risk' }, { status: 500 })
  }
}
