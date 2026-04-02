'use client'

import { useState, useEffect, useRef } from 'react'
import { useTradingStore } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { TradingSidebar } from '@/components/trading/sidebar'
import { DashboardView } from '@/components/trading/dashboard-view'
import { PortfolioView } from '@/components/trading/portfolio-view'
import { RiskView } from '@/components/trading/risk-view'
import { TradingView } from '@/components/trading/trading-view'
import { JournalView } from '@/components/trading/journal-view'
import { AccountsView } from '@/components/trading/accounts-view'
import { LandingPage } from '@/components/trading/landing-page'
import { SignupPage } from '@/components/trading/signup-page'
import { LoginPage } from '@/components/trading/login-page'
import { ThemeToggle } from '@/components/trading/theme-toggle'
import { LanguageToggle } from '@/components/trading/language-toggle'
import { Toaster } from '@/components/ui/toaster'
import { toast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Crown, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

// User state
interface User {
  id: string
  email: string
  name: string
  plan: 'free' | 'pro'
  trialEndsAt?: string
}

// دالة للحصول على المستخدم الحالي
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
  const { activeSection, setActiveSection, sidebarCollapsed } = useTradingStore()
  const { direction, language, t } = useI18n()
  
  // Client-side only state - use ref to avoid cascading render warning
  const mountedRef = useRef(false)
  const [mounted, setMounted] = useState(false)
  const [appView, setAppView] = useState<'landing' | 'signup' | 'login' | 'dashboard'>('landing')
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Handle client-side mounting
  useEffect(() => {
    const initializeState = async () => {
      if (!mountedRef.current) {
        mountedRef.current = true
        setMounted(true)
        
        // محاولة الحصول على المستخدم من API أولاً
        const currentUser = await fetchCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          setAppView('dashboard')
        } else {
          // fallback to localStorage for offline mode
          const savedUser = localStorage.getItem('trademaster_user')
          if (savedUser) {
            try {
              const parsed = JSON.parse(savedUser)
              setUser(parsed)
              setAppView('dashboard')
            } catch {
              localStorage.removeItem('trademaster_user')
            }
          }
        }
      }
    }
    // Use queueMicrotask to defer setState outside effect body
    queueMicrotask(initializeState)
  }, [])

  // Apply direction on mount and language change
  useEffect(() => {
    if (mounted) {
      document.documentElement.dir = direction
      document.documentElement.lang = language
    }
  }, [direction, language, mounted])

  const handleSignup = async (data: { email: string; password: string; name: string }) => {
    // التسجيل تم بالفعل في SignupPage عبر API
    // الآن نحصل على المستخدم الحالي
    const currentUser = await fetchCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      localStorage.setItem('trademaster_user', JSON.stringify(currentUser))
      setAppView('dashboard')
      
      toast({
        title: language === 'ar' ? 'مرحباً بك!' : 'Welcome!',
        description: language === 'ar' 
          ? `مرحباً ${currentUser.name}، تم إنشاء حسابك بنجاح` 
          : `Welcome ${currentUser.name}, your account has been created`,
      })
    }
  }

  const handleLogin = async (data: { email: string; password: string }) => {
    // الدخول تم بالفعل في LoginPage عبر API
    // الآن نحصل على المستخدم الحالي
    const currentUser = await fetchCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      localStorage.setItem('trademaster_user', JSON.stringify(currentUser))
      setAppView('dashboard')
      
      toast({
        title: language === 'ar' ? 'مرحباً بعودتك!' : 'Welcome back!',
        description: language === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'You have been logged in successfully',
      })
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    setUser(null)
    localStorage.removeItem('trademaster_user')
    setAppView('landing')
    toast({
      title: language === 'ar' ? 'تم تسجيل الخروج' : 'Logged out',
      description: language === 'ar' ? 'تم تسجيل خروجك بنجاح' : 'You have been logged out successfully',
    })
  }

  const handleSelectPlan = (plan: 'free' | 'pro') => {
    if (user) {
      const updatedUser = { ...user, plan }
      setUser(updatedUser)
      localStorage.setItem('trademaster_user', JSON.stringify(updatedUser))
      toast({
        title: language === 'ar' ? 'تم تحديث الخطة' : 'Plan updated',
        description: language === 'ar' 
          ? `تم الترقية إلى الخطة ${plan === 'pro' ? 'الاحترافية' : 'المجانية'}` 
          : `Upgraded to ${plan} plan`,
      })
    }
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardView />
      case 'accounts':
        return <AccountsView />
      case 'portfolio':
        return <PortfolioView />
      case 'risk':
        return <RiskView />
      case 'trading':
        return <TradingView />
      case 'journal':
        return <JournalView />
      default:
        return <DashboardView />
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
    strategies: t('sidebar.strategies'),
    'log-trade': t('sidebar.logTrade'),
    'zen-mode': t('sidebar.zenMode'),
    pricing: t('sidebar.pricing'),
  }

  // Loading state - show loading until client-side mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <span className="text-white font-bold">T</span>
                </div>
                <span className="text-xl font-bold">TradeMaster</span>
              </div>
            </div>
          </div>
        </nav>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 animate-pulse" />
            <div className="text-muted-foreground">{t('common.loading')}</div>
          </div>
        </div>
      </div>
    )
  }

  // Landing page
  if (appView === 'landing') {
    return (
      <div dir={direction}>
        <LandingPage 
          onGetStarted={() => setAppView('signup')} 
          onLogin={() => setAppView('login')} 
        />
        <Toaster />
      </div>
    )
  }

  // Signup page
  if (appView === 'signup') {
    return (
      <div dir={direction}>
        <SignupPage 
          onSignup={handleSignup}
          onLogin={() => setAppView('login')}
          onBack={() => setAppView('landing')}
        />
        <Toaster />
      </div>
    )
  }

  // Login page
  if (appView === 'login') {
    return (
      <div dir={direction}>
        <LoginPage 
          onLogin={handleLogin}
          onSignup={() => setAppView('signup')}
          onBack={() => setAppView('landing')}
        />
        <Toaster />
      </div>
    )
  }

  // Dashboard view
  const isRTL = direction === 'rtl'

  return (
    <div className="min-h-screen bg-background" dir={direction}>
      <TradingSidebar onLogout={handleLogout} />
      
      {/* Main Content - No margin on mobile, margin on desktop */}
      <div
        className="transition-all duration-300 min-h-screen"
        style={{
          marginLeft: !isRTL && typeof window !== 'undefined' && window.innerWidth >= 1024 
            ? (sidebarCollapsed ? '4rem' : '16rem') 
            : 0,
          marginRight: isRTL && typeof window !== 'undefined' && window.innerWidth >= 1024 
            ? (sidebarCollapsed ? '4rem' : '16rem') 
            : 0,
        }}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2 sm:gap-4">
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent truncate">
                {sidebarTitleMap[activeSection] || t('sidebar.dashboard')}
              </h1>
              {user && (
                <Badge 
                  variant={user.plan === 'pro' ? 'default' : 'secondary'}
                  className={cn(
                    'text-xs hidden sm:flex',
                    user.plan === 'pro' && 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0'
                  )}
                >
                  {user.plan === 'pro' ? (
                    <>
                      <Crown className="h-3 w-3 mr-1" />
                      Pro
                    </>
                  ) : 'Free'}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {user?.plan === 'free' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setActiveSection('pricing')}
                  className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hidden sm:flex"
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  {t('common.upgrade')}
                </Button>
              )}
              <LanguageToggle />
              <ThemeToggle />
              {user && (
                <div className="text-sm text-muted-foreground hidden md:block px-3 py-1 rounded-full bg-muted/50">
                  {user.name}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content - Responsive padding */}
        <div className="p-4 sm:p-6">
          {renderContent()}
        </div>
      </div>
      <Toaster />
    </div>
  )
}
