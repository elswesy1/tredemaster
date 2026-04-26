export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-middleware'

// GET /api/trading-accounts/[id]/stats - إحصائيات حساب
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getAuthUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Auth required' },
        { status: 401 }
      )
    }

    // التحقق من ملكية الحساب
    const account = await prisma.tradingAccount.findFirst({
      where: {
        id,
        userId: user.userId,
        deletedAt: null
      }
    })

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // جلب إحصائيات الحساب
    const trades = await prisma.trade.findMany({
      where: {
        accountId: id,
        status: 'closed',
        deletedAt: null
      },
      select: {
        profitLoss: true,
        closedAt: true
      }
    })

    const totalTrades = trades.length
    const winningTrades = trades.filter(t => t.profitLoss > 0).length
    const losingTrades = trades.filter(t => t.profitLoss < 0).length
    const totalProfit = trades.reduce((sum, t) => sum + (t.profitLoss || 0), 0)
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

    return NextResponse.json({
      totalTrades,
      winningTrades,
      losingTrades,
      totalProfit,
      winRate,
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