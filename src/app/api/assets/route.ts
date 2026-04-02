import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch all assets for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'default-user'
    const portfolioId = searchParams.get('portfolioId')
    const assetType = searchParams.get('assetType')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = { userId }
    
    if (portfolioId) {
      where.portfolioId = portfolioId
    }
    if (assetType) {
      where.assetType = assetType
    }
    if (status) {
      where.status = status
    }

    const assets = await db.asset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json(assets)
  } catch (error) {
    console.error('Error fetching assets:', error)
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 })
  }
}

// POST - Create a new asset
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      userId,
      portfolioId,
      name,
      assetType,
      symbol,
      quantity,
      entryPrice,
      currentPrice,
      currency,
      connectionMethod,
      platform,
      broker,
      server,
      accountNumber,
      apiKey,
      apiSecret,
      status,
      autoSync,
      notes,
    } = body

    // Calculate current value and profit/loss
    const quantityNum = parseFloat(quantity) || 0
    const entryPriceNum = parseFloat(entryPrice) || 0
    const currentPriceNum = parseFloat(currentPrice) || 0
    
    const currentValue = quantityNum * currentPriceNum
    const investedValue = quantityNum * entryPriceNum
    const profitLoss = currentValue - investedValue
    const profitLossPercent = investedValue > 0 ? (profitLoss / investedValue) * 100 : 0

    const asset = await db.asset.create({
      data: {
        userId: userId || 'default-user',
        portfolioId: portfolioId || null,
        name,
        assetType: assetType || 'forex',
        symbol: symbol || null,
        quantity: quantityNum,
        entryPrice: entryPriceNum,
        currentPrice: currentPriceNum,
        currency: currency || 'USD',
        connectionMethod: connectionMethod || 'manual',
        platform: platform || null,
        broker: broker || null,
        server: server || null,
        accountNumber: accountNumber || null,
        apiKey: apiKey || null,
        apiSecret: apiSecret || null,
        status: status || (connectionMethod === 'manual' ? 'active' : 'connected'),
        autoSync: autoSync || false,
        currentValue,
        profitLoss,
        profitLossPercent,
        notes: notes || null,
      },
    })

    // Update portfolio total value if linked
    if (portfolioId) {
      await updatePortfolioTotals(portfolioId)
    }

    return NextResponse.json(asset, { status: 201 })
  } catch (error) {
    console.error('Error creating asset:', error)
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 })
  }
}

// PUT - Update an asset
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 })
    }

    // Recalculate values if price/quantity changed
    if (updateData.quantity !== undefined || updateData.entryPrice !== undefined || updateData.currentPrice !== undefined) {
      const existingAsset = await db.asset.findUnique({ where: { id } })
      if (existingAsset) {
        const quantityNum = parseFloat(updateData.quantity) || existingAsset.quantity
        const entryPriceNum = parseFloat(updateData.entryPrice) || existingAsset.entryPrice
        const currentPriceNum = parseFloat(updateData.currentPrice) || existingAsset.currentPrice
        
        updateData.currentValue = quantityNum * currentPriceNum
        updateData.profitLoss = updateData.currentValue - (quantityNum * entryPriceNum)
        updateData.profitLossPercent = (quantityNum * entryPriceNum) > 0 
          ? (updateData.profitLoss / (quantityNum * entryPriceNum)) * 100 
          : 0
      }
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

// DELETE - Delete an asset
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 })
    }

    // Get asset before deletion to update portfolio
    const asset = await db.asset.findUnique({ where: { id } })
    const portfolioId = asset?.portfolioId

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
