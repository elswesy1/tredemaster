import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-middleware'
import { logAudit, AuditAction } from '@/lib/audit'


// GET - Fetch a single psychology log
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
    const log = await db.psychologyLog.findFirst({
      where: { 
        id, 
        userId: user.userId,
      },
    })

    if (!log) {
      return NextResponse.json({ error: 'Psychology log not found' }, { status: 404 })
    }

    // Ownership verification
    if (log.userId !== user.userId) {
      return NextResponse.json({ error: 'غير مصرح', message: 'لا يمكنك الوصول لهذا السجل' }, { status: 403 })
    }

    return NextResponse.json(log)
  } catch (error) {
    console.error('[PSYCHOLOGY_GET_BY_ID]', error)
    return NextResponse.json({ error: 'Failed to fetch psychology log' }, { status: 500 })
  }
}

// PUT - Update a psychology log
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
    
    // Verify ownership first
    const existingLog = await db.psychologyLog.findUnique({
      where: { id },
      select: { userId: true }
    })
    
    if (!existingLog) {
      return NextResponse.json({ error: 'Psychology log not found' }, { status: 404 })
    }
    
    if (existingLog.userId !== user.userId) {
      return NextResponse.json({ error: 'غير مصرح', message: 'لا يمكنك تعديل هذا السجل' }, { status: 403 })
    }

    const body = await request.json()
    const {
      type,
      tradeId,
      emotion,
      emotionIntensity,
      trigger,
      reaction,
      outcome,
      copingStrategy,
      lessons,
      recommendations,
      stress,
      discipline,
      patience,
      confidence,
      notes,
    } = body


    const log = await db.psychologyLog.update({
      where: { id },
      data: {
        type,
        tradeId,
        emotion,
        emotionIntensity,
        trigger,
        reaction,
        outcome,
        copingStrategy,
        lessons,
        recommendations,
        stress,
        discipline,
        patience,
        confidence,
        notes,
      },
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.PSYCHOLOGY_ENTRY_CREATED, // Using created for update as well if specific update action missing
      details: { logId: id, action: 'update' }
    })

    return NextResponse.json(log)
  } catch (error) {
    console.error('[PSYCHOLOGY_PUT]', error)
    return NextResponse.json({ error: 'Failed to update psychology log' }, { status: 500 })
  }
}

// DELETE - Delete a psychology log
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

    // Verify ownership first
    const existingLog = await db.psychologyLog.findUnique({
      where: { id },
      select: { userId: true }
    })
    
    if (!existingLog) {
      return NextResponse.json({ error: 'Psychology log not found' }, { status: 404 })
    }
    
    if (existingLog.userId !== user.userId) {
      return NextResponse.json({ error: 'غير مصرح', message: 'لا يمكنك حذف هذا السجل' }, { status: 403 })
    }

    await db.psychologyLog.update({

      where: { id },
      data: { deletedAt: new Date() }
    })

    // تسجيل في سجل التدقيق
    await logAudit(request, {
      userId: user.userId,
      action: AuditAction.PSYCHOLOGY_ENTRY_CREATED, // Or specific delete action
      details: { logId: id, action: 'soft-delete' }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PSYCHOLOGY_DELETE]', error)
    return NextResponse.json({ error: 'Failed to delete psychology log' }, { status: 500 })
  }
}
