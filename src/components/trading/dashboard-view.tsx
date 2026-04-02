'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import { useTradingStore } from '@/lib/store'
import { MaskedBalance } from '@/components/trading/masked-balance'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Shield,
  BarChart3,
  Activity,
  Target,
  DollarSign,
  Eye,
  EyeOff,
  ShieldCheck,
  Monitor,
  Smartphone,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'

interface LoginHistoryItem {
  id: string
  date: string
  ipAddress: string
  device: { browser: string; os: string; device: string }
  successful: boolean
  method: string
}

export function DashboardView() {
  const { t, language } = useI18n()
  const { hideBalance, toggleHideBalance } = useTradingStore()
  const [loginHistory, setLoginHistory] = useState<LoginHistoryItem[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  // جلب سجل الدخول
  useEffect(() => {
    async function fetchLoginHistory() {
      setIsLoadingHistory(true)
      try {
        const response = await fetch('/api/auth/login-history')
        if (response.ok) {
          const data = await response.json()
          setLoginHistory(data.history || [])
        }
      } catch (error) {
        console.error('Error fetching login history:', error)
      }
      setIsLoadingHistory(false)
    }

    fetchLoginHistory()
  }, [])

  const stats = [
    {
      title: t('dashboard.totalAssets'),
      value: 0,
      change: '+0%',
      trend: 'up',
      icon: Wallet,
      color: 'from-green-500 to-emerald-600',
      isCurrency: true,
    },
    {
      title: t('dashboard.profitLoss'),
      value: 0,
      change: '+0%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-600',
      isCurrency: true,
    },
    {
      title: t('dashboard.winRate'),
      value: 0,
      change: '+0%',
      trend: 'up',
      icon: Target,
      color: 'from-purple-500 to-pink-600',
      isCurrency: false,
      suffix: '%',
    },
    {
      title: t('dashboard.openTrades'),
      value: 0,
      change: '0',
      trend: 'up',
      icon: Activity,
      color: 'from-amber-500 to-orange-600',
      isCurrency: false,
    }
  ]

  // تنسيق التاريخ
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return language === 'ar' ? 'الآن' : 'Just now'
    if (diffMins < 60) return language === 'ar' ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`
    if (diffHours < 24) return language === 'ar' ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`
    if (diffDays < 7) return language === 'ar' ? `منذ ${diffDays} يوم` : `${diffDays}d ago`

    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">
            {t('dashboard.welcome')} 👋
          </h2>
          <p className="text-muted-foreground mt-1">
            {t('dashboard.overview')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleHideBalance}
            className="gap-2"
          >
            {hideBalance ? (
              <>
                <Eye className="h-4 w-4" />
                {language === 'ar' ? 'إظهار الأرصدة' : 'Show Balances'}
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4" />
                {language === 'ar' ? 'إخفاء الأرصدة' : 'Hide Balances'}
              </>
            )}
          </Button>
          <Badge variant="outline" className="px-4 py-2 text-sm">
            {t('dashboard.lastUpdate')}
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              {stat.isCurrency ? (
                <MaskedBalance value={stat.value} size="lg" showToggle={false} />
              ) : (
                <div className="text-2xl font-bold">
                  {hideBalance ? '***' : `${stat.value}${stat.suffix || ''}`}
                </div>
              )}
              <div className="flex items-center gap-1 mt-1">
                {stat.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={stat.trend === 'up' ? 'text-green-500 text-sm' : 'text-red-500 text-sm'}>
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Login History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              {t('dashboard.portfolioPerformance')}
            </CardTitle>
            <CardDescription>
              {language === 'ar'
                ? 'تتبع أداء محفظتك على مدار الشهر'
                : 'Track your portfolio performance over the month'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{language === 'ar' ? 'الرسم البياني سيظهر هنا' : 'Chart will appear here'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              {t('dashboard.riskAlerts')}
            </CardTitle>
            <CardDescription>
              {language === 'ar'
                ? 'مراقبة مستوى المخاطر الحالي'
                : 'Monitor your current risk level'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t('dashboard.dailyRisk')}
                  </span>
                  <Badge variant="outline" className="text-green-500 border-green-500">
                    {t('dashboard.safe')}
                  </Badge>
                </div>
                <Progress value={0} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t('dashboard.weeklyRisk')}
                  </span>
                  <Badge variant="outline" className="text-green-500 border-green-500">
                    {t('dashboard.safe')}
                  </Badge>
                </div>
                <Progress value={0} className="h-2" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t('dashboard.leverage')}
                </span>
                <Badge variant="outline">1:1</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Login History / Security Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-500" />
            {language === 'ar' ? 'آخر نشاط للدخول' : 'Recent Login Activity'}
          </CardTitle>
          <CardDescription>
            {language === 'ar'
              ? 'راقب تسجيلات الدخول إلى حسابك للأمان'
              : 'Monitor login activity to your account for security'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : loginHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShieldCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{language === 'ar' ? 'لا يوجد سجل دخول بعد' : 'No login history yet'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {loginHistory.slice(0, 5).map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${item.successful ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                      {item.successful ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {item.device.device} - {item.device.browser}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {item.device.os}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Globe className="h-3 w-3" />
                        <span>{item.ipAddress}</span>
                        <Clock className="h-3 w-3 ml-2" />
                        <span>{formatDate(item.date)}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={item.successful ? 'default' : 'destructive'} className="text-xs">
                    {item.successful
                      ? (language === 'ar' ? 'نجاح' : 'Success')
                      : (language === 'ar' ? 'فشل' : 'Failed')}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
