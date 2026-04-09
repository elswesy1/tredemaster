'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { 
  Plus, 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  PieChart,
  Link2,
  Building2,
  Server,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  CreditCard,
  BarChart3,
  LineChart,
  Coins,
  Landmark,
  ChartLine,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Calendar,
  Clock,
  Zap,
  Award,
  Percent,
  Activity,
  Gauge
} from 'lucide-react'
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart } from 'recharts'

// Types
interface TradingAccount {
  id: string
  userId: string
  name: string
  accountType: 'broker' | 'propfirm' | 'indices' | 'stocks'
  
  // Broker fields
  broker?: string
  platform?: 'mt4' | 'mt5' | 'ctrader' | 'tradingview' | 'other'
  server?: string
  accountNumber?: string
  balance: number
  equity: number
  margin?: number
  freeMargin?: number
  marginLevel?: number
  leverage: number
  currency: string
  
  // Prop Firm fields
  propFirmCompany?: string
  challengeType?: 'one_phase' | 'two_phase'
  phase?: 'phase1' | 'phase2' | 'funded'
  targetProfit?: number
  maxDrawdown?: number
  dailyDrawdownLimit?: number
  tradingDays?: number
  startDate?: Date
  endDate?: Date
  status: 'active' | 'inactive' | 'passed' | 'failed'
  
  // Indices fields
  indexName?: string
  indexSymbol?: string
  
  // Stocks fields
  exchange?: string
  sector?: string
  shares?: number
  
  // Common
  connectionMethod: 'manual' | 'mt4' | 'mt5' | 'tradingview' | 'api'
  autoSync: boolean
  lastSync?: Date
  isActive: boolean
  notes?: string
  createdAt: Date
  updatedAt: Date
}

interface AccountStats {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalProfit: number
  grossProfit: number
  grossLoss: number
  profitFactor: number
  avgTrade: number
  avgWin: number
  avgLoss: number
  bestTrade: number
  worstTrade: number
}

interface FormData {
  name: string
  accountType: 'broker' | 'propfirm' | 'indices' | 'stocks'
  broker: string
  platform: string
  server: string
  accountNumber: string
  password: string
  balance: string
  equity: string
  leverage: string
  currency: string
  propFirmCompany: string
  challengeType: 'one_phase' | 'two_phase'
  phase: 'phase1' | 'phase2' | 'funded'
  targetProfit: string
  maxDrawdown: string
  dailyDrawdownLimit: string
  tradingDays: string
  startDate: string
  endDate: string
  indexName: string
  indexSymbol: string
  exchange: string
  sector: string
  shares: string
  connectionMethod: 'manual' | 'mt4' | 'mt5' | 'tradingview' | 'api'
  autoSync: boolean
  notes: string
}

const initialFormData: FormData = {
  name: '',
  accountType: 'broker',
  broker: '',
  platform: 'mt4',
  server: '',
  accountNumber: '',
  password: '',
  balance: '',
  equity: '',
  leverage: '100',
  currency: 'USD',
  propFirmCompany: '',
  challengeType: 'two_phase',
  phase: 'phase1',
  targetProfit: '',
  maxDrawdown: '',
  dailyDrawdownLimit: '',
  tradingDays: '',
  startDate: '',
  endDate: '',
  indexName: '',
  indexSymbol: '',
  exchange: '',
  sector: '',
  shares: '',
  connectionMethod: 'manual',
  autoSync: false,
  notes: ''
}

// Colors for charts
const COLORS = ['#22C55E', '#3B82F6', '#A855F7', '#F59E0B', '#EF4444', '#06B6D4']

