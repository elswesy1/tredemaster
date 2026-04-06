import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'

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
      where: { userId: user.userId },
      include: {
        tradingAccounts: true,
        trades: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(portfolios)
  } catch (error) {
    console.error('Error fetching portfolios:', error)
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
    return NextResponse.json(portfolio, { status: 201 })
  } catch (error) {
    console.error('Error creating portfolio:', error)
    return NextResponse.json({ error: 'Failed to create portfolio' }, { status: 500 })
  }
}
