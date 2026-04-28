export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';


import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'
import { logAudit, AuditAction } from '@/lib/audit'

// GET - Fetch portfolios for authenticated user only
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

    // جلب محافظ المستخدم فقط
    const portfolios = await db.portfolio.findMany({
      where: { 
        userId: user.userId,
        deletedAt: null
      },
      include: {
        tradingAccounts: true,
        trades: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(portfolios)
  } catch (error) {
    console.error('[PORTFOLIO_GET]', error)
    return NextResponse.json({ error: 'Failed to fetch portfolios' }, { status: 500 })
  }
}

// POST - Create a new portfolio for authenticated user
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

    const body = await request.json()
    const { name, description, currency } = body

    const portfolio = await db.portfolio.create({
      data: {
        name,
        description,
        currency: currency || 'USD',
        userId: user.userId, // ربط بالمستخدم الحالي
      },
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.PORTFOLIO_CREATED,
      details: { portfolioId: portfolio.id, name: portfolio.name }
    })

    // revalidateTag removed
    return NextResponse.json(portfolio, { status: 201 })
  } catch (error) {
    console.error('[PORTFOLIO_POST]', error)
    return NextResponse.json({ error: 'Failed to create portfolio' }, { status: 500 })
  }
}