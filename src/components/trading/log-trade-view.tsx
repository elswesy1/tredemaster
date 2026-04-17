'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useI18n } from '@/lib/i18n'
import { apiGet, apiPost } from '@/lib/api'
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Image as ImageIcon,
  Calendar,
  DollarSign,
  Target,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calculator,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Trade {
  id: string
  symbol: string
  type: 'buy' | 'sell'
  status: 'open' | 'closed'
  entryPrice: number
  exitPrice?: number
  quantity: number
  stopLoss?: number
  takeProfit?: number
  profitLoss?: number
  strategy?: string
  notes?: string
  lessons?: string
  chartImage?: string
  openedAt: Date
  closedAt?: Date
}

interface RiskProfile {
  id: string
  name: string
  accountName?: string
  accountType?: string
  isConfigured: boolean
  maxRiskPerTrade?: number
  maxDailyLoss?: number
  stopLossRequired: boolean
  takeProfitRequired: boolean
}

interface RiskCheckResult {
  passed: boolean
  violations: string[]
  warnings: string[]
  riskMetrics: {
    riskAmount: number
    riskPercent: number
    rewardAmount: number
    riskRewardRatio: number
  }
}

const symbols = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'GBP/JPY', 'XAU/USD', 'BTC/USD', 'ETH/USD', 'USD/CHF', 'AUD/USD', 'NZD/USD']

