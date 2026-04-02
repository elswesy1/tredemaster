'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n'
import { getApiHeaders } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  Percent,
  Calendar,
  Award,
  Zap,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts'

// Types for API response
interface Statistics {
  winRate: number
  riskReward: number
  profitableSetups: number
  optimalTimes: string
  maxConsecutiveLosses: number
  tradeExpectancy: number
  averageWin: number
  averageLoss: number
  profitFactor: number
  sharpeRatio: number
  averageRRR: number
  bestDay: string
  worstDay: string
}

interface PerformanceByMonth {
  month: string
  profit: number
  trades: number
  winRate: number
}

interface HourlyPerformance {
  hour: string
  winRate: number
  trades: number
}

interface SetupPerformance {
  setup: string
  profit: number
  winRate: number
  trades: number
}

interface StatisticsApiResponse {
  statistics: Statistics
  performanceByMonth: PerformanceByMonth[]
  hourlyPerformance: HourlyPerformance[]
  setupPerformance: SetupPerformance[]
}

export function StatisticsView() {
  const { t, language } = useI18n()
  const { toast } = useToast()
  const [timeframe, setTimeframe] = useState('month')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [performanceByMonth, setPerformanceByMonth] = useState<PerformanceByMonth[]>([])
  const [hourlyPerformance, setHourlyPerformance] = useState<HourlyPerformance[]>([])
  const [setupPerformance, setSetupPerformance] = useState<SetupPerformance[]>([])

  const fetchStatistics = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      const response = await fetch(`/api/statistics?timeframe=${timeframe}`, {
        method: 'GET',
        headers: getApiHeaders(),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data: StatisticsApiResponse = await response.json()
      
      setStatistics(data.statistics)
      setPerformanceByMonth(data.performanceByMonth)
      setHourlyPerformance(data.hourlyPerformance)
      setSetupPerformance(data.setupPerformance)
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' 
          ? 'فشل في تحميل الإحصائيات. يرجى المحاولة مرة أخرى.' 
          : 'Failed to load statistics. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStatistics()
  }, [timeframe])

  const handleRefresh = () => {
    fetchStatistics(true)
  }

  const formatNumber = (num: number, decimals = 2) => {
    return num.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">
            {language === 'ar' ? 'جاري تحميل الإحصائيات...' : 'Loading statistics...'}
          </p>
        </div>
      </div>
    )
  }

  // No data state
  if (!statistics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <AlertTriangle className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            {language === 'ar' ? 'لا توجد بيانات متاحة' : 'No data available'}
          </p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Timeframe Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('statistics.title')}</h2>
          <p className="text-muted-foreground">{t('statistics.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          {(['today', 'week', 'month', 'year', 'all'] as const).map((tf) => (
            <Button
              key={tf}
              variant={timeframe === tf ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(tf)}
            >
              {t(`statistics.timeframes.${tf}`)}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Percent className="h-4 w-4 text-green-500" />
              {t('statistics.metrics.winRate')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {formatNumber(statistics.winRate)}%
            </div>
            <Progress value={statistics.winRate} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {language === 'ar' ? '52 صفقة رابحة / 76 إجمالي' : '52 winning / 76 total trades'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              {t('statistics.metrics.riskReward')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">
              1:{formatNumber(statistics.riskReward)}
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>{language === 'ar' ? 'متوسط الربح' : 'Avg Win'}: ${statistics.averageWin}</span>
              <span>{language === 'ar' ? 'متوسط الخسارة' : 'Avg Loss'}: ${statistics.averageLoss}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-500" />
              {t('statistics.metrics.tradeExpectancy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500">
              ${formatNumber(statistics.tradeExpectancy)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {language === 'ar' ? 'الربح المتوقع لكل صفقة' : 'Expected profit per trade'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              {t('statistics.metrics.maxConsecutiveLosses')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">
              {statistics.maxConsecutiveLosses}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {language === 'ar' ? 'أسوأ سلسلة: -$425 إجمالي' : 'Worst streak: -$425 total'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Performance Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t('dashboard.portfolioPerformance')}
            </CardTitle>
            <CardDescription>
              {language === 'ar' ? 'اتجاهات الربح والخسارة الشهرية' : 'Monthly P&L and win rate trends'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {performanceByMonth.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceByMonth}>
                    <defs>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.65 0.2 145)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="oklch(0.65 0.2 145)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 250)" />
                    <XAxis dataKey="month" stroke="oklch(0.5 0.02 250)" fontSize={12} />
                    <YAxis stroke="oklch(0.5 0.02 250)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(0.17 0.025 250)',
                        border: '1px solid oklch(0.3 0.03 250)',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`$${value}`, language === 'ar' ? 'الربح' : 'Profit']}
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stroke="oklch(0.65 0.2 145)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorProfit)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  {language === 'ar' ? 'لا توجد بيانات' : 'No data available'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Hourly Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t('statistics.metrics.optimalTimes')}
            </CardTitle>
            <CardDescription>
              {language === 'ar' ? 'معدل الفوز حسب ساعة التداول (UTC)' : 'Win rate by trading hour (UTC)'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {hourlyPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 250)" />
                    <XAxis dataKey="hour" stroke="oklch(0.5 0.02 250)" fontSize={12} />
                    <YAxis stroke="oklch(0.5 0.02 250)" fontSize={12} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(0.17 0.025 250)',
                        border: '1px solid oklch(0.3 0.03 250)',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number, name: string) => [
                        name === 'winRate' ? `${value}%` : value,
                        name === 'winRate' 
                          ? (language === 'ar' ? 'معدل الفوز' : 'Win Rate') 
                          : (language === 'ar' ? 'الصفقات' : 'Trades')
                      ]}
                    />
                    <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
                      {hourlyPerformance.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.winRate >= 70
                              ? 'oklch(0.65 0.2 145)'
                              : entry.winRate >= 60
                              ? 'oklch(0.7 0.15 200)'
                              : 'oklch(0.55 0.15 25)'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  {language === 'ar' ? 'لا توجد بيانات' : 'No data available'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Setup Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            {t('statistics.metrics.profitableSetups')}
          </CardTitle>
          <CardDescription>
            {language === 'ar' ? 'تحليل الأداء حسب نوع الإعداد' : 'Performance breakdown by trading setup'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {setupPerformance.length > 0 ? (
              setupPerformance.map((setup) => (
                <div
                  key={setup.setup}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      setup.profit >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {setup.profit >= 0 ? (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">{setup.setup}</h4>
                      <p className="text-sm text-muted-foreground">
                        {setup.trades} {language === 'ar' ? 'صفقات' : 'trades'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'معدل الفوز' : 'Win Rate'}
                      </p>
                      <p className={`font-semibold ${
                        setup.winRate >= 60 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {setup.winRate}%
                      </p>
                    </div>
                    <div className="text-center min-w-[80px]">
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'الربح/الخسارة' : 'P&L'}
                      </p>
                      <p className={`font-semibold ${
                        setup.profit >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {setup.profit >= 0 ? '+' : ''}${setup.profit}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                {language === 'ar' ? 'لا توجد بيانات' : 'No data available'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <DollarSign className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('statistics.metrics.profitFactor')}</p>
                <p className="text-2xl font-bold">{formatNumber(statistics.profitFactor)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <Zap className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('statistics.metrics.sharpeRatio')}</p>
                <p className="text-2xl font-bold">{formatNumber(statistics.sharpeRatio)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/20">
                <Award className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('statistics.metrics.bestDay')}</p>
                <p className="text-2xl font-bold">{statistics.bestDay}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-500/20">
                <Calendar className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('statistics.metrics.worstDay')}</p>
                <p className="text-2xl font-bold">{statistics.worstDay}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
