'use client'

/**
 * TradeMaster v7.2 - Stable Core
 * Resolves Minified React error #310 and hydration conflicts.
 * Follows strict hooks rules: all hooks at top, zero early returns before hooks.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTradingStore } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { setStorageVersion } from '@/lib/clear-stale-storage'

// Components
import { TradingSidebar } from '@/components/trading/sidebar'
import { DashboardView } from '@/components/trading/dashboard-view'
import { PortfolioView } from '@/components/trading/portfolio-view'
import { RiskView } from '@/components/trading/risk-view'
import { TradingView } from '@/components/trading/trading-view'
import { PlaybookView } from '@/components/trading/playbook-view'
import { TradingAccountsView } from '@/components/trading/trading-accounts-view'
import { JournalView } from '@/components/trading/journal-view'
import { LandingPage } from '@/components/trading/landing-page'
import { SignupPage } from '@/components/trading/signup-page'
import { LoginPage } from '@/components/trading/login-page'
import { PsychologyView } from '@/components/trading/psychology-view'
import { StatisticsView } from '@/components/trading/statistics-view'
import { ZenModeView } from '@/components/trading/zen-mode-view'
import { SessionRecording } from '@/components/trading/session-recording'
import { PricingView } from '@/components/trading/pricing-view'
import { TradingHubView } from '@/components/trading/trading-hub-view'
import { RulesView } from '@/components/trading/rules-view'
import { AIChat } from '@/components/trading/ai-chat'
import { AuditsView } from '@/components/trading/audits-view'
import { LoginHistoryView } from '@/components/trading/login-history-view'
import { TwoFactorSetup } from '@/components/auth/2fa-setup'

// UI Components
import { ThemeToggle } from '@/components/trading/theme-toggle'
import { LanguageToggle } from '@/components/trading/language-toggle'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from '@/hooks/use-toast'
import { 
  Crown, 
  User, 
  Settings, 
  LogOut, 
  Mail, 
  Shield, 
  ChevronDown 
} from 'lucide-react'
import { cn } from '@/lib/utils'

// User state interface
interface User {
  id: string
  email: string
  name: string
  plan: 'free' | 'pro'
  trialEndsAt?: string
}

// Helper to fetch current user
async function fetchCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/me')
    if (response.ok) {
      const data = await response.json()
      return data.user
    }
    return null
  } catch {
    return null
  }
}

export default function Home() {
  // 1. ALL HOOKS MUST BE AT THE TOP
  const { activeSection, setActiveSection, sidebarCollapsed } = useTradingStore()
  const { direction, language, t } = useI18n()
  
  const [appView, setAppView] = useState<'landing' | 'signup' | 'login' | 'dashboard'>('landing')
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  // 2. Auth Initialization Logic
  const initializeAuth = useCallback(async () => {
    try {
      const currentUser = await fetchCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        setAppView('dashboard')
        // Fix storage version to prevent migration loops
        setStorageVersion(currentUser.id)
      } else {
        const saved = localStorage.getItem('trademaster_user')
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            setUser(parsed)
            setAppView('dashboard')
          } catch {
            localStorage.removeItem('trademaster_user')
          }
        }
      }
    } catch (err) {
      console.error('Failed to initialize auth:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 3. Effects
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    initializeAuth()
  }, [initializeAuth])
  
  useEffect(() => {
    // Only update DOM on client side
    if (typeof document !== 'undefined') {
      document.documentElement.dir = direction
      document.documentElement.lang = language
    }
  }, [direction, language])
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 4. Action Handlers
  const handleLogout = useCallback(async () => {
    setProfileMenuOpen(false)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch { /* ignore */ }
    setUser(null)
    localStorage.removeItem('trademaster_user')
    setAppView('landing')
    toast({
      title: language === 'ar' ? 'تم تسجيل الخروج' : 'Logged out',
    })
  }, [language])

  // 5. Render Logic Helper
  const renderActiveSectionContent = () => {
    switch (activeSection) {
      case 'dashboard': return <DashboardView />
      case 'accounts': return <TradingAccountsView />
      case 'portfolio': return <PortfolioView />
      case 'risk': return <RiskView />
      case 'trading': return <TradingView />
      case 'playbook': return <PlaybookView />
      case 'journal': return <JournalView />
      case 'psychology': return <PsychologyView />
      case 'statistics': return <StatisticsView />
      case 'zen-mode': return <ZenModeView />
      case 'sessions': return <SessionRecording />
      case 'pricing': return <PricingView />
      case 'trading-hub': return <TradingHubView />
      case 'rules': return <RulesView />
      case 'ai-assistant': return <AIChat />
      case 'audits': return <AuditsView />
      case 'login-history': return <LoginHistoryView />
      case 'security': return (
        <div className="max-w-2xl mx-auto py-8">
          <TwoFactorSetup />
        </div>
      )
      case 'strategies':
      case 'log-trade':
        return <TradingView />
      default: return <DashboardView />
    }
  }

  const sidebarTitleMap: Record<string, string> = {
    dashboard: t('sidebar.dashboard'),
    accounts: t('sidebar.accounts'),
    sessions: t('sidebar.sessions'),
    statistics: t('sidebar.statistics'),
    rules: t('sidebar.rules'),
    'ai-assistant': t('sidebar.aiAssistant'),
    portfolio: t('sidebar.portfolio'),
    risk: t('sidebar.risk'),
    trading: t('sidebar.trading'),
    journal: t('sidebar.journal'),
    audits: t('sidebar.audits'),
    psychology: t('sidebar.psychology'),
    'trading-hub': t('sidebar.tradingHub'),
    playbook: t('sidebar.playbook'),
    'log-trade': t('sidebar.logTrade'),
    'zen-mode': t('sidebar.zenMode'),
    pricing: t('sidebar.pricing'),
    'login-history': language === 'ar' ? 'سجل تسجيلات الدخول' : 'Login History',
    security: t('sidebar.security'),
  }

  // 6. Final Render Structure - ZERO Redundant Conditionals
  // Note: Hydration check is handled by layout.tsx wrapper
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 animate-pulse" />
        <div className="text-muted-foreground">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
      </div>
    )
  }

  if (appView === 'landing') {
    return (
      <div dir={direction}>
        <LandingPage onGetStarted={() => setAppView('signup')} onLogin={() => setAppView('login')} />
      </div>
    )
  }

  if (appView === 'signup') {
    return (
      <div dir={direction}>
        <SignupPage onSignup={initializeAuth} onLogin={() => setAppView('login')} onBack={() => setAppView('landing')} />
      </div>
    )
  }

  if (appView === 'login') {
    return (
      <div dir={direction}>
        <LoginPage onLogin={initializeAuth} onSignup={() => setAppView('signup')} onBack={() => setAppView('landing')} />
      </div>
    )
  }

  const isRTL = direction === 'rtl'

  return (
    <div className="min-h-screen bg-background" dir={direction}>
      <TradingSidebar />
      
      <div
        className="transition-all duration-300 min-h-screen"
        style={{
          marginLeft: !isRTL ? (sidebarCollapsed ? '4rem' : '16rem') : 0,
          marginRight: isRTL ? (sidebarCollapsed ? '4rem' : '16rem') : 0,
        }}
      >
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur h-16 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent truncate">
              {sidebarTitleMap[activeSection] || t('sidebar.dashboard')}
            </h1>
            {user && (
              <Badge variant={user.plan === 'pro' ? 'default' : 'secondary'} className={cn('text-xs hidden sm:flex', user.plan === 'pro' && 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0')}>
                {user.plan === 'pro' ? <><Crown className="h-3 w-3 mr-1" />Pro</> : 'Free'}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            <ThemeToggle />
            {user && (
              <div className="relative" ref={profileMenuRef}>
                <button onClick={() => setProfileMenuOpen(!profileMenuOpen)} className={cn("flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 hover:from-green-500/20 hover:to-emerald-500/20 hover:border-green-500/30", profileMenuOpen && "ring-2 ring-green-500/30")}>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-sm font-medium">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", profileMenuOpen && "rotate-180")} />
                </button>

                {profileMenuOpen && (
                  <div className={cn("absolute top-full mt-2 w-72 rounded-xl border border-border bg-card shadow-xl z-50 p-2", isRTL ? "right-0" : "left-0")}>
                    <div className="p-2 border-b border-border bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-t-xl mb-2 flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-medium">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-sm">{user.name}</div>
                        <div className="text-xs text-muted-foreground truncate w-40">{user.email}</div>
                      </div>
                    </div>
                    
                    <button onClick={() => { setProfileMenuOpen(false); toast({ title: language === 'ar' ? 'قريباً' : 'Coming Soon' }) }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left text-sm">
                      <User className="h-4 w-4 text-blue-500" /> {language === 'ar' ? 'البيانات الشخصية' : 'Profile'}
                    </button>
                    <button onClick={() => { setProfileMenuOpen(false); toast({ title: language === 'ar' ? 'قريباً' : 'Coming Soon' }) }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left text-sm">
                      <Settings className="h-4 w-4 text-purple-500" /> {language === 'ar' ? 'الإعدادات' : 'Settings'}
                    </button>
                    <button onClick={() => { setProfileMenuOpen(false); setActiveSection('login-history') }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left text-sm">
                      <Shield className="h-4 w-4 text-green-500" /> {language === 'ar' ? 'سجل الدخول' : 'Login History'}
                    </button>
                    <div className="my-1 border-t border-border" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors text-left text-sm text-red-500">
                      <LogOut className="h-4 w-4" /> {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <main className="p-4 sm:p-6">
          {renderActiveSectionContent()}
        </main>
      </div>
    </div>
  )
}