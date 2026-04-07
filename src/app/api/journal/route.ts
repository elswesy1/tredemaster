import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'

// GET - Fetch journal entries for authenticated user only
export async function GET(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصارح - يجب تسجيل الدخول' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const date = searchParams.get('date')
    const accountId = searchParams.get('accountId')

    // فلترة حسب المستخدم
    const where: Record<string, unknown> = { userId: user.userId }
    if (type) where.type = type
    if (accountId) where.accountId = accountId
    if (date) {
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)
      where.date = {
        gte: startDate,
        lte: endDate,
      }
    }

    const entries = await db.tradingJournal.findMany({
      where,
      include: {
        account: {
          select: {
            id: true,
            name: true,
            accountType: true,
            currency: true,
          }
        }
      },
      orderBy: { date: 'desc' },
    })
    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching journal entries:', error)
    return NextResponse.json({ error: 'Failed to fetch journal entries' }, { status: 500 })
  }
}

// POST - Create a new journal entry for authenticated user
export async function POST(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصارح - يجب تسجيل الدخول' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // التحقق من الحساب إذا تم تقديمه
    if (body.accountId) {
      const account = await db.tradingAccount.findFirst({
        where: { id: body.accountId, userId: user.userId }
      })
      if (!account) {
        return NextResponse.json(
          { error: 'الحساب غير موجود أو لا تملك صلاحية الوصول إليه' },
          { status: 404 }
        )
      }
    }

    const entry = await db.tradingJournal.create({
      data: {
        type: body.type || 'daily',
        date: body.date ? new Date(body.date) : new Date(),
        userId: user.userId,
        accountId: body.accountId || null, // optional

        // Pre-market fields
        marketAnalysis: body.marketAnalysis,
        keyLevels: body.keyLevels,
        supportLevels: body.supportLevels,
        resistanceLevels: body.resistanceLevels,
        trendDirection: body.trendDirection,
        expectedVolatility: body.expectedVolatility,
        economicEvents: body.economicEvents,
        tradingPlan: body.tradingPlan,
        strategiesToUse: body.strategiesToUse,
        riskPlan: body.riskPlan,
        dailyGoal: body.dailyGoal,
        maxTrades: body.maxTrades ? parseInt(body.maxTrades) : 3,

        // Market-in fields
        sessionType: body.sessionType,
        sessionStart: body.sessionStart,
        sessionEnd: body.sessionEnd,
        tradesPlanned: body.tradesPlanned ? parseInt(body.tradesPlanned) : 0,
        tradesExecuted: body.tradesExecuted ? parseInt(body.tradesExecuted) : 0,
        entrySetups: body.entrySetups,
        priceActionObs: body.priceActionObs,
        executionNotes: body.executionNotes,
        marketBehavior: body.marketBehavior,
        realTimeObservations: body.realTimeObservations,

        // Market-post fields
        totalTrades: body.totalTrades ? parseInt(body.totalTrades) : 0,
        winningTrades: body.winningTrades ? parseInt(body.winningTrades) : 0,
        losingTrades: body.losingTrades ? parseInt(body.losingTrades) : 0,
        totalProfitLoss: body.totalProfitLoss ? parseFloat(body.totalProfitLoss) : 0,
        sessionResult: body.sessionResult,
        executionQuality: body.executionQuality ? parseInt(body.executionQuality) : 5,
        planAdherence: body.planAdherence ? parseInt(body.planAdherence) : 5,
        riskAdherence: body.riskAdherence ? parseInt(body.riskAdherence) : 5,
        emotionsBefore: body.emotionsBefore,
        emotionsDuring: body.emotionsDuring,
        emotionsAfter: body.emotionsAfter,
        whatWentWell: body.whatWentWell,
        whatNeedsImprovement: body.whatNeedsImprovement,
        lessonsLearned: body.lessonsLearned,
        tomorrowPlan: body.tomorrowPlan,

        // Legacy fields
        title: body.title,
        sentiment: body.sentiment,
        notes: body.notes,
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            accountType: true,
          }
        }
      }
    })
    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Error creating journal entry:', error)
    return NextResponse.json({ error: 'Failed to create journal entry' }, { status: 500 })
  }
}
