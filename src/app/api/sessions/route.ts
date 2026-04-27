export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';


import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'
import { logAudit, AuditAction } from '@/lib/audit'

// GET /api/sessions - Get all session reviews for user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const sessionType = searchParams.get('session')
    
    const where: any = { 
      userId: user.userId,
      deletedAt: null 
    }
    if (sessionType) where.session = sessionType
    
    const sessions = await db.sessionReview.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit
    })
    
    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('[SESSIONS_GET]', error)
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}

// POST /api/sessions - Create new session review
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول' }, { status: 401 })
    }

    const data = await request.json()
    
    const session = await db.sessionReview.create({
      data: {
        userId: user.userId,
        session: data.session || 'london',
        marketOpen: data.marketOpen ?? true,
        marketCondition: data.marketCondition,
        volatility: data.volatility,
        volume: data.volume,
        tradesPlanned: parseInt(data.tradesPlanned) || 0,
        tradesTaken: parseInt(data.tradesTaken) || 0,
        tradesWon: parseInt(data.tradesWon) || 0,
        tradesLost: parseInt(data.tradesLost) || 0,
        profitLoss: parseFloat(data.profitLoss) || 0,
        rulesFollowed: data.rulesFollowed,
        emotions: data.emotions,
        mistakes: data.mistakes,
        improvements: data.improvements,
        notes: data.notes,
        rating: data.rating ? parseInt(data.rating) : null
      }
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.JOURNAL_ENTRY_CREATED, // Session review is part of journaling
      details: { sessionId: session.id, sessionName: session.session }
    })
    
    revalidateTag('sessions', 'max')
    return NextResponse.json({ session }, { status: 201 })
  } catch (error) {
    console.error('[SESSIONS_POST]', error)
    return NextResponse.json({ error: 'Failed to create session review' }, { status: 500 })
  }
}

// PUT /api/sessions - Update session review
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول' }, { status: 401 })
    }

    const data = await request.json()

    // Check ownership
    const existing = await db.sessionReview.findFirst({
      where: { id: data.id, userId: user.userId, deletedAt: null }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Session review not found' }, { status: 404 })
    }
    
    const session = await db.sessionReview.update({
      where: { id: data.id },
      data: {
        tradesTaken: data.tradesTaken !== undefined ? parseInt(data.tradesTaken) : undefined,
        tradesWon: data.tradesWon !== undefined ? parseInt(data.tradesWon) : undefined,
        tradesLost: data.tradesLost !== undefined ? parseInt(data.tradesLost) : undefined,
        profitLoss: data.profitLoss !== undefined ? parseFloat(data.profitLoss) : undefined,
        emotions: data.emotions,
        mistakes: data.mistakes,
        improvements: data.improvements,
        notes: data.notes,
        rating: data.rating ? parseInt(data.rating) : null
      }
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.JOURNAL_ENTRY_UPDATED,
      details: { sessionId: data.id }
    })
    
    return NextResponse.json({ session })
  } catch (error) {
    console.error('[SESSIONS_PUT]', error)
    return NextResponse.json({ error: 'Failed to update session review' }, { status: 500 })
  }
}

// DELETE /api/sessions
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Check ownership
    const existing = await db.sessionReview.findFirst({
      where: { id, userId: user.userId, deletedAt: null }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Session review not found' }, { status: 404 })
    }
    
    await db.sessionReview.update({ 
      where: { id },
      data: { deletedAt: new Date() }
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.JOURNAL_ENTRY_UPDATED, // Or special delete action
      details: { sessionId: id, action: 'soft-delete' }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[SESSIONS_DELETE]', error)
    return NextResponse.json({ error: 'Failed to delete session review' }, { status: 500 })
  }
}