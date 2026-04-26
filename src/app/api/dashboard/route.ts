export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';


import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'
/**
 * Dashboard Aggregation API
 * يجمع كل البيانات المطلوبة للـ Dashboard في طلب واحد
 * يتضمن:
 * - إحصائيات المحافظ
 * - إحصائيات الحسابات
 * - إحصائيات الصفقات
 * - استخدام المخاطر
 * - الأهداف اليومية
 * - سلسلة الانضباط
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const userId = user.userId
    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)

    // 1️⃣ جلب المحافظ مع الحسابات والصفقات
    const portfolios = await db.portfolio.findMany({
      where: { userId },
      include: {
        tradingAccounts: {
          where: { deletedAt: null },
          include: {
            trades: {
              where: { status: 'closed', deletedAt: null },
              select: {
                profitLoss: true,
                openedAt: true,
                closedAt: true,
              },
            },
            riskProfiles: {
              where: { isActive: true, deletedAt: null },
              select: {
                id: true,
                name: true,
                maxDailyLoss: true,
                maxWeeklyLoss: true,
                maxMonthlyLoss: true,
                maxDrawdown: true,
              }
            }
          },
        },
        trades: {
          where: { status: 'closed', deletedAt: null },
          select: {
            profitLoss: true,
            openedAt: true,
          },
        },
      },
    })

    // 2️⃣ جلب الحسابات بشكل منفصل للحصول على تفاصيل أكثر
    const tradingAccounts = await db.tradingAccount.findMany({
      where: { userId, deletedAt: null },
      include: {
        _count: {
          select: { trades: { where: { deletedAt: null } } },
        },
        riskProfiles: {
          where: { isActive: true, deletedAt: null },
          select: {
            id: true,
            name: true,
            maxDailyLoss: true,
            maxWeeklyLoss: true,
            maxMonthlyLoss: true,
            maxDrawdown: true,
          }
        }
      },
    })

    // 3️⃣ جلب الصفقات المفتوحة والمغلقة
    const openTrades = await db.trade.findMany({
      where: { userId, status: 'open', deletedAt: null },
      include: {
        account: {
          select: { id: true, name: true, accountType: true }
        }
      }
    })

    const closedTrades = await db.trade.findMany({
      where: { userId, status: 'closed', deletedAt: null },
      orderBy: { closedAt: 'desc' },
      take: 100,
      include: {
        account: {
          select: { id: true, name: true, accountType: true }
        }
      }
    })

    // 4️⃣ جلب ملفات المخاطر مع الحسابات المرتبطة
    const riskProfiles = await db.riskProfile.findMany({
      where: { userId },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            accountType: true,
            balance: true,
            equity: true,
          }
        }
      }
    })

    // 5️⃣ جلب استخدام المخاطر اليومي
    const riskUsage = await db.riskUsage.findFirst({
      where: {
        userId,
        date: { gte: todayStart },
      },
    })

    // 6️⃣ جلب يومية اليوم مع الحساب المرتبط
    const todayJournal = await db.tradingJournal.findFirst({
      where: {
        userId,
        date: { gte: todayStart },
      },
      include: {
        account: {
          select: { id: true, name: true, accountType: true }
        }
      }
    })

    // 7️⃣ جلب سجل النفسية لليوم مع الحساب المرتبط
    const todayPsychology = await db.psychologyLog.findFirst({
      where: {
        userId,
        date: { gte: todayStart },
      },
      include: {
        account: {
          select: { id: true, name: true, accountType: true }
        }
      }
    })

    // ========== حساب الإحصائيات ==========

    // حساب إجمالي الأصول
    const totalAssets = portfolios.reduce((sum, p) => sum + (p.totalValue || 0), 0)

    // حساب إجمالي الأرباح/الخسائر
    const totalProfitLoss = closedTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0)

    // حساب Win Rate
    const winningTrades = closedTrades.filter(t => (t.profitLoss || 0) > 0).length
    const winRate = closedTrades.length > 0 
      ? (winningTrades / closedTrades.length) * 100 
      : 0

    // حساب Average R:R
    const tradesWithRR = closedTrades.filter(t => t.stopLoss && t.takeProfit)
    let avgRiskReward = 0
    if (tradesWithRR.length > 0) {
      const totalRR = tradesWithRR.reduce((sum, t) => {
        if (!t.stopLoss || !t.takeProfit || !t.entryPrice) return sum
        const risk = Math.abs(t.entryPrice - t.stopLoss)
        const reward = Math.abs(t.takeProfit - t.entryPrice)
        return sum + (reward / risk)
      }, 0)
      avgRiskReward = totalRR / tradesWithRR.length
    }

    // حساب Profit Factor
    const totalWins = closedTrades
      .filter(t => (t.profitLoss || 0) > 0)
      .reduce((sum, t) => sum + (t.profitLoss || 0), 0)
    const totalLosses = Math.abs(closedTrades
      .filter(t => (t.profitLoss || 0) < 0)
      .reduce((sum, t) => sum + (t.profitLoss || 0), 0))
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0

    // حساب المخاطر المستخدمة
    const dailyRiskUsed = riskUsage?.dailyLoss || 0
    const weeklyRiskUsed = riskUsage?.weeklyLoss || 0
    const monthlyRiskUsed = riskUsage?.monthlyLoss || 0

    // حساب أهداف اليوم (من اليومية)
    const dailyGoals = [
      {
        id: 1,
        title: 'مراجعة السوق الصباحية',
        titleEn: 'Morning market review',
        completed: todayJournal?.marketAnalysis ? true : false,
      },
      {
        id: 2,
        title: 'تسجيل الصفقات',
        titleEn: 'Log trades',
        completed: closedTrades.filter(t => 
          t.closedAt && new Date(t.closedAt) >= todayStart
        ).length > 0,
      },
      {
        id: 3,
        title: 'تحديث يومية التداول',
        titleEn: 'Update trading journal',
        completed: todayJournal?.whatWentWell ? true : false,
      },
      {
        id: 4,
        title: 'مراجعة نهاية اليوم',
        titleEn: 'End-of-day review',
        completed: todayJournal?.lessonsLearned ? true : false,
      },
    ]

    // حساب سلسلة الانضباط
    const disciplineStreak = await calculateDisciplineStreak(userId)

    // حساب Max Drawdown
    const maxDrawdown = await calculateMaxDrawdown(userId)

    // ========== بناء الاستجابة ==========

    const dashboardData = {
      // إحصائيات رئيسية
      stats: {
        totalAssets,
        totalProfitLoss,
        winRate,
        openTrades: openTrades.length,
        totalTrades: closedTrades.length,
        winningTrades,
        losingTrades: closedTrades.length - winningTrades,
        avgRiskReward,
        profitFactor,
        maxDrawdown,
      },

      // المخاطر (مع الحسابات المرتبطة)
      risk: {
        dailyUsed: dailyRiskUsed,
        weeklyUsed: weeklyRiskUsed,
        monthlyUsed: monthlyRiskUsed,
        profiles: riskProfiles.map(p => ({
          ...p,
          accountName: p.account?.name,
          accountType: p.account?.accountType,
        })),
        activeProfile: riskProfiles.find(p => p.isActive),
      },

      // الأهداف اليومية
      dailyGoals,

      // سلسلة الانضباط
      disciplineStreak,

      // المحافظ
      portfolios: portfolios.map(p => ({
        id: p.id,
        name: p.name,
        totalValue: p.totalValue,
        profitLoss: p.profitLoss,
        accountsCount: p.tradingAccounts.length,
      })),

      // الحسابات (مع ملفات المخاطر)
      accounts: tradingAccounts.map(a => ({
        id: a.id,
        name: a.name,
        accountType: a.accountType,
        balance: a.balance,
        equity: a.equity,
        healthStatus: a.healthStatus,
        currentDrawdown: a.currentDrawdown,
        tradesCount: a._count.trades,
        riskProfile: a.riskProfiles[0] || null,
      })),

      // آخر الصفقات
      recentTrades: closedTrades.slice(0, 5).map(t => ({
        id: t.id,
        symbol: t.symbol,
        type: t.type,
        profitLoss: t.profitLoss,
        closedAt: t.closedAt,
        account: t.account,
      })),

      // حالة النفسية اليوم
      psychology: todayPsychology ? {
        stress: todayPsychology.stress,
        confidence: todayPsychology.confidence,
        discipline: todayPsychology.discipline,
        patience: todayPsychology.patience,
        account: todayPsychology.account,
      } : null,

      // حالة اليومية
      journal: todayJournal ? {
        hasPreMarket: !!todayJournal.marketAnalysis,
        hasInMarket: !!todayJournal.executionNotes,
        hasPostMarket: !!todayJournal.whatWentWell,
        sessionResult: todayJournal.sessionResult,
        account: todayJournal.account,
      } : null,

      // Timestamp
      lastUpdate: now.toISOString(),
    }

    return NextResponse.json(dashboardData)
  } catch (error: any) {
    console.error(' [DASHBOARD_ERROR]:', error)
    
    // Check for specific Prisma/DB errors
    const errorMessage = error.message || 'Unknown error'
    const isDbError = errorMessage.includes('database') || errorMessage.includes('Prisma') || error.code?.startsWith('P')
    
    return NextResponse.json(
      { 
        error: isDbError ? 'Database Connection Error' : 'Failed to fetch dashboard data',
        message: errorMessage,
        suggestion: isDbError ? 'Please check your database connectivity or run migrations.' : undefined
      },
      { status: 500 }
    )
  }
}


// ========== Helper Functions ==========

/**
 * حساب سلسلة الانضباط
 * عدد الأيام المتتالية التي تم فيها اتباع الخطة
 */
