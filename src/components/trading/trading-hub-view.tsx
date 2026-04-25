'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import {
  Activity,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Clock,
  Target,
  Zap,
  RefreshCw,
  FolderOpen,
} from 'lucide-react'

interface LiveStats {
  balance: number
  equity: number
  dailyPnL: number
  weeklyPnL: number
  openTrades: number
  margin: number
  freeMargin: number
  marginLevel: number
  dailyRiskUsed: number
  weeklyRiskUsed: number
}

interface RiskAlert {
  id: string
  type: 'warning' | 'danger' | 'info'
  message: string
  time: Date
}

interface RecentTrade {
  id: string
  symbol: string
  type: 'buy' | 'sell'
  profitLoss: number
  openedAt: Date
  closedAt: Date
}

// Empty initial state - no mock data
const emptyLiveStats: LiveStats = {
  balance: 0,
  equity: 0,
  dailyPnL: 0,
  weeklyPnL: 0,
  openTrades: 0,
  margin: 0,
  freeMargin: 0,
  marginLevel: 0,
  dailyRiskUsed: 0,
  weeklyRiskUsed: 0
}

export function TradingHubView() {
  const { language } = useI18n()
  const isRTL = language === 'ar'
  const [liveStats] = useState<LiveStats>(emptyLiveStats)
  const [alerts] = useState<RiskAlert[]>([])
  const [recentTrades] = useState<RecentTrade[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setLastUpdate(new Date())
      setIsRefreshing(false)
    }, 1000)
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
      case 'danger':
        return 'bg-red-500/10 border-red-500/30 text-red-500'
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-500'
      default:
        return 'bg-muted'
    }
  }

  const marketSessions = [
    { name: isRTL ? 'طوكيو' : 'Tokyo', active: false, open: '00:00', close: '09:00' },
    { name: isRTL ? 'لندن' : 'London', active: true, open: '08:00', close: '17:00' },
    { name: isRTL ? 'نيويورك' : 'New York', active: true, open: '13:00', close: '22:00' },
    { name: isRTL ? 'سيدني' : 'Sydney', active: false, open: '22:00', close: '07:00' }
  ]

  return (
    <div className="space-y-6">
      {/* Header with Live Indicator */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Activity className="w-6 h-6 text-green-500" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{isRTL ? 'مركز التداول' : 'Trading Hub'}</h2>
            <p className="text-sm text-muted-foreground" suppressHydrationWarning>
              {isRTL ? `آخر تحديث: ${lastUpdate.toLocaleTimeString('ar')}` : `Last update: ${lastUpdate.toLocaleTimeString()}`}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRTL ? 'تحديث' : 'Refresh'}
        </Button>
      </div>

      {/* Empty State */}
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {isRTL ? 'لا توجد بيانات بعد' : 'No Data Yet'}
          </h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            {isRTL 
              ? 'أضف حسابات في إدارة المحفظة وابدأ تسجيل الصفقات لرؤية إحصائيات مباشرة هنا'
              : 'Add accounts in Portfolio Management and start logging trades to see live stats here'
            }
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'portfolio' }))}>
              {isRTL ? 'إدارة المحفظة' : 'Portfolio Management'}
            </Button>
            <Button variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'log-trade' }))}>
              {isRTL ? 'تسجيل صفقة' : 'Log Trade'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Stats Grid - Zero State */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{isRTL ? 'الرصيد' : 'Balance'}</span>
              <DollarSign className="w-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold">${liveStats.balance.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{isRTL ? 'الصافي' : 'Equity'}</span>
              <BarChart3 className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">${liveStats.equity.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-muted/50 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{isRTL ? 'P/L اليومي' : 'Daily P/L'}</span>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">$0.00</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{isRTL ? 'الصفقات المفتوحة' : 'Open Trades'}</span>
              <Target className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">{liveStats.openTrades}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Risk Overview */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              {isRTL ? 'نظرة عامة على المخاطر' : 'Risk Overview'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Daily Risk */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{isRTL ? 'المخاطر اليومية' : 'Daily Risk'}</span>
                <span className="text-muted-foreground">0% / 2%</span>
              </div>
              <Progress value={0} className="h-3" />
            </div>

            {/* Weekly Risk */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{isRTL ? 'المخاطر الأسبوعية' : 'Weekly Risk'}</span>
                <span className="text-muted-foreground">0% / 6%</span>
              </div>
              <Progress value={0} className="h-3" />
            </div>

            {/* Margin Level */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{isRTL ? 'مستوى الهامش' : 'Margin Level'}</span>
                <span className="text-muted-foreground">0%</span>
              </div>
              <Progress value={0} className="h-3" />
            </div>

            {/* Market Sessions */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">{isRTL ? 'جلسات السوق' : 'Market Sessions'}</h4>
              <div className="grid grid-cols-4 gap-2">
                {marketSessions.map((session) => (
                  <div 
                    key={session.name}
                    className={`p-3 rounded-lg text-center ${
                      session.active ? 'bg-green-500/10 border border-green-500/30' : 'bg-muted/50'
                    }`}
                  >
                    <div className="text-sm font-medium">{session.name}</div>
                    <div className={`text-xs ${session.active ? 'text-green-500' : 'text-muted-foreground'}`}>
                      {session.active ? (isRTL ? 'نشط' : 'Active') : `${session.open}-${session.close}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              {isRTL ? 'تنبيهات المخاطر' : 'Risk Alerts'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}
                  >
                    <div className="text-sm font-medium">{alert.message}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {alert.time.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{isRTL ? 'لا توجد تنبيهات' : 'No alerts'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Trades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {isRTL ? 'آخر الصفقات' : 'Recent Trades'}
          </CardTitle>
          <CardDescription>
            {isRTL ? 'آخر 5 صفقات مغلقة' : 'Last 5 closed trades'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentTrades.length > 0 ? (
            <div className="space-y-3">
              {recentTrades.map((trade) => (
                <div 
                  key={trade.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      trade.type === 'buy' ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}>
                      <Activity className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">{trade.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        {trade.type.toUpperCase()} • {trade.closedAt.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className={`text-lg font-semibold ${trade.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trade.profitLoss >= 0 ? '+' : ''}${trade.profitLoss}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{isRTL ? 'لا توجد صفقات بعد' : 'No trades yet'}</p>
              <Button 
                variant="link" 
                className="mt-2"
                onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'log-trade' }))}
              >
                {isRTL ? 'سجل أول صفقة' : 'Log your first trade'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
