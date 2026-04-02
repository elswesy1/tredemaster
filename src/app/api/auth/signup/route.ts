import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// POST /api/auth/signup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'trader',
        isActive: true,
      }
    })

    // Create free subscription
    await db.subscription.create({
      data: {
        userId: user.id,
        plan: 'free',
        status: 'active',
      }
    })

    // Create usage records
    const subscription = await db.subscription.findUnique({
      where: { userId: user.id }
    })

    if (subscription) {
      await db.usage.createMany({
        data: [
          { subscriptionId: subscription.id, userId: user.id, type: 'trades', count: 0, limit: 10 },
          { subscriptionId: subscription.id, userId: user.id, type: 'sessions', count: 0, limit: 0 },
          { subscriptionId: subscription.id, userId: user.id, type: 'ai_chats', count: 0, limit: 0 },
          { subscriptionId: subscription.id, userId: user.id, type: 'exports', count: 0, limit: 0 },
        ]
      })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
