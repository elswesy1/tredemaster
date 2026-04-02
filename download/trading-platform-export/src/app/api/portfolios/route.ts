import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all portfolios
export async function GET() {
  try {
    const portfolios = await db.portfolio.findMany({
      include: {
        accounts: true,
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

// POST - Create a new portfolio
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, currency, userId } = body

    const portfolio = await db.portfolio.create({
      data: {
        name,
        description,
        currency: currency || 'USD',
        userId: userId || 'default-user',
      },
    })
    return NextResponse.json(portfolio, { status: 201 })
  } catch (error) {
    console.error('Error creating portfolio:', error)
    return NextResponse.json({ error: 'Failed to create portfolio' }, { status: 500 })
  }
}
