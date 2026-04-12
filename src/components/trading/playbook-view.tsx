'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
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
import { useI18n } from '@/lib/i18n'
import { getApiHeaders } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Target,
  Edit,
  Trash2,
  BarChart3,
  Clock,
  Loader2,
  RefreshCw,
  BookOpen,
  Image,
  CheckCircle,
  XCircle
} from 'lucide-react'

// Playbook Interface - Updated with new fields
interface Playbook {
  id: string
  name: string
  description: string | null
  setupName: string | null
  rulesChecklist: string | null  // JSON string from database
  screenshotUrl: string | null
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
  createdAt: string
  updatedAt: string
}

interface PlaybookFormData {
  name: string
  description: string
  setupName: string
  rulesChecklist: string[]
  screenshotUrl: string
  category: string
  timeframe: string
  entryRules: string
  exitRules: string
}

const initialFormData: PlaybookFormData = {
  name: '',
  description: '',
  setupName: '',
  rulesChecklist: [],
  screenshotUrl: '',
  category: 'technical',
  timeframe: 'H1',
  entryRules: '',
  exitRules: ''
}

export function PlaybookView() {
  const { t, language } = useI18n()
  const isRTL = language === 'ar'
  const { toast } = useToast()
  
  // States
  const [playbooks, setPlaybooks] = useState<Playbook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null)
  const [playbookToDelete, setPlaybookToDelete] = useState<Playbook | null>(null)
  const [newPlaybook, setNewPlaybook] = useState<PlaybookFormData>(initialFormData)
  const [editPlaybook, setEditPlaybook] = useState<PlaybookFormData>(initialFormData)
  const [newRule, setNewRule] = useState('')

  const categories = [
    { value: 'technical', label: isRTL ? 'تحليل فني' : 'Technical' },
    { value: 'fundamental', label: isRTL ? 'تحليل أساسي' : 'Fundamental' },
    { value: 'hybrid', label: isRTL ? 'مختلط' : 'Hybrid' },
    { value: 'smc', label: isRTL ? 'SMC (Smart Money)' : 'SMC (Smart Money)' }
  ]

  const timeframes = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1']

  // Fetch strategies from API
  const fetchStrategies = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/strategies', {
        method: 'GET',
        headers: getApiHeaders(),
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch strategies')
      }
      
      const data = await response.json()
      setPlaybooks(data)
    } catch (error) {
      console.error('Error fetching strategies:', error)
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في تحميل الاستراتيجيات' : 'Failed to load strategies',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, isRTL])

  // Fetch strategies on mount
  useEffect(() => {
    fetchStrategies()
  }, [fetchStrategies])

  // Create new strategy
  const handleAddStrategy = async () => {
    if (!newPlaybook.name.trim()) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'يرجى إدخال اسم الاستراتيجية' : 'Please enter a strategy name',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSaving(true)
      const response = await fetch('/api/strategies', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(newPlaybook),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create strategy')
      }
      
      const createdStrategy = await response.json()
      setPlaybooks([createdStrategy, ...playbooks])
      setIsAddDialogOpen(false)
      setNewPlaybook(initialFormData)
      
      toast({
        title: isRTL ? 'نجاح' : 'Success',
        description: isRTL ? 'تم إضافة الاستراتيجية بنجاح' : 'Strategy added successfully',
      })
    } catch (error) {
      console.error('Error creating strategy:', error)
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في إضافة الاستراتيجية' : 'Failed to add strategy',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Update strategy
  const handleUpdateStrategy = async () => {
    if (!selectedPlaybook || !editPlaybook.name.trim()) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'يرجى إدخال اسم الاستراتيجية' : 'Please enter a strategy name',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSaving(true)
      const response = await fetch('/api/strategies', {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify({
          id: selectedPlaybook.id,
          ...editPlaybook,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update strategy')
      }
      
      const updatedStrategy = await response.json()
      setPlaybooks(playbooks.map(s => 
        s.id === updatedStrategy.id ? updatedStrategy : s
      ))
      setIsEditDialogOpen(false)
      setSelectedPlaybook(null)
      setEditPlaybook(initialFormData)
      
      toast({
        title: isRTL ? 'نجاح' : 'Success',
        description: isRTL ? 'تم تحديث الاستراتيجية بنجاح' : 'Strategy updated successfully',
      })
    } catch (error) {
      console.error('Error updating strategy:', error)
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في تحديث الاستراتيجية' : 'Failed to update strategy',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Delete strategy
  const handleDeleteStrategy = async (id: string) => {
    try {
      setIsSaving(true)
      const response = await fetch(`/api/strategies?id=${id}`, {
        method: 'DELETE',
        headers: getApiHeaders(),
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete strategy')
      }
      
      setPlaybooks(playbooks.filter(s => s.id !== id))
      setPlaybookToDelete(null)
      setSelectedPlaybook(null)
      
      toast({
        title: isRTL ? 'نجاح' : 'Success',
        description: isRTL ? 'تم حذف الاستراتيجية بنجاح' : 'Strategy deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting strategy:', error)
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في حذف الاستراتيجية' : 'Failed to delete strategy',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Open edit dialog
  const openEditDialog = (strategy: Playbook) => {
    setSelectedPlaybook(strategy)
    setEditPlaybook({
      name: strategy.name,
      description: strategy.description || '',
      setupName: strategy.setupName || '',
      rulesChecklist: strategy.rulesChecklist ? JSON.parse(strategy.rulesChecklist) : [],
      screenshotUrl: strategy.screenshotUrl || '',
      category: strategy.category || 'technical',
      timeframe: strategy.timeframe || 'H1',
      entryRules: strategy.entryRules || '',
      exitRules: strategy.exitRules || '',
    })
    setIsEditDialogOpen(true)
  }

  // Open detail dialog
  const openDetailDialog = (strategy: Playbook) => {
    setSelectedPlaybook(strategy)
  }

  const getCategoryBadge = (category: string | null) => {
    const cat = category || 'technical'
    const colors: Record<string, string> = {
      technical: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      fundamental: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      hybrid: 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    }
    const labels: Record<string, string> = {
      technical: isRTL ? 'فني' : 'Technical',
      fundamental: isRTL ? 'أساسي' : 'Fundamental',
      hybrid: isRTL ? 'مختلط' : 'Hybrid'
    }
    return (
      <Badge variant="outline" className={colors[cat]}>
        {labels[cat]}
      </Badge>
    )
  }

  // Calculate stats
  const totalTrades = playbooks.reduce((acc, s) => acc + s.totalTrades, 0)
  const totalProfit = playbooks.reduce((acc, s) => acc + s.profitLoss, 0)
  const avgWinRate = playbooks.length > 0 
    ? playbooks.reduce((acc, s) => acc + (s.winRate || 0), 0) / playbooks.length 
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {isRTL ? 'الاستراتيجيات' : 'Strategies'}
          </h2>
          <p className="text-muted-foreground">
            {isRTL ? 'تتبع وأداء استراتيجيات التداول الخاصة بك' : 'Track and manage your trading strategies'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={fetchStrategies}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            onClick={() => {
              setNewPlaybook(initialFormData)
              setIsAddDialogOpen(true)
            }} 
            className="bg-green-500 hover:bg-green-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isRTL ? 'إضافة استراتيجية' : 'Add Strategy'}
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{playbooks.length}</div>
                <div className="text-sm text-muted-foreground">
                  {isRTL ? 'إجمالي الاستراتيجيات' : 'Total Strategies'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalTrades}</div>
                <div className="text-sm text-muted-foreground">
                  {isRTL ? 'إجمالي الصفقات' : 'Total Trades'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">
                  ${totalProfit.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {isRTL ? 'إجمالي الربح' : 'Total Profit'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {avgWinRate.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {isRTL ? 'متوسط نسبة الفوز' : 'Avg Win Rate'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading && playbooks.length === 0 && (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-green-500 mb-4" />
            <p className="text-muted-foreground">
              {isRTL ? 'جاري تحميل الاستراتيجيات...' : 'Loading strategies...'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && playbooks.length === 0 && (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center">
            <Target className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">
              {isRTL ? 'لا توجد استراتيجيات' : 'No strategies yet'}
            </p>
            <p className="text-muted-foreground mb-4">
              {isRTL ? 'أضف استراتيجيتك الأولى للبدء' : 'Add your first strategy to get started'}
            </p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)} 
              className="bg-green-500 hover:bg-green-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isRTL ? 'إضافة استراتيجية' : 'Add Strategy'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Strategies List */}
      <div className="grid gap-4">
        {playbooks.map((strategy) => (
          <Card 
            key={strategy.id} 
            className="hover:shadow-lg transition-all cursor-pointer border-green-500/10 hover:border-green-500/30"
            onClick={() => openDetailDialog(strategy)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{strategy.name}</CardTitle>
                    <CardDescription>{strategy.description || (isRTL ? 'لا يوجد وصف' : 'No description')}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getCategoryBadge(strategy.category)}
                  {strategy.timeframe && (
                    <Badge variant="outline">{strategy.timeframe}</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">{isRTL ? 'الصفقات' : 'Trades'}</div>
                  <div className="text-lg font-semibold">{strategy.totalTrades}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{isRTL ? 'الرابحة' : 'Winners'}</div>
                  <div className="text-lg font-semibold text-green-500">{strategy.winningTrades}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{isRTL ? 'الخاسرة' : 'Losers'}</div>
                  <div className="text-lg font-semibold text-red-500">{strategy.losingTrades}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{isRTL ? 'نسبة الفوز' : 'Win Rate'}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-semibold">{strategy.winRate?.toFixed(1) || 0}%</div>
                    <Progress value={strategy.winRate || 0} className="h-2 w-16" />
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">{isRTL ? 'الربح/الخسارة' : 'P/L'}</div>
                  <div className={`text-lg font-semibold flex items-center gap-1 ${strategy.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {strategy.profitLoss >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    ${Math.abs(strategy.profitLoss).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Strategy Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isRTL ? 'إضافة استراتيجية جديدة' : 'Add New Strategy'}</DialogTitle>
            <DialogDescription>
              {isRTL ? 'حدد تفاصيل استراتيجيتك الجديدة' : 'Define your new trading strategy'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{isRTL ? 'اسم الاستراتيجية' : 'Strategy Name'} *</Label>
              <Input
                value={newPlaybook.name}
                onChange={(e) => setNewPlaybook({ ...newPlaybook, name: e.target.value })}
                placeholder={isRTL ? 'مثال: استراتيجية الاختراق' : 'e.g., Breakout Strategy'}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'الوصف' : 'Description'}</Label>
              <Textarea
                value={newPlaybook.description}
                onChange={(e) => setNewPlaybook({ ...newPlaybook, description: e.target.value })}
                placeholder={isRTL ? 'وصف مختصر للاستراتيجية' : 'Brief description of the strategy'}
                rows={3}
                disabled={isSaving}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'الفئة' : 'Category'}</Label>
                <Select 
                  value={newPlaybook.category} 
                  onValueChange={(v) => setNewPlaybook({ ...newPlaybook, category: v })}
                  disabled={isSaving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'الإطار الزمني' : 'Timeframe'}</Label>
                <Select 
                  value={newPlaybook.timeframe} 
                  onValueChange={(v) => setNewPlaybook({ ...newPlaybook, timeframe: v })}
                  disabled={isSaving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeframes.map((tf) => (
                      <SelectItem key={tf} value={tf}>{tf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'قواعد الدخول' : 'Entry Rules'}</Label>
              <Textarea
                value={newPlaybook.entryRules}
                onChange={(e) => setNewPlaybook({ ...newPlaybook, entryRules: e.target.value })}
                placeholder={isRTL ? 'متى تدخل في الصفقة؟' : 'When to enter a trade?'}
                rows={2}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'قواعد الخروج' : 'Exit Rules'}</Label>
              <Textarea
                value={newPlaybook.exitRules}
                onChange={(e) => setNewPlaybook({ ...newPlaybook, exitRules: e.target.value })}
                placeholder={isRTL ? 'متى تخرج من الصفقة؟' : 'When to exit a trade?'}
                rows={2}
                disabled={isSaving}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isSaving}
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              onClick={handleAddStrategy} 
              className="bg-green-500 hover:bg-green-600"
              disabled={isSaving || !newPlaybook.name.trim()}
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isRTL ? 'إضافة' : 'Add Strategy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Strategy Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isRTL ? 'تعديل الاستراتيجية' : 'Edit Strategy'}</DialogTitle>
            <DialogDescription>
              {isRTL ? 'قم بتحديث تفاصيل الاستراتيجية' : 'Update your strategy details'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{isRTL ? 'اسم الاستراتيجية' : 'Strategy Name'} *</Label>
              <Input
                value={editPlaybook.name}
                onChange={(e) => setEditPlaybook({ ...editPlaybook, name: e.target.value })}
                placeholder={isRTL ? 'مثال: استراتيجية الاختراق' : 'e.g., Breakout Strategy'}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'الوصف' : 'Description'}</Label>
              <Textarea
                value={editPlaybook.description}
                onChange={(e) => setEditPlaybook({ ...editPlaybook, description: e.target.value })}
                placeholder={isRTL ? 'وصف مختصر للاستراتيجية' : 'Brief description of the strategy'}
                rows={3}
                disabled={isSaving}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'الفئة' : 'Category'}</Label>
                <Select 
                  value={editPlaybook.category} 
                  onValueChange={(v) => setEditPlaybook({ ...editPlaybook, category: v })}
                  disabled={isSaving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'الإطار الزمني' : 'Timeframe'}</Label>
                <Select 
                  value={editPlaybook.timeframe} 
                  onValueChange={(v) => setEditPlaybook({ ...editPlaybook, timeframe: v })}
                  disabled={isSaving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeframes.map((tf) => (
                      <SelectItem key={tf} value={tf}>{tf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'قواعد الدخول' : 'Entry Rules'}</Label>
              <Textarea
                value={editPlaybook.entryRules}
                onChange={(e) => setEditPlaybook({ ...editPlaybook, entryRules: e.target.value })}
                placeholder={isRTL ? 'متى تدخل في الصفقة؟' : 'When to enter a trade?'}
                rows={2}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'قواعد الخروج' : 'Exit Rules'}</Label>
              <Textarea
                value={editPlaybook.exitRules}
                onChange={(e) => setEditPlaybook({ ...editPlaybook, exitRules: e.target.value })}
                placeholder={isRTL ? 'متى تخرج من الصفقة؟' : 'When to exit a trade?'}
                rows={2}
                disabled={isSaving}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSaving}
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              onClick={handleUpdateStrategy} 
              className="bg-green-500 hover:bg-green-600"
              disabled={isSaving || !editPlaybook.name.trim()}
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isRTL ? 'حفظ' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Strategy Detail Dialog */}
      <Dialog open={!!selectedPlaybook && !isEditDialogOpen} onOpenChange={() => setSelectedPlaybook(null)}>
        <DialogContent className="max-w-2xl">
          {selectedPlaybook && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedPlaybook.name}
                  {getCategoryBadge(selectedPlaybook.category)}
                </DialogTitle>
                <DialogDescription>{selectedPlaybook.description || (isRTL ? 'لا يوجد وصف' : 'No description')}</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">{isRTL ? 'إجمالي الصفقات' : 'Total Trades'}</div>
                  <div className="text-2xl font-bold">{selectedPlaybook.totalTrades}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">{isRTL ? 'نسبة الفوز' : 'Win Rate'}</div>
                  <div className="text-2xl font-bold text-green-500">{selectedPlaybook.winRate?.toFixed(1) || 0}%</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">{isRTL ? 'متوسط R:R' : 'Avg R:R'}</div>
                  <div className="text-2xl font-bold">{selectedPlaybook.avgRRR?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">{isRTL ? 'الربح' : 'Profit'}</div>
                  <div className="text-2xl font-bold text-green-500">${selectedPlaybook.profitLoss.toLocaleString()}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">{isRTL ? 'الإطار الزمني' : 'Timeframe'}</div>
                  <div className="text-2xl font-bold">{selectedPlaybook.timeframe || '-'}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">{isRTL ? 'الصفقات الرابحة' : 'Winning Trades'}</div>
                  <div className="text-2xl font-bold">{selectedPlaybook.winningTrades}</div>
                </div>
              </div>
              
              {/* Entry/Exit Rules */}
              {(selectedPlaybook.entryRules || selectedPlaybook.exitRules) && (
                <div className="space-y-4 border-t pt-4">
                  {selectedPlaybook.entryRules && (
                    <div>
                      <div className="text-sm font-medium mb-1">{isRTL ? 'قواعد الدخول' : 'Entry Rules'}</div>
                      <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                        {selectedPlaybook.entryRules}
                      </div>
                    </div>
                  )}
                  {selectedPlaybook.exitRules && (
                    <div>
                      <div className="text-sm font-medium mb-1">{isRTL ? 'قواعد الخروج' : 'Exit Rules'}</div>
                      <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                        {selectedPlaybook.exitRules}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setPlaybookToDelete(selectedPlaybook)}
                  className="text-red-500 w-full sm:w-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isRTL ? 'حذف' : 'Delete'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => openEditDialog(selectedPlaybook)}
                  className="w-full sm:w-auto"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {isRTL ? 'تعديل' : 'Edit'}
                </Button>
                <Button 
                  onClick={() => setSelectedPlaybook(null)} 
                  className="bg-green-500 hover:bg-green-600 w-full sm:w-auto"
                >
                  {isRTL ? 'إغلاق' : 'Close'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!playbookToDelete} onOpenChange={() => setPlaybookToDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isRTL ? 'تأكيد الحذف' : 'Confirm Delete'}</DialogTitle>
            <DialogDescription>
              {isRTL 
                ? `هل أنت متأكد من حذف استراتيجية "${playbookToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete "${playbookToDelete?.name}"? This action cannot be undone.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setPlaybookToDelete(null)}
              disabled={isSaving}
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => playbookToDelete && handleDeleteStrategy(playbookToDelete.id)}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isRTL ? 'حذف' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
