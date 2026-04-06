import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET /api/trading-accounts/[id]/stats - إحصائيات حساب
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // التحقق من ملكية الحساب
    const account = await prisma.tradingAccount.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // جلب إحصائيات الحساب
    const trades = await prisma.trade.findMany({
      where: {
        accountId: params.id,
        status: 'closed'
      },
      select: {
        profitLoss: true,
        openedAt: true,
        closedAt: true,
        symbol: true,
        type: true
      }
    })

    const totalTrades = trades.length
    const winningTrades = trades.filter(t => t.profitLoss > 0).length
    const losingTrades = trades.filter(t => t.profitLoss < 0).length
    const totalProfit = trades.reduce((sum, t) => sum + (t.profitLoss || 0), 0)
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

    // إحصائيات الأسبوع الحالي
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const weeklyTrades = trades.filter(t => t.closedAt && t.closedAt >= weekStart)
    const weeklyProfit = weeklyTrades.reduce((sum, t) => sum + (t.profitLoss || 0), 0)

    return NextResponse.json({
      totalTrades,
      winningTrades,
      losingTrades,
      totalProfit,
      winRate,
      weeklyTrades: weeklyTrades.length,
      weeklyProfit,
      balance: account.balance,
      equity: account.equity,
      profitLoss: account.equity - account.balance
    })
  } catch (error) {
    console.error('Error fetching account stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch account stats' },
      { status: 500 }
    )
  }
}