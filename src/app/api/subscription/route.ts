import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// GET /api/subscription - Get user subscription
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const subscription = await db.subscription.findUnique({
      where: { userId },
      include: {
        usage: true
      }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Get subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/subscription - Update subscription plan
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, plan } = body

    if (!userId || !plan) {
      return NextResponse.json(
        { error: 'User ID and plan are required' },
        { status: 400 }
      )
    }

    // Update subscription
    const subscription = await db.subscription.update({
      where: { userId },
      data: { plan }
    })

    // Update usage limits based on plan
    const limits = plan === 'pro' 
      ? { trades: null, sessions: null, ai_chats: null, exports: null } // Unlimited
      : { trades: 10, sessions: 0, ai_chats: 0, exports: 0 } // Free limits

    // Update or create usage records
    const existingUsage = await db.usage.findMany({
      where: { userId }
    })

    for (const usage of existingUsage) {
      await db.usage.update({
        where: { id: usage.id },
        data: { 
          limit: limits[usage.type as keyof typeof limits] || null 
        }
      })
    }

    return NextResponse.json({
      success: true,
      subscription
    })
  } catch (error) {
    console.error('Update subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}