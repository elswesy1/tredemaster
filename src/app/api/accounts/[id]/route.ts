import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'
import { logAudit, AuditAction } from '@/lib/audit'

// GET /api/accounts/[id] - Get a single account for authenticated user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول' }, { status: 401 })
    }

    const { id } = await params
    
    const account = await db.tradingAccount.findFirst({
      where: { 
        id, 
        userId: user.userId,
        deletedAt: null 
      },
      include: {
        portfolio: {
          select: { name: true }
        },
        _count: {
          select: { trades: true }
        }
      }
    })
    
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }
    
    return NextResponse.json(account)
  } catch (error) {
    console.error('[ACCOUNTS_GET_BY_ID]', error)
    return NextResponse.json({ error: 'Failed to fetch account' }, { status: 500 })
  }
}

// PUT /api/accounts/[id] - Update an account
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول' }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()

    // Check ownership
    const existing = await db.tradingAccount.findFirst({
      where: { id, userId: user.userId, deletedAt: null }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }
    
    const account = await db.tradingAccount.update({
      where: { id },
      data: {
        name: data.name,
        broker: data.broker,
        accountNumber: data.accountNumber,
        accountType: data.accountType,
        balance: data.balance !== undefined ? parseFloat(data.balance) : undefined,
        equity: data.equity !== undefined ? parseFloat(data.equity) : undefined,
        lastSync: new Date()
      }
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.ACCOUNT_UPDATED,
      details: { accountId: id, action: 'update', via: 'legacy-api' }
    })
    
    return NextResponse.json(account)
  } catch (error) {
    console.error('[ACCOUNTS_PUT]', error)
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 })
  }
}

// DELETE /api/accounts/[id] - Delete an account
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول' }, { status: 401 })
    }

    const { id } = await params

    // Check ownership
    const existing = await db.tradingAccount.findFirst({
      where: { id, userId: user.userId, deletedAt: null }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }
    
    await db.tradingAccount.update({ 
      where: { id },
      data: { deletedAt: new Date() }
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.ACCOUNT_DELETED,
      details: { accountId: id, action: 'soft-delete', via: 'legacy-api' }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[ACCOUNTS_DELETE]', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}