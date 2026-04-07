import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-middleware'

// POST /api/trading-accounts/[id]/sync - مزامنة حساب
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request)
    
    if (!user) {
      return NextResponse.json({ 
        error: 'غير مصرح', 
        message: 'يجب تسجيل الدخول للوصول لهذه البيانات' 
      }, { status: 401 })
    }

    // التحقق من ملكية الحساب
    const account = await prisma.tradingAccount.findFirst({
      where: {
        id: params.id,
        userId: user.userId
      }
    })

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // تحديث حالة الاتصال إلى "syncing"
    await prisma.tradingAccount.update({
      where: { id: params.id },
      data: {
        connectionStatus: 'syncing',  // ✅ تم الإصلاح: connectionStatus بدلاً من status
        lastSync: new Date()
      }
    })

    // محاكاة عملية المزامنة (في الإنتاج، ستتصل بـ MetaAPI أو TradingView)
    // في الواقع، ستقوم بجلب البيانات من الـ broker
    const syncData = {
      balance: account.balance + Math.random() * 100 - 50, // محاكاة
      equity: account.equity + Math.random() * 100 - 50,
      timestamp: new Date()
    }

    // إنشاء سجل مزامنة
    await prisma.dailySyncLog.create({
      data: {
        userId: user.userId,
        accountId: params.id,
        syncDate: new Date(),
        balanceBefore: account.balance,
        balanceAfter: syncData.balance,
        equityBefore: account.equity,
        equityAfter: syncData.equity,
        tradesSynced: 0,
        syncStatus: 'success'  // ✅ تم الإصلاح: syncStatus بدلاً من status
      }
    })

    // تحديث الحساب بالبيانات الجديدة
    const updatedAccount = await prisma.tradingAccount.update({
      where: { id: params.id },
      data: {
        balance: syncData.balance,
        equity: syncData.equity,
        connectionStatus: 'connected',  // ✅ تم الإصلاح
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
      await prisma.tradingAccount.update({
        where: { id: params.id },
        data: {
          connectionStatus: 'error'  // ✅ تم الإصلاح
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
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request)
    
    if (!user) {
      return NextResponse.json({ 
        error: 'غير مصرح', 
        message: 'يجب تسجيل الدخول للوصول لهذه البيانات' 
      }, { status: 401 })
    }

    // التحقق من ملكية الحساب
    const account = await prisma.tradingAccount.findFirst({
      where: {
        id: params.id,
        userId: user.userId
      }
    })

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // جلب سجل المزامنة
    const syncLogs = await prisma.dailySyncLog.findMany({
      where: { accountId: params.id },
      orderBy: { syncDate: 'desc' },  // ✅ تم الإصلاح
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