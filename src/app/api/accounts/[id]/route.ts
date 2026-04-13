import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'

// GET - Fetch a single account
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح - يجب تسجيل الدخول' },
        { status: 401 }
      )
    }

    const { id } = await params

    const account = await db.tradingAccount.findFirst({
      where: { id, userId: user.userId },
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
      return NextResponse.json({ error: 'الحساب غير موجود' }, { status: 404 })
    }

    return NextResponse.json(account)
  } catch (error) {
    console.error('Get account error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update account
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح - يجب تسجيل الدخول' },
        { status: 401 }
      )
    }

    const { id } = await params
    const data = await request.json()

    const existingAccount = await db.tradingAccount.findFirst({
      where: { id, userId: user.userId }
    })

    if (!existingAccount) {
      return NextResponse.json({ error: 'الحساب غير موجود' }, { status: 404 })
    }

    const account = await db.tradingAccount.update({
      where: { id },
      data: {
        name: data.name,
        broker: data.broker,
        accountNumber: data.accountNumber,
        balance: parseFloat(data.balance) || 0,
        equity: parseFloat(data.equity) || 0,
        lastSync: new Date()
      }
    })

    return NextResponse.json({ account })
  } catch (error) {
    console.error('Update account error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete account
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح - يجب تسجيل الدخول' },
        { status: 401 }
      )
    }

    const { id } = await params

    const existingAccount = await db.tradingAccount.findFirst({
      where: { id, userId: user.userId }
    })

    if (!existingAccount) {
      return NextResponse.json({ error: 'الحساب غير موجود' }, { status: 404 })
    }

    await db.tradingAccount.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
