import { NextRequest } from 'next/server'

// Mock dependencies BEFORE importing
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    tradingAccount: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}))

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

// Import AFTER mocking
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { GET, POST } from '@/app/api/trading-accounts/route'

describe('GET /api/trading-accounts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if user is not authenticated', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/trading-accounts')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('should return accounts list for authenticated user', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
    }

    const mockAccounts = [
      {
        id: 'account-1',
        name: 'DAX Account',
        accountType: 'indices',
        balance: 10000,
        equity: 10500,
        userId: 'user-1',
        createdAt: new Date(),
      },
    ]

    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' },
    })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
    ;(prisma.tradingAccount.findMany as jest.Mock).mockResolvedValue(mockAccounts)

    const request = new NextRequest('http://localhost/api/trading-accounts')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
  })
})

describe('POST /api/trading-accounts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a new account successfully', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
    }

    const newAccount = {
      id: 'account-new',
      userId: 'user-1',
      name: 'New Account',
      accountType: 'broker',
      broker: 'IC Markets',
      platform: 'MT5',
      balance: 5000,
      equity: 5000,
      currency: 'USD',
      leverage: 100,
      status: 'active',
      createdAt: new Date(),
    }

    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' },
    })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
    ;(prisma.tradingAccount.create as jest.Mock).mockResolvedValue(newAccount)

    const request = new NextRequest('http://localhost/api/trading-accounts', {
      method: 'POST',
      body: JSON.stringify({
        name: 'New Account',
        accountType: 'broker',
        broker: 'IC Markets',
        platform: 'MT5',
        balance: 5000,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.name).toBe('New Account')
  })

  it('should return 400 if name is missing', async () => {
    ;(getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'test@example.com' },
    })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1' })

    const request = new NextRequest('http://localhost/api/trading-accounts', {
      method: 'POST',
      body: JSON.stringify({
        accountType: 'broker',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Name and account type are required')
  })
})