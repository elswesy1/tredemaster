import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch a single audit by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const audit = await db.audit.findUnique({
      where: { id },
    })
    
    if (!audit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
    }
    
    return NextResponse.json(audit)
  } catch (error) {
    console.error('Error fetching audit:', error)
    return NextResponse.json({ error: 'Failed to fetch audit' }, { status: 500 })
  }
}

// PUT - Update an audit
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    
    return NextResponse.json(audit)
  } catch (error) {
    console.error('Error updating audit:', error)
    return NextResponse.json({ error: 'Failed to update audit' }, { status: 500 })
  }
}

// DELETE - Delete an audit
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.audit.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting audit:', error)
    return NextResponse.json({ error: 'Failed to delete audit' }, { status: 500 })
  }
}