async function calculateDisciplineStreak(userId: string): Promise<number> {
  const journals = await db.tradingJournal.findMany({
    where: {
      userId,
      planAdherence: { gte: 7 }, // اتباع الخطة بنسبة 70% أو أكثر
    },
    orderBy: { date: 'desc' },
    take: 30, // آخر 30 يوم
  })

  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  for (const journal of journals) {
    const journalDate = new Date(journal.date)
    journalDate.setHours(0, 0, 0, 0)

    // التحقق من أن اليوم متتالي
    const diffDays = Math.floor(
      (currentDate.getTime() - journalDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffDays <= 1) {
      streak++
      currentDate = journalDate
    } else {
      break
    }
  }

  return streak
}

/**
 * حساب Max Drawdown
 */
async function calculateMaxDrawdown(userId: string): Promise<number> {
  const trades = await db.trade.findMany({
    where: {
      userId,
      status: 'closed',
      deletedAt: null,
    },
    orderBy: { closedAt: 'asc' },
    select: {
      profitLoss: true,
      closedAt: true,
    },
  })

  if (trades.length === 0) return 0

  let peak = 0
  let maxDrawdown = 0
  let runningPnL = 0

  for (const trade of trades) {
    runningPnL += trade.profitLoss || 0
    
    if (runningPnL > peak) {
      peak = runningPnL
    }

    const drawdown = peak - runningPnL
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
    }
  }

  return maxDrawdown
}
