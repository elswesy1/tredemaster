'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { useI18n } from '@/lib/i18n'
import { useTradingStore } from '@/lib/store'
import { toast } from 'sonner'
import {
  Plus,
  BookOpen, 
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Save,
  Trash2,
  Edit3,
  History,
  Lightbulb,
  Brain,
  Heart,
  Zap,
  PlayCircle,
  StopCircle,
  Timer,
  DollarSign,
  Activity,
  Award,
  X,
  Settings,
  FileText,
  LineChart,
  CandlestickChart,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Wallet
} from 'lucide-react'

interface JournalEntry {
  id: string
  date: string
  type: string
  
  // Pre-market
  marketAnalysis?: string
  keyLevels?: string
  supportLevels?: string
  resistanceLevels?: string
  trendDirection?: string
  expectedVolatility?: string
  economicEvents?: string
  tradingPlan?: string
  playbooksToUse?: string
  riskPlan?: string
  dailyGoal?: string
  maxTrades?: number
  
  // Market-in
  sessionType?: string
  sessionStart?: string
  sessionEnd?: string
  tradesPlanned?: number
  tradesExecuted?: number
  entrySetups?: string
  priceActionObs?: string
  executionNotes?: string
  marketBehavior?: string
  realTimeObservations?: string
  
  // Market-post
  totalTrades?: number
  winningTrades?: number
  losingTrades?: number
  totalProfitLoss?: number
  executionQuality?: number
  planAdherence?: number
  riskAdherence?: number
  emotionsBefore?: string
  emotionsDuring?: string
  emotionsAfter?: string
  sessionResult?: string
  whatWentWell?: string
  whatNeedsImprovement?: string
  lessonsLearned?: string
  tomorrowPlan?: string
  accountId?: string
}

interface FormData {
  // Pre-market
  marketAnalysis: string
  keyLevels: string
  supportLevels: string
  resistanceLevels: string
  trendDirection: string
  expectedVolatility: string
  economicEvents: string
  tradingPlan: string
  playbooksToUse: string
  riskPlan: string
  dailyGoal: string
  maxTrades: number
  
  // Market-in
  sessionType: string
  sessionStart: string
  sessionEnd: string
  tradesPlanned: number
  tradesExecuted: number
  entrySetups: string
  priceActionObs: string
  executionNotes: string
  marketBehavior: string
  realTimeObservations: string
  
  // Market-post
  totalTrades: number
  winningTrades: number
  losingTrades: number
  totalProfitLoss: number
  executionQuality: number
  planAdherence: number
  riskAdherence: number
  emotionsBefore: string
  emotionsDuring: string
  emotionsAfter: string
  sessionResult: string
  whatWentWell: string
  whatNeedsImprovement: string
  lessonsLearned: string
  tomorrowPlan: string
  accountId: string
}

const initialFormData: FormData = {
  // Pre-market
  marketAnalysis: '',
  keyLevels: '',
  supportLevels: '',
  resistanceLevels: '',
  trendDirection: '',
  expectedVolatility: '',
  economicEvents: '',
  tradingPlan: '',
  playbooksToUse: '',
  riskPlan: '',
  dailyGoal: '',
  maxTrades: 3,
  
  // Market-in
  sessionType: '',
  sessionStart: '',
  sessionEnd: '',
  tradesPlanned: 0,
  tradesExecuted: 0,
  entrySetups: '',
  priceActionObs: '',
  executionNotes: '',
  marketBehavior: '',
  realTimeObservations: '',
  
  // Market-post
  totalTrades: 0,
  winningTrades: 0,
  losingTrades: 0,
  totalProfitLoss: 0,
  executionQuality: 5,
  planAdherence: 5,
  riskAdherence: 5,
  emotionsBefore: '',
  emotionsDuring: '',
  emotionsAfter: '',
  sessionResult: '',
  whatWentWell: '',
  whatNeedsImprovement: '',
  lessonsLearned: '',
  tomorrowPlan: '',
  accountId: 'none',
}

