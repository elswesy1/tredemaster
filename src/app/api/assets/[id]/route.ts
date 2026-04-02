import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch a single asset by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const asset = await db.asset.findUnique({
      where: { id },
      include: {
        portfolio: true,
      },
    })

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    return NextResponse.json(asset)
  } catch (error) {
    console.error('Error fetching asset:', error)
    return NextResponse.json({ error: 'Failed to fetch asset' }, { status: 500 })
  }
}

// PUT - Update an asset by ID
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Get existing asset
    const existingAsset = await db.asset.findUnique({ where: { id } })
    if (!existingAsset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: Record<string, unknown> = { ...body }
    
    // Recalculate values if price/quantity changed
    if (body.quantity !== undefined || body.entryPrice !== undefined || body.currentPrice !== undefined) {
      const quantityNum = parseFloat(body.quantity) ?? existingAsset.quantity
      const entryPriceNum = parseFloat(body.entryPrice) ?? existingAsset.entryPrice
      const currentPriceNum = parseFloat(body.currentPrice) ?? existingAsset.currentPrice
      
      updateData.currentValue = quantityNum * currentPriceNum
      updateData.profitLoss = updateData.currentValue - (quantityNum * entryPriceNum)
      updateData.profitLossPercent = (quantityNum * entryPriceNum) > 0 
        ? ((updateData.profitLoss as number) / (quantityNum * entryPriceNum)) * 100 
        : 0
    }

    // Handle status sync updates
    if (body.status === 'syncing') {
      updateData.lastSync = new Date()
    }

    const asset = await db.asset.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    })

    // Update portfolio totals if linked
    if (asset.portfolioId) {
      await updatePortfolioTotals(asset.portfolioId)
    }

    return NextResponse.json(asset)
  } catch (error) {
    console.error('Error updating asset:', error)
    return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 })
  }
}

// DELETE - Delete an asset by ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get asset before deletion to update portfolio
    const asset = await db.asset.findUnique({ where: { id } })
    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    const portfolioId = asset.portfolioId

    await db.asset.delete({ where: { id } })

    // Update portfolio totals
    if (portfolioId) {
      await updatePortfolioTotals(portfolioId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting asset:', error)
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 })
  }
}

// Helper function to update portfolio totals
async function updatePortfolioTotals(portfolioId: string) {
  try {
    const assets = await db.asset.findMany({
      where: { portfolioId, isActive: true },
    })

    const totalValue = assets.reduce((sum, a) => sum + a.currentValue, 0)
    const totalProfitLoss = assets.reduce((sum, a) => sum + a.profitLoss, 0)
    const investedAmount = assets.reduce((sum, a) => sum + (a.quantity * a.entryPrice), 0)
    const profitLossPercent = investedAmount > 0 ? (totalProfitLoss / investedAmount) * 100 : 0

    await db.portfolio.update({
      where: { id: portfolioId },
      data: {
        totalValue,
        profitLoss: totalProfitLoss,
        profitLossPercent,
        investedAmount,
        updatedAt: new Date(),
      },
    })
  } catch (error) {
    console.error('Error updating portfolio totals:', error)
  }
}
