import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/accounts/[id] - Get a single account
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const account = await db.account.findUnique({
      where: { id },
      include: {
        portfolio: {
          select: { name: true }
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
    console.error('Get account error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/accounts/[id] - Update an account
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    const account = await db.account.update({
      where: { id },
      data: {
        name: data.name,
        broker: data.broker,
        accountNumber: data.accountNumber,
        type: data.type,
        balance: data.balance !== undefined ? parseFloat(data.balance) : undefined,
        equity: data.equity !== undefined ? parseFloat(data.equity) : undefined,
        margin: data.margin !== undefined ? parseFloat(data.margin) : undefined,
        freeMargin: data.freeMargin !== undefined ? parseFloat(data.freeMargin) : undefined,
        marginLevel: data.marginLevel !== undefined ? parseFloat(data.marginLevel) : undefined,
        leverage: data.leverage !== undefined ? parseFloat(data.leverage) : undefined,
        lastSync: new Date()
      }
    })
    
    return NextResponse.json(account)
  } catch (error) {
    console.error('Update account error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/accounts/[id] - Delete an account
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await db.account.delete({ where: { id } })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
