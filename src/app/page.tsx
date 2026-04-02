'use client'

// TradeMaster v7.0 - User Profile Menu with Logout, Settings, and Upgrade

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
import { ThemeToggle } from '@/components/trading/theme-toggle'
import { LanguageToggle } from '@/components/trading/language-toggle'
import { Toaster } from '@/components/ui/toaster'
import { toast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Crown, 
  Sparkles, 
  User, 
  Settings, 
  LogOut, 
  CreditCard,
  ChevronDown,
  Mail,
  Shield
} from 'lucide-react'
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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
    setProfileMenuOpen(false)
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
      case 'psychology':
        return <PsychologyView />
      case 'statistics':
        return <StatisticsView />
      case 'zen-mode':
        return <ZenModeView />
      case 'sessions':
        return <SessionRecording />
      case 'pricing':
        return <PricingView />
      case 'trading-hub':
        return <TradingHubView />
      case 'rules':
        return <RulesView />
      case 'ai-assistant':
        return <AIChat />
      case 'audits':
        return <AuditsView />
      case 'login-history':
        return <LoginHistoryView />
      // Redirect old sections to new unified trading view
      case 'strategies':
      case 'log-trade':
        return <TradingView />
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
    'login-history': language === 'ar' ? 'سجل تسجيلات الدخول' : 'Login History',
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
      <TradingSidebar />
      
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
            
            {/* Right Side - User Profile Menu */}
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageToggle />
              <ThemeToggle />
              
              {/* User Profile Dropdown */}
              {user && (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200",
                      "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20",
                      "hover:from-green-500/20 hover:to-emerald-500/20 hover:border-green-500/30",
                      profileMenuOpen && "ring-2 ring-green-500/30"
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-sm font-medium">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium text-foreground">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform duration-200",
                      profileMenuOpen && "rotate-180"
                    )} />
                  </button>

                  {/* Dropdown Menu */}
                  {profileMenuOpen && (
                    <div className={cn(
                      "absolute top-full mt-2 w-72 rounded-xl border border-border bg-card shadow-xl z-50",
                      "animate-in fade-in-0 zoom-in-95 duration-200",
                      isRTL ? "right-0" : "left-0"
                    )}>
                      {/* User Info Header */}
                      <div className="p-4 border-b border-border bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-t-xl">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-lg font-medium">
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-foreground">{user.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                            <Badge 
                              variant={user.plan === 'pro' ? 'default' : 'secondary'}
                              className={cn(
                                'mt-1 text-xs',
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
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        {/* Profile */}
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false)
                            toast({
                              title: language === 'ar' ? 'قريباً' : 'Coming Soon',
                              description: language === 'ar' ? 'صفحة البيانات الشخصية قيد التطوير' : 'Profile page is under development',
                            })
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left"
                        >
                          <div className="p-2 rounded-lg bg-blue-500/10">
                            <User className="h-4 w-4 text-blue-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{language === 'ar' ? 'البيانات الشخصية' : 'Profile'}</div>
                            <div className="text-xs text-muted-foreground">{language === 'ar' ? 'إدارة معلومات حسابك' : 'Manage your account info'}</div>
                          </div>
                        </button>

                        {/* Settings */}
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false)
                            toast({
                              title: language === 'ar' ? 'قريباً' : 'Coming Soon',
                              description: language === 'ar' ? 'صفحة الإعدادات قيد التطوير' : 'Settings page is under development',
                            })
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left"
                        >
                          <div className="p-2 rounded-lg bg-purple-500/10">
                            <Settings className="h-4 w-4 text-purple-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{language === 'ar' ? 'الإعدادات' : 'Settings'}</div>
                            <div className="text-xs text-muted-foreground">{language === 'ar' ? 'تخصيص التطبيق' : 'Customize the app'}</div>
                          </div>
                        </button>

                        {/* Upgrade - Only for free users */}
                        {user.plan === 'free' && (
                          <button
                            onClick={() => {
                              setProfileMenuOpen(false)
                              setActiveSection('pricing')
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-amber-500/10 transition-colors text-left"
                          >
                            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                              <Sparkles className="h-4 w-4 text-amber-500" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-amber-600 dark:text-amber-400">
                                {language === 'ar' ? 'ترقية إلى Pro' : 'Upgrade to Pro'}
                              </div>
                              <div className="text-xs text-muted-foreground">{language === 'ar' ? 'احصل على مميزات إضافية' : 'Get premium features'}</div>
                            </div>
                          </button>
                        )}

                        {/* Login History */}
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false)
                            setActiveSection('login-history')
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left"
                        >
                          <div className="p-2 rounded-lg bg-green-500/10">
                            <Shield className="h-4 w-4 text-green-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{language === 'ar' ? 'سجل الدخول' : 'Login History'}</div>
                            <div className="text-xs text-muted-foreground">{language === 'ar' ? 'عرض نشاط الدخول' : 'View login activity'}</div>
                          </div>
                        </button>

                        {/* Divider */}
                        <div className="my-2 border-t border-border" />

                        {/* Logout */}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 transition-colors text-left group"
                        >
                          <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                            <LogOut className="h-4 w-4 text-red-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-red-500">{language === 'ar' ? 'تسجيل الخروج' : 'Logout'}</div>
                            <div className="text-xs text-muted-foreground">{language === 'ar' ? 'الخروج من حسابك' : 'Sign out of your account'}</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
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
