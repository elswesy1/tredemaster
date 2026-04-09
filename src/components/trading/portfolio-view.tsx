'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useI18n } from '@/lib/i18n'
import { useTradingStore } from '@/lib/store'
import { 
  Wallet,
  Building2,
  Briefcase,
  TrendingUp,
  LineChart,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Link2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  AlertTriangle,
  Target
} from 'lucide-react'

// Account Types Configuration
const ACCOUNT_TYPES = {
  broker: {
    icon: Building2,
    gradient: 'from-blue-500 to-cyan-500',
    badgeColor: 'bg-blue-500',
    borderColor: 'border-blue-500/30',
    label: { ar: 'وسيط', en: 'Broker' }
  },
  propfirm: {
    icon: Briefcase,
    gradient: 'from-purple-500 to-pink-500',
    badgeColor: 'bg-purple-500',
    borderColor: 'border-purple-500/30',
    label: { ar: 'شركة تمويل', en: 'Prop Firm' }
  },
  indices: {
    icon: TrendingUp,
    gradient: 'from-green-500 to-emerald-500',
    badgeColor: 'bg-green-500',
    borderColor: 'border-green-500/30',
    label: { ar: 'مؤشرات', en: 'Indices' }
  },
  stocks: {
    icon: LineChart,
    gradient: 'from-amber-500 to-orange-500',
    badgeColor: 'bg-amber-500',
    borderColor: 'border-amber-500/30',
    label: { ar: 'أسهم', en: 'Stocks' }
  }
}

// Prop Firm Templates
const PROP_FIRM_TEMPLATES = [
  { 
    name: 'FTMO', 
    phases: [
      { phase: 'Phase 1', target: 10, maxDailyLoss: 5, maxOverallLoss: 10, minDays: 30 },
      { phase: 'Phase 2', target: 5, maxDailyLoss: 5, maxOverallLoss: 10, minDays: 30 },
      { phase: 'Funded', target: null, maxDailyLoss: 5, maxOverallLoss: 10, minDays: null }
    ]
  },
  { 
    name: 'MFF', 
    phases: [
      { phase: 'Phase 1', target: 8, maxDailyLoss: 5, maxOverallLoss: 12, minDays: 30 },
      { phase: 'Funded', target: null, maxDailyLoss: 5, maxOverallLoss: 12, minDays: null }
    ]
  },
  { 
    name: 'The Funded Trader', 
    phases: [
      { phase: 'Phase 1', target: 10, maxDailyLoss: 5, maxOverallLoss: 10, minDays: 30 },
      { phase: 'Phase 2', target: 5, maxDailyLoss: 5, maxOverallLoss: 10, minDays: 30 }
    ]
  }
]

// Sample sparkline data (7 days equity curve)
const generateSparkline = (trend: 'up' | 'down' | 'flat') => {
  const base = 50
  if (trend === 'up') return [45, 48, 52, 55, 58, 62, 65]
  if (trend === 'down') return [65, 62, 58, 55, 52, 48, 45]
  return [50, 52, 48, 50, 52, 48, 50]
}

