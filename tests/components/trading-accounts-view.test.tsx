import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TradingAccountsView } from '@/components/trading/trading-accounts-view'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: jest.fn(),
  })),
}))

// Mock useI18n hook
jest.mock('@/lib/i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: 'ar',
  }),
}))

// Mock useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

describe('TradingAccountsView Component', () => {
  it('should render empty state when no accounts', () => {
    render(<TradingAccountsView />)
    
    expect(screen.getByText(/لا توجد حسابات بعد/i)).toBeInTheDocument()
  })

  it('should render account types tabs', () => {
    render(<TradingAccountsView />)
    
    expect(screen.getByText(/وكلاء/i)).toBeInTheDocument()
    expect(screen.getByText(/شركات/i)).toBeInTheDocument()
    expect(screen.getByText(/مؤشرات/i)).toBeInTheDocument()
    expect(screen.getByText(/أسهم/i)).toBeInTheDocument()
  })

  it('should open add account dialog when button clicked', async () => {
    render(<TradingAccountsView />)
    
    const addButton = screen.getByRole('button', { name: /إضافة حساب/i })
    fireEvent.click(addButton)
    
    await waitFor(() => {
      expect(screen.getByText(/إضافة حساب تداول جديد/i)).toBeInTheDocument()
    })
  })
})