import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-middleware'

// POST /api/trading-accounts/[id]/sync - مزامنة حساب
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح', message: 'يجب تسجيل الدخول للوصول للددات' },
        { status: 401 }
      )
    }

    const { id } = await params

    // التحقق من ملكية الحساب
    const account = await prisma.tradingAccount.findFirst({
      where: {
        id,
        userId: user.userId
      }
    })

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // تحديث حالة الاتصال إلى "syncing"
    await prisma.tradingAccount.update({
      where: { id },
      data: {
        connectionStatus: 'syncing',
        lastSync: new Date()
      }
    })

    // محاكاة عملية المزامنة (في الإنتاج، ستتصل بـ MetaAPI أو TradingView)
    const syncData = {
      balance: account.balance + Math.random() * 100 - 50,
      equity: account.equity + Math.random() * 100 - 50,
      timestamp: new Date()
    }

    // إنشاء سجل مزامنة
    await prisma.dailySyncLog.create({
      data: {
        userId: user.userId,
        accountId: id,
        syncDate: new Date(),
        balanceBefore: account.balance,
        balanceAfter: syncData.balance,
        equityBefore: account.equity,
        equityAfter: syncData.equity,
        tradesSynced: 0,
        syncStatus: 'success'
      }
    })

    // تحديث الحساب بالبيانات الجديدة
    const updatedAccount = await prisma.tradingAccount.update({
      where: { id },
      data: {
        balance: syncData.balance,
        equity: syncData.equity,
        connectionStatus: 'connected',
        lastSync: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      account: updatedAccount,
      message: 'Account synced successfully'
    })
  } catch (error) {
    console.error('Error syncing account:', error)
    
    // تحديث حالة الخطأ
    try {
      const { id } = await params
      await prisma.tradingAccount.update({
        where: { id },
        data: {
          connectionStatus: 'error'
        }
      })
    } catch (e) {
      console.error('Error updating error status:', e)
    }

    return NextResponse.json(
      { error: 'Failed to sync account' },
      { status: 500 }
    )
  }
}

// GET /api/trading-accounts/[id]/sync - جلب سجل المزامنة
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح', message: 'يجب تسجيل الدخول للوصول للددات' },
        { status: 401 }
      )
    }

    const { id } = await params

    // التحقق من ملكية الحساب
    const account = await prisma.tradingAccount.findFirst({
      where: {
        id,
        userId: user.userId
      }
    })

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // جلب سجل المزامنة
    const syncLogs = await prisma.dailySyncLog.findMany({
      where: { accountId: id },
      orderBy: { syncDate: 'desc' },
      take: 30
    })

    return NextResponse.json({
      account: {
        id: account.id,
        name: account.name,
        balance: account.balance,
        equity: account.equity,
        connectionStatus: account.connectionStatus,
        lastSync: account.lastSync
      },
      syncLogs
    })
  } catch (error) {
    console.error('Error fetching sync logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sync logs' },
      { status: 500 }
    )
  }
}