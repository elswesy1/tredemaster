import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/accounts - Get all accounts for user
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user'
    
    const accounts = await db.account.findMany({
      where: { userId },
      include: {
        portfolio: {
          select: { name: true }
        },
        _count: {
          select: { trades: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ accounts })
  } catch (error) {
    console.error('Get accounts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/accounts - Create new account
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user'
    const data = await request.json()
    
    const account = await db.account.create({
      data: {
        userId,
        name: data.name,
        broker: data.broker,
        accountNumber: data.accountNumber,
        type: data.type || 'demo',
        currency: data.currency || 'USD',
        balance: parseFloat(data.balance) || 0,
        equity: parseFloat(data.equity) || 0,
        leverage: parseFloat(data.leverage) || 100,
        portfolioId: data.portfolioId || null
      }
    })
    
    return NextResponse.json({ account }, { status: 201 })
  } catch (error) {
    console.error('Create account error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/accounts - Update account
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    
    const account = await db.account.update({
      where: { id: data.id },
      data: {
        name: data.name,
        broker: data.broker,
        accountNumber: data.accountNumber,
        balance: parseFloat(data.balance) || 0,
        equity: parseFloat(data.equity) || 0,
        margin: parseFloat(data.margin) || 0,
        freeMargin: parseFloat(data.freeMargin) || 0,
        lastSync: new Date()
      }
    })
    
    return NextResponse.json({ account })
  } catch (error) {
    console.error('Update account error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/accounts
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Account ID required' }, { status: 400 })
    }
    
    await db.account.delete({ where: { id } })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
