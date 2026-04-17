export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';


import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all audits
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (type) where.type = type
    if (status) where.status = status

    const audits = await db.audit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(audits)
  } catch (error) {
    console.error('Error fetching audits:', error)
    return NextResponse.json({ error: 'Failed to fetch audits' }, { status: 500 })
  }
}

// POST - Create a new audit
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      type,
      title,
      description,
      period,
      startDate,
      endDate,
      findings,
      recommendations,
      improvements,
      userId,
    } = body

    const audit = await db.audit.create({
      data: {
        type,
        title,
        description,
        period,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        findings,
        recommendations,
        improvements,
        status: 'pending',
        userId: userId || 'default-user',
      },
    })
    return NextResponse.json(audit, { status: 201 })
    revalidateTag('audits')
  } catch (error) {
    console.error('Error creating audit:', error)
    return NextResponse.json({ error: 'Failed to create audit' }, { status: 500 })
  }
}
