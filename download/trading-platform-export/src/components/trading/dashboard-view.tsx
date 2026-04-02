'use client'

import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Target,
  AlertTriangle,
  BarChart3,
  PieChart,
  Play,
  FolderOpen,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export function DashboardView() {
  const { t, language } = useI18n()
  const isRTL = language === 'ar'
  
  // All values start at zero - no mock data
  const totalValue = 0
  const totalPnL = 0
  const todayPnL = 0
  const winRate = 0
  const openTrades = 0
  const maxDrawdown = 0

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">{t('hero.title')}</h2>
            <p className="text-muted-foreground text-lg mb-4">{t('hero.subtitle')}</p>
            <div className="flex gap-3">
              <Button className="bg-green-600 hover:bg-green-700">
                <Play className="h-4 w-4 mr-2" />
                {t('hero.cta.startFree')}
              </Button>
              <Button variant="outline">
                {t('hero.cta.learnMore')}
              </Button>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="h-24 w-24 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Empty State - Welcome Message */}
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {isRTL ? 'مرحباً بك في Trading Hub' : 'Welcome to Trading Hub'}
          </h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            {isRTL 
              ? 'ابدأ بإضافة حساباتك وأصولك في إدارة المحفظة، ثم حدد معايير المخاطر لكل حساب لبدء التتبع الذكي'
              : 'Start by adding your accounts and assets in Portfolio Management, then set risk criteria for each account to begin smart tracking'
            }
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'portfolio' }))}>
              {isRTL ? 'إدارة المحفظة' : 'Portfolio Management'}
            </Button>
            <Button variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'risk' }))}>
              {isRTL ? 'إدارة المخاطر' : 'Risk Management'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Header Stats - Zero State */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-fade-in-up hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalAssets')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'أضف حسابات للبدء' : 'Add accounts to start'}
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up hover:shadow-lg transition-shadow" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.profitLoss')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPnL.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.today')}: $0
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up hover:shadow-lg transition-shadow" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.winRate')}</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate}%</div>
            <Progress value={winRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up hover:shadow-lg transition-shadow" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.openTrades')}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTrades}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.maxDrawdown')}: {maxDrawdown}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row - Empty State */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Performance Chart */}
        <Card className="animate-fade-in-up hover:shadow-lg transition-shadow" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t('dashboard.portfolioPerformance')}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'تطور قيمة المحفظة' : 'Portfolio value evolution'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {isRTL ? 'لا توجد بيانات أداء بعد' : 'No performance data yet'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'أضف صفقات لرؤية الأداء' : 'Add trades to see performance'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Distribution */}
        <Card className="animate-fade-in-up hover:shadow-lg transition-shadow" style={{ animationDelay: '0.5s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              {t('dashboard.portfolioDistribution')}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'توزيع الأصول حسب الفئة' : 'Asset distribution by category'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <PieChart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {isRTL ? 'لا توجد أصول بعد' : 'No assets yet'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'أضف حسابات وأصول في المحفظة' : 'Add accounts and assets in Portfolio'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Empty States */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Trades */}
        <Card className="animate-fade-in-up hover:shadow-lg transition-shadow" style={{ animationDelay: '0.6s' }}>
          <CardHeader>
            <CardTitle>{t('dashboard.recentTrades')}</CardTitle>
            <CardDescription>
              {isRTL ? 'آخر الصفقات المنفذة' : 'Last executed trades'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center">
              <div className="text-center">
                <Activity className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {isRTL ? 'لا توجد صفقات بعد' : 'No trades yet'}
                </p>
                <Button 
                  variant="link" 
                  className="mt-2"
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'log-trade' }))}
                >
                  {isRTL ? 'سجل أول صفقة' : 'Log your first trade'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Alerts */}
        <Card className="animate-fade-in-up hover:shadow-lg transition-shadow" style={{ animationDelay: '0.7s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {t('dashboard.riskAlerts')}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'آخر التنبيهات والإشعارات' : 'Latest alerts and notifications'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center">
              <div className="text-center">
                <AlertTriangle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {isRTL ? 'لا توجد تنبيهات' : 'No alerts'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'سيظهر هنا أي تنبيهات مخاطر' : 'Risk alerts will appear here'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
