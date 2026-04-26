import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-middleware'
import { logAudit, AuditAction } from '@/lib/audit'

// GET /api/trading-accounts/[id] - جلب حساب محدد
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح', message: 'يجب تسجيل الدخول للوصول لهذه البيانات' },
        { status: 401 }
      )
    }

    const { id } = await params
    const account = await prisma.tradingAccount.findFirst({
      where: {
        id,
        userId: user.userId,
        deletedAt: null
      },
      include: {
        trades: {
          take: 50,
          orderBy: { openedAt: 'desc' }
        },
        dailySyncLogs: {
          take: 30,
          orderBy: { syncDate: 'desc' }
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح', message: 'يجب تسجيل الدخول للوصول لهذه البيانات' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // التحقق من ملكية الحساب
    const existingAccount = await prisma.tradingAccount.findFirst({
      where: {
        id,
        userId: user.userId
      }
    })

    if (!existingAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    // تحديث الحساب
    const updateData: Record<string, unknown> = { ...body }

    if (body.startDate) updateData.startDate = new Date(body.startDate)
    if (body.endDate) updateData.endDate = new Date(body.endDate)
    if (body.challengeStart) updateData.challengeStart = new Date(body.challengeStart)
    if (body.challengeEnd) updateData.challengeEnd = new Date(body.challengeEnd)

    const account = await prisma.tradingAccount.update({
      where: { id },
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
    const existingAccount = await prisma.tradingAccount.findFirst({
      where: {
        id,
        userId: user.userId
      }
    })

    if (!existingAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    await prisma.tradingAccount.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.ACCOUNT_DELETED,
      details: { accountId: id, name: existingAccount.name }
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