// Sample accounts with enhanced data
const sampleAccounts = {
  broker: [
    { 
      id: '1', 
      name: 'IC Markets USD', 
      broker: 'IC Markets', 
      balance: 5000, 
      equity: 5200, 
      status: 'connected', 
      platform: 'MT5',
      sparkline: generateSparkline('up'),
      maxDrawdown: 10,
      currentDrawdown: 2.3
    },
    { 
      id: '2', 
      name: 'Exness EUR', 
      broker: 'Exness', 
      balance: 3000, 
      equity: 2850, 
      status: 'connected', 
      platform: 'MT4',
      sparkline: generateSparkline('down'),
      maxDrawdown: 10,
      currentDrawdown: 5.2
    },
  ],
  propfirm: [
    { 
      id: '3', 
      name: 'FTMO Challenge', 
      company: 'FTMO', 
      phase: 'Phase 1', 
      balance: 10000, 
      target: 10, 
      current: 4.5, 
      profitTarget: 1000,
      currentProfit: 450,
      dailyLossLimit: 500,
      currentDailyLoss: 120,
      overallLossLimit: 1000,
      currentOverallLoss: 250,
      status: 'active',
      sparkline: generateSparkline('up'),
      maxDrawdown: 5,
      currentDrawdown: 1.2,
      daysLeft: 22
    },
    { 
      id: '4', 
      name: 'MFF Funded', 
      company: 'MyForexFunds', 
      phase: 'Funded', 
      balance: 50000, 
      profitTarget: null,
      currentProfit: 1250,
      dailyLossLimit: 2500,
      currentDailyLoss: 380,
      overallLossLimit: 5000,
      currentOverallLoss: 1200,
      status: 'funded',
      sparkline: generateSparkline('flat'),
      maxDrawdown: 5,
      currentDrawdown: 3.8
    },
  ],
  indices: [
    { 
      id: '5', 
      name: 'DAX Scalping', 
      index: 'DAX 40', 
      balance: 8000, 
      equity: 8450, 
      status: 'active',
      sparkline: generateSparkline('up'),
      maxDrawdown: 8,
      currentDrawdown: 2.5
    },
    { 
      id: '6', 
      name: 'NAS100 Swing', 
      index: 'NASDAQ 100', 
      balance: 10000, 
      equity: 9800, 
      status: 'active',
      sparkline: generateSparkline('down'),
      maxDrawdown: 8,
      currentDrawdown: 6.5
    },
  ],
  stocks: [
    { 
      id: '7', 
      name: 'Tech Stocks', 
      exchange: 'NASDAQ', 
      balance: 15000, 
      stocks: ['AAPL', 'GOOGL', 'MSFT'], 
      status: 'active',
      sparkline: generateSparkline('up'),
      maxDrawdown: 15,
      currentDrawdown: 4.2
    },
    { 
      id: '8', 
      name: 'Saudi Stocks', 
      exchange: 'Tadawul', 
      balance: 50000, 
      stocks: ['2222.SR', '1120.SR'], 
      status: 'active',
      sparkline: generateSparkline('flat'),
      maxDrawdown: 15,
      currentDrawdown: 8.5
    },
  ]
}

// Asset Allocation Data for Tree Map
const assetAllocationData = [
  { name: 'FTMO Challenge', value: 10000, type: 'propfirm', color: '#a855f7' },
  { name: 'MFF Funded', value: 50000, type: 'propfirm', color: '#a855f7' },
  { name: 'DAX Scalping', value: 8000, type: 'indices', color: '#22c55e' },
  { name: 'NAS100 Swing', value: 10000, type: 'indices', color: '#22c55e' },
  { name: 'Tech Stocks', value: 15000, type: 'stocks', color: '#f59e0b' },
  { name: 'Saudi Stocks', value: 50000, type: 'stocks', color: '#f59e0b' },
  { name: 'IC Markets', value: 5000, type: 'broker', color: '#3b82f6' },
  { name: 'Exness', value: 3000, type: 'broker', color: '#3b82f6' },
]

// Sparkline SVG Component
function Sparkline({ data, width = 80, height = 30, color = '#10b981' }: { data: number[]; width?: number; height?: number; color?: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
      />
    </svg>
  )
}

