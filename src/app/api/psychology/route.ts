export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';


import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'
import { rateLimit, getRateLimitKey } from '@/lib/rate-limiter'

// GET - Fetch psychology logs for authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصارح - يجب تسجيل الدخول' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const accountId = searchParams.get('accountId')

    const where: Record<string, unknown> = { userId: user.userId }
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
    console.error('Error fetching psychology logs:', error)
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

    // ✅ استخدام rateLimit بشكل صحيح
    const rl3 = rateLimit(getRateLimitKey(user.userId, 'psychology_log_create'), 'psychology_log_create')
    if (!rl3.success) return NextResponse.json({ error: "Too many requests", retryAfter: rl3.retryAfter }, { status: 429 })

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
    return NextResponse.json(log, { status: 201 })
    revalidateTag('psychology')
  } catch (error) {
    console.error('Error creating psychology log:', error)
    return NextResponse.json({ error: 'Failed to create psychology log' }, { status: 500 })
  }
}