export function LogTradeView() {
  const { language } = useI18n()
  const isRTL = language === 'ar'
  const [trades, setTrades] = useState<Trade[]>([])
  const [playbooks, setPlaybooks] = useState<any[]>([])
  const [riskProfiles, setRiskProfiles] = useState<RiskProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingRisk, setIsCheckingRisk] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [riskCheckResult, setRiskCheckResult] = useState<RiskCheckResult | null>(null)
  const [showRiskWarning, setShowRiskWarning] = useState(false)

  const [newTrade, setNewTrade] = useState({
    symbol: '',
    type: 'buy' as 'buy' | 'sell',
    entryPrice: '',
    exitPrice: '',
    quantity: '0.1',
    lotSize: '1',
    stopLoss: '',
    takeProfit: '',
    strategy: '',
    notes: '',
    lessons: '',
    chartImage: '',
    riskProfileId: '',
    accountBalance: '10000',
  })

  // Fetch trades, playbooks and risk profiles
  useEffect(() => {
    fetchTrades()
    fetchPlaybooks()
    fetchRiskProfiles()
  }, [])

  const fetchPlaybooks = async () => {
    try {
      const data = await apiGet<any[]>('/api/playbook')
      setPlaybooks(data)
    } catch (error) {
      console.error('Error fetching playbooks:', error)
    }
  }

  const fetchTrades = async () => {
    try {
      setIsLoading(true)
      const data = await apiGet<Trade[]>('/api/trades')
      setTrades(data.map((t: Trade) => ({
        ...t,
        openedAt: new Date(t.openedAt),
        closedAt: t.closedAt ? new Date(t.closedAt) : undefined
      })))
    } catch (error) {
      console.error('Error fetching trades:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRiskProfiles = async () => {
    try {
      const data = await apiGet<RiskProfile[]>('/api/risk-profiles')
      setRiskProfiles(data)
      if (data.length > 0) {
        setNewTrade(prev => ({ ...prev, riskProfileId: data[0].id }))
      }
    } catch (error) {
      console.error('Error fetching risk profiles:', error)
    }
  }

  // Check risk before adding trade
  const checkRisk = async (): Promise<RiskCheckResult | null> => {
    if (!newTrade.riskProfileId || !newTrade.entryPrice || !newTrade.symbol) {
      return null
    }

    setIsCheckingRisk(true)
    try {
      const result = await apiPost<RiskCheckResult>('/api/risk-check', {
        riskProfileId: newTrade.riskProfileId,
        symbol: newTrade.symbol,
        tradeType: newTrade.type,
        entryPrice: parseFloat(newTrade.entryPrice),
        stopLoss: newTrade.stopLoss ? parseFloat(newTrade.stopLoss) : null,
        takeProfit: newTrade.takeProfit ? parseFloat(newTrade.takeProfit) : null,
        quantity: parseFloat(newTrade.quantity),
        lotSize: parseFloat(newTrade.lotSize),
        accountBalance: parseFloat(newTrade.accountBalance),
      })
      return result
    } catch (error) {
      console.error('Error checking risk:', error)
      return null
    } finally {
      setIsCheckingRisk(false)
    }
  }

  // Calculate and display risk in real-time
  const calculateRiskMetrics = () => {
    const entry = parseFloat(newTrade.entryPrice) || 0
    const sl = parseFloat(newTrade.stopLoss) || 0
    const tp = parseFloat(newTrade.takeProfit) || 0
    const qty = parseFloat(newTrade.quantity) || 0
    const balance = parseFloat(newTrade.accountBalance) || 10000

    if (!entry || !sl) return null

    const riskAmount = Math.abs(entry - sl) * qty * 100000 // Simplified
    const riskPercent = (riskAmount / balance) * 100
    const rewardAmount = tp ? Math.abs(tp - entry) * qty * 100000 : 0
    const riskRewardRatio = riskAmount > 0 && rewardAmount > 0 ? rewardAmount / riskAmount : 0

    return { riskAmount, riskPercent, rewardAmount, riskRewardRatio }
  }

  const riskMetrics = calculateRiskMetrics()

  // Validate trade against risk profile requirements
  const validateTradeRequirements = () => {
    const profile = riskProfiles.find(p => p.id === newTrade.riskProfileId)
    if (!profile || !profile.isConfigured) return { valid: true, warnings: [] }

    const warnings: string[] = []

    if (profile.stopLossRequired && !newTrade.stopLoss) {
      warnings.push(isRTL ? 'وقف الخسارة مطلوب حسب إعدادات المخاطر' : 'Stop Loss is required by risk settings')
    }

    if (profile.takeProfitRequired && !newTrade.takeProfit) {
      warnings.push(isRTL ? 'جني الأرباح مطلوب حسب إعدادات المخاطر' : 'Take Profit is required by risk settings')
    }

    if (profile.maxRiskPerTrade && riskMetrics && riskMetrics.riskPercent > profile.maxRiskPerTrade) {
      warnings.push(isRTL
        ? `نسبة المخاطرة (${riskMetrics.riskPercent.toFixed(2)}%) تتجاوز الحد المسموح (${profile.maxRiskPerTrade}%)`
        : `Risk % (${riskMetrics.riskPercent.toFixed(2)}%) exceeds limit (${profile.maxRiskPerTrade}%)`
      )
    }

    return { valid: warnings.length === 0, warnings }
  }

  const validation = validateTradeRequirements()

  const handleAddTrade = async () => {
    // Check risk first
    const checkResult = await checkRisk()
    setRiskCheckResult(checkResult)

    // If there are violations, show warning dialog
    if (checkResult && !checkResult.passed) {
      setShowRiskWarning(true)
      return
    }

    await submitTrade()
  }

  const submitTrade = async () => {
    try {
      setIsSubmitting(true)
      const tradeData = {
        symbol: newTrade.symbol,
        type: newTrade.type,
        entryPrice: parseFloat(newTrade.entryPrice),
        exitPrice: newTrade.exitPrice ? parseFloat(newTrade.exitPrice) : undefined,
        quantity: parseFloat(newTrade.quantity),
        lotSize: parseFloat(newTrade.lotSize),
        stopLoss: newTrade.stopLoss ? parseFloat(newTrade.stopLoss) : undefined,
        takeProfit: newTrade.takeProfit ? parseFloat(newTrade.takeProfit) : undefined,
        notes: newTrade.notes,
        strategy: newTrade.strategy,
      }

      const savedTrade = await apiPost<Trade>('/api/trades', tradeData)

      setTrades([{
        ...savedTrade,
        openedAt: new Date(savedTrade.openedAt),
        closedAt: savedTrade.closedAt ? new Date(savedTrade.closedAt) : undefined
      }, ...trades])

      setIsAddDialogOpen(false)
      setShowRiskWarning(false)
      setRiskCheckResult(null)
      resetForm()

      toast({
        title: isRTL ? 'تم بنجاح' : 'Success',
        description: isRTL ? 'تم إضافة الصفقة بنجاح' : 'Trade added successfully',
      })
    } catch (error) {
      console.error('Error adding trade:', error)
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في إضافة الصفقة' : 'Failed to add trade',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTrade = async (id: string) => {
    try {
      const response = await fetch(`/api/trades?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setTrades(trades.filter(t => t.id !== id))
        setSelectedTrade(null)
        toast({
          title: isRTL ? 'تم الحذف' : 'Deleted',
          description: isRTL ? 'تم حذف الصفقة' : 'Trade deleted successfully',
        })
      }
    } catch (error) {
      console.error('Error deleting trade:', error)
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في حذف الصفقة' : 'Failed to delete trade',
        variant: 'destructive'
      })
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewTrade({ ...newTrade, chartImage: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const resetForm = () => {
    setNewTrade({
      symbol: '',
      type: 'buy',
      entryPrice: '',
      exitPrice: '',
      quantity: '0.1',
      lotSize: '1',
      stopLoss: '',
      takeProfit: '',
      strategy: '',
      notes: '',
      lessons: '',
      chartImage: '',
      riskProfileId: riskProfiles.length > 0 ? riskProfiles[0].id : '',
      accountBalance: '10000',
    })
    setRiskCheckResult(null)
  }

  const openTrades = trades.filter(t => t.status === 'open')
  const closedTrades = trades.filter(t => t.status === 'closed')

  const selectedProfile = riskProfiles.find(p => p.id === newTrade.riskProfileId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {isRTL ? 'سجل الصفقات' : 'Trade Log'}
          </h2>
          <p className="text-muted-foreground">
            {isRTL ? 'سجل وتتبع جميع صفقاتك مع فحص المخاطر التلقائي' : 'Log and track all your trades with automatic risk checking'}
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-green-500 hover:bg-green-600">
          <Plus className="w-4 h-4 mr-2" />
          {isRTL ? 'صفقة جديدة' : 'New Trade'}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{trades.length}</div>
                <div className="text-sm text-muted-foreground">
                  {isRTL ? 'إجمالي الصفقات' : 'Total Trades'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{openTrades.length}</div>
                <div className="text-sm text-muted-foreground">
                  {isRTL ? 'صفقات مفتوحة' : 'Open Trades'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">
                  ${closedTrades.reduce((acc, t) => acc + (t.profitLoss || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {isRTL ? 'إجمالي الربح' : 'Total Profit'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {closedTrades.filter(t => (t.profitLoss || 0) > 0).length}/{closedTrades.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  {isRTL ? 'نسبة الفوز' : 'Win Rate'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Open Trades */}
      {openTrades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-500" />
              {isRTL ? 'الصفقات المفتوحة' : 'Open Trades'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {openTrades.map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer border border-transparent hover:border-green-500/30"
                  onClick={() => setSelectedTrade(trade)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      trade.type === 'buy' ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}>
                      {trade.type === 'buy' ?
                        <TrendingUp className="w-6 h-6 text-green-500" /> :
                        <TrendingDown className="w-6 h-6 text-red-500" />
                      }
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{trade.symbol}</span>
                        <Badge variant="outline" className={trade.type === 'buy' ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}>
                          {trade.type.toUpperCase()}
                        </Badge>
                        {trade.strategy && <Badge variant="secondary">{trade.strategy}</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {isRTL ? 'دخول:' : 'Entry:'} {trade.entryPrice}
                        {trade.stopLoss && ` • SL: ${trade.stopLoss}`}
                        {trade.takeProfit && ` • TP: ${trade.takeProfit}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {trade.openedAt.toLocaleDateString()}
                    </div>
                    <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                      {isRTL ? 'مفتوحة' : 'Open'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Closed Trades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            {isRTL ? 'الصفقات المغلقة' : 'Closed Trades'}
          </CardTitle>
          <CardDescription>
            {isRTL ? 'سجل الصفقات المغلقة' : 'History of closed trades'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {closedTrades.map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer border border-transparent hover:border-green-500/30"
                onClick={() => setSelectedTrade(trade)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    (trade.profitLoss || 0) >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    {(trade.profitLoss || 0) >= 0 ?
                      <TrendingUp className="w-6 h-6 text-green-500" /> :
                      <TrendingDown className="w-6 h-6 text-red-500" />
                    }
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{trade.symbol}</span>
                      <Badge variant="outline" className={trade.type === 'buy' ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}>
                        {trade.type.toUpperCase()}
                      </Badge>
                      {trade.strategy && <Badge variant="secondary">{trade.strategy}</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {isRTL ? 'دخول:' : 'Entry:'} {trade.entryPrice}
                      {trade.exitPrice && ` → ${isRTL ? 'خروج:' : 'Exit:'} ${trade.exitPrice}`}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-semibold ${(trade.profitLoss || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {(trade.profitLoss || 0) >= 0 ? '+' : ''}${trade.profitLoss?.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {trade.closedAt?.toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Trade Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {isRTL ? 'صفقة جديدة' : 'New Trade'}
            </DialogTitle>
            <DialogDescription>
              {isRTL ? 'أدخل تفاصيل الصفقة - سيتم فحص المخاطر تلقائياً' : 'Enter trade details - Risk will be checked automatically'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Risk Profile Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {isRTL ? 'ملف المخاطر' : 'Risk Profile'}
                </Label>
                <Select
                  value={newTrade.riskProfileId}
                  onValueChange={(v) => setNewTrade({ ...newTrade, riskProfileId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isRTL ? 'اختر ملف المخاطر' : 'Select risk profile'} />
                  </SelectTrigger>
                  <SelectContent>
                    {riskProfiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        <div className="flex items-center gap-2">
                          <span>{profile.name}</span>
                          {!profile.isConfigured && (
                            <Badge variant="outline" className="text-xs">
                              {isRTL ? 'غير مُعدّ' : 'Not configured'}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'رصيد الحساب ($)' : 'Account Balance ($)'}</Label>
                <Input
                  type="number"
                  value={newTrade.accountBalance}
                  onChange={(e) => setNewTrade({ ...newTrade, accountBalance: e.target.value })}
                  placeholder="10000"
                />
              </div>
            </div>

            {/* Profile Requirements Alert */}
            {selectedProfile?.isConfigured && (selectedProfile.stopLossRequired || selectedProfile.takeProfitRequired) && (
              <Alert className="bg-blue-500/10 border-blue-500/20">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <AlertTitle className="text-blue-500">
                  {isRTL ? 'متطلبات ملف المخاطر' : 'Risk Profile Requirements'}
                </AlertTitle>
                <AlertDescription className="text-sm">
                  {selectedProfile.stopLossRequired && (isRTL ? '• وقف الخسارة مطلوب' : '• Stop Loss is required')}
                  {selectedProfile.stopLossRequired && selectedProfile.takeProfitRequired && ' | '}
                  {selectedProfile.takeProfitRequired && (isRTL ? 'جني الأرباح مطلوب' : 'Take Profit is required')}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'الرمز' : 'Symbol'}</Label>
                <Select value={newTrade.symbol} onValueChange={(v) => setNewTrade({ ...newTrade, symbol: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder={isRTL ? 'اختر...' : 'Select...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {symbols.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'النوع' : 'Type'}</Label>
                <Select value={newTrade.type} onValueChange={(v) => setNewTrade({ ...newTrade, type: v as 'buy' | 'sell' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">{isRTL ? 'شراء' : 'Buy'}</SelectItem>
                    <SelectItem value="sell">{isRTL ? 'بيع' : 'Sell'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'سعر الدخول' : 'Entry Price'}</Label>
                <Input
                  type="number"
                  step="any"
                  value={newTrade.entryPrice}
                  onChange={(e) => setNewTrade({ ...newTrade, entryPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'سعر الخروج' : 'Exit Price (Optional)'}</Label>
                <Input
                  type="number"
                  step="any"
                  value={newTrade.exitPrice}
                  onChange={(e) => setNewTrade({ ...newTrade, exitPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'الكمية' : 'Quantity'}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newTrade.quantity}
                  onChange={(e) => setNewTrade({ ...newTrade, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'حجم اللوت' : 'Lot Size'}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newTrade.lotSize}
                  onChange={(e) => setNewTrade({ ...newTrade, lotSize: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-red-500">{isRTL ? 'وقف الخسارة' : 'Stop Loss'}</Label>
                <Input
                  type="number"
                  step="any"
                  value={newTrade.stopLoss}
                  onChange={(e) => setNewTrade({ ...newTrade, stopLoss: e.target.value })}
                  placeholder="0.00"
                  className={selectedProfile?.stopLossRequired && !newTrade.stopLoss ? 'border-red-500' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-green-500">{isRTL ? 'جني الأرباح' : 'Take Profit'}</Label>
                <Input
                  type="number"
                  step="any"
                  value={newTrade.takeProfit}
                  onChange={(e) => setNewTrade({ ...newTrade, takeProfit: e.target.value })}
                  placeholder="0.00"
                  className={selectedProfile?.takeProfitRequired && !newTrade.takeProfit ? 'border-green-500' : ''}
                />
              </div>
            </div>

            {/* Risk Metrics Preview */}
            {riskMetrics && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{isRTL ? 'معايير المخاطر المحسوبة' : 'Calculated Risk Metrics'}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-red-500">${riskMetrics.riskAmount.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">{isRTL ? 'مبلغ المخاطرة' : 'Risk Amount'}</div>
                    </div>
                    <div>
                      <div className={`text-lg font-bold ${riskMetrics.riskPercent > 2 ? 'text-red-500' : 'text-green-500'}`}>
                        {riskMetrics.riskPercent.toFixed(2)}%
                      </div>
                      <div className="text-xs text-muted-foreground">{isRTL ? 'نسبة المخاطرة' : 'Risk %'}</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-500">${riskMetrics.rewardAmount.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">{isRTL ? 'مبلغ العائد' : 'Reward'}</div>
                    </div>
                    <div>
                      <div className={`text-lg font-bold ${riskMetrics.riskRewardRatio >= 1.5 ? 'text-green-500' : 'text-amber-500'}`}>
                        1:{riskMetrics.riskRewardRatio.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">{isRTL ? 'مخاطرة:عائد' : 'R:R Ratio'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Validation Warnings */}
            {validation.warnings.length > 0 && (
              <Alert className="bg-amber-500/10 border-amber-500/20">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertTitle className="text-amber-500">
                  {isRTL ? 'تحذيرات المخاطر' : 'Risk Warnings'}
                </AlertTitle>
                <AlertDescription>
                  <ul className="text-sm mt-2 space-y-1">
                    {validation.warnings.map((w, i) => (
                      <li key={i}>• {w}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>{isRTL ? 'كتيب القواعد (Setup)' : 'Playbook Setup'}</Label>
              <Select value={newTrade.strategy} onValueChange={(v) => setNewTrade({ ...newTrade, strategy: v })}>
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? 'اختر النموذج...' : 'Select setup...'} />
                </SelectTrigger>
                <SelectContent>
                  {playbooks.map((pb) => (
                    <SelectItem key={pb.id} value={pb.name}>{pb.name}</SelectItem>
                  ))}
                  {playbooks.length === 0 && (
                    <SelectItem value="none" disabled>{isRTL ? 'لا توجد نماذج' : 'No setups found'}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? 'ملاحظات' : 'Notes'}</Label>
              <Textarea
                value={newTrade.notes}
                onChange={(e) => setNewTrade({ ...newTrade, notes: e.target.value })}
                placeholder={isRTL ? 'ملاحظات حول الصفقة...' : 'Notes about the trade...'}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? 'صورة الشارت' : 'Chart Image'}</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="chart-image"
                />
                <Button variant="outline" asChild>
                  <label htmlFor="chart-image" className="cursor-pointer">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    {isRTL ? 'تحميل صورة' : 'Upload Image'}
                  </label>
                </Button>
                {newTrade.chartImage && (
                  <img src={newTrade.chartImage} alt="Chart" className="w-16 h-16 rounded object-cover" />
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }} disabled={isSubmitting}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handleAddTrade}
              className="bg-green-500 hover:bg-green-600"
              disabled={isSubmitting || isCheckingRisk || !newTrade.symbol || !newTrade.entryPrice}
            >
              {isCheckingRisk ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isRTL ? 'فحص المخاطر...' : 'Checking Risk...'}
                </>
              ) : isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isRTL ? 'جاري الإضافة...' : 'Adding...'}
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  {isRTL ? 'إضافة مع فحص المخاطر' : 'Add with Risk Check'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Risk Warning Dialog */}
      <Dialog open={showRiskWarning} onOpenChange={setShowRiskWarning}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              {isRTL ? 'تحذير: انتهاك قواعد المخاطر' : 'Warning: Risk Rules Violation'}
            </DialogTitle>
            <DialogDescription>
              {isRTL ? 'هذه الصفقة تنتهك قواعد المخاطر المحددة' : 'This trade violates your defined risk rules'}
            </DialogDescription>
          </DialogHeader>

          {riskCheckResult && (
            <div className="space-y-4">
              {/* Violations */}
              {riskCheckResult.violations.length > 0 && (
                <Alert className="bg-red-500/10 border-red-500/20">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <AlertTitle className="text-red-500">{isRTL ? 'الانتهاكات' : 'Violations'}</AlertTitle>
                  <AlertDescription>
                    <ul className="text-sm mt-2 space-y-1">
                      {riskCheckResult.violations.map((v, i) => (
                        <li key={i}>• {v}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Warnings */}
              {riskCheckResult.warnings.length > 0 && (
                <Alert className="bg-amber-500/10 border-amber-500/20">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <AlertTitle className="text-amber-500">{isRTL ? 'تحذيرات' : 'Warnings'}</AlertTitle>
                  <AlertDescription>
                    <ul className="text-sm mt-2 space-y-1">
                      {riskCheckResult.warnings.map((w, i) => (
                        <li key={i}>• {w}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Risk Metrics */}
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-center text-sm">
                    <div>
                      <div className="font-bold">${riskCheckResult.riskMetrics.riskAmount.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">{isRTL ? 'مبلغ المخاطرة' : 'Risk Amount'}</div>
                    </div>
                    <div>
                      <div className="font-bold">{riskCheckResult.riskMetrics.riskPercent.toFixed(2)}%</div>
                      <div className="text-xs text-muted-foreground">{isRTL ? 'نسبة المخاطرة' : 'Risk %'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowRiskWarning(false)} className="flex-1">
              {isRTL ? 'إلغاء الصفقة' : 'Cancel Trade'}
            </Button>
            <Button
              onClick={submitTrade}
              className="flex-1 bg-amber-500 hover:bg-amber-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <AlertTriangle className="w-4 h-4 mr-2" />
              )}
              {isRTL ? 'متابعة على أي حال' : 'Proceed Anyway'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Trade Detail Dialog */}
      <Dialog open={!!selectedTrade} onOpenChange={() => setSelectedTrade(null)}>
        <DialogContent className="max-w-lg">
          {selectedTrade && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedTrade.symbol}
                  <Badge variant="outline" className={selectedTrade.type === 'buy' ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}>
                    {selectedTrade.type.toUpperCase()}
                  </Badge>
                  <Badge className={selectedTrade.status === 'open' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}>
                    {selectedTrade.status === 'open' ? (isRTL ? 'مفتوحة' : 'Open') : (isRTL ? 'مغلقة' : 'Closed')}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {selectedTrade.chartImage && (
                  <img src={selectedTrade.chartImage} alt="Chart" className="w-full rounded-lg" />
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-sm text-muted-foreground">{isRTL ? 'سعر الدخول' : 'Entry Price'}</div>
                    <div className="text-lg font-semibold">{selectedTrade.entryPrice}</div>
                  </div>
                  {selectedTrade.exitPrice && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-sm text-muted-foreground">{isRTL ? 'سعر الخروج' : 'Exit Price'}</div>
                      <div className="text-lg font-semibold">{selectedTrade.exitPrice}</div>
                    </div>
                  )}
                  {selectedTrade.stopLoss && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-sm text-muted-foreground">{isRTL ? 'وقف الخسارة' : 'Stop Loss'}</div>
                      <div className="text-lg font-semibold text-red-500">{selectedTrade.stopLoss}</div>
                    </div>
                  )}
                  {selectedTrade.takeProfit && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-sm text-muted-foreground">{isRTL ? 'جني الأرباح' : 'Take Profit'}</div>
                      <div className="text-lg font-semibold text-green-500">{selectedTrade.takeProfit}</div>
                    </div>
                  )}
                </div>
                {selectedTrade.notes && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-sm text-muted-foreground mb-1">{isRTL ? 'ملاحظات' : 'Notes'}</div>
                    <div className="text-sm">{selectedTrade.notes}</div>
                  </div>
                )}
                {(selectedTrade.profitLoss || 0) !== 0 && (
                  <div className={`text-center p-4 rounded-lg ${(selectedTrade.profitLoss || 0) >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    <div className="text-sm text-muted-foreground">{isRTL ? 'الربح/الخسارة' : 'Profit/Loss'}</div>
                    <div className={`text-2xl font-bold ${(selectedTrade.profitLoss || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {(selectedTrade.profitLoss || 0) >= 0 ? '+' : ''}${selectedTrade.profitLoss?.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => handleDeleteTrade(selectedTrade.id)} className="text-red-500">
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isRTL ? 'حذف' : 'Delete'}
                </Button>
                <Button onClick={() => setSelectedTrade(null)} className="bg-green-500 hover:bg-green-600">
                  {isRTL ? 'إغلاق' : 'Close'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
