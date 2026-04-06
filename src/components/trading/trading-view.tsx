'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useI18n } from '@/lib/i18n'
import { apiGet, apiPost, getApiHeaders } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { MaskedBalance } from '@/components/trading/masked-balance'
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Target,
  Upload,
  Download,
  BarChart3,
  Clock,
  Loader2,
  RefreshCw,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calculator,
  LineChart,
  Lightbulb,
  Zap,
  FileSpreadsheet,
  Image as ImageIcon,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  MoreVertical,
  Play,
  Pause,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ================ Types ================
interface Trade {
  id: string
  symbol: string
  type: 'buy' | 'sell'
  status: 'open' | 'closed'
  entryPrice: number
  exitPrice?: number
  quantity: number
  lotSize?: number
  stopLoss?: number
  takeProfit?: number
  profitLoss?: number
  strategy?: string
  strategyId?: string
  notes?: string
  emotions?: string
  confidence?: number
  entryReason?: string
  exitReason?: string
  chartImage?: string
  openedAt: string
  closedAt?: string
}

interface Strategy {
  id: string
  name: string
  description: string | null
  category: string | null
  timeframe: string | null
  entryRules: string | null
  exitRules: string | null
  totalTrades: number
  winningTrades: number
  losingTrades: number
  profitLoss: number
  winRate: number | null
  avgRRR: number | null
  isActive: boolean
}

interface RiskProfile {
  id: string
  name: string
  accountName?: string
  isConfigured: boolean
  maxRiskPerTrade?: number
  stopLossRequired: boolean
  takeProfitRequired: boolean
}

// ================ Constants ================
const SYMBOLS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'GBP/JPY', 'AUD/USD', 'NZD/USD',
  'USD/CHF', 'USD/CAD', 'EUR/GBP', 'EUR/JPY', 'XAU/USD', 'XAG/USD',
  'BTC/USD', 'ETH/USD', 'US30', 'US500', 'NAS100', 'GER30'
]

const TIMEFRAMES = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1']

const EMOTIONS = [
  { value: 'confident', labelAr: 'واثق', labelEn: 'Confident' },
  { value: 'anxious', labelAr: 'قلق', labelEn: 'Anxious' },
  { value: 'greedy', labelAr: 'طماع', labelEn: 'Greedy' },
  { value: 'fearful', labelAr: 'خائف', labelEn: 'Fearful' },
  { value: 'calm', labelAr: 'هادئ', labelEn: 'Calm' },
  { value: 'excited', labelAr: 'متحمس', labelEn: 'Excited' },
]

