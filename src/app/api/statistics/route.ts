export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';


import { NextResponse } from 'next/server'

// Mock statistics data
const statistics = {
  winRate: 68.4,
  riskReward: 1.85,
  profitableSetups: 4,
  optimalTimes: '08:00-12:00 UTC',
  maxConsecutiveLosses: 5,
  tradeExpectancy: 42.5,
  averageWin: 156,
  averageLoss: 85,
  profitFactor: 1.82,
  sharpeRatio: 1.45,
  averageRRR: 1.65,
  bestDay: 'Tuesday',
  worstDay: 'Friday',
}

const performanceByMonth = [
  { month: 'Aug', profit: 1200, trades: 45, winRate: 62 },
  { month: 'Sep', profit: 1800, trades: 52, winRate: 65 },
  { month: 'Oct', profit: -400, trades: 38, winRate: 55 },
  { month: 'Nov', profit: 2400, trades: 60, winRate: 70 },
  { month: 'Dec', profit: 1500, trades: 48, winRate: 68 },
  { month: 'Jan', profit: 2100, trades: 55, winRate: 72 },
]

const hourlyPerformance = [
  { hour: '00-04', winRate: 58, trades: 15 },
  { hour: '04-08', winRate: 65, trades: 22 },
  { hour: '08-12', winRate: 75, trades: 35 },
  { hour: '12-16', winRate: 70, trades: 28 },
  { hour: '16-20', winRate: 62, trades: 18 },
  { hour: '20-24', winRate: 55, trades: 12 },
]

const setupPerformance = [
  { setup: 'Breakout', profit: 2450, winRate: 72, trades: 25 },
  { setup: 'Trend Follow', profit: 1890, winRate: 68, trades: 22 },
  { setup: 'Support/Res', profit: 1340, winRate: 65, trades: 18 },
  { setup: 'Reversal', profit: -320, winRate: 48, trades: 12 },
  { setup: 'News Trade', profit: -450, winRate: 42, trades: 8 },
]

export async function GET() {
  return NextResponse.json({
    statistics,
    performanceByMonth,
    hourlyPerformance,
    setupPerformance,
  })
}
