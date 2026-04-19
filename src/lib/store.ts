import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export interface Portfolio {
  id: string
  name: string
  description?: string
  totalValue: number
  cashBalance: number
  investedAmount: number
  profitLoss: number
  profitLossPercent: number
  currency: string
}

export interface Trade {
  id: string
  symbol: string
  type: 'buy' | 'sell'
  status: 'open' | 'closed' | 'cancelled'
  entryPrice: number
  exitPrice?: number
  quantity: number
  stopLoss?: number
  takeProfit?: number
  profitLoss: number
  openedAt: string
  closedAt?: string
}

export interface RiskProfile {
  id: string
  name: string
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  riskDegree: number
  maxDailyLoss: number
  maxWeeklyLoss: number
  maxMonthlyLoss: number
  maxDrawdown: number
  maxPositionSize: number
  maxRiskPerTrade: number
}

export interface JournalEntry {
  id: string
  date: string
  type: 'pre-market' | 'market-in' | 'daily' | 'weekly'
  title?: string
  marketCondition?: string
  sentiment?: 'bullish' | 'bearish' | 'neutral'
  mood?: number
  energy?: number
  focus?: number
  notes?: string
}

export interface SessionReview {
  id: string
  date: string
  session: 'london' | 'new_york' | 'tokyo' | 'asian'
  tradesPlanned: number
  tradesTaken: number
  tradesWon: number
  tradesLost: number
  profitLoss: number
  rating?: number
}

export interface PsychologyLog {
  id: string
  date: string
  type: 'check-in' | 'post-trade' | 'end-day'
  emotion?: string
  emotionIntensity?: number
  stress?: number
  discipline?: number
  patience?: number
  confidence?: number
}

export interface Audit {
  id: string
  type: 'portfolio' | 'trading' | 'risk' | 'behaviour'
  title: string
  status: 'pending' | 'in-progress' | 'completed'
  score?: number
  period?: string
}

export interface ConnectedAccount {
  id: string
  name: string
  type: string // "broker" | "propfirm" | "indices" | "stocks"
  accountType?: 'demo' | 'live'
  platform?: string
  server?: string
  accountNumber?: string
  broker?: string
  currency: string
  balance: number
  status: 'connected' | 'disconnected' | 'syncing' | 'error'
  lastSync?: string
}

export interface TradingRule {
  id: string
  name: string
  description: string
  category: 'entry' | 'exit' | 'risk' | 'psychology'
  compliance: number
  violations: number
  violationCost: number
  active: boolean
}

export interface TradingSession {
  id: string
  name: string
  startTime: string
  endTime?: string
  duration: number
  tradesPlaced: number
  profitLoss: number
  notes: string
  status: 'stopped' | 'recording' | 'paused'
  tags: string[]
}

// Active section type
export type ActiveSection = 
  | 'dashboard'
  | 'portfolio'
  | 'risk'
  | 'trading'
  | 'journal'
  | 'audits'
  | 'psychology'
  | 'accounts'
  | 'sessions'
  | 'statistics'
  | 'rules'
  | 'ai-assistant'
  | 'trading-hub'
  | 'playbook'
  | 'log-trade'
  | 'zen-mode'
  | 'pricing'
  | 'login-history'
  | 'security'

// Store State
interface TradingStore {
  // UI State
  activeSection: ActiveSection
  sidebarCollapsed: boolean
  theme: 'light' | 'dark' | 'system'
  hideBalance: boolean // إخفاء الرصيد للمتداولين
  
  // Portfolio State
  portfolios: Portfolio[]
  activePortfolio: Portfolio | null
  
  // Trading State
  trades: Trade[]
  openTrades: Trade[]
  
  // Risk State
  riskProfiles: RiskProfile[]
  activeRiskProfile: RiskProfile | null
  
  // Journal State
  journalEntries: JournalEntry[]
  
  // Session State
  sessionReviews: SessionReview[]
  
  // Psychology State
  psychologyLogs: PsychologyLog[]
  
  // Audits State
  audits: Audit[]
  
  // Connected Accounts
  connectedAccounts: ConnectedAccount[]
  
  // Trading Rules
  tradingRules: TradingRule[]
  
  // Trading Sessions
  tradingSessions: TradingSession[]
  
  // Actions
  setActiveSection: (section: ActiveSection) => void
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  toggleHideBalance: () => void // تبديل إخفاء الرصيد
  
  // Portfolio Actions
  setPortfolios: (portfolios: Portfolio[]) => void
  setActivePortfolio: (portfolio: Portfolio | null) => void
  
  // Trade Actions
  setTrades: (trades: Trade[]) => void
  addTrade: (trade: Trade) => void
  updateTrade: (id: string, trade: Partial<Trade>) => void
  
  // Risk Actions
  setRiskProfiles: (profiles: RiskProfile[]) => void
  setActiveRiskProfile: (profile: RiskProfile | null) => void
  
  // Journal Actions
  setJournalEntries: (entries: JournalEntry[]) => void
  addJournalEntry: (entry: JournalEntry) => void
  
  // Session Actions
  setSessionReviews: (reviews: SessionReview[]) => void
  addSessionReview: (review: SessionReview) => void
  
  // Psychology Actions
  setPsychologyLogs: (logs: PsychologyLog[]) => void
  addPsychologyLog: (log: PsychologyLog) => void
  
  // Audit Actions
  setAudits: (audits: Audit[]) => void
  addAudit: (audit: Audit) => void
  updateAudit: (id: string, audit: Partial<Audit>) => void
  
