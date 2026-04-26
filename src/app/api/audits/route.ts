import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'
import { logAudit, AuditAction } from '@/lib/audit'
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// GET - Fetch all audits for authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = { 
      userId: user.userId,
      deletedAt: null 
    }
    if (type) where.type = type
    if (status) where.status = status

    const audits = await db.audit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(audits)
  } catch (error) {
    console.error('[AUDITS_GET]', error)
    return NextResponse.json({ error: 'Failed to fetch audits' }, { status: 500 })
  }
}

// POST - Create a new audit for authenticated user
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول' }, { status: 401 })
    }

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
        userId: user.userId,
      },
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.SETTINGS_UPDATED, // Using generic until specific audit action added
      details: { auditId: audit.id, title: audit.title }
    })

    return NextResponse.json(audit, { status: 201 })
    revalidateTag('audits')
  } catch (error) {
    console.error('[AUDITS_POST]', error)
    return NextResponse.json({ error: 'Failed to create audit' }, { status: 500 })
  }
}