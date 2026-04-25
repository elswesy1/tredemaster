'use client'

import { useState, useEffect } from 'react'
import { useTradingStore, ActiveSection } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard,
  Wallet,
  Shield,
  LineChart,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Link2,
  Video,
  BarChart3,
  ScrollText,
  Bot,
  Activity,
  Target,
  Moon,
  CreditCard,
  TrendingUp,
  Menu,
  X,
  ClipboardCheck,
  Brain,
  History,
} from 'lucide-react'

// Menu items data - defined outside component
const coreFeatures: { id: ActiveSection; labelKey: string; icon: React.ElementType }[] = [
  { id: 'dashboard', labelKey: 'sidebar.dashboard', icon: LayoutDashboard },
  { id: 'portfolio', labelKey: 'sidebar.portfolio', icon: Wallet },
  { id: 'risk', labelKey: 'sidebar.risk', icon: Shield },
  { id: 'trading', labelKey: 'sidebar.trading', icon: LineChart },
  { id: 'playbook', labelKey: 'sidebar.playbook', icon: Target },
]

const tradingTools: { id: ActiveSection; labelKey: string; icon: React.ElementType }[] = [
  { id: 'accounts', labelKey: 'sidebar.accounts', icon: Link2 },
]

const analyticsFeatures: { id: ActiveSection; labelKey: string; icon: React.ElementType }[] = [
  { id: 'sessions', labelKey: 'sidebar.sessions', icon: Video },
  { id: 'statistics', labelKey: 'sidebar.statistics', icon: BarChart3 },
  { id: 'rules', labelKey: 'sidebar.rules', icon: ScrollText },
  { id: 'ai-assistant', labelKey: 'sidebar.aiAssistant', icon: Bot },
]

const psychologyFeatures: { id: ActiveSection; labelKey: string; icon: React.ElementType }[] = [
  { id: 'journal', labelKey: 'sidebar.journal', icon: BookOpen },
  { id: 'psychology', labelKey: 'sidebar.psychology', icon: Brain },
  { id: 'audits', labelKey: 'sidebar.audits', icon: ClipboardCheck },
  { id: 'zen-mode', labelKey: 'sidebar.zenMode', icon: Moon },
]

