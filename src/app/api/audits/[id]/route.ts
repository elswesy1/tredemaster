import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'
import { logAudit, AuditAction } from '@/lib/audit'
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// GET - Fetch a single audit by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول' }, { status: 401 })
    }

    const { id } = await params
    const audit = await db.audit.findFirst({
      where: { 
        id, 
        userId: user.userId,
        deletedAt: null 
      },
    })
    
    if (!audit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
    }
    
    return NextResponse.json(audit)
  } catch (error) {
    console.error('[AUDIT_GET_BY_ID]', error)
    return NextResponse.json({ error: 'Failed to fetch audit' }, { status: 500 })
  }
}

// PUT - Update an audit
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول' }, { status: 401 })
    }

    const { id } = await params
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
      status,
      score,
    } = body

    // Check if audit exists and belongs to user
    const existingAudit = await db.audit.findFirst({
      where: { id, userId: user.userId, deletedAt: null },
    })

    if (!existingAudit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (type !== undefined) updateData.type = type
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (period !== undefined) updateData.period = period
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null
    if (findings !== undefined) updateData.findings = findings
    if (recommendations !== undefined) updateData.recommendations = recommendations
    if (improvements !== undefined) updateData.improvements = improvements
    if (status !== undefined) {
      updateData.status = status
      if (status === 'completed') {
        updateData.completedAt = new Date()
      }
    }
    if (score !== undefined) updateData.score = score

    const audit = await db.audit.update({
      where: { id },
      data: updateData,
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.SETTINGS_UPDATED,
      details: { auditId: id, action: 'update' }
    })
    
    return NextResponse.json(audit)
  } catch (error) {
    console.error('[AUDIT_PUT]', error)
    return NextResponse.json({ error: 'Failed to update audit' }, { status: 500 })
  }
}

// DELETE - Delete an audit
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح - يجب تسجيل الدخول' }, { status: 401 })
    }

    const { id } = await params

    // Check if audit exists and belongs to user
    const existingAudit = await db.audit.findFirst({
      where: { id, userId: user.userId, deletedAt: null },
    })

    if (!existingAudit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
    }

    await db.audit.update({
      where: { id },
      data: { deletedAt: new Date() }
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.SETTINGS_UPDATED,
      details: { auditId: id, action: 'soft-delete' }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[AUDIT_DELETE]', error)
    return NextResponse.json({ error: 'Failed to delete audit' }, { status: 500 })
  }
}
