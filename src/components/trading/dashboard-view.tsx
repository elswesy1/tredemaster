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
  Loader2,
  ArrowRight,
  Flame,
  Sun,
  Moon,
  Zap,
  Award,
  Trophy,
  Flag,
  Goal,
  Gauge
} from 'lucide-react'

// ========== 1️⃣ DAILY GOALS SECTION ==========
function DailyGoalsCard({ language }: { language: string }) {
  const goals = [
    { id: 1, title: language === 'ar' ? 'مراجعة السوق الصباحية' : 'Morning market review', completed: true },
    { id: 2, title: language === 'ar' ? 'تسجيل 3 صفقات' : 'Log 3 trades', completed: true },
    { id: 3, title: language === 'ar' ? 'تحديث يومية التداول' : 'Update trading journal', completed: false },
    { id: 4, title: language === 'ar' ? 'مراجعة نهاية اليوم' : 'End-of-day review', completed: false }
  ]

  const completedGoals = goals.filter(g => g.completed).length
  const totalGoals = goals.length
  const progressPercentage = (completedGoals / totalGoals) * 100

  return (
    <Card className="border-cyan-500/20 bg-gradient-to-br from-gray-900/50 to-black">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Goal className="h-5 w-5 text-cyan-400" />
            </div>
            <span>{language === 'ar' ? 'أهداف اليوم' : 'Daily Goals'}</span>
          </div>
          <Badge className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-bold">
            {completedGoals}/{totalGoals}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {goals.map((goal) => (
            <div 
              key={goal.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                goal.completed 
                  ? 'bg-green-500/10 border border-green-500/20' 
                  : 'bg-gray-800/30 border border-gray-700/50'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                goal.completed 
                  ? 'bg-green-500' 
                  : 'border-2 border-gray-600'
              }`}>
                {goal.completed && <CheckCircle className="h-4 w-4 text-white" />}
              </div>
              <span className={`flex-1 ${goal.completed ? 'text-green-400 line-through' : 'text-gray-300'}`}>
                {goal.title}
              </span>
            </div>
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 pt-4 border-t border-gray-700/50">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-400">{language === 'ar' ? 'التقدم' : 'Progress'}</span>
            <span className="text-cyan-400 font-bold">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2 bg-gray-800 [&>div]:bg-gradient-to-r [&>div]:from-cyan-500 [&>div]:to-emerald-500" />
        </div>
      </CardContent>
    </Card>
  )
}

// ========== 2️⃣ MOBILE QUICK STATS WIDGET ==========
function MobileQuickStats({ language }: { language: string }) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 p-4">
      <div className="grid grid-cols-4 gap-2">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-1">
            <Wallet className="h-5 w-5 text-green-400" />
          </div>
          <div className="text-xs text-gray-400">{language === 'ar' ? 'الرصيد' : 'Balance'}</div>
          <div className="text-sm font-bold text-white">$0</div>
        </div>
        
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-1">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="text-xs text-gray-400">{language === 'ar' ? 'الربح' : 'P&L'}</div>
          <div className="text-sm font-bold text-green-400">+$0</div>
        </div>
        
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-1">
            <Target className="h-5 w-5 text-purple-400" />
          </div>
          <div className="text-xs text-gray-400">{language === 'ar' ? 'الفوز' : 'Win%'}</div>
          <div className="text-sm font-bold text-white">0%</div>
        </div>
        
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-1">
            <Activity className="h-5 w-5 text-amber-400" />
          </div>
          <div className="text-xs text-gray-400">{language === 'ar' ? 'الصفقات' : 'Trades'}</div>
          <div className="text-sm font-bold text-white">0</div>
        </div>
      </div>
    </div>
  )
}

// ========== 3️⃣ RISK GAUGE CHART (CIRCULAR) ==========
function RiskGaugeChart({ 
  value, 
  max, 
  label, 
  language 
}: { 
  value: number
  max: number
  label: string
  language: string 
}) {
  const percentage = Math.min((value / max) * 100, 100)
  const angle = (percentage / 100) * 180 - 90 // -90 to 90 degrees
  
  // Determine color based on percentage
  const getColor = () => {
    if (percentage < 50) return { from: '#10b981', to: '#059669', text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' }
    if (percentage < 80) return { from: '#f59e0b', to: '#d97706', text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' }
    return { from: '#ef4444', to: '#dc2626', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' }
  }
  
  const color = getColor()

  return (
    <div className={`p-4 rounded-xl ${color.bg} border ${color.border}`}>
      <div className="relative w-32 h-16 mx-auto">
        {/* Background Arc */}
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <defs>
            <linearGradient id={`gauge-gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color.from} />
              <stop offset="100%" stopColor={color.to} />
            </linearGradient>
          </defs>
          
          {/* Background Arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Progress Arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={`url(#gauge-gradient-${label})`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 1.26} 126`}
          />
          
          {/* Needle */}
          <g transform={`rotate(${angle} 50 50)`}>
            <line x1="50" y1="50" x2="50" y2="25" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="50" cy="50" r="4" fill="white" />
          </g>
        </svg>
      </div>
      
      <div className="text-center mt-2">
        <div className={`text-2xl font-bold ${color.text}`}>
          {percentage.toFixed(0)}%
        </div>
        <div className="text-xs text-gray-400 mt-1">{label}</div>
      </div>
    </div>
  )
}

// ========== 4️⃣ DISCIPLINE STREAK (GAMIFICATION) ==========
function DisciplineStreak({ language }: { language: string }) {
  const streakDays = 5 // Example: 5 days
  const maxStreak = 30
  
  return (
    <Card className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border-amber-500/30">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-500/30 border border-amber-500/50 flex items-center justify-center">
              <Flame className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {streakDays} <span className="text-lg text-amber-400">{language === 'ar' ? 'يوم' : 'days'}</span>
              </div>
              <div className="text-sm text-gray-400">
                {language === 'ar' ? 'سلسلة الانضباط' : 'Discipline Streak'}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-gray-400">
                {language === 'ar' ? 'أفضل: 30 يوم' : 'Best: 30 days'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Motivational Message */}
        <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-sm text-amber-300">
            {language === 'ar' 
              ? '🔥 استمر! أنت على الطريق الصحيح للانضباط'
              : '🔥 Keep going! You\'re on the right path to discipline'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// ========== 5️⃣ THEME TOGGLE ==========
function ThemeToggle({ language }: { language: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
    // Apply theme to document
    document.documentElement.classList.toggle('light-mode')
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="gap-2 border-cyan-500/30 hover:bg-cyan-500/10"
      title={language === 'ar' ? 'تبديل الوضع' : 'Toggle Theme'}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 text-amber-400" />
      ) : (
        <Moon className="h-4 w-4 text-cyan-400" />
      )}
    </Button>
  )
}

// ========== MAIN DASHBOARD VIEW ==========
export function DashboardView() {
  const { t, language } = useI18n()
  const { hideBalance, toggleHideBalance } = useTradingStore()

  const stats = [
    {
      title: t('dashboard.totalAssets'),
      value: 0,
      change: '+0%',
      trend: 'up',
      icon: Wallet,
      color: 'from-green-500 to-emerald-600',
      isCurrency: true,
      trendValue: '+2.3%',
      trendLabel: language === 'ar' ? 'منذ الأسبوع الماضي' : 'vs last week',
    },
    {
      title: t('dashboard.profitLoss'),
      value: 0,
      change: '+0%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-600',
      isCurrency: true,
      trendValue: '+5.8%',
      trendLabel: language === 'ar' ? 'منذ الأسبوع الماضي' : 'vs last week',
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
      trendValue: '+3.2%',
      trendLabel: language === 'ar' ? 'منذ الأسبوع الماضي' : 'vs last week',
    },
    {
      title: t('dashboard.openTrades'),
      value: 0,
      change: '0',
      trend: 'neutral',
      icon: Activity,
      color: 'from-amber-500 to-orange-600',
      isCurrency: false,
      trendValue: '0',
      trendLabel: language === 'ar' ? 'لا تغيير' : 'no change',
    }
  ]

  return (
    <div className="space-y-6 pb-24 lg:pb-0">
      {/* Header with Theme Toggle */}
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
          <ThemeToggle language={language} />
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
          <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
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
              
              {/* Trend Indicator */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-800/50">
                <div className="flex items-center gap-1">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : stat.trend === 'down' ? (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  ) : (
                    <Activity className="h-3 w-3 text-gray-500" />
                  )}
                  <span className={`text-xs font-medium ${
                    stat.trend === 'up' ? 'text-green-500' : 
                    stat.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {stat.trendValue}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {stat.trendLabel}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Daily Goals + Discipline Streak */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyGoalsCard language={language} />
        <DisciplineStreak language={language} />
      </div>

      {/* Risk Gauges Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-cyan-400" />
            {language === 'ar' ? 'عدادات المخاطر' : 'Risk Gauges'}
          </CardTitle>
          <CardDescription>
            {language === 'ar'
              ? 'مراقبة بصرية لمستوى المخاطر الخاصة بك'
              : 'Visual monitoring of your risk levels'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <RiskGaugeChart 
              value={15} 
              max={100} 
              label={language === 'ar' ? 'المخاطر اليومية' : 'Daily Risk'} 
              language={language} 
            />
            <RiskGaugeChart 
              value={45} 
              max={100} 
              label={language === 'ar' ? 'المخاطر الأسبوعية' : 'Weekly Risk'} 
              language={language} 
            />
            <RiskGaugeChart 
              value={30} 
              max={100} 
              label={language === 'ar' ? 'التراجع الأقصى' : 'Max Drawdown'} 
              language={language} 
            />
            <RiskGaugeChart 
              value={5} 
              max={100} 
              label={language === 'ar' ? 'المخاطر/الصفقة' : 'Risk/Trade'} 
              language={language} 
            />
          </div>
        </CardContent>
      </Card>

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
          <div className="h-[200px] relative flex items-center justify-center border-2 border-dashed rounded-lg overflow-hidden">
            {/* Skeleton Chart */}
            <div className="absolute inset-0 opacity-10">
              <div className="h-full flex items-end gap-2 px-4 pb-4">
                {[40, 65, 45, 80, 55, 70, 60, 85, 50, 75].map((height, i) => (
                  <div 
                    key={i}
                    className="flex-1 bg-gradient-to-t from-cyan-500 to-emerald-500 rounded-t-lg animate-pulse"
                    style={{ height: `${height}%`, animationDelay: `${i * 200}ms` }}
                  />
                ))}
              </div>
            </div>
            
            {/* CTA Overlay */}
            <div className="relative z-10 text-center p-6 bg-gray-900/80 rounded-xl backdrop-blur-sm border border-cyan-500/20">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-7 w-7 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {language === 'ar' ? 'ابدأ رحلتك' : 'Start Your Journey'}
              </h3>
              <p className="text-sm text-gray-400 mb-4 max-w-xs">
                {language === 'ar' 
                  ? 'أضف صفقتك الأولى لرؤية منحنى نمو محفظتك'
                  : 'Add your first trade to see your portfolio growth curve'}
              </p>
              <Button 
                className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-black hover:opacity-90"
                onClick={() => {
                  const store = useTradingStore.getState()
                  store.setActiveSection('trading')
                }}
              >
                {language === 'ar' ? 'أضف صفقة' : 'Add Trade'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Quick Stats */}
      <MobileQuickStats language={language} />
    </div>
  )
}
