import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/auth/me - Get current user
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        portfolios: true,
        accounts: true,
        riskProfiles: true,
        strategies: true,
        _count: {
          select: {
            trades: true,
            journals: true,
            sessions: true,
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.subscription?.plan || 'free',
        trialEndsAt: user.subscription?.endDate,
        stats: {
          totalTrades: user._count.trades,
          totalJournals: user._count.journals,
          totalSessions: user._count.sessions,
        }
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
