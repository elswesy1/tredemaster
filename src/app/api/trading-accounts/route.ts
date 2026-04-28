export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';


import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-middleware'
import { logAudit, AuditAction } from '@/lib/audit'
import { Prisma } from '@prisma/client'

// GET /api/trading-accounts - جلب جميع الحسابات
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    
    if (!user) {
      return NextResponse.json({ 
        error: 'غير مصرح', 
        message: 'يجب تسجيل الدخول للوصول لهذه البيانات' 
      }, { status: 401 })
    }

    const accounts = await prisma.tradingAccount.findMany({
      where: { 
        userId: user.userId,
        deletedAt: null 
      },
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
    const user = await getAuthUser(request)
    
    if (!user) {
      return NextResponse.json({ 
        error: 'غير مصرح', 
        message: 'يجب تسجيل الدخول للوصول لهذه البيانات' 
      }, { status: 401 })
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
      propFirmCompany,
      propFirmPhase,
      challengeType,
      challengeTarget,
      dailyDrawdownLimit,
      overallDrawdownLimit,
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
        userId: user.userId,
        name,
        accountType,
        broker: broker || null,
        platform: platform || null,
        accountNumber: accountNumber || null,
        server: server || null,
        currency: currency || 'USD',
        balance: balance || 0,
        equity: equity || 0,
        
        // Prop Firm fields
        propFirmCompany: propFirmCompany || null,
        propFirmPhase: propFirmPhase || null,
        challengeType: challengeType || null,
        challengeTarget: challengeTarget || null,
        dailyDrawdownLimit: dailyDrawdownLimit || null,
        overallDrawdownLimit: overallDrawdownLimit || null,
        challengeStart: challengeStart ? new Date(challengeStart) : null,
        challengeEnd: challengeEnd ? new Date(challengeEnd) : null,
        
        // Connection settings
        connectionMethod: connectionMethod || 'manual',
        connectionStatus: 'disconnected',
        autoSync: autoSync || false,
        isActive: true
      }
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.ACCOUNT_CREATED,
      details: { accountId: account.id, name: account.name }
    })

    // revalidateTag removed
    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    console.error('[TRADING_ACCOUNT_POST]', error)
    
    // معالجة خطأ القيد الفريد (حساب مكرر)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { 
          error: 'Conflict', 
          message: 'يوجد حساب بنفس الاسم والمنصة لهذا المستخدم بالفعل' 
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}