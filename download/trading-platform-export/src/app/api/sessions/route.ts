import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/sessions - Get all session reviews for user
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user'
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const session = searchParams.get('session')
    
    const where: any = { userId }
    if (session) where.session = session
    
    const sessions = await db.sessionReview.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit
    })
    
    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('Get sessions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/sessions - Create new session review
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user'
    const data = await request.json()
    
    const session = await db.sessionReview.create({
      data: {
        userId,
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
    
    return NextResponse.json({ session }, { status: 201 })
  } catch (error) {
    console.error('Create session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/sessions - Update session review
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    
    const session = await db.sessionReview.update({
      where: { id: data.id },
      data: {
        tradesTaken: parseInt(data.tradesTaken),
        tradesWon: parseInt(data.tradesWon),
        tradesLost: parseInt(data.tradesLost),
        profitLoss: parseFloat(data.profitLoss),
        emotions: data.emotions,
        mistakes: data.mistakes,
        improvements: data.improvements,
        notes: data.notes,
        rating: data.rating ? parseInt(data.rating) : null
      }
    })
    
    return NextResponse.json({ session })
  } catch (error) {
    console.error('Update session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/sessions
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }
    
    await db.sessionReview.delete({ where: { id } })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete session error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