export function TradingSidebar() {
  const { activeSection, setActiveSection, sidebarCollapsed, toggleSidebar } = useTradingStore()
  const { t, direction } = useI18n()
  const isRTL = direction === 'rtl'
  const [mobileOpen, setMobileOpen] = useState(false)

  // Keyboard shortcut for toggling sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleSidebar])

  // Close mobile menu when section changes
  const handleSectionChange = (section: ActiveSection) => {
    setActiveSection(section)
    setMobileOpen(false)
  }

  const renderMenuItems = (items: { id: ActiveSection; labelKey: string; icon: React.ElementType }[], isMobile = false) => {
    return items.map((item) => (
      <div key={item.id} className="relative group">
        <Button
          variant="ghost"
          onClick={() => handleSectionChange(item.id)}
          className={cn(
            'w-full gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200',
            activeSection === item.id && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm',
            (sidebarCollapsed && !isMobile) ? 'justify-center px-2' : 'justify-start'
          )}
        >
          <item.icon className={cn(
            'h-5 w-5 shrink-0 transition-transform duration-200',
            activeSection === item.id && 'scale-110'
          )} />
          {(isMobile || !sidebarCollapsed) && <span>{t(item.labelKey)}</span>}
        </Button>
        
        {/* Tooltip when collapsed */}
        {sidebarCollapsed && !isMobile && (
          <div className={cn(
            'absolute top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50',
            isRTL ? 'right-full mr-2' : 'left-full ml-2'
          )}>
            {t(item.labelKey)}
          </div>
        )}
      </div>
    ))
  }

  return (
    <>
      {/* Mobile Menu Button - Fixed at top */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300 shadow-lg',
          'hidden lg:block', // Hidden on mobile, visible on lg+
          sidebarCollapsed ? 'w-16' : 'w-64',
          isRTL ? 'right-0' : 'left-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border bg-gradient-to-r from-green-600/10 to-emerald-600/10">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-lg text-sidebar-foreground">
                    TradeMaster
                  </span>
                  <p className="text-[10px] text-muted-foreground -mt-1">Pro Trading</p>
                </div>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="w-full flex justify-center">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
              </div>
            )}
            {!sidebarCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                {isRTL ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </Button>
            )}
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {/* Core Features */}
              {!sidebarCollapsed && (
                <p className="px-3 text-xs font-semibold text-green-400 mb-2 uppercase tracking-wider">
                  Core Features
                </p>
              )}
              {renderMenuItems(coreFeatures)}

              {!sidebarCollapsed && <Separator className="my-3" />}
              {sidebarCollapsed && <Separator className="my-2" />}
              
              {/* Trading Tools */}
              {!sidebarCollapsed && (
                <p className="px-3 text-xs font-semibold text-blue-400 mb-2 uppercase tracking-wider">
                  Trading Tools
                </p>
              )}
              {renderMenuItems(tradingTools)}

              {!sidebarCollapsed && <Separator className="my-3" />}
              {sidebarCollapsed && <Separator className="my-2" />}
              
              {/* Analytics */}
              {!sidebarCollapsed && (
                <p className="px-3 text-xs font-semibold text-purple-400 mb-2 uppercase tracking-wider">
                  Analytics
                </p>
              )}
              {renderMenuItems(analyticsFeatures)}

              {!sidebarCollapsed && <Separator className="my-3" />}
              {sidebarCollapsed && <Separator className="my-2" />}
              
              {/* Psychology */}
              {!sidebarCollapsed && (
                <p className="px-3 text-xs font-semibold text-amber-400 mb-2 uppercase tracking-wider">
                  Psychology
                </p>
              )}
              {renderMenuItems(psychologyFeatures)}
            </nav>
          </ScrollArea>

          {/* Footer - Only Login History and Pricing */}
          <div className="border-t border-sidebar-border p-3 space-y-1 bg-muted/30">
            <Button
              variant="ghost"
              onClick={() => setActiveSection('login-history')}
              className={cn(
                'w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                activeSection === 'login-history' && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
                sidebarCollapsed ? 'justify-center px-2' : 'justify-start gap-3'
              )}
            >
              <History className="h-5 w-5 shrink-0" />
              {!sidebarCollapsed && <span>{isRTL ? 'سجل الدخول' : 'Login History'}</span>}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveSection('pricing')}
              className={cn(
                'w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                activeSection === 'pricing' && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
                sidebarCollapsed ? 'justify-center px-2' : 'justify-start gap-3'
              )}
            >
              <CreditCard className="h-5 w-5 shrink-0" />
              {!sidebarCollapsed && <span>{t('sidebar.pricing')}</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar - Slide in from left */}
      <aside
        className={cn(
          'fixed top-0 z-40 h-screen w-72 border-r border-sidebar-border bg-sidebar transition-transform duration-300 shadow-xl',
          'lg:hidden', // Only visible on mobile
          isRTL ? 'right-0' : 'left-0',
          mobileOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border bg-gradient-to-r from-green-600/10 to-emerald-600/10">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg text-sidebar-foreground">
                  TradeMaster
                </span>
                <p className="text-[10px] text-muted-foreground -mt-1">Pro Trading</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {/* Core Features */}
              <p className="px-3 text-xs font-semibold text-green-400 mb-2 uppercase tracking-wider">
                Core Features
              </p>
              {renderMenuItems(coreFeatures, true)}

              <Separator className="my-3" />
              
              {/* Trading Tools */}
              <p className="px-3 text-xs font-semibold text-blue-400 mb-2 uppercase tracking-wider">
                Trading Tools
              </p>
              {renderMenuItems(tradingTools, true)}

              <Separator className="my-3" />
              
              {/* Analytics */}
              <p className="px-3 text-xs font-semibold text-purple-400 mb-2 uppercase tracking-wider">
                Analytics
              </p>
              {renderMenuItems(analyticsFeatures, true)}

              <Separator className="my-3" />
              
              {/* Psychology */}
              <p className="px-3 text-xs font-semibold text-amber-400 mb-2 uppercase tracking-wider">
                Psychology
              </p>
              {renderMenuItems(psychologyFeatures, true)}
            </nav>
          </ScrollArea>

          {/* Footer - Mobile */}
          <div className="border-t border-sidebar-border p-3 space-y-1 bg-muted/30">
            <Button
              variant="ghost"
              onClick={() => handleSectionChange('login-history')}
              className={cn(
                'w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                activeSection === 'login-history' && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
              )}
            >
              <History className="h-5 w-5 shrink-0" />
              <span>{isRTL ? 'سجل الدخول' : 'Login History'}</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleSectionChange('pricing')}
              className={cn(
                'w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                activeSection === 'pricing' && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
              )}
            >
              <CreditCard className="h-5 w-5 shrink-0" />
              <span>{t('sidebar.pricing')}</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
