import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch risk alerts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const riskProfileId = searchParams.get('riskProfileId')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const where: Record<string, unknown> = {}
    if (riskProfileId) {
      where.riskProfileId = riskProfileId
    }
    if (unreadOnly) {
      where.isRead = false
    }

    const alerts = await db.riskAlert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching risk alerts:', error)
    return NextResponse.json({ error: 'Failed to fetch risk alerts' }, { status: 500 })
  }
}

// PUT - Mark alert as read
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { alertId, isRead, isResolved } = body

    const alert = await db.riskAlert.update({
      where: { id: alertId },
      data: {
        isRead: isRead ?? true,
        isResolved: isResolved ?? false,
        resolvedAt: isResolved ? new Date() : null,
      },
    })

    return NextResponse.json(alert)
  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 })
  }
}

// DELETE - Delete alert
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const alertId = searchParams.get('alertId')

    if (!alertId) {
      return NextResponse.json({ error: 'alertId is required' }, { status: 400 })
    }

    await db.riskAlert.delete({
      where: { id: alertId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting alert:', error)
    return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 })
  }
}