export function TradingAccountsView() {
  const { t, language } = useI18n()
  
  const isRTL = language === 'ar'
  
  // State
  const [accounts, setAccounts] = useState<TradingAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<TradingAccount | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState<Record<string, AccountStats>>({})
  
  // Fetch accounts
  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/trading-accounts', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setAccounts(data)
        
        // Fetch stats for each account
        data.forEach((account: TradingAccount) => {
          fetchAccountStats(account.id)
        })
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAccountStats = async (accountId: string) => {
    try {
      const response = await fetch(`/api/trading-accounts/${accountId}/stats`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setStats(prev => ({ ...prev, [accountId]: data.performance }))
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  // Calculate portfolio stats
  const portfolioStats = {
    totalBalance: accounts.reduce((sum, a) => sum + a.balance, 0),
    totalEquity: accounts.reduce((sum, a) => sum + a.equity, 0),
    totalProfit: Object.values(stats).reduce((sum, s) => sum + s.totalProfit, 0),
    totalAccounts: accounts.length,
    activeAccounts: accounts.filter(a => a.isActive).length,
    brokerAccounts: accounts.filter(a => a.accountType === 'broker').length,
    propFirmAccounts: accounts.filter(a => a.accountType === 'propfirm').length,
    indicesAccounts: accounts.filter(a => a.accountType === 'indices').length,
    stocksAccounts: accounts.filter(a => a.accountType === 'stocks').length
  }
  
  const totalProfitPercent = portfolioStats.totalBalance > 0 
    ? (portfolioStats.totalProfit / portfolioStats.totalBalance) * 100 
    : 0

  // Distribution data for charts
  const distributionByType = accounts.reduce((acc, account) => {
    const type = account.accountType
    const existing = acc.find(a => a.name === type)
    if (existing) {
      existing.value += account.equity
    } else {
      acc.push({ 
        name: type, 
        value: account.equity,
        label: t(`portfolio.accountTypes.${type}.title`)
      })
    }
    return acc
  }, [] as { name: string; value: number; label: string }[])

  // Performance chart data (last 7 days)
  const performanceData = [
    { day: language === 'ar' ? 'السبت' : 'Sat', profit: 250 },
    { day: language === 'ar' ? 'الأحد' : 'Sun', profit: -120 },
    { day: language === 'ar' ? 'الاثنين' : 'Mon', profit: 380 },
    { day: language === 'ar' ? 'الثلاثاء' : 'Tue', profit: 150 },
    { day: language === 'ar' ? 'الأربعاء' : 'Wed', profit: -80 },
    { day: language === 'ar' ? 'الخميس' : 'Thu', profit: 420 },
    { day: language === 'ar' ? 'الجمعة' : 'Fri', profit: 290 },
  ]

  // Handle add account
  const handleAddAccount = async () => {
    if (!formData.name) {
      toast.error(t('portfolio.messages.requiredFields'))
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/trading-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          balance: parseFloat(formData.balance) || 0,
          equity: parseFloat(formData.equity) || 0,
          leverage: parseFloat(formData.leverage) || 100,
          targetProfit: parseFloat(formData.targetProfit) || 0,
          maxDrawdown: parseFloat(formData.maxDrawdown) || 0,
          dailyDrawdownLimit: parseFloat(formData.dailyDrawdownLimit) || 0,
          tradingDays: parseInt(formData.tradingDays) || 0,
          shares: parseFloat(formData.shares) || 0,
          userId: 'default-user'
        })
      })

      if (response.ok) {
        toast.success(t('portfolio.messages.accountAdded'))
        setShowAddDialog(false)
        setFormData(initialFormData)
        fetchAccounts()
      } else {
        throw new Error('Failed to add account')
      }
    } catch (error) {
      console.error('Error adding account:', error)
      toast.error(t('portfolio.messages.connectionError'))
    } finally {
      setSaving(false)
    }
  }

  // Handle edit account
  const handleEditAccount = async () => {
    if (!selectedAccount || !formData.name) {
      toast.error(t('portfolio.messages.requiredFields'))
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/trading-accounts/${selectedAccount.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          balance: parseFloat(formData.balance) || 0,
          equity: parseFloat(formData.equity) || 0,
          leverage: parseFloat(formData.leverage) || 100,
          targetProfit: parseFloat(formData.targetProfit) || 0,
          maxDrawdown: parseFloat(formData.maxDrawdown) || 0,
          dailyDrawdownLimit: parseFloat(formData.dailyDrawdownLimit) || 0,
          tradingDays: parseInt(formData.tradingDays) || 0,
          shares: parseFloat(formData.shares) || 0,
        })
      })

      if (response.ok) {
        toast.success(t('portfolio.messages.accountUpdated'))
        setShowEditDialog(false)
        setSelectedAccount(null)
        setFormData(initialFormData)
        fetchAccounts()
      } else {
        throw new Error('Failed to update account')
      }
    } catch (error) {
      console.error('Error updating account:', error)
      toast.error(t('portfolio.messages.connectionError'))
    } finally {
      setSaving(false)
    }
  }

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (!selectedAccount) return

    try {
      const response = await fetch(`/api/trading-accounts/${selectedAccount.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        toast.success(t('portfolio.messages.accountDeleted'))
        setShowDeleteDialog(false)
        setSelectedAccount(null)
        fetchAccounts()
      } else {
        throw new Error('Failed to delete account')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error(t('portfolio.messages.connectionError'))
    }
  }

  // Handle sync
  const handleSync = async (account: TradingAccount) => {
    setAccounts(accounts.map(a => 
      a.id === account.id ? { ...a, status: 'active' as const } : a
    ))
    
    try {
      const response = await fetch(`/api/trading-accounts/${account.id}/sync`, {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        toast.success(t('portfolio.messages.syncSuccess'))
        fetchAccounts()
      }
    } catch (error) {
      console.error('Error syncing:', error)
      toast.error(t('portfolio.messages.syncFailed'))
    }
  }

  // Open edit dialog
  const openEditDialog = (account: TradingAccount) => {
    setSelectedAccount(account)
    setFormData({
      name: account.name,
      accountType: account.accountType,
      broker: account.broker || '',
      platform: account.platform || 'mt4',
      server: account.server || '',
      accountNumber: account.accountNumber || '',
      password: '',
      balance: account.balance.toString(),
      equity: account.equity.toString(),
      leverage: account.leverage.toString(),
      currency: account.currency,
      propFirmCompany: account.propFirmCompany || '',
      challengeType: account.challengeType || 'two_phase',
      phase: account.phase || 'phase1',
      targetProfit: account.targetProfit?.toString() || '',
      maxDrawdown: account.maxDrawdown?.toString() || '',
      dailyDrawdownLimit: account.dailyDrawdownLimit?.toString() || '',
      tradingDays: account.tradingDays?.toString() || '',
      startDate: account.startDate?.toString().split('T')[0] || '',
      endDate: account.endDate?.toString().split('T')[0] || '',
      indexName: account.indexName || '',
      indexSymbol: account.indexSymbol || '',
      exchange: account.exchange || '',
      sector: account.sector || '',
      shares: account.shares?.toString() || '',
      connectionMethod: account.connectionMethod,
      autoSync: account.autoSync,
      notes: account.notes || ''
    })
    setShowEditDialog(true)
  }

  // Get account type icon
  const getAccountTypeIcon = (type: TradingAccount['accountType']) => {
    switch (type) {
      case 'broker':
        return Building2
      case 'propfirm':
        return Award
      case 'indices':
        return LineChart
      case 'stocks':
        return TrendingUp
    }
  }

  // Get status badge
  const getStatusBadge = (account: TradingAccount) => {
    if (account.accountType === 'propfirm') {
      if (account.phase === 'funded') {
        return { color: 'bg-green-500/20 text-green-500 border-green-500/30', text: language === 'ar' ? 'ممول' : 'Funded' }
      }
      if (account.phase === 'phase1') {
        return { color: 'bg-blue-500/20 text-blue-500 border-blue-500/30', text: language === 'ar' ? 'المرحلة 1' : 'Phase 1' }
      }
      if (account.phase === 'phase2') {
        return { color: 'bg-purple-500/20 text-purple-500 border-purple-500/30', text: language === 'ar' ? 'المرحلة 2' : 'Phase 2' }
      }
    }
    
    if (account.isActive) {
      return { color: 'bg-green-500/20 text-green-500 border-green-500/30', text: language === 'ar' ? 'نشط' : 'Active' }
    }
    
    return { color: 'bg-gray-500/20 text-gray-500 border-gray-500/30', text: language === 'ar' ? 'غير نشط' : 'Inactive' }
  }

  // Render form content
  const renderFormContent = (isEdit = false) => (
    <div className="space-y-6">
      {/* Account Type Selection */}
      <div className="space-y-3">
        <Label>{t('portfolio.accountTypes.title')}</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['broker', 'propfirm', 'indices', 'stocks'] as const).map((type) => {
            const Icon = getAccountTypeIcon(type)
            const isSelected = formData.accountType === type
            return (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, accountType: type })}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all text-center',
                  isSelected 
                    ? 'border-cyan-500 bg-cyan-500/10' 
                    : 'border-gray-700 hover:border-gray-600'
                )}
              >
                <Icon className={cn(
                  'w-8 h-8 mx-auto mb-2',
                  isSelected ? 'text-cyan-400' : 'text-gray-400'
                )} />
                <p className="text-sm font-medium">{t(`portfolio.accountTypes.${type}.title`)}</p>
                <p className="text-xs text-gray-500 mt-1">{t(`portfolio.accountTypes.${type}.subtitle`)}</p>
              </button>
            )
          })}
        </div>
      </div>

      <Separator />

      {/* Common Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('portfolio.accountName')} *</Label>
          <Input 
            placeholder={language === 'ar' ? 'مثال: حساب IC Markets رئيسي' : 'e.g., IC Markets Main'}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>{t('portfolio.currency')}</Label>
          <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="SAR">SAR</SelectItem>
              <SelectItem value="AED">AED</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Broker Fields */}
      {formData.accountType === 'broker' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('portfolio.brokerDetails.brokerName')}</Label>
              <Input 
                placeholder="IC Markets, Exness, etc."
                value={formData.broker}
                onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('portfolio.brokerDetails.platform')}</Label>
              <Select value={formData.platform} onValueChange={(v) => setFormData({ ...formData, platform: v as FormData['platform'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mt4">MetaTrader 4</SelectItem>
                  <SelectItem value="mt5">MetaTrader 5</SelectItem>
                  <SelectItem value="ctrader">cTrader</SelectItem>
                  <SelectItem value="tradingview">TradingView</SelectItem>
                  <SelectItem value="other">{language === 'ar' ? 'أخرى' : 'Other'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t('portfolio.brokerDetails.accountNumber')}</Label>
              <Input 
                placeholder="12345678"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('portfolio.brokerDetails.server')}</Label>
              <Input 
                placeholder="ICMarketsSC-Demo"
                value={formData.server}
                onChange={(e) => setFormData({ ...formData, server: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('portfolio.brokerDetails.leverage')}</Label>
              <Select value={formData.leverage} onValueChange={(v) => setFormData({ ...formData, leverage: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1:1</SelectItem>
                  <SelectItem value="10">1:10</SelectItem>
                  <SelectItem value="50">1:50</SelectItem>
                  <SelectItem value="100">1:100</SelectItem>
                  <SelectItem value="200">1:200</SelectItem>
                  <SelectItem value="500">1:500</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('portfolio.brokerDetails.balance')}</Label>
              <Input 
                type="number"
                placeholder="10000"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('portfolio.brokerDetails.equity')}</Label>
              <Input 
                type="number"
                placeholder="10000"
                value={formData.equity}
                onChange={(e) => setFormData({ ...formData, equity: e.target.value })}
              />
            </div>
          </div>

          {!isEdit && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t('portfolio.brokerDetails.password')}</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Input 
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          )}
        </>
      )}

      {/* Prop Firm Fields */}
      {formData.accountType === 'propfirm' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('portfolio.propfirmDetails.company')}</Label>
              <Input 
                placeholder="FTMO, MFF, etc."
                value={formData.propFirmCompany}
                onChange={(e) => setFormData({ ...formData, propFirmCompany: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('portfolio.propfirmDetails.challengeType')}</Label>
              <Select value={formData.challengeType} onValueChange={(v) => setFormData({ ...formData, challengeType: v as FormData['challengeType'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one_phase">{language === 'ar' ? 'مرحلة واحدة' : 'One Phase'}</SelectItem>
                  <SelectItem value="two_phase">{language === 'ar' ? 'مرحلتين' : 'Two Phase'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('portfolio.propfirmDetails.challengePhase')}</Label>
              <Select value={formData.phase} onValueChange={(v) => setFormData({ ...formData, phase: v as FormData['phase'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phase1">{language === 'ar' ? 'المرحلة الأولى' : 'Phase 1'}</SelectItem>
                  <SelectItem value="phase2">{language === 'ar' ? 'المرحلة الثانية' : 'Phase 2'}</SelectItem>
                  <SelectItem value="funded">{language === 'ar' ? 'ممول' : 'Funded'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('portfolio.propfirmDetails.tradingDays')}</Label>
              <Input 
                type="number"
                placeholder="30"
                value={formData.tradingDays}
                onChange={(e) => setFormData({ ...formData, tradingDays: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t('portfolio.propfirmDetails.target')} (%)</Label>
              <Input 
                type="number"
                placeholder="10"
                value={formData.targetProfit}
                onChange={(e) => setFormData({ ...formData, targetProfit: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('portfolio.propfirmDetails.maxDrawdown')} (%)</Label>
              <Input 
                type="number"
                placeholder="10"
                value={formData.maxDrawdown}
                onChange={(e) => setFormData({ ...formData, maxDrawdown: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('portfolio.propfirmDetails.dailyDrawdown')} (%)</Label>
              <Input 
                type="number"
                placeholder="5"
                value={formData.dailyDrawdownLimit}
                onChange={(e) => setFormData({ ...formData, dailyDrawdownLimit: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('portfolio.propfirmDetails.startDate')}</Label>
              <Input 
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('portfolio.propfirmDetails.endDate')}</Label>
              <Input 
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>
        </>
      )}

      {/* Indices Fields */}
      {formData.accountType === 'indices' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('portfolio.indicesDetails.indexName')}</Label>
              <Input 
                placeholder={language === 'ar' ? 'داكس، ناسداك...' : 'DAX, NASDAQ...'}
                value={formData.indexName}
                onChange={(e) => setFormData({ ...formData, indexName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('portfolio.indicesDetails.symbol')}</Label>
              <Input 
                placeholder="GER40, US100"
                value={formData.indexSymbol}
                onChange={(e) => setFormData({ ...formData, indexSymbol: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('portfolio.brokerDetails.balance')}</Label>
              <Input 
                type="number"
                placeholder="10000"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('portfolio.brokerDetails.leverage')}</Label>
              <Select value={formData.leverage} onValueChange={(v) => setFormData({ ...formData, leverage: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1:1</SelectItem>
                  <SelectItem value="10">1:10</SelectItem>
                  <SelectItem value="50">1:50</SelectItem>
                  <SelectItem value="100">1:100</SelectItem>
                  <SelectItem value="200">1:200</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}

      {/* Stocks Fields */}
      {formData.accountType === 'stocks' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('portfolio.stocksDetails.exchange')}</Label>
              <Input 
                placeholder="NYSE, NASDAQ, LSE"
                value={formData.exchange}
                onChange={(e) => setFormData({ ...formData, exchange: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('portfolio.stocksDetails.sector')}</Label>
              <Input 
                placeholder={language === 'ar' ? 'تكنولوجيا، رعاية صحية...' : 'Technology, Healthcare...'}
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('portfolio.stocksDetails.shares')}</Label>
              <Input 
                type="number"
                placeholder="100"
                value={formData.shares}
                onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('portfolio.brokerDetails.balance')}</Label>
              <Input 
                type="number"
                placeholder="10000"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              />
            </div>
          </div>
        </>
      )}

      <Separator />

      {/* Connection Method */}
      <div className="space-y-3">
        <Label>{t('assets.connectionMethod')}</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(['manual', 'mt4', 'mt5', 'tradingview'] as const).map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setFormData({ ...formData, connectionMethod: method })}
              className={cn(
                'px-4 py-2 rounded-lg border transition-all text-sm',
                formData.connectionMethod === method 
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' 
                  : 'border-gray-700 hover:border-gray-600'
              )}
            >
              {t(`assets.connection.${method}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Auto Sync */}
      {formData.connectionMethod !== 'manual' && (
        <div className="flex items-center justify-between">
          <div>
            <Label>{t('portfolio.brokerDetails.autoSync')}</Label>
            <p className="text-xs text-muted-foreground">{t('assets.enableAutoSync')}</p>
          </div>
          <Switch 
            checked={formData.autoSync}
            onCheckedChange={(checked) => setFormData({ ...formData, autoSync: checked })}
          />
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <Label>{t('assets.notes')}</Label>
        <Textarea 
          placeholder={t('assets.notesPlaceholder')}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
        />
      </div>
    </div>
  )

  // Render account card
  const renderAccountCard = (account: TradingAccount) => {
    const Icon = getAccountTypeIcon(account.accountType)
    const statusBadge = getStatusBadge(account)
    const accountStats = stats[account.id]

    return (
      <Card key={account.id} className="hover:border-cyan-500/50 transition-all">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-3 rounded-xl',
                account.accountType === 'broker' ? 'bg-blue-500/20' :
                account.accountType === 'propfirm' ? 'bg-purple-500/20' :
                account.accountType === 'indices' ? 'bg-cyan-500/20' : 'bg-green-500/20'
              )}>
                <Icon className={cn(
                  'w-6 h-6',
                  account.accountType === 'broker' ? 'text-blue-400' :
                  account.accountType === 'propfirm' ? 'text-purple-400' :
                  account.accountType === 'indices' ? 'text-cyan-400' : 'text-green-400'
                )} />
              </div>
              <div>
                <h3 className="font-semibold">{account.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {t(`portfolio.accountTypes.${account.accountType}.title`)}
                  {account.broker && ` • ${account.broker}`}
                </p>
              </div>
            </div>
            <Badge variant="outline" className={statusBadge.color}>
              {statusBadge.text}
            </Badge>
          </div>

          {/* Balance & Equity */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-muted-foreground">{t('portfolio.totalBalance')}</p>
              <p className="text-xl font-bold">
                {account.currency} {account.balance.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('portfolio.totalEquity')}</p>
              <p className="text-xl font-bold">
                {account.currency} {account.equity.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Stats */}
          {accountStats && (
            <div className="grid grid-cols-3 gap-2 mb-4 p-3 rounded-lg bg-black/20">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">{t('dashboard.winRate')}</p>
                <p className="font-semibold text-green-400">{accountStats.winRate.toFixed(1)}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">{t('trading.winning')}</p>
                <p className="font-semibold">{accountStats.winningTrades}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">{t('trading.losing')}</p>
                <p className="font-semibold">{accountStats.losingTrades}</p>
              </div>
            </div>
          )}

          {/* Prop Firm Progress */}
          {account.accountType === 'propfirm' && account.targetProfit && accountStats && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'التقدم نحو الهدف' : 'Progress to Target'}
                </span>
                <span className="text-xs font-medium">
                  {((accountStats.totalProfit / account.targetProfit) * 100).toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={(accountStats.totalProfit / account.targetProfit) * 100} 
                className="h-2"
              />
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">
                  ${accountStats.totalProfit.toFixed(2)}
                </span>
                <span className="text-xs text-muted-foreground">
                  ${account.targetProfit}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-800">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {account.lastSync 
                ? new Date(account.lastSync).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')
                : (language === 'ar' ? 'لم تتم المزامنة' : 'Not synced')
              }
            </div>
            <div className="flex gap-2">
              {account.connectionMethod !== 'manual' && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleSync(account)}
                  title={t('assets.syncNow')}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => openEditDialog(account)}
                title={t('common.edit')}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setSelectedAccount(account)
                  setShowDeleteDialog(true)
                }}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                title={t('common.delete')}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6 text-cyan-500" />
            {t('portfolio.title')}
          </h2>
          <p className="text-muted-foreground mt-1">
            {language === 'ar' 
              ? 'إدارة جميع حساباتك التداولية في مكان واحد'
              : 'Manage all your trading accounts in one place'}
          </p>
        </div>
        <Button 
          className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-black"
          onClick={() => {
            setFormData(initialFormData)
            setShowAddDialog(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('portfolio.addAccount')}
        </Button>
      </div>

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-cyan-500/10 to-emerald-500/5 border-cyan-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('portfolio.totalBalance')}
                </p>
                <p className="text-2xl font-bold">
                  ${portfolioStats.totalBalance.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('portfolio.profitLoss')}
                </p>
                <p className={cn(
                  'text-2xl font-bold flex items-center gap-1',
                  portfolioStats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'
                )}>
                  {portfolioStats.totalProfit >= 0 ? (
                    <ArrowUpRight className="h-5 w-5" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5" />
                  )}
                  ${Math.abs(portfolioStats.totalProfit).toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                {portfolioStats.totalProfit >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-400" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-400" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('portfolio.connectedAccounts')}
                </p>
                <p className="text-2xl font-bold">
                  {portfolioStats.activeAccounts}/{portfolioStats.totalAccounts}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Link2 className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'إجمالي الحسابات' : 'Total Accounts'}
                </p>
                <p className="text-2xl font-bold">
                  {portfolioStats.totalAccounts}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartLine className="h-5 w-5 text-cyan-500" />
              {language === 'ar' ? 'أداء المحفظة' : 'Portfolio Performance'}
            </CardTitle>
            <CardDescription>
              {language === 'ar' ? 'آخر 7 أيام' : 'Last 7 days'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#06B6D4" 
                    fillOpacity={1} 
                    fill="url(#colorProfit)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribution by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-500" />
              {t('assets.distribution.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <PieChart className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('assets.distribution.noData')}</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={distributionByType}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {distributionByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                      contentStyle={{ 
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Account Types */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className="hover:border-blue-500/50 transition-colors cursor-pointer" 
          onClick={() => {
            setFormData({ ...initialFormData, accountType: 'broker' })
            setShowAddDialog(true)
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
            setFormData({ ...initialFormData, accountType: 'propfirm' })
            setShowAddDialog(true)
          }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Award className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="font-medium">{t('portfolio.accountTypes.propfirm.title')}</p>
                <p className="text-sm text-muted-foreground">{t('portfolio.accountTypes.propfirm.subtitle')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="hover:border-cyan-500/50 transition-colors cursor-pointer"
          onClick={() => {
            setFormData({ ...initialFormData, accountType: 'indices' })
            setShowAddDialog(true)
          }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <LineChart className="h-6 w-6 text-cyan-500" />
              </div>
              <div>
                <p className="font-medium">{t('portfolio.accountTypes.indices.title')}</p>
                <p className="text-sm text-muted-foreground">{t('portfolio.accountTypes.indices.subtitle')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="hover:border-green-500/50 transition-colors cursor-pointer"
          onClick={() => {
            setFormData({ ...initialFormData, accountType: 'stocks' })
            setShowAddDialog(true)
          }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="font-medium">{t('portfolio.accountTypes.stocks.title')}</p>
                <p className="text-sm text-muted-foreground">{t('portfolio.accountTypes.stocks.subtitle')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts List */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'ar' ? 'الحسابات التداولية' : 'Trading Accounts'}</CardTitle>
          <CardDescription>
            {language === 'ar' 
              ? `${accounts.length} حساب تداولي`
              : `${accounts.length} trading accounts`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-20 w-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                <Wallet className="h-10 w-10 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {t('portfolio.noAccounts')}
              </h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                {t('portfolio.startCreating')}
              </p>
              <Button 
                className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-black"
                onClick={() => {
                  setFormData(initialFormData)
                  setShowAddDialog(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('portfolio.createFirstAccount')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map(renderAccountCard)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('portfolio.createAccount')}</DialogTitle>
            <DialogDescription>
              {language === 'ar' 
                ? 'أضف حساب تداولي جديد - وسيط، Prop Firm، مؤشرات، أو أسهم'
                : 'Add a new trading account - Broker, Prop Firm, Indices, or Stocks'}
            </DialogDescription>
          </DialogHeader>
          
          {renderFormContent()}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button 
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-black"
              onClick={handleAddAccount}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('portfolio.create')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{language === 'ar' ? 'تعديل الحساب' : 'Edit Account'}</DialogTitle>
            <DialogDescription>
              {language === 'ar' 
                ? 'تعديل بيانات الحساب التداولي'
                : 'Edit trading account details'}
            </DialogDescription>
          </DialogHeader>
          
          {renderFormContent(true)}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button 
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-black"
              onClick={handleEditAccount}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t('common.save')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{language === 'ar' ? 'حذف الحساب' : 'Delete Account'}</AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ar' 
                ? 'هل أنت متأكد من حذف هذا الحساب؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this account? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              className="bg-red-500 hover:bg-red-600"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}