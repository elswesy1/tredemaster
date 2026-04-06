import { NextRequest } from 'next/server'

// Mock all dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    tradingAccount: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    trade: { create: jest.fn(), findMany: jest.fn() },
  },
}))

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { GET, POST } from '@/app/api/trading-accounts/route'

describe('Trading Workflow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should complete full account creation workflow', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' }
    
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' },
    })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
    ;(prisma.tradingAccount.create as jest.Mock).mockResolvedValue({
      id: 'account-1',
      name: 'Test Account',
      accountType: 'broker',
      userId: 'user-1',
      balance: 10000,
      equity: 10000,
      status: 'active',
    })

    // Create account
    const createRequest = new NextRequest('http://localhost/api/trading-accounts', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Account',
        accountType: 'broker',
        balance: 10000,
      }),
    })

    const createResponse = await POST(createRequest)
    expect(createResponse.status).toBe(201)

    // Verify account exists
    ;(prisma.tradingAccount.findMany as jest.Mock).mockResolvedValue([
      { id: 'account-1', name: 'Test Account', accountType: 'broker' },
    ])

    const listRequest = new NextRequest('http://localhost/api/trading-accounts')
    const listResponse = await GET(listRequest)
    const accounts = await listResponse.json()

    expect(listResponse.status).toBe(200)
    expect(accounts).toHaveLength(1)
  })

  it('should handle PropFirm account with phases', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' }
    
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' },
    })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
    ;(prisma.tradingAccount.create as jest.Mock).mockResolvedValue({
      id: 'prop-1',
      name: 'FTMO Challenge',
      accountType: 'propfirm',
      propFirmCompany: 'FTMO',
      propFirmPhase: 'Phase 1',
      challengeTarget: 10,
      dailyDrawdownLimit: 5,
      maxDailyLoss: 1000,
      userId: 'user-1',
      status: 'active',
    })

    const request = new NextRequest('http://localhost/api/trading-accounts', {
      method: 'POST',
      body: JSON.stringify({
        name: 'FTMO Challenge',
        accountType: 'propfirm',
        propFirmCompany: 'FTMO',
        propFirmPhase: 'Phase 1',
        challengeTarget: 10,
        dailyDrawdownLimit: 5,
        maxDailyLoss: 1000,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.accountType).toBe('propfirm')
    expect(data.propFirmPhase).toBe('Phase 1')
  })
})