export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';


import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// DELETE - Delete a journal entry by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if entry exists
    const existingEntry = await db.tradingJournal.findUnique({
      where: { id },
    })

    if (!existingEntry) {
      return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 })
    }

    // Delete the entry
    await db.tradingJournal.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Journal entry deleted successfully' })
  } catch (error) {
    console.error('Error deleting journal entry:', error)
    return NextResponse.json({ error: 'Failed to delete journal entry' }, { status: 500 })
  }
}

// GET - Fetch a single journal entry by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const entry = await db.tradingJournal.findUnique({
      where: { id },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 })
    }

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error fetching journal entry:', error)
    return NextResponse.json({ error: 'Failed to fetch journal entry' }, { status: 500 })
  }
}

// PUT - Update a journal entry by ID
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Check if entry exists
    const existingEntry = await db.tradingJournal.findUnique({
      where: { id },
    })

    if (!existingEntry) {
      return NextResponse.json({ error: 'Journal entry not found' }, { status: 404 })
    }

    const updatedEntry = await db.tradingJournal.update({
      where: { id },
      data: {
        type: body.type,
        title: body.title,
        date: body.date ? new Date(body.date) : undefined,
        
        // Pre-market - Market Analysis
        marketAnalysis: body.marketAnalysis,
        keyLevels: body.keyLevels,
        supportLevels: body.supportLevels,
        resistanceLevels: body.resistanceLevels,
        trendDirection: body.trendDirection,
        expectedVolatility: body.expectedVolatility,
        economicEvents: body.economicEvents,
        
        // Pre-market - Trading Plan
        tradingPlan: body.tradingPlan,
        strategiesToUse: body.strategiesToUse,
        riskPlan: body.riskPlan,
        dailyGoal: body.dailyGoal,
        maxTrades: body.maxTrades ? parseInt(body.maxTrades) : undefined,
        
        // Market-in - Session Info
        sessionType: body.sessionType,
        sessionStart: body.sessionStart,
        sessionEnd: body.sessionEnd,
        tradesPlanned: body.tradesPlanned ? parseInt(body.tradesPlanned) : undefined,
        tradesExecuted: body.tradesExecuted ? parseInt(body.tradesExecuted) : undefined,
        
        // Market-in - Execution
        entrySetups: body.entrySetups,
        priceActionObs: body.priceActionObs,
        executionNotes: body.executionNotes,
        marketBehavior: body.marketBehavior,
        realTimeObservations: body.realTimeObservations,
        
        // Market-post - Results
        totalTrades: body.totalTrades ? parseInt(body.totalTrades) : undefined,
        winningTrades: body.winningTrades ? parseInt(body.winningTrades) : undefined,
        losingTrades: body.losingTrades ? parseInt(body.losingTrades) : undefined,
        totalProfitLoss: body.totalProfitLoss ? parseFloat(body.totalProfitLoss) : undefined,
        sessionResult: body.sessionResult,
        
        // Market-post - Ratings
        executionQuality: body.executionQuality ? parseInt(body.executionQuality) : undefined,
        planAdherence: body.planAdherence ? parseInt(body.planAdherence) : undefined,
        riskAdherence: body.riskAdherence ? parseInt(body.riskAdherence) : undefined,
        
        // Market-post - Emotions
        emotionsBefore: body.emotionsBefore,
        emotionsDuring: body.emotionsDuring,
        emotionsAfter: body.emotionsAfter,
        
        // Market-post - Review
        whatWentWell: body.whatWentWell,
        whatNeedsImprovement: body.whatNeedsImprovement,
        lessonsLearned: body.lessonsLearned,
        tomorrowPlan: body.tomorrowPlan,
        
        // Legacy fields
        sentiment: body.sentiment,
        notes: body.notes,
        plannedTrades: body.plannedTrades,
        actualTrades: body.actualTrades,
        lessons: body.lessons,
        mistakes: body.mistakes,
        improvements: body.improvements,
        mood: body.mood,
        energy: body.energy,
        focus: body.focus,
        confidence: body.confidence,
      },
    })

    return NextResponse.json(updatedEntry)
  } catch (error) {
    console.error('Error updating journal entry:', error)
    return NextResponse.json({ error: 'Failed to update journal entry' }, { status: 500 })
  }
}