// Health Status Indicator
function HealthIndicator({ current, max }: { current: number; max: number }) {
  const percentage = (current / max) * 100
  
  let color = 'bg-green-500'
  let bgColor = 'bg-green-500/10'
  let borderColor = 'border-green-500/30'
  let Icon = CheckCircle
  let label = { ar: 'آمن', en: 'Safe' }
  
  if (percentage > 50) {
    color = 'bg-yellow-500'
    bgColor = 'bg-yellow-500/10'
    borderColor = 'border-yellow-500/30'
    Icon = AlertTriangle
    label = { ar: 'تحذير', en: 'Warning' }
  }
  
  if (percentage > 75) {
    color = 'bg-red-500'
    bgColor = 'bg-red-500/10'
    borderColor = 'border-red-500/30'
    Icon = AlertCircle
    label = { ar: 'خطر', en: 'Danger' }
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${bgColor} border ${borderColor}`}>
      <Icon className={`h-4 w-4 ${color.replace('bg-', 'text-')}`} />
      <div className="flex flex-col">
        <span className="text-xs font-medium">{label.ar}</span>
        <span className="text-[10px] text-gray-400">{current.toFixed(1)}% / {max}%</span>
      </div>
    </div>
  )
}

// Type Badge Component
function TypeBadge({ type }: { type: keyof typeof ACCOUNT_TYPES }) {
  const config = ACCOUNT_TYPES[type]
  
  return (
    <div className={`absolute top-0 left-0 right-0 h-1 ${config.badgeColor}`} />
  )
}

// Prop Firm Distance Bars Component
function PropFirmDistanceBars({ 
  profitTarget, 
  currentProfit, 
  dailyLossLimit, 
  currentDailyLoss,
  overallLossLimit,
  currentOverallLoss,
  language 
}: { 
  profitTarget: number | null
  currentProfit: number
  dailyLossLimit: number
  currentDailyLoss: number
  overallLossLimit: number
  currentOverallLoss: number
  language: string
}) {
  const profitPercentage = profitTarget ? (currentProfit / profitTarget) * 100 : 0
  const dailyLossPercentage = (currentDailyLoss / dailyLossLimit) * 100
  const overallLossPercentage = (currentOverallLoss / overallLossLimit) * 100

  return (
    <div className="space-y-3 mt-4 p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
      {/* Profit Target Distance */}
      {profitTarget && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-400" />
              {language === 'ar' ? 'المسافة للهدف' : 'Distance to Target'}
            </span>
            <span className="text-green-400 font-bold">
              ${currentProfit.toFixed(0)} / ${profitTarget}
            </span>
          </div>
          <div className="relative">
            <Progress value={profitPercentage} className="h-2 bg-gray-800" />
            <span className="absolute right-0 top-0 text-[10px] text-gray-400 -mt-4">
              {profitPercentage.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-gray-400">
            {language === 'ar' 
              ? `متبقي: $${(profitTarget - currentProfit).toFixed(0)} (${(100 - profitPercentage).toFixed(1)}%)`
              : `Remaining: $${(profitTarget - currentProfit).toFixed(0)} (${(100 - profitPercentage).toFixed(1)}%)`}
          </p>
        </div>
      )}

      {/* Daily Drawdown Distance */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            {language === 'ar' ? 'الحد اليومي للتراجع' : 'Daily Drawdown Limit'}
          </span>
          <span className={`font-bold ${dailyLossPercentage > 80 ? 'text-red-400' : 'text-yellow-400'}`}>
            ${currentDailyLoss.toFixed(0)} / ${dailyLossLimit}
          </span>
        </div>
        <div className="relative">
          <Progress 
            value={dailyLossPercentage} 
            className={`h-2 ${dailyLossPercentage > 80 ? 'bg-red-900' : 'bg-gray-800'}`} 
          />
          <span className="absolute right-0 top-0 text-[10px] text-gray-400 -mt-4">
            {dailyLossPercentage.toFixed(1)}%
          </span>
        </div>
        <p className={`text-xs ${dailyLossPercentage > 80 ? 'text-red-400' : 'text-gray-400'}`}>
          {language === 'ar' 
            ? `متبقي: $${(dailyLossLimit - currentDailyLoss).toFixed(0)} للحد اليومي`
            : `Remaining: $${(dailyLossLimit - currentDailyLoss).toFixed(0)} daily limit`}
        </p>
      </div>

      {/* Overall Drawdown Distance */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-red-400" />
            {language === 'ar' ? 'الحد الإجمالي للتراجع' : 'Overall Drawdown Limit'}
          </span>
          <span className={`font-bold ${overallLossPercentage > 80 ? 'text-red-400' : 'text-orange-400'}`}>
            ${currentOverallLoss.toFixed(0)} / ${overallLossLimit}
          </span>
        </div>
        <div className="relative">
          <Progress 
            value={overallLossPercentage} 
            className={`h-2 ${overallLossPercentage > 80 ? 'bg-red-900' : 'bg-gray-800'}`} 
          />
          <span className="absolute right-0 top-0 text-[10px] text-gray-400 -mt-4">
            {overallLossPercentage.toFixed(1)}%
          </span>
        </div>
        <p className={`text-xs ${overallLossPercentage > 80 ? 'text-red-400' : 'text-gray-400'}`}>
          {language === 'ar' 
            ? `متبقي: $${(overallLossLimit - currentOverallLoss).toFixed(0)} للحد الإجمالي`
            : `Remaining: $${(overallLossLimit - currentOverallLoss).toFixed(0)} overall limit`}
        </p>
      </div>
    </div>
  )
}

// Tree Map Component for Asset Allocation
function TreeMap({ data, language }: { data: typeof assetAllocationData; language: string }) {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0)
  
  // Calculate grid layout (simplified tree map)
  const sortedData = [...data].sort((a, b) => b.value - a.value)
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 auto-rows-fr">
      {sortedData.map((item, index) => {
        const percentage = ((item.value / totalValue) * 100)
        const isLarge = percentage > 20
        
        return (
          <div
            key={index}
            className={`
              relative rounded-lg border-2 overflow-hidden
              ${isLarge ? 'md:col-span-2 md:row-span-2' : ''}
            `}
            style={{ 
              borderColor: item.color,
              backgroundColor: `${item.color}15`
            }}
          >
            {/* Content */}
            <div className="p-3 h-full flex flex-col justify-between">
              <div>
                <p className="font-bold text-white text-sm">{item.name}</p>
                <p className="text-xs text-gray-400 mt-1">
                  ${item.value.toLocaleString()}
                </p>
              </div>
              <div className="flex items-end justify-between mt-2">
                <Badge 
                  variant="outline" 
                  className="text-[10px]"
                  style={{ borderColor: item.color, color: item.color }}
                >
                  {percentage.toFixed(1)}%
                </Badge>
                {percentage > 30 && (
                  <div className="flex items-center gap-1 text-yellow-500 text-[10px]">
                    <AlertTriangle className="h-3 w-3" />
                    {language === 'ar' ? 'تركيز عالي' : 'High Exposure'}
                  </div>
                )}
              </div>
            </div>
            
            {/* Size indicator bar */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-1"
              style={{ 
                backgroundColor: item.color,
                opacity: 0.5
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

// Prop Firm Account Card
function PropFirmCard({ account, language }: { account: typeof sampleAccounts.propfirm[0]; language: string }) {
  const config = ACCOUNT_TYPES.propfirm
  
  return (
    <Card className={`relative overflow-hidden ${config.borderColor} hover:border-purple-500/50 transition-all`}>
      <TypeBadge type="propfirm" />
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{account.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                {account.company}
              </Badge>
              <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                {account.phase}
              </Badge>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Sparkline data={account.sparkline} color="#a855f7" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Balance */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">
            {language === 'ar' ? 'الرصيد' : 'Balance'}
          </span>
          <span className="text-xl font-bold">
            ${account.balance.toLocaleString()}
          </span>
        </div>

        {/* Days Left (if applicable) */}
        {account.daysLeft && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">
              {language === 'ar' ? 'الأيام المتبقية' : 'Days Left'}
            </span>
            <Badge variant="outline" className="border-purple-500/30">
              {account.daysLeft} {language === 'ar' ? 'يوم' : 'days'}
            </Badge>
          </div>
        )}

        {/* Prop Firm Distance Bars */}
        <PropFirmDistanceBars
          profitTarget={account.profitTarget}
          currentProfit={account.currentProfit}
          dailyLossLimit={account.dailyLossLimit}
          currentDailyLoss={account.currentDailyLoss}
          overallLossLimit={account.overallLossLimit}
          currentOverallLoss={account.currentOverallLoss}
          language={language}
        />

        {/* Health Indicator */}
        <HealthIndicator current={account.currentDrawdown} max={account.maxDrawdown} />

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
          </Button>
          <Button variant="outline" size="sm">
            <Link2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function PortfolioView() {
  const { t, language } = useI18n()
  const isRTL = language === 'ar'
  const [activeTab, setActiveTab] = useState('broker')

  // Calculate totals
  const totals = {
    broker: {
      accounts: sampleAccounts.broker.length,
      balance: sampleAccounts.broker.reduce((sum, a) => sum + a.balance, 0),
      equity: sampleAccounts.broker.reduce((sum, a) => sum + a.equity, 0),
      connected: sampleAccounts.broker.filter(a => a.status === 'connected').length
    },
    propfirm: {
      accounts: sampleAccounts.propfirm.length,
      balance: sampleAccounts.propfirm.reduce((sum, a) => sum + a.balance, 0),
      funded: sampleAccounts.propfirm.filter(a => a.status === 'funded').length,
      active: sampleAccounts.propfirm.filter(a => a.status === 'active').length
    },
    indices: {
      accounts: sampleAccounts.indices.length,
      balance: sampleAccounts.indices.reduce((sum, a) => sum + a.balance, 0),
      equity: sampleAccounts.indices.reduce((sum, a) => sum + a.equity, 0)
    },
    stocks: {
      accounts: sampleAccounts.stocks.length,
      balance: sampleAccounts.stocks.reduce((sum, a) => sum + a.balance, 0)
    }
  }

  const grandTotal = totals.broker.balance + totals.propfirm.balance + totals.indices.balance + totals.stocks.balance
  const totalAccounts = totals.broker.accounts + totals.propfirm.accounts + totals.indices.accounts + totals.stocks.accounts

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6 text-green-500" />
            {language === 'ar' ? 'إدارة الحسابات' : 'Account Management'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {language === 'ar' 
              ? 'إدارة جميع حساباتك وأصولك في مكان واحد'
              : 'Manage all your accounts and assets in one place'}
          </p>
        </div>
        <Button 
          className="bg-gradient-to-r from-green-500 to-emerald-600"
          onClick={() => useTradingStore.getState().setActiveSection('accounts')}
        >
          <Plus className="h-4 w-4 mr-2" />
          {language === 'ar' ? 'إضافة حساب' : 'Add Account'}
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  {language === 'ar' ? 'إجمالي الرصيد' : 'Total Balance'}
                </p>
                <p className="text-2xl font-bold mt-1">
                  ${grandTotal.toLocaleString()}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  {language === 'ar' ? 'عدد الحسابات' : 'Total Accounts'}
                </p>
                <p className="text-2xl font-bold mt-1">{totalAccounts}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  {language === 'ar' ? 'حسابات التمويل' : 'Prop Firms'}
                </p>
                <p className="text-2xl font-bold mt-1">{totals.propfirm.accounts}</p>
              </div>
              <Briefcase className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  {language === 'ar' ? 'الحسابات المتصلة' : 'Connected'}
                </p>
                <p className="text-2xl font-bold mt-1">{totals.broker.connected}</p>
              </div>
              <Link2 className="h-8 w-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset Allocation Tree Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-green-500" />
            {language === 'ar' ? 'توزيع الأصول' : 'Asset Allocation'}
          </CardTitle>
          <CardDescription>
            {language === 'ar' 
              ? 'خريطة توضح توزيع محفظتك المالية'
              : 'Visual map of your portfolio distribution'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TreeMap data={assetAllocationData} language={language} />
        </CardContent>
      </Card>

      {/* Account Types Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="broker" className="gap-2">
            <Building2 className="h-4 w-4" />
            {language === 'ar' ? 'وسطاء' : 'Brokers'}
          </TabsTrigger>
          <TabsTrigger value="propfirm" className="gap-2">
            <Briefcase className="h-4 w-4" />
            {language === 'ar' ? 'تمويل' : 'Prop Firms'}
          </TabsTrigger>
          <TabsTrigger value="indices" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            {language === 'ar' ? 'مؤشرات' : 'Indices'}
          </TabsTrigger>
          <TabsTrigger value="stocks" className="gap-2">
            <LineChart className="h-4 w-4" />
            {language === 'ar' ? 'أسهم' : 'Stocks'}
          </TabsTrigger>
        </TabsList>

        {/* Broker Tab */}
        <TabsContent value="broker" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sampleAccounts.broker.map((account) => (
              <Card key={account.id} className="relative overflow-hidden border-blue-500/30">
                <TypeBadge type="broker" />
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold">{account.name}</h3>
                      <p className="text-sm text-gray-400">{account.broker}</p>
                    </div>
                    <Sparkline data={account.sparkline} color="#3b82f6" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">
                        {language === 'ar' ? 'الرصيد' : 'Balance'}
                      </span>
                      <span className="font-bold">${account.balance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">
                        {language === 'ar' ? 'الأسهم' : 'Equity'}
                      </span>
                      <span className="font-bold">${account.equity.toLocaleString()}</span>
                    </div>
                    <HealthIndicator current={account.currentDrawdown} max={account.maxDrawdown} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Prop Firm Tab */}
        <TabsContent value="propfirm" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sampleAccounts.propfirm.map((account) => (
              <PropFirmCard key={account.id} account={account} language={language} />
            ))}
          </div>
        </TabsContent>

        {/* Indices Tab */}
        <TabsContent value="indices" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sampleAccounts.indices.map((account) => (
              <Card key={account.id} className="relative overflow-hidden border-green-500/30">
                <TypeBadge type="indices" />
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold">{account.name}</h3>
                      <Badge variant="outline" className="border-green-500/30 text-green-400">
                        {account.index}
                      </Badge>
                    </div>
                    <Sparkline data={account.sparkline} color="#22c55e" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">
                        {language === 'ar' ? 'الرصيد' : 'Balance'}
                      </span>
                      <span className="font-bold">${account.balance.toLocaleString()}</span>
                    </div>
                    <HealthIndicator current={account.currentDrawdown} max={account.maxDrawdown} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Stocks Tab */}
        <TabsContent value="stocks" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sampleAccounts.stocks.map((account) => (
              <Card key={account.id} className="relative overflow-hidden border-amber-500/30">
                <TypeBadge type="stocks" />
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold">{account.name}</h3>
                      <p className="text-sm text-gray-400">{account.exchange}</p>
                    </div>
                    <Sparkline data={account.sparkline} color="#f59e0b" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">
                        {language === 'ar' ? 'الرصيد' : 'Balance'}
                      </span>
                      <span className="font-bold">${account.balance.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {account.stocks.map((stock) => (
                        <Badge key={stock} variant="outline" className="border-amber-500/30 text-amber-400 text-xs">
                          {stock}
                        </Badge>
                      ))}
                    </div>
                    <HealthIndicator current={account.currentDrawdown} max={account.maxDrawdown} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:border-blue-500/50 transition-colors cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">
                  {language === 'ar' ? 'ربط وسيط' : 'Connect Broker'}
                </p>
                <p className="text-sm text-gray-400">MT4 / MT5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-purple-500/50 transition-colors cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="font-medium">
                  {language === 'ar' ? 'حساب تمويل' : 'Prop Firm'}
                </p>
                <p className="text-sm text-gray-400">
                  {language === 'ar' ? 'قوالب جاهزة' : 'Ready Templates'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-green-500/50 transition-colors cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="font-medium">
                  {language === 'ar' ? 'تداول مؤشرات' : 'Indices Trading'}
                </p>
                <p className="text-sm text-gray-400">DAX / NASDAQ</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-amber-500/50 transition-colors cursor-pointer">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <LineChart className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="font-medium">
                  {language === 'ar' ? 'محفظة أسهم' : 'Stocks Portfolio'}
                </p>
                <p className="text-sm text-gray-400">
                  {language === 'ar' ? 'إدارة محلية' : 'Local Management'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}