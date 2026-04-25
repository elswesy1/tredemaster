'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useI18n } from '@/lib/i18n'
import { useTradingStore } from '@/lib/store'
import { toast } from 'sonner'
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
  Target,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { useRouter } from 'next/navigation'

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

// Types
interface TradingAccount {
  id: string
  userId: string
  name: string
  accountType: 'broker' | 'propfirm' | 'indices' | 'stocks'
  broker?: string
  platform?: string
  balance: number
  equity: number
  currency: string
  connectionStatus?: string
  healthStatus?: string
  currentDrawdown?: number
  maxDrawdown?: number
  propFirmCompany?: string
  propFirmPhase?: string
  profitTarget?: number
  currentProfit?: number
  dailyDrawdownLimit?: number
  dailyDrawdownUsed?: number
  overallDrawdownLimit?: number
  overallDrawdownUsed?: number
  indexSymbol?: string
  exchange?: string
  daysRemaining?: number
  isActive: boolean
}

// Health Status Indicator
function HealthIndicator({ current, max }: { current: number; max: number }) {
  const percentage = max > 0 ? (current / max) * 100 : 0
  
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
  dailyDrawdownLimit,
  dailyDrawdownUsed,
  overallDrawdownLimit,
  overallDrawdownUsed,
  language 
}: { 
  profitTarget?: number | null
  currentProfit?: number
  dailyDrawdownLimit?: number
  dailyDrawdownUsed?: number
  overallDrawdownLimit?: number
  overallDrawdownUsed?: number
  language: string
}) {
  const profitPercentage = profitTarget && currentProfit ? (currentProfit / profitTarget) * 100 : 0
  const dailyLossPercentage = dailyDrawdownLimit && dailyDrawdownUsed ? (dailyDrawdownUsed / dailyDrawdownLimit) * 100 : 0
  const overallLossPercentage = overallDrawdownLimit && overallDrawdownUsed ? (overallDrawdownUsed / overallDrawdownLimit) * 100 : 0

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
              ${(currentProfit || 0).toFixed(0)} / ${profitTarget}
            </span>
          </div>
          <div className="relative">
            <Progress value={profitPercentage} className="h-2 bg-gray-800" />
            <span className="absolute right-0 top-0 text-[10px] text-gray-400 -mt-4">
              {profitPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* Daily Drawdown Distance */}
      {dailyDrawdownLimit && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              {language === 'ar' ? 'الحد اليومي للتراجع' : 'Daily Drawdown Limit'}
            </span>
            <span className={`font-bold ${dailyLossPercentage > 80 ? 'text-red-400' : 'text-yellow-400'}`}>
              ${(dailyDrawdownUsed || 0).toFixed(0)} / ${dailyDrawdownLimit}
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={dailyLossPercentage} 
              className={`h-2 ${dailyLossPercentage > 80 ? 'bg-red-900' : 'bg-gray-800'}`} 
            />
          </div>
        </div>
      )}

      {/* Overall Drawdown Distance */}
      {overallDrawdownLimit && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-400" />
              {language === 'ar' ? 'الحد الإجمالي للتراجع' : 'Overall Drawdown Limit'}
            </span>
            <span className={`font-bold ${overallLossPercentage > 80 ? 'text-red-400' : 'text-orange-400'}`}>
              ${(overallDrawdownUsed || 0).toFixed(0)} / ${overallDrawdownLimit}
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={overallLossPercentage} 
              className={`h-2 ${overallLossPercentage > 80 ? 'bg-red-900' : 'bg-gray-800'}`} 
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Asset Allocation Data for Tree Map
function TreeMap({ data, language }: { data: { name: string; value: number; type: string; color: string }[]; language: string }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  if (data.length === 0 || total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          {language === 'ar' ? 'لا توجد أصول لعرضها' : 'No assets to display'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {data.map((item, index) => {
        const percentage = total > 0 ? (item.value / total) * 100 : 0
        return (
          <div 
            key={index}
            className={`relative rounded-lg p-3 ${percentage > 30 ? 'col-span-2 md:row-span-2' : ''}`}
            style={{ 
              borderColor: item.color,
              backgroundColor: `${item.color}15`
            }}
          >
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
function PropFirmCard({ account, language }: { account: TradingAccount; language: string }) {
  const config = ACCOUNT_TYPES.propfirm
  
  return (
    <Card className={`relative overflow-hidden ${config.borderColor} hover:border-purple-500/50 transition-all`}>
      <TypeBadge type="propfirm" />
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{account.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              {account.propFirmCompany && (
                <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                  {account.propFirmCompany}
                </Badge>
              )}
              {account.propFirmPhase && (
                <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                  {account.propFirmPhase}
                </Badge>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">
            {language === 'ar' ? 'الرصيد' : 'Balance'}
          </span>
          <span className="text-xl font-bold">
            ${account.balance.toLocaleString()}
          </span>
        </div>

        {account.daysRemaining && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">
              {language === 'ar' ? 'الأيام المتبقية' : 'Days Left'}
            </span>
            <Badge variant="outline" className="border-purple-500/30">
              {account.daysRemaining} {language === 'ar' ? 'يوم' : 'days'}
            </Badge>
          </div>
        )}

        <PropFirmDistanceBars
          profitTarget={account.profitTarget}
          currentProfit={account.currentProfit}
          dailyDrawdownLimit={account.dailyDrawdownLimit}
          dailyDrawdownUsed={account.dailyDrawdownUsed}
          overallDrawdownLimit={account.overallDrawdownLimit}
          overallDrawdownUsed={account.overallDrawdownUsed}
          language={language}
        />

        {account.maxDrawdown && (
          <HealthIndicator current={account.currentDrawdown || 0} max={account.maxDrawdown} />
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function PortfolioView() {
  const router = useRouter()
  const { t, language } = useI18n()
  const isRTL = language === 'ar'
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('broker')
  const [accounts, setAccounts] = useState<TradingAccount[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  // Fetch accounts from API
  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/accounts', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setAccounts(data)
      } else {
        console.error('Failed to fetch accounts')
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  // Separate accounts by type
  const brokerAccounts = accounts.filter(a => a.accountType === 'broker')
  const propfirmAccounts = accounts.filter(a => a.accountType === 'propfirm')
  const indicesAccounts = accounts.filter(a => a.accountType === 'indices')
  const stocksAccounts = accounts.filter(a => a.accountType === 'stocks')

  // Calculate totals
  const totals = {
    broker: {
      accounts: brokerAccounts.length,
      balance: brokerAccounts.reduce((sum, a) => sum + a.balance, 0),
      equity: brokerAccounts.reduce((sum, a) => sum + a.equity, 0),
      connected: brokerAccounts.filter(a => a.connectionStatus === 'connected').length
    },
    propfirm: {
      accounts: propfirmAccounts.length,
      balance: propfirmAccounts.reduce((sum, a) => sum + a.balance, 0),
      funded: propfirmAccounts.filter(a => a.propFirmPhase === 'Funded').length,
      active: propfirmAccounts.filter(a => a.isActive).length
    },
    indices: {
      accounts: indicesAccounts.length,
      balance: indicesAccounts.reduce((sum, a) => sum + a.balance, 0),
      equity: indicesAccounts.reduce((sum, a) => sum + a.equity, 0)
    },
    stocks: {
      accounts: stocksAccounts.length,
      balance: stocksAccounts.reduce((sum, a) => sum + a.balance, 0)
    }
  }

  const grandTotal = totals.broker.balance + totals.propfirm.balance + totals.indices.balance + totals.stocks.balance
  const totalAccounts = totals.broker.accounts + totals.propfirm.accounts + totals.indices.accounts + totals.stocks.accounts

  // Asset Allocation Data for Tree Map
  const assetAllocationData = accounts.map(a => ({
    name: a.name,
    value: a.balance,
    type: a.accountType,
    color: ACCOUNT_TYPES[a.accountType as keyof typeof ACCOUNT_TYPES]?.badgeColor.replace('bg-', '#').replace('-500', '-500') || '#3b82f6'
  }))

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
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={fetchAccounts}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            className="bg-gradient-to-r from-green-500 to-emerald-600"
            onClick={() => {
              useTradingStore.getState().setActiveSection('accounts')
              toast.success(language === 'ar' ? 'انتقل إلى قسم الحسابات' : 'Navigating to Accounts section')
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'إضافة حساب' : 'Add Account'}
          </Button>
        </div>
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

      {/* Loading State */}
      {loading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {language === 'ar' ? 'جاري تحميل البيانات...' : 'Loading data...'}
            </p>
          </CardContent>
        </Card>
      ) : accounts.length === 0 ? (
        /* Empty State */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-20 w-20 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
              <Wallet className="h-10 w-10 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {language === 'ar' ? 'لا توجد حسابات بعد' : 'No accounts yet'}
            </h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              {language === 'ar' 
                ? 'ابدأ بإضافة حسابك الأول - وسيط، Prop Firm، مؤشرات، أو أسهم'
                : 'Start by adding your first account - Broker, Prop Firm, Indices, or Stocks'}
            </p>
            <Button 
              className="bg-gradient-to-r from-green-500 to-emerald-600"
              onClick={() => {
                useTradingStore.getState().setActiveSection('accounts')
                toast.success(language === 'ar' ? 'انتقل إلى قسم الحسابات' : 'Navigating to Accounts section')
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'إضافة أول حساب' : 'Add First Account'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
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
                {brokerAccounts.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{brokerAccounts.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="propfirm" className="gap-2">
                <Briefcase className="h-4 w-4" />
                {language === 'ar' ? 'تمويل' : 'Prop Firms'}
                {propfirmAccounts.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{propfirmAccounts.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="indices" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                {language === 'ar' ? 'مؤشرات' : 'Indices'}
                {indicesAccounts.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{indicesAccounts.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="stocks" className="gap-2">
                <LineChart className="h-4 w-4" />
                {language === 'ar' ? 'أسهم' : 'Stocks'}
                {stocksAccounts.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{stocksAccounts.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Broker Tab */}
            <TabsContent value="broker" className="mt-6">
              {brokerAccounts.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Building2 className="h-12 w-12 text-blue-500 mb-4" />
                    <p className="text-muted-foreground">
                      {language === 'ar' ? 'لا توجد حسابات وسطاء' : 'No broker accounts'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {brokerAccounts.map((account) => (
                    <Card key={account.id} className="relative overflow-hidden border-blue-500/30">
                      <TypeBadge type="broker" />
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-bold">{account.name}</h3>
                            <p className="text-sm text-gray-400">{account.broker}</p>
                          </div>
                          <Badge variant={account.connectionStatus === 'connected' ? 'default' : 'secondary'}>
                            {account.connectionStatus || 'disconnected'}
                          </Badge>
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
                          {account.maxDrawdown && (
                            <HealthIndicator current={account.currentDrawdown || 0} max={account.maxDrawdown} />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Prop Firm Tab */}
            <TabsContent value="propfirm" className="mt-6">
              {propfirmAccounts.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Briefcase className="h-12 w-12 text-purple-500 mb-4" />
                    <p className="text-muted-foreground">
                      {language === 'ar' ? 'لا توجد حسابات تمويل' : 'No prop firm accounts'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {propfirmAccounts.map((account) => (
                    <PropFirmCard key={account.id} account={account} language={language} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Indices Tab */}
            <TabsContent value="indices" className="mt-6">
              {indicesAccounts.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <TrendingUp className="h-12 w-12 text-green-500 mb-4" />
                    <p className="text-muted-foreground">
                      {language === 'ar' ? 'لا توجد حسابات مؤشرات' : 'No indices accounts'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {indicesAccounts.map((account) => (
                    <Card key={account.id} className="relative overflow-hidden border-green-500/30">
                      <TypeBadge type="indices" />
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-bold">{account.name}</h3>
                            {account.indexSymbol && (
                              <Badge variant="outline" className="border-green-500/30 text-green-400">
                                {account.indexSymbol}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">
                              {language === 'ar' ? 'الرصيد' : 'Balance'}
                            </span>
                            <span className="font-bold">${account.balance.toLocaleString()}</span>
                          </div>
                          {account.maxDrawdown && (
                            <HealthIndicator current={account.currentDrawdown || 0} max={account.maxDrawdown} />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Stocks Tab */}
            <TabsContent value="stocks" className="mt-6">
              {stocksAccounts.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <LineChart className="h-12 w-12 text-amber-500 mb-4" />
                    <p className="text-muted-foreground">
                      {language === 'ar' ? 'لا توجد حسابات أسهم' : 'No stocks accounts'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stocksAccounts.map((account) => (
                    <Card key={account.id} className="relative overflow-hidden border-amber-500/30">
                      <TypeBadge type="stocks" />
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-bold">{account.name}</h3>
                            <p className="text-sm text-gray-400">{account.exchange}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">
                              {language === 'ar' ? 'الرصيد' : 'Balance'}
                            </span>
                            <span className="font-bold">${account.balance.toLocaleString()}</span>
                          </div>
                          {account.maxDrawdown && (
                            <HealthIndicator current={account.currentDrawdown || 0} max={account.maxDrawdown} />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card 
              className="hover:border-blue-500/50 transition-colors cursor-pointer" 
              onClick={() => {
                useTradingStore.getState().setActiveSection('accounts')
                toast.success(language === 'ar' ? 'إضافة حساب وسيط' : 'Add broker account')
              }}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">{t('portfolio.accountTypes.broker.title')}</p>
                    <p className="text-sm text-muted-foreground">{t('portfolio.accountTypes.broker.subtitle')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="hover:border-purple-500/50 transition-colors cursor-pointer"
              onClick={() => {
                useTradingStore.getState().setActiveSection('accounts')
                toast.success(language === 'ar' ? 'إضافة حساب تمويل' : 'Add prop firm account')
              }}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium">{t('portfolio.accountTypes.propfirm.title')}</p>
                    <p className="text-sm text-muted-foreground">{t('portfolio.accountTypes.propfirm.subtitle')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="hover:border-green-500/50 transition-colors cursor-pointer"
              onClick={() => {
                useTradingStore.getState().setActiveSection('accounts')
                toast.success(language === 'ar' ? 'إضافة حساب مؤشرات' : 'Add indices account')
              }}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">{t('portfolio.accountTypes.indices.title')}</p>
                    <p className="text-sm text-muted-foreground">{t('portfolio.accountTypes.indices.subtitle')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="hover:border-amber-500/50 transition-colors cursor-pointer"
              onClick={() => {
                useTradingStore.getState().setActiveSection('accounts')
                toast.success(language === 'ar' ? 'إضافة محفظة أسهم' : 'Add stocks portfolio')
              }}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <LineChart className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium">{t('portfolio.accountTypes.stocks.title')}</p>
                    <p className="text-sm text-muted-foreground">{t('portfolio.accountTypes.stocks.subtitle')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}