// ================ Main Component ================
export function TradingView() {
  const { t, language } = useI18n()
  const isRTL = language === 'ar'
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // States
  const [activeTab, setActiveTab] = useState('overview')
  const [trades, setTrades] = useState<Trade[]>([])
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [riskProfiles, setRiskProfiles] = useState<RiskProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAddTradeOpen, setIsAddTradeOpen] = useState(false)
  const [isAddStrategyOpen, setIsAddStrategyOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)
  const [tradeFilter, setTradeFilter] = useState<'all' | 'open' | 'closed'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [quickMode, setQuickMode] = useState(true)

  // New Trade Form
  const [newTrade, setNewTrade] = useState({
    symbol: '',
    type: 'buy' as 'buy' | 'sell',
    entryPrice: '',
    exitPrice: '',
    quantity: '0.1',
    lotSize: '1',
    stopLoss: '',
    takeProfit: '',
    strategyId: '',
    timeframe: 'H1',
    entryReason: '',
    exitReason: '',
    notes: '',
    emotions: '',
    confidence: 5,
    chartImage: '',
    riskProfileId: '',
    accountBalance: '10000',
  })

  // New Strategy Form
  const [newStrategy, setNewStrategy] = useState({
    name: '',
    description: '',
    category: 'technical',
    timeframe: 'H1',
    entryRules: '',
    exitRules: '',
  })

  // Fetch all data
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [tradesData, strategiesData, profilesData] = await Promise.all([
        apiGet<Trade[]>('/api/trades').catch(() => []),
        apiGet<Strategy[]>('/api/strategies').catch(() => []),
        apiGet<RiskProfile[]>('/api/risk-profiles').catch(() => []),
      ])
      setTrades(tradesData)
      setStrategies(strategiesData)
      setRiskProfiles(profilesData)
      if (profilesData.length > 0) {
        setNewTrade(prev => ({ ...prev, riskProfileId: profilesData[0].id }))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // ================ Computed Values ================
  const openTrades = trades.filter(t => t.status === 'open')
  const closedTrades = trades.filter(t => t.status === 'closed')
  const winningTrades = closedTrades.filter(t => (t.profitLoss || 0) > 0)

  const totalProfit = closedTrades.reduce((acc, t) => acc + (t.profitLoss || 0), 0)
  const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0

  const filteredTrades = trades.filter(t => {
    const matchesFilter = tradeFilter === 'all' || t.status === tradeFilter
    const matchesSearch = !searchQuery || 
      t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.strategy && t.strategy.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  // Risk calculations
  const calculateRisk = () => {
    const entry = parseFloat(newTrade.entryPrice) || 0
    const sl = parseFloat(newTrade.stopLoss) || 0
    const tp = parseFloat(newTrade.takeProfit) || 0
    const qty = parseFloat(newTrade.quantity) || 0
    const balance = parseFloat(newTrade.accountBalance) || 10000

    if (!entry || !sl) return null

    const riskAmount = Math.abs(entry - sl) * qty * 100000
    const riskPercent = (riskAmount / balance) * 100
    const rewardAmount = tp ? Math.abs(tp - entry) * qty * 100000 : 0
    const rrRatio = riskAmount > 0 && rewardAmount > 0 ? rewardAmount / riskAmount : 0

    return { riskAmount, riskPercent, rewardAmount, rrRatio }
  }

  const riskMetrics = calculateRisk()

  // ================ Handlers ================
  const handleAddTrade = async () => {
    if (!newTrade.symbol || !newTrade.entryPrice) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'يرجى ملء الحقول المطلوبة' : 'Please fill required fields',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      const tradeData = {
        symbol: newTrade.symbol,
        type: newTrade.type,
        entryPrice: parseFloat(newTrade.entryPrice),
        exitPrice: newTrade.exitPrice ? parseFloat(newTrade.exitPrice) : null,
        quantity: parseFloat(newTrade.quantity),
        lotSize: parseFloat(newTrade.lotSize),
        stopLoss: newTrade.stopLoss ? parseFloat(newTrade.stopLoss) : null,
        takeProfit: newTrade.takeProfit ? parseFloat(newTrade.takeProfit) : null,
        strategy: strategies.find(s => s.id === newTrade.strategyId)?.name,
        strategyId: newTrade.strategyId,
        notes: newTrade.notes,
        emotions: newTrade.emotions,
        confidence: newTrade.confidence,
        entryReason: newTrade.entryReason,
        exitReason: newTrade.exitReason,
        status: newTrade.exitPrice ? 'closed' : 'open',
      }

      const saved = await apiPost<Trade>('/api/trades', tradeData)
      setTrades([saved, ...trades])
      setIsAddTradeOpen(false)
      resetTradeForm()

      toast({
        title: isRTL ? 'تم بنجاح' : 'Success',
        description: isRTL ? 'تم إضافة الصفقة بنجاح' : 'Trade added successfully',
      })
    } catch (error) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في إضافة الصفقة' : 'Failed to add trade',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddStrategy = async () => {
    if (!newStrategy.name) return

    setIsSaving(true)
    try {
      const saved = await apiPost<Strategy>('/api/strategies', newStrategy)
      setStrategies([saved, ...strategies])
      setIsAddStrategyOpen(false)
      resetStrategyForm()

      toast({
        title: isRTL ? 'تم بنجاح' : 'Success',
        description: isRTL ? 'تم إضافة الاستراتيجية' : 'Strategy added',
      })
    } catch (error) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في إضافة الاستراتيجية' : 'Failed to add strategy',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteTrade = async (id: string) => {
    try {
      await fetch(`/api/trades?id=${id}`, { method: 'DELETE' })
      setTrades(trades.filter(t => t.id !== id))
      setSelectedTrade(null)
      toast({ title: isRTL ? 'تم الحذف' : 'Deleted' })
    } catch (error) {
      toast({ title: isRTL ? 'خطأ' : 'Error', variant: 'destructive' })
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Handle CSV/JSON upload for MT4/MT5
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string
        
        // Parse based on file type
        if (file.name.endsWith('.csv')) {
          // Parse CSV (MT4/MT5 format)
          const lines = content.split('\n')
          const parsedTrades: { symbol: string; type: string; entryPrice: number; exitPrice: number | undefined; profitLoss: number; quantity: number }[] = []
          
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',')
            if (cols.length >= 5) {
              parsedTrades.push({
                symbol: cols[0]?.trim() || '',
                type: cols[1]?.trim()?.toLowerCase() === 'buy' ? 'buy' : 'sell',
                entryPrice: parseFloat(cols[2]) || 0,
                exitPrice: parseFloat(cols[3]) || undefined,
                profitLoss: parseFloat(cols[4]) || 0,
                quantity: parseFloat(cols[5]) || 0.1,
              })
            }
          }

          // Save parsed trades
          for (const trade of parsedTrades) {
            if (trade.symbol && trade.entryPrice) {
              await apiPost('/api/trades', trade)
            }
          }

          toast({
            title: isRTL ? 'تم الرفع' : 'Uploaded',
            description: isRTL ? `تم استيراد ${parsedTrades.length} صفقة` : `Imported ${parsedTrades.length} trades`,
          })
          fetchData()
        }
      } catch (error) {
        toast({
          title: isRTL ? 'خطأ' : 'Error',
          description: isRTL ? 'فشل في قراءة الملف' : 'Failed to read file',
          variant: 'destructive',
        })
      }
    }
    reader.readAsText(file)
    setIsUploadOpen(false)
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

  const resetTradeForm = () => {
    setNewTrade({
      symbol: '',
      type: 'buy',
      entryPrice: '',
      exitPrice: '',
      quantity: '0.1',
      lotSize: '1',
      stopLoss: '',
      takeProfit: '',
      strategyId: '',
      timeframe: 'H1',
      entryReason: '',
      exitReason: '',
      notes: '',
      emotions: '',
      confidence: 5,
      chartImage: '',
      riskProfileId: riskProfiles.length > 0 ? riskProfiles[0].id : '',
      accountBalance: '10000',
    })
    setQuickMode(true)
  }

  const resetStrategyForm = () => {
    setNewStrategy({
      name: '',
      description: '',
      category: 'technical',
      timeframe: 'H1',
      entryRules: '',
      exitRules: '',
    })
  }

  // ================ Render ================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <LineChart className="h-6 w-6 text-green-500" />
            {isRTL ? 'إدارة التداول' : 'Trading Management'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {isRTL ? 'سجل صفقاتك، استراتيجياتك، وحلل أداءك' : 'Log trades, strategies, and analyze your performance'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsUploadOpen(true)}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {isRTL ? 'رفع من MT4/MT5' : 'Upload from MT4/MT5'}
          </Button>
          <Button
            onClick={() => setIsAddTradeOpen(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 gap-2"
          >
            <Plus className="h-4 w-4" />
            {isRTL ? 'صفقة جديدة' : 'New Trade'}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 border-blue-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{trades.length}</div>
                <div className="text-xs text-muted-foreground">{isRTL ? 'الصفقات' : 'Trades'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 border-yellow-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{openTrades.length}</div>
                <div className="text-xs text-muted-foreground">{isRTL ? 'مفتوحة' : 'Open'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 border-green-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <MaskedBalance value={totalProfit} size="sm" showToggle={false} />
                <div className="text-xs text-muted-foreground">{isRTL ? 'الربح' : 'Profit'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 border-purple-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">{isRTL ? 'نسبة الفوز' : 'Win Rate'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 border-orange-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{strategies.length}</div>
                <div className="text-xs text-muted-foreground">{isRTL ? 'استراتيجية' : 'Strategies'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            {isRTL ? 'نظرة عامة' : 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="trades" className="gap-2">
            <Target className="h-4 w-4" />
            {isRTL ? 'الصفقات' : 'Trades'}
          </TabsTrigger>
          <TabsTrigger value="strategies" className="gap-2">
            <Lightbulb className="h-4 w-4" />
            {isRTL ? 'الاستراتيجيات' : 'Strategies'}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Open Trades Preview */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-yellow-500" />
                    {isRTL ? 'الصفقات المفتوحة' : 'Open Trades'}
                  </span>
                  <Badge variant="outline">{openTrades.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {openTrades.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>{isRTL ? 'لا توجد صفقات مفتوحة' : 'No open trades'}</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {openTrades.slice(0, 5).map(trade => (
                        <div
                          key={trade.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer"
                          onClick={() => setSelectedTrade(trade)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center",
                              trade.type === 'buy' ? "bg-green-500/10" : "bg-red-500/10"
                            )}>
                              {trade.type === 'buy' ? 
                                <TrendingUp className="h-4 w-4 text-green-500" /> :
                                <TrendingDown className="h-4 w-4 text-red-500" />
                              }
                            </div>
                            <div>
                              <div className="font-medium">{trade.symbol}</div>
                              <div className="text-xs text-muted-foreground">
                                {trade.entryPrice} • {trade.quantity}
                              </div>
                            </div>
                          </div>
                          <Badge className={trade.type === 'buy' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}>
                            {trade.type.toUpperCase()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-500" />
                  {isRTL ? 'آخر النشاطات' : 'Recent Activity'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {closedTrades.slice(0, 5).map(trade => (
                      <div
                        key={trade.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer"
                        onClick={() => setSelectedTrade(trade)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            (trade.profitLoss || 0) >= 0 ? "bg-green-500/10" : "bg-red-500/10"
                          )}>
                            {(trade.profitLoss || 0) >= 0 ?
                              <CheckCircle2 className="h-4 w-4 text-green-500" /> :
                              <XCircle className="h-4 w-4 text-red-500" />
                            }
                          </div>
                          <div>
                            <div className="font-medium">{trade.symbol}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(trade.closedAt || trade.openedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className={cn(
                          "font-semibold",
                          (trade.profitLoss || 0) >= 0 ? "text-green-500" : "text-red-500"
                        )}>
                          ${(trade.profitLoss || 0).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Top Strategies */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-orange-500" />
                  {isRTL ? 'أفضل الاستراتيجيات' : 'Top Strategies'}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('strategies')}>
                  {isRTL ? 'عرض الكل' : 'View All'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {strategies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>{isRTL ? 'لا توجد استراتيجيات' : 'No strategies yet'}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setIsAddStrategyOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isRTL ? 'إضافة استراتيجية' : 'Add Strategy'}
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  {strategies.slice(0, 3).map(strategy => (
                    <Card
                      key={strategy.id}
                      className="cursor-pointer hover:border-green-500/30"
                      onClick={() => setSelectedStrategy(strategy)}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{strategy.name}</span>
                          <Badge variant="outline">{strategy.winRate?.toFixed(0) || 0}%</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-sm">
                          <div>
                            <div className="font-semibold">{strategy.totalTrades}</div>
                            <div className="text-xs text-muted-foreground">{isRTL ? 'صفقات' : 'Trades'}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-green-500">{strategy.winningTrades}</div>
                            <div className="text-xs text-muted-foreground">{isRTL ? 'رابحة' : 'Win'}</div>
                          </div>
                          <div>
                            <div className={cn(
                              "font-semibold",
                              strategy.profitLoss >= 0 ? "text-green-500" : "text-red-500"
                            )}>
                              ${Math.abs(strategy.profitLoss).toFixed(0)}
                            </div>
                            <div className="text-xs text-muted-foreground">{isRTL ? 'ربح' : 'P/L'}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trades Tab */}
        <TabsContent value="trades" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={isRTL ? 'بحث في الصفقات...' : 'Search trades...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'open', 'closed'] as const).map(filter => (
                <Button
                  key={filter}
                  variant={tradeFilter === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTradeFilter(filter)}
                >
                  {filter === 'all' ? (isRTL ? 'الكل' : 'All') :
                   filter === 'open' ? (isRTL ? 'مفتوحة' : 'Open') :
                   (isRTL ? 'مغلقة' : 'Closed')}
                </Button>
              ))}
            </div>
          </div>

          {/* Trades List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            </div>
          ) : filteredTrades.length === 0 ? (
            <Card>
              <CardContent className="py-12 flex flex-col items-center justify-center">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  {isRTL ? 'لا توجد صفقات' : 'No trades found'}
                </p>
                <p className="text-muted-foreground mb-4">
                  {isRTL ? 'ابدأ بتسجيل صفقتك الأولى' : 'Start by logging your first trade'}
                </p>
                <Button onClick={() => setIsAddTradeOpen(true)} className="bg-green-500">
                  <Plus className="h-4 w-4 mr-2" />
                  {isRTL ? 'صفقة جديدة' : 'New Trade'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredTrades.map(trade => (
                <Card
                  key={trade.id}
                  className="cursor-pointer hover:border-green-500/30 transition-colors"
                  onClick={() => setSelectedTrade(trade)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center",
                          trade.status === 'open' ? "bg-yellow-500/10" :
                          (trade.profitLoss || 0) >= 0 ? "bg-green-500/10" : "bg-red-500/10"
                        )}>
                          {trade.status === 'open' ? (
                            <Play className="h-6 w-6 text-yellow-500" />
                          ) : (trade.profitLoss || 0) >= 0 ? (
                            <TrendingUp className="h-6 w-6 text-green-500" />
                          ) : (
                            <TrendingDown className="h-6 w-6 text-red-500" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{trade.symbol}</span>
                            <Badge variant="outline" className={trade.type === 'buy' ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}>
                              {trade.type.toUpperCase()}
                            </Badge>
                            {trade.strategy && (
                              <Badge variant="secondary" className="text-xs">{trade.strategy}</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {isRTL ? 'دخول:' : 'Entry:'} {trade.entryPrice}
                            {trade.stopLoss && ` • SL: ${trade.stopLoss}`}
                            {trade.takeProfit && ` • TP: ${trade.takeProfit}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn(
                          "text-lg font-semibold",
                          trade.status === 'open' ? "text-yellow-500" :
                          (trade.profitLoss || 0) >= 0 ? "text-green-500" : "text-red-500"
                        )}>
                          {trade.status === 'open' ? (
                            <Badge className="bg-yellow-500/10 text-yellow-500">
                              {isRTL ? 'مفتوحة' : 'Open'}
                            </Badge>
                          ) : (
                            `$${(trade.profitLoss || 0).toFixed(2)}`
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(trade.openedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Strategies Tab */}
        <TabsContent value="strategies" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {isRTL ? 'استراتيجيات التداول' : 'Trading Strategies'}
            </h3>
            <Button onClick={() => setIsAddStrategyOpen(true)} className="bg-green-500">
              <Plus className="h-4 w-4 mr-2" />
              {isRTL ? 'إضافة استراتيجية' : 'Add Strategy'}
            </Button>
          </div>

          {strategies.length === 0 ? (
            <Card>
              <CardContent className="py-12 flex flex-col items-center justify-center">
                <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  {isRTL ? 'لا توجد استراتيجيات' : 'No strategies yet'}
                </p>
                <p className="text-muted-foreground mb-4">
                  {isRTL ? 'أضف استراتيجيتك الأولى لتتبع أدائها' : 'Add your first strategy to track its performance'}
                </p>
                <Button onClick={() => setIsAddStrategyOpen(true)} className="bg-green-500">
                  <Plus className="h-4 w-4 mr-2" />
                  {isRTL ? 'إضافة استراتيجية' : 'Add Strategy'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {strategies.map(strategy => (
                <Card
                  key={strategy.id}
                  className="cursor-pointer hover:border-green-500/30"
                  onClick={() => setSelectedStrategy(strategy)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{strategy.name}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="outline">{strategy.timeframe}</Badge>
                        <Badge className={strategy.category === 'technical' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}>
                          {strategy.category}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>{strategy.description || (isRTL ? 'لا يوجد وصف' : 'No description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-2 text-center text-sm">
                      <div>
                        <div className="font-semibold">{strategy.totalTrades}</div>
                        <div className="text-xs text-muted-foreground">{isRTL ? 'صفقات' : 'Trades'}</div>
                      </div>
                      <div>
                        <div className="font-semibold text-green-500">{strategy.winningTrades}</div>
                        <div className="text-xs text-muted-foreground">{isRTL ? 'رابحة' : 'Wins'}</div>
                      </div>
                      <div>
                        <div className="font-semibold">{strategy.winRate?.toFixed(0) || 0}%</div>
                        <div className="text-xs text-muted-foreground">{isRTL ? 'فوز' : 'Win%'}</div>
                      </div>
                      <div>
                        <div className={cn("font-semibold", strategy.profitLoss >= 0 ? "text-green-500" : "text-red-500")}>
                          ${Math.abs(strategy.profitLoss).toFixed(0)}
                        </div>
                        <div className="text-xs text-muted-foreground">{isRTL ? 'ربح' : 'P/L'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Trade Dialog */}
      <Dialog open={isAddTradeOpen} onOpenChange={setIsAddTradeOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {isRTL ? 'تسجيل صفقة جديدة' : 'Log New Trade'}
            </DialogTitle>
            <DialogDescription>
              {isRTL ? 'أدخل تفاصيل الصفقة' : 'Enter trade details'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Quick/Detailed Toggle */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">{isRTL ? 'وضع التسجيل:' : 'Entry Mode:'}</span>
              <div className="flex gap-2">
                <Button
                  variant={quickMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setQuickMode(true)}
                >
                  <Zap className="h-4 w-4 mr-1" />
                  {isRTL ? 'سريع' : 'Quick'}
                </Button>
                <Button
                  variant={!quickMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setQuickMode(false)}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-1" />
                  {isRTL ? 'مفصل' : 'Detailed'}
                </Button>
              </div>
            </div>

            {/* Basic Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'الرمز' : 'Symbol'} *</Label>
                <Select value={newTrade.symbol} onValueChange={(v) => setNewTrade({ ...newTrade, symbol: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder={isRTL ? 'اختر...' : 'Select...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {SYMBOLS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'النوع' : 'Type'} *</Label>
                <Select value={newTrade.type} onValueChange={(v) => setNewTrade({ ...newTrade, type: v as 'buy' | 'sell' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">{isRTL ? 'شراء 📈' : 'Buy 📈'}</SelectItem>
                    <SelectItem value="sell">{isRTL ? 'بيع 📉' : 'Sell 📉'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'سعر الدخول' : 'Entry Price'} *</Label>
                <Input
                  type="number"
                  step="any"
                  value={newTrade.entryPrice}
                  onChange={(e) => setNewTrade({ ...newTrade, entryPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'سعر الخروج' : 'Exit Price'}</Label>
                <Input
                  type="number"
                  step="any"
                  value={newTrade.exitPrice}
                  onChange={(e) => setNewTrade({ ...newTrade, exitPrice: e.target.value })}
                  placeholder={isRTL ? 'اتركه فارغ للصفقات المفتوحة' : 'Leave empty for open trades'}
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
                <Label className="text-red-500">{isRTL ? 'وقف الخسارة' : 'Stop Loss'}</Label>
                <Input
                  type="number"
                  step="any"
                  value={newTrade.stopLoss}
                  onChange={(e) => setNewTrade({ ...newTrade, stopLoss: e.target.value })}
                  placeholder="0.00"
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
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'الإطار الزمني' : 'Timeframe'}</Label>
                <Select value={newTrade.timeframe} onValueChange={(v) => setNewTrade({ ...newTrade, timeframe: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEFRAMES.map(tf => <SelectItem key={tf} value={tf}>{tf}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Strategy Selection */}
            <div className="space-y-2">
              <Label>{isRTL ? 'الاستراتيجية' : 'Strategy'}</Label>
              <Select value={newTrade.strategyId} onValueChange={(v) => setNewTrade({ ...newTrade, strategyId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? 'اختر استراتيجية...' : 'Select strategy...'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{isRTL ? 'بدون استراتيجية' : 'No strategy'}</SelectItem>
                  {strategies.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Risk Metrics */}
            {riskMetrics && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{isRTL ? 'معايير المخاطر' : 'Risk Metrics'}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-red-500">${riskMetrics.riskAmount.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">{isRTL ? 'مبلغ المخاطرة' : 'Risk'}</div>
                    </div>
                    <div>
                      <div className={cn("text-lg font-bold", riskMetrics.riskPercent > 2 ? 'text-red-500' : 'text-green-500')}>
                        {riskMetrics.riskPercent.toFixed(2)}%
                      </div>
                      <div className="text-xs text-muted-foreground">{isRTL ? 'النسبة' : 'Risk %'}</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-500">${riskMetrics.rewardAmount.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">{isRTL ? 'العائد' : 'Reward'}</div>
                    </div>
                    <div>
                      <div className={cn("text-lg font-bold", riskMetrics.rrRatio >= 1.5 ? 'text-green-500' : 'text-amber-500')}>
                        1:{riskMetrics.rrRatio.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">{isRTL ? 'مخاطرة:عائد' : 'R:R'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detailed Fields */}
            {!quickMode && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{isRTL ? 'سبب الدخول' : 'Entry Reason'}</Label>
                    <Textarea
                      value={newTrade.entryReason}
                      onChange={(e) => setNewTrade({ ...newTrade, entryReason: e.target.value })}
                      placeholder={isRTL ? 'لماذا دخلت هذه الصفقة؟' : 'Why did you enter this trade?'}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'سبب الخروج' : 'Exit Reason'}</Label>
                    <Textarea
                      value={newTrade.exitReason}
                      onChange={(e) => setNewTrade({ ...newTrade, exitReason: e.target.value })}
                      placeholder={isRTL ? 'لماذا خرجت من الصفقة؟' : 'Why did you exit?'}
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{isRTL ? 'الحالة النفسية' : 'Emotions'}</Label>
                      <Select value={newTrade.emotions} onValueChange={(v) => setNewTrade({ ...newTrade, emotions: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder={isRTL ? 'اختر...' : 'Select...'} />
                        </SelectTrigger>
                        <SelectContent>
                          {EMOTIONS.map(e => (
                            <SelectItem key={e.value} value={e.value}>
                              {isRTL ? e.labelAr : e.labelEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{isRTL ? 'مستوى الثقة' : 'Confidence'}</Label>
                      <div className="flex items-center gap-4">
                        <Input
                          type="range"
                          min="1"
                          max="10"
                          value={newTrade.confidence}
                          onChange={(e) => setNewTrade({ ...newTrade, confidence: parseInt(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="font-semibold w-6">{newTrade.confidence}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{isRTL ? 'ملاحظات' : 'Notes'}</Label>
                    <Textarea
                      value={newTrade.notes}
                      onChange={(e) => setNewTrade({ ...newTrade, notes: e.target.value })}
                      placeholder={isRTL ? 'ملاحظات إضافية...' : 'Additional notes...'}
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
                          <ImageIcon className="h-4 w-4 mr-2" />
                          {isRTL ? 'تحميل صورة' : 'Upload Image'}
                        </label>
                      </Button>
                      {newTrade.chartImage && (
                        <img src={newTrade.chartImage} alt="Chart" className="w-16 h-16 rounded object-cover" />
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddTradeOpen(false); resetTradeForm(); }} disabled={isSaving}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handleAddTrade}
              className="bg-green-500 hover:bg-green-600"
              disabled={isSaving || !newTrade.symbol || !newTrade.entryPrice}
            >
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              {isRTL ? 'حفظ الصفقة' : 'Save Trade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Strategy Dialog */}
      <Dialog open={isAddStrategyOpen} onOpenChange={setIsAddStrategyOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isRTL ? 'إضافة استراتيجية جديدة' : 'Add New Strategy'}</DialogTitle>
            <DialogDescription>
              {isRTL ? 'حدد تفاصيل استراتيجيتك' : 'Define your strategy details'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{isRTL ? 'اسم الاستراتيجية' : 'Strategy Name'} *</Label>
              <Input
                value={newStrategy.name}
                onChange={(e) => setNewStrategy({ ...newStrategy, name: e.target.value })}
                placeholder={isRTL ? 'مثال: استراتيجية الاختراق' : 'e.g., Breakout Strategy'}
              />
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'الوصف' : 'Description'}</Label>
              <Textarea
                value={newStrategy.description}
                onChange={(e) => setNewStrategy({ ...newStrategy, description: e.target.value })}
                placeholder={isRTL ? 'وصف مختصر' : 'Brief description'}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'الفئة' : 'Category'}</Label>
                <Select value={newStrategy.category} onValueChange={(v) => setNewStrategy({ ...newStrategy, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">{isRTL ? 'تحليل فني' : 'Technical'}</SelectItem>
                    <SelectItem value="fundamental">{isRTL ? 'تحليل أساسي' : 'Fundamental'}</SelectItem>
                    <SelectItem value="hybrid">{isRTL ? 'مختلط' : 'Hybrid'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'الإطار الزمني' : 'Timeframe'}</Label>
                <Select value={newStrategy.timeframe} onValueChange={(v) => setNewStrategy({ ...newStrategy, timeframe: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEFRAMES.map(tf => <SelectItem key={tf} value={tf}>{tf}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'قواعد الدخول' : 'Entry Rules'}</Label>
              <Textarea
                value={newStrategy.entryRules}
                onChange={(e) => setNewStrategy({ ...newStrategy, entryRules: e.target.value })}
                placeholder={isRTL ? 'متى تدخل؟' : 'When to enter?'}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'قواعد الخروج' : 'Exit Rules'}</Label>
              <Textarea
                value={newStrategy.exitRules}
                onChange={(e) => setNewStrategy({ ...newStrategy, exitRules: e.target.value })}
                placeholder={isRTL ? 'متى تخرج؟' : 'When to exit?'}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStrategyOpen(false)} disabled={isSaving}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={handleAddStrategy}
              className="bg-green-500"
              disabled={isSaving || !newStrategy.name}
            >
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isRTL ? 'إضافة' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              {isRTL ? 'رفع من MT4/MT5' : 'Upload from MT4/MT5'}
            </DialogTitle>
            <DialogDescription>
              {isRTL ? 'ارفع ملف CSV أو JSON من منصة التداول' : 'Upload CSV or JSON file from your trading platform'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                {isRTL ? 'اسحب الملف هنا أو اضغط للاختيار' : 'Drag file here or click to select'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileUpload}
                className="hidden"
                id="trade-file"
              />
              <Button variant="outline" asChild>
                <label htmlFor="trade-file" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  {isRTL ? 'اختيار ملف' : 'Select File'}
                </label>
              </Button>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{isRTL ? 'تنسيق الملف' : 'File Format'}</AlertTitle>
              <AlertDescription className="text-xs">
                {isRTL ? 'الملف يجب أن يحتوي على: Symbol, Type, Entry, Exit, P/L' : 'File should contain: Symbol, Type, Entry, Exit, P/L'}
              </AlertDescription>
            </Alert>
          </div>
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
                {selectedTrade.strategy && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-sm text-muted-foreground">{isRTL ? 'الاستراتيجية' : 'Strategy'}</div>
                    <Badge variant="secondary">{selectedTrade.strategy}</Badge>
                  </div>
                )}
                {selectedTrade.notes && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-sm text-muted-foreground mb-1">{isRTL ? 'ملاحظات' : 'Notes'}</div>
                    <div className="text-sm">{selectedTrade.notes}</div>
                  </div>
                )}
                {(selectedTrade.profitLoss || 0) !== 0 && (
                  <div className={cn("text-center p-4 rounded-lg", (selectedTrade.profitLoss || 0) >= 0 ? 'bg-green-500/10' : 'bg-red-500/10')}>
                    <div className="text-sm text-muted-foreground">{isRTL ? 'الربح/الخسارة' : 'Profit/Loss'}</div>
                    <div className={cn("text-2xl font-bold", (selectedTrade.profitLoss || 0) >= 0 ? 'text-green-500' : 'text-red-500')}>
                      ${(selectedTrade.profitLoss || 0).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => handleDeleteTrade(selectedTrade.id)} className="text-red-500">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isRTL ? 'حذف' : 'Delete'}
                </Button>
                <Button onClick={() => setSelectedTrade(null)}>
                  {isRTL ? 'إغلاق' : 'Close'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Strategy Detail Dialog */}
      <Dialog open={!!selectedStrategy && !isAddStrategyOpen} onOpenChange={() => setSelectedStrategy(null)}>
        <DialogContent className="max-w-2xl">
          {selectedStrategy && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedStrategy.name}
                  <Badge variant="outline">{selectedStrategy.timeframe}</Badge>
                </DialogTitle>
                <DialogDescription>{selectedStrategy.description}</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-4 py-4">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{selectedStrategy.totalTrades}</div>
                  <div className="text-sm text-muted-foreground">{isRTL ? 'صفقات' : 'Trades'}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-500">{selectedStrategy.winRate?.toFixed(0) || 0}%</div>
                  <div className="text-sm text-muted-foreground">{isRTL ? 'نسبة الفوز' : 'Win Rate'}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <div className={cn("text-2xl font-bold", selectedStrategy.profitLoss >= 0 ? "text-green-500" : "text-red-500")}>
                    ${selectedStrategy.profitLoss.toFixed(0)}
                  </div>
                  <div className="text-sm text-muted-foreground">{isRTL ? 'ربح/خسارة' : 'P/L'}</div>
                </div>
              </div>
              {selectedStrategy.entryRules && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-sm font-medium mb-2">{isRTL ? 'قواعد الدخول' : 'Entry Rules'}</div>
                  <div className="text-sm text-muted-foreground">{selectedStrategy.entryRules}</div>
                </div>
              )}
              {selectedStrategy.exitRules && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-sm font-medium mb-2">{isRTL ? 'قواعد الخروج' : 'Exit Rules'}</div>
                  <div className="text-sm text-muted-foreground">{selectedStrategy.exitRules}</div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={() => setSelectedStrategy(null)} className="bg-green-500">
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