export function JournalView() {
  const { t, language } = useI18n()
  const isRTL = language === 'ar'
  const { connectedAccounts, setConnectedAccounts } = useTradingStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [playbooks, setPlaybooks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('preMarket')

  // Fetch accounts if store is empty
  useEffect(() => {
    if (connectedAccounts.length === 0) {
      const fetchAccounts = async () => {
        try {
          const res = await fetch('/api/accounts')
          if (res.ok) {
            const data = await res.json()
            setConnectedAccounts(data.map((a: any) => ({
              id: a.id,
              name: a.name,
              type: a.accountType || 'broker',
              currency: a.currency,
              balance: a.balance,
              status: a.isActive ? 'connected' : 'disconnected',
              broker: a.broker,
              accountNumber: a.accountNumber
            })))
          }
        } catch (error) {
          console.error('Error fetching accounts for journal:', error)
        }
      }
      fetchAccounts()
    }
  }, [connectedAccounts.length, setConnectedAccounts])

  // Fetch entries on mount and when date changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [entriesRes, playbooksRes] = await Promise.all([
          fetch(`/api/journal?date=${selectedDate}`),
          fetch('/api/playbook')
        ])
        
        if (entriesRes.ok) {
          const data = await entriesRes.json()
          setEntries(data)
        }
        
        if (playbooksRes.ok) {
          const data = await playbooksRes.json()
          setPlaybooks(data)
        }
      } catch (error) {
        console.error('Error fetching journal data:', error)
      } finally {
        setIsLoading(false)
        setLoading(false)
      }
    }
    
    fetchData()
  }, [selectedDate])

  const fetchEntries = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/journal?date=${selectedDate}`)
      if (response.ok) {
        const data = await response.json()
        setEntries(data)
      }
    } catch (error) {
      console.error('Error fetching entries:', error)
      toast.error(t('journal.saveError'))
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        ...formData,
        date: selectedDate,
        type: 'daily',
      }

      let response
      if (editingId) {
        response = await fetch(`/api/journal/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        response = await fetch('/api/journal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (response.ok) {
        toast.success(t('journal.saved'))
        setFormData(initialFormData)
        setEditingId(null)
        setShowAddForm(false)
        fetchEntries()
      } else {
        toast.error(t('journal.saveError'))
      }
    } catch (error) {
      console.error('Error saving entry:', error)
      toast.error(t('journal.saveError'))
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (entry: JournalEntry) => {
    setEditingId(entry.id)
    setFormData({
      marketAnalysis: entry.marketAnalysis || '',
      keyLevels: entry.keyLevels || '',
      supportLevels: entry.supportLevels || '',
      resistanceLevels: entry.resistanceLevels || '',
      trendDirection: entry.trendDirection || '',
      expectedVolatility: entry.expectedVolatility || '',
      economicEvents: entry.economicEvents || '',
      tradingPlan: entry.tradingPlan || '',
      playbooksToUse: entry.playbooksToUse || '',
      riskPlan: entry.riskPlan || '',
      dailyGoal: entry.dailyGoal || '',
      maxTrades: entry.maxTrades || 3,
      sessionType: entry.sessionType || '',
      sessionStart: entry.sessionStart || '',
      sessionEnd: entry.sessionEnd || '',
      tradesPlanned: entry.tradesPlanned || 0,
      tradesExecuted: entry.tradesExecuted || 0,
      entrySetups: entry.entrySetups || '',
      priceActionObs: entry.priceActionObs || '',
      executionNotes: entry.executionNotes || '',
      marketBehavior: entry.marketBehavior || '',
      realTimeObservations: entry.realTimeObservations || '',
      totalTrades: entry.totalTrades || 0,
      winningTrades: entry.winningTrades || 0,
      losingTrades: entry.losingTrades || 0,
      totalProfitLoss: entry.totalProfitLoss || 0,
      executionQuality: entry.executionQuality || 5,
      planAdherence: entry.planAdherence || 5,
      riskAdherence: entry.riskAdherence || 5,
      emotionsBefore: entry.emotionsBefore || '',
      emotionsDuring: entry.emotionsDuring || '',
      emotionsAfter: entry.emotionsAfter || '',
      sessionResult: entry.sessionResult || '',
      whatWentWell: entry.whatWentWell || '',
      whatNeedsImprovement: entry.whatNeedsImprovement || '',
      lessonsLearned: entry.lessonsLearned || '',
      tomorrowPlan: entry.tomorrowPlan || '',
      accountId: entry.accountId || '',
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('journal.confirmDelete'))) return
    
    try {
      const response = await fetch(`/api/journal/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        toast.success(t('journal.saved'))
        fetchEntries()
      } else {
        toast.error(t('journal.saveError'))
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
      toast.error(t('journal.saveError'))
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedEntries(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const getRatingLabel = (value: number): string => {
    if (value <= 2) return t('journal.rating.poor')
    if (value <= 4) return t('journal.rating.fair')
    if (value <= 6) return t('journal.rating.good')
    if (value <= 8) return t('journal.rating.veryGood')
    return t('journal.rating.excellent')
  }

  const getRatingColor = (value: number): string => {
    if (value <= 3) return 'text-red-500'
    if (value <= 6) return 'text-yellow-500'
    return 'text-green-500'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'profit':
        return <ThumbsUp className="h-4 w-4 text-green-500" />
      case 'loss':
        return <ThumbsDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />
    }
  }

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'profit':
        return <Badge className="bg-green-500 hover:bg-green-600">{t('journal.marketPost.results.profit')}</Badge>
      case 'loss':
        return <Badge className="bg-red-500 hover:bg-red-600">{t('journal.marketPost.results.loss')}</Badge>
      default:
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">{t('journal.marketPost.results.breakEven')}</Badge>
    }
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-amber-500" />
            {t('journal.title')}
          </h2>
          <p className="text-muted-foreground mt-1">
            {t('journal.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          />
          <Button 
            onClick={() => {
              setShowAddForm(!showAddForm)
              if (!showAddForm) {
                setEditingId(null)
                setFormData(initialFormData)
              }
            }} 
            className="bg-gradient-to-r from-amber-500 to-orange-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            {editingId ? t('journal.editEntry') : t('journal.newEntry')}
          </Button>
        </div>
      </div>

      {/* Add/Edit Entry Form */}
      {showAddForm && (
        <Card className="border-2 border-amber-500/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {editingId ? <Edit3 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                  {editingId ? t('journal.editEntry') : t('journal.newEntry')}
                </CardTitle>
                <CardDescription>
                  {formatDate(selectedDate)}
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingId(null)
                  setFormData(initialFormData)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 h-auto">
                <TabsTrigger value="preMarket" className="flex flex-col items-center gap-1 py-2 px-3">
                  <Clock className="h-5 w-5" />
                  <span className="text-xs sm:text-sm">{t('journal.sections.preMarket')}</span>
                </TabsTrigger>
                <TabsTrigger value="marketIn" className="flex flex-col items-center gap-1 py-2 px-3">
                  <PlayCircle className="h-5 w-5" />
                  <span className="text-xs sm:text-sm">{t('journal.sections.marketIn')}</span>
                </TabsTrigger>
                <TabsTrigger value="marketPost" className="flex flex-col items-center gap-1 py-2 px-3">
                  <StopCircle className="h-5 w-5" />
                  <span className="text-xs sm:text-sm">{t('journal.sections.marketPost')}</span>
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[500px] pr-4">
                {/* ============ PRE-MARKET SECTION ============ */}
                <TabsContent value="preMarket" className="space-y-6 mt-0">
                  {/* Section Title & Account Selection */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-muted/30 border">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{t('journal.preMarket.title')}</h3>
                        <p className="text-sm text-muted-foreground">{t('journal.preMarket.subtitle')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 min-w-[240px]">
                      <Label className="whitespace-nowrap flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-cyan-500" />
                        {isRTL ? 'الحساب:' : 'Account:'}
                      </Label>
                      <Select
                        value={formData.accountId}
                        onValueChange={(value) => setFormData({ ...formData, accountId: value })}
                      >
                        <SelectTrigger className="bg-background border-cyan-500/30">
                          <SelectValue placeholder={isRTL ? 'اختر الحساب' : 'Select Account'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            {isRTL ? 'عام / بدون حساب' : 'General / No Account'}
                          </SelectItem>
                          {connectedAccounts.map((acc) => (
                            <SelectItem key={acc.id} value={acc.id}>
                              {acc.name} ({acc.currency})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Market Analysis */}
                  <Card className="border-blue-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <LineChart className="h-4 w-4 text-blue-500" />
                        {t('journal.preMarket.analysis.title')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t('journal.preMarket.analysis.marketAnalysis')}</Label>
                        <Textarea
                          value={formData.marketAnalysis}
                          onChange={(e) => setFormData({ ...formData, marketAnalysis: e.target.value })}
                          placeholder={t('journal.preMarket.analysis.marketAnalysisPlaceholder')}
                          rows={4}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            {t('journal.preMarket.analysis.supportLevels')}
                          </Label>
                          <Input
                            value={formData.supportLevels}
                            onChange={(e) => setFormData({ ...formData, supportLevels: e.target.value })}
                            placeholder="1.0850, 1.0820..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-red-500" />
                            {t('journal.preMarket.analysis.resistanceLevels')}
                          </Label>
                          <Input
                            value={formData.resistanceLevels}
                            onChange={(e) => setFormData({ ...formData, resistanceLevels: e.target.value })}
                            placeholder="1.0920, 1.0950..."
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t('journal.preMarket.analysis.trendDirection')}</Label>
                          <Select
                            value={formData.trendDirection}
                            onValueChange={(value) => setFormData({ ...formData, trendDirection: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('journal.preMarket.analysis.selectTrend')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bullish">
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4 text-green-500" />
                                  {t('journal.preMarket.analysis.trends.bullish')}
                                </div>
                              </SelectItem>
                              <SelectItem value="bearish">
                                <div className="flex items-center gap-2">
                                  <TrendingDown className="h-4 w-4 text-red-500" />
                                  {t('journal.preMarket.analysis.trends.bearish')}
                                </div>
                              </SelectItem>
                              <SelectItem value="ranging">
                                <div className="flex items-center gap-2">
                                  <Minus className="h-4 w-4 text-yellow-500" />
                                  {t('journal.preMarket.analysis.trends.ranging')}
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>{t('journal.preMarket.analysis.expectedVolatility')}</Label>
                          <Select
                            value={formData.expectedVolatility}
                            onValueChange={(value) => setFormData({ ...formData, expectedVolatility: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('journal.preMarket.analysis.selectVolatility')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">{t('journal.preMarket.analysis.volatility.low')}</SelectItem>
                              <SelectItem value="medium">{t('journal.preMarket.analysis.volatility.medium')}</SelectItem>
                              <SelectItem value="high">{t('journal.preMarket.analysis.volatility.high')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          {t('journal.preMarket.analysis.economicEvents')}
                        </Label>
                        <Textarea
                          value={formData.economicEvents}
                          onChange={(e) => setFormData({ ...formData, economicEvents: e.target.value })}
                          placeholder={t('journal.preMarket.analysis.economicEventsPlaceholder')}
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Trading Plan */}
                  <Card className="border-green-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-500" />
                        {t('journal.preMarket.plan.title')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t('journal.preMarket.plan.tradingPlan')}</Label>
                        <Textarea
                          value={formData.tradingPlan}
                          onChange={(e) => setFormData({ ...formData, tradingPlan: e.target.value })}
                          placeholder={t('journal.preMarket.plan.tradingPlanPlaceholder')}
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <CandlestickChart className="h-4 w-4 text-purple-500" />
                          {isRTL ? 'نماذج التداول المستخدمة' : 'Playbooks to Use'}
                        </Label>
                        <Select 
                          value={formData.playbooksToUse} 
                          onValueChange={(v) => setFormData({ ...formData, playbooksToUse: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={isRTL ? 'اختر نموذج...' : 'Select playbook...'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">{isRTL ? 'بدون نموذج محدد' : 'No specific playbook'}</SelectItem>
                            {playbooks.map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t('journal.preMarket.plan.dailyGoal')}</Label>
                          <Input
                            value={formData.dailyGoal}
                            onChange={(e) => setFormData({ ...formData, dailyGoal: e.target.value })}
                            placeholder={t('journal.preMarket.plan.dailyGoalPlaceholder')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('journal.preMarket.plan.maxTrades')}</Label>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={formData.maxTrades}
                            onChange={(e) => setFormData({ ...formData, maxTrades: parseInt(e.target.value) || 3 })}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Risk Plan */}
                  <Card className="border-red-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        {t('journal.preMarket.risk.title')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label>{t('journal.preMarket.risk.riskPlan')}</Label>
                        <Textarea
                          value={formData.riskPlan}
                          onChange={(e) => setFormData({ ...formData, riskPlan: e.target.value })}
                          placeholder={t('journal.preMarket.risk.riskPlanPlaceholder')}
                          rows={4}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Navigation Button */}
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => setActiveTab('marketIn')}
                      className="bg-gradient-to-r from-blue-500 to-cyan-600"
                    >
                      {t('journal.preMarket.nextToMarketIn')}
                      {isRTL ? <ChevronDown className="h-4 w-4 mr-2 rotate-90" /> : <ChevronDown className="h-4 w-4 ml-2 -rotate-90" />}
                    </Button>
                  </div>
                </TabsContent>

                {/* ============ MARKET-IN SECTION ============ */}
                <TabsContent value="marketIn" className="space-y-6 mt-0">
                  {/* Section Header */}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                    <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <PlayCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{t('journal.marketIn.title')}</h3>
                      <p className="text-sm text-muted-foreground">{t('journal.marketIn.subtitle')}</p>
                    </div>
                  </div>

                  {/* Session Info */}
                  <Card className="border-green-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Timer className="h-4 w-4 text-green-500" />
                        {t('journal.marketIn.session.title')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>{t('journal.marketIn.session.sessionType')}</Label>
                          <Select
                            value={formData.sessionType}
                            onValueChange={(value) => setFormData({ ...formData, sessionType: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('journal.marketIn.session.selectSession')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="london">{t('journal.marketIn.session.sessions.london')}</SelectItem>
                              <SelectItem value="newYork">{t('journal.marketIn.session.sessions.newYork')}</SelectItem>
                              <SelectItem value="tokyo">{t('journal.marketIn.session.sessions.tokyo')}</SelectItem>
                              <SelectItem value="sydney">{t('journal.marketIn.session.sessions.sydney')}</SelectItem>
                              <SelectItem value="overlap">{t('journal.marketIn.session.sessions.overlap')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>{t('journal.marketIn.session.sessionStart')}</Label>
                          <Input
                            type="time"
                            value={formData.sessionStart}
                            onChange={(e) => setFormData({ ...formData, sessionStart: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('journal.marketIn.session.sessionEnd')}</Label>
                          <Input
                            type="time"
                            value={formData.sessionEnd}
                            onChange={(e) => setFormData({ ...formData, sessionEnd: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-muted/50 text-center">
                          <p className="text-sm text-muted-foreground">{t('journal.marketIn.session.tradesPlanned')}</p>
                          <p className="text-2xl font-bold text-blue-500">{formData.tradesPlanned}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50 text-center">
                          <p className="text-sm text-muted-foreground">{t('journal.marketIn.session.tradesExecuted')}</p>
                          <p className="text-2xl font-bold text-green-500">{formData.tradesExecuted}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Trade Execution */}
                  <Card className="border-purple-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Activity className="h-4 w-4 text-purple-500" />
                        {t('journal.marketIn.execution.title')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-amber-500" />
                          {t('journal.marketIn.execution.entrySetups')}
                        </Label>
                        <Select
                          value={formData.entrySetups}
                          onValueChange={(value) => setFormData({ ...formData, entrySetups: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('journal.marketIn.execution.entrySetupsPlaceholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            {playbooks.length > 0 ? (
                              playbooks.map((pb) => (
                                <SelectItem key={pb.id} value={pb.name}>
                                  {pb.name} {pb.setupName ? `(${pb.setupName})` : ''}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>
                                {isRTL ? 'لا توجد قواعد في الكتيب' : 'No playbooks found'}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <CandlestickChart className="h-4 w-4 text-blue-500" />
                          {t('journal.marketIn.execution.priceActionObs')}
                        </Label>
                        <Textarea
                          value={formData.priceActionObs}
                          onChange={(e) => setFormData({ ...formData, priceActionObs: e.target.value })}
                          placeholder={t('journal.marketIn.execution.priceActionObsPlaceholder')}
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t('journal.marketIn.execution.marketBehavior')}</Label>
                        <Select
                          value={formData.marketBehavior}
                          onValueChange={(value) => setFormData({ ...formData, marketBehavior: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('journal.marketIn.execution.selectBehavior')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="trending">{t('journal.marketIn.execution.behaviors.trending')}</SelectItem>
                            <SelectItem value="ranging">{t('journal.marketIn.execution.behaviors.ranging')}</SelectItem>
                            <SelectItem value="volatile">{t('journal.marketIn.execution.behaviors.volatile')}</SelectItem>
                            <SelectItem value="choppy">{t('journal.marketIn.execution.behaviors.choppy')}</SelectItem>
                            <SelectItem value="quiet">{t('journal.marketIn.execution.behaviors.quiet')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notes & Observations */}
                  <Card className="border-amber-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4 text-amber-500" />
                        {t('journal.marketIn.notes.title')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t('journal.marketIn.notes.executionNotes')}</Label>
                        <Textarea
                          value={formData.executionNotes}
                          onChange={(e) => setFormData({ ...formData, executionNotes: e.target.value })}
                          placeholder={t('journal.marketIn.notes.executionNotesPlaceholder')}
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                          {t('journal.marketIn.notes.realTimeObservations')}
                        </Label>
                        <Textarea
                          value={formData.realTimeObservations}
                          onChange={(e) => setFormData({ ...formData, realTimeObservations: e.target.value })}
                          placeholder={t('journal.marketIn.notes.realTimeObservationsPlaceholder')}
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={() => setActiveTab('preMarket')}
                    >
                      {isRTL ? <ChevronDown className="h-4 w-4 ml-2 -rotate-90" /> : <ChevronDown className="h-4 w-4 mr-2 rotate-90" />}
                      {t('journal.marketIn.backToPreMarket')}
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('marketPost')}
                      className="bg-gradient-to-r from-green-500 to-emerald-600"
                    >
                      {t('journal.marketIn.nextToMarketPost')}
                      {isRTL ? <ChevronDown className="h-4 w-4 mr-2 rotate-90" /> : <ChevronDown className="h-4 w-4 ml-2 -rotate-90" />}
                    </Button>
                  </div>
                </TabsContent>

                {/* ============ MARKET-POST SECTION ============ */}
                <TabsContent value="marketPost" className="space-y-6 mt-0">
                  {/* Section Header */}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <StopCircle className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{t('journal.marketPost.title')}</h3>
                      <p className="text-sm text-muted-foreground">{t('journal.marketPost.subtitle')}</p>
                    </div>
                  </div>

                  {/* Session Results */}
                  <Card className="border-purple-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-purple-500" />
                        {t('journal.marketPost.results.title')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg bg-muted/50 text-center">
                          <p className="text-sm text-muted-foreground">{t('journal.marketPost.results.totalTrades')}</p>
                          <p className="text-2xl font-bold">{formData.totalTrades}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-green-500/10 text-center">
                          <p className="text-sm text-muted-foreground">{t('journal.marketPost.results.winningTrades')}</p>
                          <p className="text-2xl font-bold text-green-500">{formData.winningTrades}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-red-500/10 text-center">
                          <p className="text-sm text-muted-foreground">{t('journal.marketPost.results.losingTrades')}</p>
                          <p className="text-2xl font-bold text-red-500">{formData.losingTrades}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50 text-center">
                          <p className="text-sm text-muted-foreground">{t('journal.marketPost.results.totalProfitLoss')}</p>
                          <p className={`text-2xl font-bold ${formData.totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ${formData.totalProfitLoss}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          {getResultIcon(formData.sessionResult)}
                          {t('journal.marketPost.results.sessionResult')}
                        </Label>
                        <Select
                          value={formData.sessionResult}
                          onValueChange={(value) => setFormData({ ...formData, sessionResult: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('journal.marketPost.results.selectResult')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="profit">
                              <div className="flex items-center gap-2">
                                <ThumbsUp className="h-4 w-4 text-green-500" />
                                {t('journal.marketPost.results.profit')}
                              </div>
                            </SelectItem>
                            <SelectItem value="loss">
                              <div className="flex items-center gap-2">
                                <ThumbsDown className="h-4 w-4 text-red-500" />
                                {t('journal.marketPost.results.loss')}
                              </div>
                            </SelectItem>
                            <SelectItem value="breakeven">
                              <div className="flex items-center gap-2">
                                <Minus className="h-4 w-4 text-yellow-500" />
                                {t('journal.marketPost.results.breakeven')}
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Performance Ratings */}
                  <Card className="border-blue-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Award className="h-4 w-4 text-blue-500" />
                        {t('journal.marketPost.ratings.title')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Execution Quality */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-blue-500" />
                            {t('journal.marketPost.ratings.executionQuality')}
                          </Label>
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-bold ${getRatingColor(formData.executionQuality)}`}>
                              {formData.executionQuality}/10
                            </span>
                            <Badge variant="outline">{getRatingLabel(formData.executionQuality)}</Badge>
                          </div>
                        </div>
                        <Slider
                          value={[formData.executionQuality]}
                          onValueChange={(value) => setFormData({ ...formData, executionQuality: value[0] })}
                          max={10}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <Progress value={formData.executionQuality * 10} className="h-2" />
                      </div>

                      <Separator />

                      {/* Plan Adherence */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-green-500" />
                            {t('journal.marketPost.ratings.planAdherence')}
                          </Label>
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-bold ${getRatingColor(formData.planAdherence)}`}>
                              {formData.planAdherence}/10
                            </span>
                            <Badge variant="outline">{getRatingLabel(formData.planAdherence)}</Badge>
                          </div>
                        </div>
                        <Slider
                          value={[formData.planAdherence]}
                          onValueChange={(value) => setFormData({ ...formData, planAdherence: value[0] })}
                          max={10}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <Progress value={formData.planAdherence * 10} className="h-2" />
                      </div>

                      <Separator />

                      {/* Risk Adherence */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            {t('journal.marketPost.ratings.riskAdherence')}
                          </Label>
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-bold ${getRatingColor(formData.riskAdherence)}`}>
                              {formData.riskAdherence}/10
                            </span>
                            <Badge variant="outline">{getRatingLabel(formData.riskAdherence)}</Badge>
                          </div>
                        </div>
                        <Slider
                          value={[formData.riskAdherence]}
                          onValueChange={(value) => setFormData({ ...formData, riskAdherence: value[0] })}
                          max={10}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                        <Progress value={formData.riskAdherence * 10} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Emotions */}
                  <Card className="border-pink-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Heart className="h-4 w-4 text-pink-500" />
                        {t('journal.marketPost.emotions.title')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t('journal.marketPost.emotions.emotionsBefore')}</Label>
                        <Textarea
                          value={formData.emotionsBefore}
                          onChange={(e) => setFormData({ ...formData, emotionsBefore: e.target.value })}
                          placeholder={t('journal.marketPost.emotions.emotionsBeforePlaceholder')}
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t('journal.marketPost.emotions.emotionsDuring')}</Label>
                        <Textarea
                          value={formData.emotionsDuring}
                          onChange={(e) => setFormData({ ...formData, emotionsDuring: e.target.value })}
                          placeholder={t('journal.marketPost.emotions.emotionsDuringPlaceholder')}
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t('journal.marketPost.emotions.emotionsAfter')}</Label>
                        <Textarea
                          value={formData.emotionsAfter}
                          onChange={(e) => setFormData({ ...formData, emotionsAfter: e.target.value })}
                          placeholder={t('journal.marketPost.emotions.emotionsAfterPlaceholder')}
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Review & Improvement */}
                  <Card className="border-amber-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                        {t('journal.marketPost.review.title')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          {t('journal.marketPost.review.whatWentWell')}
                        </Label>
                        <Textarea
                          value={formData.whatWentWell}
                          onChange={(e) => setFormData({ ...formData, whatWentWell: e.target.value })}
                          placeholder={t('journal.marketPost.review.whatWentWellPlaceholder')}
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          {t('journal.marketPost.review.whatNeedsImprovement')}
                        </Label>
                        <Textarea
                          value={formData.whatNeedsImprovement}
                          onChange={(e) => setFormData({ ...formData, whatNeedsImprovement: e.target.value })}
                          placeholder={t('journal.marketPost.review.whatNeedsImprovementPlaceholder')}
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-purple-500" />
                          {t('journal.marketPost.review.lessonsLearned')}
                        </Label>
                        <Textarea
                          value={formData.lessonsLearned}
                          onChange={(e) => setFormData({ ...formData, lessonsLearned: e.target.value })}
                          placeholder={t('journal.marketPost.review.lessonsLearnedPlaceholder')}
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-blue-500" />
                          {t('journal.marketPost.review.tomorrowPlan')}
                        </Label>
                        <Textarea
                          value={formData.tomorrowPlan}
                          onChange={(e) => setFormData({ ...formData, tomorrowPlan: e.target.value })}
                          placeholder={t('journal.marketPost.review.tomorrowPlanPlaceholder')}
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Navigation & Save Buttons */}
                  <div className="flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={() => setActiveTab('marketIn')}
                    >
                      {isRTL ? <ChevronDown className="h-4 w-4 ml-2 -rotate-90" /> : <ChevronDown className="h-4 w-4 mr-2 rotate-90" />}
                      {t('journal.marketPost.backToMarketIn')}
                    </Button>
                    <Button 
                      onClick={handleSave} 
                      disabled={saving}
                      className="bg-gradient-to-r from-amber-500 to-orange-600"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? t('journal.loading') : t('journal.save')}
                    </Button>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Entry History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-amber-500" />
            {t('journal.history.title')}
          </CardTitle>
          <CardDescription>
            {formatDate(selectedDate)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
            </div>
          ) : Array.isArray(entries) && entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Edit3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">{t('journal.history.noEntriesForDate')}</h3>
              <p className="text-muted-foreground text-center mt-2 max-w-md">
                {t('journal.startWriting')}
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-96">
              <div className="space-y-4">
                {entries.map((entry) => (
                  <Card key={entry.id} className="border">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {entry.sessionResult && getResultIcon(entry.sessionResult)}
                          <span className="font-medium">
                            {new Date(entry.date).toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {entry.sessionType && (
                            <Badge variant="outline">
                              {t(`journal.marketIn.session.sessions.${entry.sessionType}`)}
                            </Badge>
                          )}
                          {entry.trendDirection && (
                            <Badge variant="outline" className={
                              entry.trendDirection === 'bullish' ? 'border-green-500 text-green-500' :
                              entry.trendDirection === 'bearish' ? 'border-red-500 text-red-500' : ''
                            }>
                              {t(`journal.preMarket.analysis.trends.${entry.trendDirection}`)}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(entry)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(entry.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpand(entry.id)}
                          >
                            {expandedEntries.has(entry.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {expandedEntries.has(entry.id) && (
                      <CardContent className="pt-2">
                        <div className="space-y-4">
                          {/* Session Stats */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                            {entry.totalTrades !== undefined && (
                              <div className="p-2 rounded bg-muted/50 text-center">
                                <span className="text-muted-foreground">{t('journal.marketPost.results.totalTrades')}:</span>
                                <p className="font-bold">{entry.totalTrades}</p>
                              </div>
                            )}
                            {entry.winningTrades !== undefined && (
                              <div className="p-2 rounded bg-green-500/10 text-center">
                                <span className="text-muted-foreground">{t('journal.marketPost.results.winningTrades')}:</span>
                                <p className="font-bold text-green-500">{entry.winningTrades}</p>
                              </div>
                            )}
                            {entry.losingTrades !== undefined && (
                              <div className="p-2 rounded bg-red-500/10 text-center">
                                <span className="text-muted-foreground">{t('journal.marketPost.results.losingTrades')}:</span>
                                <p className="font-bold text-red-500">{entry.losingTrades}</p>
                              </div>
                            )}
                            {entry.totalProfitLoss !== undefined && (
                              <div className="p-2 rounded bg-muted/50 text-center">
                                <span className="text-muted-foreground">P/L:</span>
                                <p className={`font-bold ${entry.totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  ${entry.totalProfitLoss}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Ratings */}
                          {(entry.executionQuality || entry.planAdherence || entry.riskAdherence) && (
                            <>
                              <Separator />
                              <div className="grid grid-cols-3 gap-4">
                                {entry.executionQuality && (
                                  <div className="text-center">
                                    <p className="text-xs text-muted-foreground">{t('journal.marketPost.ratings.executionQuality')}</p>
                                    <p className={`text-lg font-bold ${getRatingColor(entry.executionQuality)}`}>
                                      {entry.executionQuality}/10
                                    </p>
                                  </div>
                                )}
                                {entry.planAdherence && (
                                  <div className="text-center">
                                    <p className="text-xs text-muted-foreground">{t('journal.marketPost.ratings.planAdherence')}</p>
                                    <p className={`text-lg font-bold ${getRatingColor(entry.planAdherence)}`}>
                                      {entry.planAdherence}/10
                                    </p>
                                  </div>
                                )}
                                {entry.riskAdherence && (
                                  <div className="text-center">
                                    <p className="text-xs text-muted-foreground">{t('journal.marketPost.ratings.riskAdherence')}</p>
                                    <p className={`text-lg font-bold ${getRatingColor(entry.riskAdherence)}`}>
                                      {entry.riskAdherence}/10
                                    </p>
                                  </div>
                                )}
                              </div>
                            </>
                          )}

                          {/* Market Analysis */}
                          {entry.marketAnalysis && (
                            <>
                              <Separator />
                              <div>
                                <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
                                  <LineChart className="h-4 w-4" />
                                  {t('journal.preMarket.analysis.title')}
                                </h4>
                                <p className="text-sm">{entry.marketAnalysis}</p>
                              </div>
                            </>
                          )}

                          {/* Lessons & Review */}
                          {(entry.whatWentWell || entry.whatNeedsImprovement || entry.lessonsLearned || entry.tomorrowPlan) && (
                            <>
                              <Separator />
                              <div className="space-y-2">
                                <h4 className="font-medium text-purple-600 dark:text-purple-400 flex items-center gap-2">
                                  <Lightbulb className="h-4 w-4" />
                                  {t('journal.marketPost.review.title')}
                                </h4>
                                {entry.whatWentWell && (
                                  <div className="text-sm">
                                    <span className="text-green-500 font-medium">{t('journal.marketPost.review.whatWentWell')}:</span>
                                    <p className="mt-1">{entry.whatWentWell}</p>
                                  </div>
                                )}
                                {entry.whatNeedsImprovement && (
                                  <div className="text-sm">
                                    <span className="text-orange-500 font-medium">{t('journal.marketPost.review.whatNeedsImprovement')}:</span>
                                    <p className="mt-1">{entry.whatNeedsImprovement}</p>
                                  </div>
                                )}
                                {entry.lessonsLearned && (
                                  <div className="text-sm">
                                    <span className="text-purple-500 font-medium">{t('journal.marketPost.review.lessonsLearned')}:</span>
                                    <p className="mt-1">{entry.lessonsLearned}</p>
                                  </div>
                                )}
                                {entry.tomorrowPlan && (
                                  <div className="text-sm">
                                    <span className="text-blue-500 font-medium">{t('journal.marketPost.review.tomorrowPlan')}:</span>
                                    <p className="mt-1">{entry.tomorrowPlan}</p>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
