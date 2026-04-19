import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'
import { logAudit, AuditAction } from '@/lib/audit'
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// GET - Fetch psychology logs for authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصرح - يجب تسجيل الدخول' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const accountId = searchParams.get('accountId')

    const where: Record<string, unknown> = { 
      userId: user.userId,
    }
    if (type) where.type = type
    if (accountId) where.accountId = accountId

    const logs = await db.psychologyLog.findMany({
      where,
      include: {
        account: {
          select: {
            id: true,
            name: true,
            accountType: true,
          }
        }
      },
      orderBy: { date: 'desc' },
    })
    return NextResponse.json(logs)
  } catch (error) {
    console.error('[PSYCHOLOGY_GET]', error)
    return NextResponse.json({ error: 'Failed to fetch psychology logs' }, { status: 500 })
  }
}

// POST - Create a new psychology log
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصارح - يجب تسجيل الدخول' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      type,
      tradeId,
      emotion,
      emotionIntensity,
      trigger,
      reaction,
      outcome,
      copingStrategy,
      lessons,
      recommendations,
      stress,
      discipline,
      patience,
      confidence,
      notes,
      accountId,
    } = body

    // التحقق من الحساب إذا تم تقديمه
    if (accountId) {
      const account = await db.tradingAccount.findFirst({
        where: { id: accountId, userId: user.userId }
      })
      if (!account) {
        return NextResponse.json(
          { error: 'الحساب غير موجود أو لا تملك صلاحية الوصول إليه' },
          { status: 404 }
        )
      }
    }

    const log = await db.psychologyLog.create({
      data: {
        type: type || 'check-in',
        tradeId,
        accountId: accountId || null,
        emotion,
        emotionIntensity,
        trigger,
        reaction,
        outcome,
        copingStrategy,
        lessons,
        recommendations,
        stress,
        discipline,
        patience,
        confidence,
        notes,
        userId: user.userId,
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            accountType: true,
          }
        }
      }
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.PSYCHOLOGY_ENTRY_CREATED,
      details: { logId: log.id, emotion: log.emotion }
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    console.error('[PSYCHOLOGY_POST]', error)
    return NextResponse.json({ error: 'Failed to create psychology log' }, { status: 500 })
  }
}