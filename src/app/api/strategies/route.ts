import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'

// GET - Fetch strategies for authenticated user
export async function GET(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصارح - يجب تسجيل الدخول' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    // فلترة حسب المستخدم
    const where: Record<string, unknown> = { userId: user.userId }
    if (category) where.category = category

    const strategies = await db.strategy.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(strategies)
  } catch (error) {
    console.error('Error fetching strategies:', error)
    return NextResponse.json({ error: 'Failed to fetch strategies' }, { status: 500 })
  }
}

// POST - Create a new strategy for authenticated user
export async function POST(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصارح - يجب تسجيل الدخول' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      category,
      timeframe,
      entryRules,
      exitRules,
      riskRules,
    } = body

    if (!name) {
      return NextResponse.json({ error: 'Strategy name is required' }, { status: 400 })
    }

    const strategy = await db.strategy.create({
      data: {
        name,
        description,
        category: category || 'technical',
        timeframe,
        entryRules,
        exitRules,
        riskRules,
        userId: user.userId, // ربط بالمستخدم الحالي
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        profitLoss: 0,
      },
    })
    return NextResponse.json(strategy, { status: 201 })
  } catch (error) {
    console.error('Error creating strategy:', error)
    return NextResponse.json({ error: 'Failed to create strategy' }, { status: 500 })
  }
}

// PUT - Update a strategy (only if owned by user)
export async function PUT(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصارح - يجب تسجيل الدخول' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Strategy ID is required' }, { status: 400 })
    }

    // التحقق من الملكية
    const existingStrategy = await db.strategy.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!existingStrategy) {
      return NextResponse.json({ error: 'الاستراتيجية غير موجودة' }, { status: 404 })
    }

    if (existingStrategy.userId !== user.userId) {
      return NextResponse.json(
        { error: 'غير مصارح - لا يمكنك تعديل هذه الاستراتيجية' },
        { status: 403 }
      )
    }

    const strategy = await db.strategy.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json(strategy)
  } catch (error) {
    console.error('Error updating strategy:', error)
    return NextResponse.json({ error: 'Failed to update strategy' }, { status: 500 })
  }
}

// DELETE - Delete a strategy (only if owned by user)
export async function DELETE(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصارح - يجب تسجيل الدخول' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Strategy ID is required' }, { status: 400 })
    }

    // التحقق من الملكية
    const existingStrategy = await db.strategy.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!existingStrategy) {
      return NextResponse.json({ error: 'الاستراتيجية غير موجودة' }, { status: 404 })
    }

    if (existingStrategy.userId !== user.userId) {
      return NextResponse.json(
        { error: 'غير مصارح - لا يمكنك حذف هذه الاستراتيجية' },
        { status: 403 }
      )
    }

    await db.strategy.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting strategy:', error)
    return NextResponse.json({ error: 'Failed to delete strategy' }, { status: 500 })
  }
}
