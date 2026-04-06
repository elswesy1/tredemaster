import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET /api/trading-accounts/[id] - جلب حساب محدد
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const account = await prisma.tradingAccount.findFirst({
      where: {
        id: params.id,
        userId: user.id
      },
      include: {
        trades: {
          take: 50,
          orderBy: { openedAt: 'desc' }
        },
        dailySyncLogs: {
          take: 30,
          orderBy: { syncDate: 'desc' }  // ✅ تم الإصلاح: syncDate بدلاً من date
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
    console.error('Error fetching account:', error)
    return NextResponse.json(
      { error: 'Failed to fetch account' },
      { status: 500 }
    )
  }
}

// PUT /api/trading-accounts/[id] - تحديث حساب
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // التحقق من ملكية الحساب
    const existingAccount = await prisma.tradingAccount.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!existingAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // تحديث الحساب
    const updateData: any = { ...body }
    
    if (body.startDate) updateData.startDate = new Date(body.startDate)
    if (body.endDate) updateData.endDate = new Date(body.endDate)
    if (body.challengeStart) updateData.challengeStart = new Date(body.challengeStart)
    if (body.challengeEnd) updateData.challengeEnd = new Date(body.challengeEnd)
    
    const account = await prisma.tradingAccount.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json(account)
  } catch (error) {
    console.error('Error updating account:', error)
    return NextResponse.json(
      { error: 'Failed to update account' },
      { status: 500 }
    )
  }
}

// DELETE /api/trading-accounts/[id] - حذف حساب
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // التحقق من ملكية الحساب
    const existingAccount = await prisma.tradingAccount.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!existingAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    await prisma.tradingAccount.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}