  // Connected Accounts Actions
  setConnectedAccounts: (accounts: ConnectedAccount[]) => void
  addConnectedAccount: (account: ConnectedAccount) => void
  updateConnectedAccount: (id: string, account: Partial<ConnectedAccount>) => void
  removeConnectedAccount: (id: string) => void
  
  // Trading Rules Actions
  setTradingRules: (rules: TradingRule[]) => void
  addTradingRule: (rule: TradingRule) => void
  updateTradingRule: (id: string, rule: Partial<TradingRule>) => void
  removeTradingRule: (id: string) => void
  
  // Trading Sessions Actions
  setTradingSessions: (sessions: TradingSession[]) => void
  addTradingSession: (session: TradingSession) => void
  updateTradingSession: (id: string, session: Partial<TradingSession>) => void
}

export const useTradingStore = create<TradingStore>()(
  persist(
    (set) => ({
      // Initial UI State
      activeSection: 'dashboard',
      sidebarCollapsed: false,
      theme: 'dark',
      hideBalance: false,
      
      // Initial Data - All Empty for New User
      portfolios: [],
      activePortfolio: null,
      trades: [],
      openTrades: [],
      riskProfiles: [],
      activeRiskProfile: null,
      journalEntries: [],
      sessionReviews: [],
      psychologyLogs: [],
      audits: [],
      connectedAccounts: [],
      tradingRules: [],
      tradingSessions: [],
      
      // UI Actions
      setActiveSection: (section) => set({ activeSection: section }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setTheme: (theme) => set({ theme }),
      toggleHideBalance: () => set((state) => ({ hideBalance: !state.hideBalance })),
      
      // Portfolio Actions
      setPortfolios: (portfolios) => set({ portfolios }),
      setActivePortfolio: (portfolio) => set({ activePortfolio: portfolio }),
      
      // Trade Actions
      setTrades: (trades) => set({ 
        trades, 
        openTrades: trades.filter(t => t.status === 'open') 
      }),
      addTrade: (trade) => set((state) => ({ 
        trades: [...state.trades, trade],
        openTrades: trade.status === 'open' 
          ? [...state.openTrades, trade] 
          : state.openTrades
      })),
      updateTrade: (id, updatedTrade) => set((state) => ({
        trades: state.trades.map(t => t.id === id ? { ...t, ...updatedTrade } : t),
        openTrades: state.openTrades.map(t => t.id === id ? { ...t, ...updatedTrade } : t)
      })),
      
      // Risk Actions
      setRiskProfiles: (profiles) => set({ riskProfiles: profiles }),
      setActiveRiskProfile: (profile) => set({ activeRiskProfile: profile }),
      
      // Journal Actions
      setJournalEntries: (entries) => set({ journalEntries: entries }),
      addJournalEntry: (entry) => set((state) => ({ 
        journalEntries: [...state.journalEntries, entry] 
      })),
      
      // Session Actions
      setSessionReviews: (reviews) => set({ sessionReviews: reviews }),
      addSessionReview: (review) => set((state) => ({ 
        sessionReviews: [...state.sessionReviews, review] 
      })),
      
      // Psychology Actions
      setPsychologyLogs: (logs) => set({ psychologyLogs: logs }),
      addPsychologyLog: (log) => set((state) => ({ 
        psychologyLogs: [...state.psychologyLogs, log] 
      })),
      
      // Audit Actions
      setAudits: (audits) => set({ audits }),
      addAudit: (audit) => set((state) => ({ audits: [...state.audits, audit] })),
      updateAudit: (id, updatedAudit) => set((state) => ({
        audits: state.audits.map(a => a.id === id ? { ...a, ...updatedAudit } : a)
      })),
      
      // Connected Accounts Actions
      setConnectedAccounts: (accounts) => set({ connectedAccounts: accounts }),
      addConnectedAccount: (account) => set((state) => ({ 
        connectedAccounts: [...state.connectedAccounts, account] 
      })),
      updateConnectedAccount: (id, updatedAccount) => set((state) => ({
        connectedAccounts: state.connectedAccounts.map(a => 
          a.id === id ? { ...a, ...updatedAccount } : a
        )
      })),
      removeConnectedAccount: (id) => set((state) => ({
        connectedAccounts: state.connectedAccounts.filter(a => a.id !== id)
      })),
      
      // Trading Rules Actions
      setTradingRules: (rules) => set({ tradingRules: rules }),
      addTradingRule: (rule) => set((state) => ({ 
        tradingRules: [...state.tradingRules, rule] 
      })),
      updateTradingRule: (id, updatedRule) => set((state) => ({
        tradingRules: state.tradingRules.map(r => 
          r.id === id ? { ...r, ...updatedRule } : r
        )
      })),
      removeTradingRule: (id) => set((state) => ({
        tradingRules: state.tradingRules.filter(r => r.id !== id)
      })),
      
      // Trading Sessions Actions
      setTradingSessions: (sessions) => set({ tradingSessions: sessions }),
      addTradingSession: (session) => set((state) => ({ 
        tradingSessions: [...state.tradingSessions, session] 
      })),
      updateTradingSession: (id, updatedSession) => set((state) => ({
        tradingSessions: state.tradingSessions.map(s => 
          s.id === id ? { ...s, ...updatedSession } : s
        )
      })),
    }),
    {
      name: 'trading-platform-storage',
      partialize: (state) => ({
        activeSection: state.activeSection,
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        hideBalance: state.hideBalance,
      }),
    }
  )
)
