import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'

// GET /api/accounts - Get accounts for authenticated user only
export async function GET(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح - يجب تسجيل الدخول' },
        { status: 401 }
      )
    }

    const accounts = await db.account.findMany({
      where: { userId: user.userId },
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
    console.error('Get accounts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/accounts - Create new account for authenticated user
export async function POST(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح - يجب تسجيل الدخول' },
        { status: 401 }
      )
    }

    const data = await request.json()

    const account = await db.account.create({
      data: {
        userId: user.userId, // ربط بالمستخدم الحالي
        name: data.name,
        broker: data.broker,
        accountNumber: data.accountNumber,
        type: data.type || 'demo',
        currency: data.currency || 'USD',
        balance: parseFloat(data.balance) || 0,
        equity: parseFloat(data.equity) || 0,
        leverage: parseFloat(data.leverage) || 100,
        portfolioId: data.portfolioId || null
      }
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    console.error('Create account error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/accounts - Update account (only if owned by user)
export async function PUT(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح - يجب تسجيل الدخول' },
        { status: 401 }
      )
    }

    const data = await request.json()

    // التحقق من ملكية الحساب
    const existingAccount = await db.account.findUnique({
      where: { id: data.id },
      select: { userId: true }
    })

    if (!existingAccount) {
      return NextResponse.json({ error: 'الحساب غير موجود' }, { status: 404 })
    }

    if (existingAccount.userId !== user.userId) {
      return NextResponse.json(
        { error: 'غير مصرح - لا يمكنك تعديل هذا الحساب' },
        { status: 403 }
      )
    }

    const account = await db.account.update({
      where: { id: data.id },
      data: {
        name: data.name,
        broker: data.broker,
        accountNumber: data.accountNumber,
        balance: parseFloat(data.balance) || 0,
        equity: parseFloat(data.equity) || 0,
        margin: parseFloat(data.margin) || 0,
        freeMargin: parseFloat(data.freeMargin) || 0,
        lastSync: new Date()
      }
    })

    return NextResponse.json({ account })
  } catch (error) {
    console.error('Update account error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/accounts - Delete account (only if owned by user)
export async function DELETE(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح - يجب تسجيل الدخول' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Account ID required' }, { status: 400 })
    }

    // التحقق من ملكية الحساب
    const existingAccount = await db.account.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!existingAccount) {
      return NextResponse.json({ error: 'الحساب غير موجود' }, { status: 404 })
    }

    if (existingAccount.userId !== user.userId) {
      return NextResponse.json(
        { error: 'غير مصرح - لا يمكنك حذف هذا الحساب' },
        { status: 403 }
      )
    }

    await db.account.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
