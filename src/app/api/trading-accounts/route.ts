import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET /api/trading-accounts - جلب جميع الحسابات
export async function GET(request: NextRequest) {
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

    const accounts = await prisma.tradingAccount.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { trades: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(accounts)
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    )
  }
}

// POST /api/trading-accounts - إنشاء حساب جديد
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      name,
      accountType,
      broker,
      platform,
      accountNumber,
      server,
      currency,
      balance,
      equity,
      leverage,
      propFirmCompany,
      propFirmPhase,
      challengeType,
      challengeTarget,
      maxDrawdown,
      dailyDrawdownLimit,
      challengeStart,
      challengeEnd,
      autoSync,
      connectionMethod
    } = body

    // التحقق من البيانات المطلوبة
    if (!name || !accountType) {
      return NextResponse.json(
        { error: 'Name and account type are required' },
        { status: 400 }
      )
    }

    const account = await prisma.tradingAccount.create({
      data: {
        userId: user.id,
        name,
        accountType,
        broker: broker || null,
        platform: platform || null,
        accountNumber: accountNumber || null,
        server: server || null,
        currency: currency || 'USD',
        balance: balance || 0,
        equity: equity || 0,
        leverage: leverage || 100,
        
        // Prop Firm fields
        propFirmCompany: propFirmCompany || null,
        propFirmPhase: propFirmPhase || null,
        challengeType: challengeType || null,
        challengeTarget: challengeTarget || null,
        maxDrawdown: maxDrawdown || null,
        dailyDrawdownLimit: dailyDrawdownLimit || null,
        challengeStart: challengeStart ? new Date(challengeStart) : null,
        challengeEnd: challengeEnd ? new Date(challengeEnd) : null,
        
        // Connection settings
        connectionMethod: connectionMethod || 'manual',
        connectionStatus: 'disconnected',
        autoSync: autoSync || false,
        isActive: true
      }
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    console.error('Error creating account:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}