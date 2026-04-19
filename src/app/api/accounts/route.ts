import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'
import { logAudit, AuditAction } from '@/lib/audit'
import { Prisma } from '@prisma/client'
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// GET /api/accounts - Get accounts for authenticated user only
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول' }, { status: 401 })
    }

    const accounts = await db.tradingAccount.findMany({
      where: { 
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
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(accounts)
  } catch (error) {
    console.error('[ACCOUNTS_GET]', error)
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
  }
}

// POST /api/accounts - Create new account for authenticated user
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول' }, { status: 401 })
    }

    const { checkRateLimit } = await import('@/lib/rate-limiter');
    const limit = checkRateLimit(request);

    if (!limit.success) {
      const retryAfter = Math.ceil((limit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'Too many requests' }, 
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    const data = await request.json()

    const account = await db.tradingAccount.create({
      data: {
        userId: user.userId,
        name: data.name,
        broker: data.broker,
        accountNumber: data.accountNumber,
        accountType: data.accountType || 'broker',
        currency: data.currency || 'USD',
        balance: parseFloat(data.balance) || 0,
        equity: parseFloat(data.equity) || 0,
        portfolioId: data.portfolioId || null
      }
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.ACCOUNT_CREATED,
      details: { accountId: account.id, name: account.name, via: 'legacy-api' }
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { 
            error: 'Conflict', 
            message: 'اسم الحساب موجود مسبقاً لهذا النوع من المنصات' 
          }, 
          { status: 409 }
        )
      }
    }
    console.error('[ACCOUNTS_POST]', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}

// PUT /api/accounts - Update account (only if owned by user)
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول' }, { status: 401 })
    }

    const data = await request.json()

    const existingAccount = await db.tradingAccount.findFirst({
      where: { id: data.id, userId: user.userId, deletedAt: null }
    })

    if (!existingAccount) {
      return NextResponse.json({ error: 'الحساب غير موجود' }, { status: 404 })
    }

    const account = await db.tradingAccount.update({
      where: { id: data.id },
      data: {
        name: data.name,
        broker: data.broker,
        accountNumber: data.accountNumber,
        balance: parseFloat(data.balance) || 0,
        equity: parseFloat(data.equity) || 0,
        lastSync: new Date()
      }
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.ACCOUNT_UPDATED,
      details: { accountId: data.id, action: 'update', via: 'legacy-api' }
    })

    return NextResponse.json({ account })
  } catch (error) {
    console.error('[ACCOUNTS_PUT]', error)
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 })
  }
}

// DELETE /api/accounts - Delete account (only if owned by user)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Account ID required' }, { status: 400 })
    }

    const existingAccount = await db.tradingAccount.findFirst({
      where: { id, userId: user.userId, deletedAt: null }
    })

    if (!existingAccount) {
      return NextResponse.json({ error: 'الحساب غير موجود' }, { status: 404 })
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