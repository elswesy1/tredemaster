'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  LineChart,
  Plus,
  Edit,
  Trash2,
  Play,
  FileText,
  Target,
  Settings,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { getApiHeaders } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

// Types
interface Trade {
  id: string
  symbol: string
  type: string
  status: string
  entryPrice: number
  exitPrice?: number | null
  quantity: number
  stopLoss?: number | null
  takeProfit?: number | null
  profitLoss: number
  notes?: string | null
  strategy?: string | null
  openedAt: string
  closedAt?: string | null
}

interface TradeFormData {
  symbol: string
  type: string
  entryPrice: string
  quantity: string
  stopLoss: string
  takeProfit: string
  notes: string
  strategy: string
}

// Empty arrays - no mock data
const tradingPlans: any[] = []
const setups: any[] = []
const playbookItems: any[] = []

const initialFormData: TradeFormData = {
  symbol: '',
  type: 'buy',
  entryPrice: '',
  quantity: '',
  stopLoss: '',
  takeProfit: '',
  notes: '',
  strategy: '',
}

export function TradingView() {
  const { toast } = useToast()
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newTradeOpen, setNewTradeOpen] = useState(false)
  const [editTradeOpen, setEditTradeOpen] = useState(false)
  const [editTrade, setEditTrade] = useState<Trade | null>(null)
  const [newPlanOpen, setNewPlanOpen] = useState(false)
  const [newSetupOpen, setNewSetupOpen] = useState(false)
  const [formData, setFormData] = useState<TradeFormData>(initialFormData)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [tradeToDelete, setTradeToDelete] = useState<Trade | null>(null)

  // Fetch trades from API
  const fetchTrades = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/trades', {
        method: 'GET',
        headers: getApiHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch trades')
      }

      const data = await response.json()
      setTrades(data)
    } catch (error) {
      console.error('Error fetching trades:', error)
      toast({
        title: 'خطأ',
        description: 'فشل في جلب الصفقات',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchTrades()
  }, [fetchTrades])

  // Create new trade
  const createTrade = async () => {
    if (!formData.symbol || !formData.entryPrice || !formData.quantity) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          symbol: formData.symbol.toUpperCase(),
          type: formData.type,
          entryPrice: parseFloat(formData.entryPrice),
          quantity: parseFloat(formData.quantity),
          stopLoss: formData.stopLoss ? parseFloat(formData.stopLoss) : null,
          takeProfit: formData.takeProfit ? parseFloat(formData.takeProfit) : null,
          notes: formData.notes || null,
          strategy: formData.strategy || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create trade')
      }

      const newTrade = await response.json()
      setTrades(prev => [newTrade, ...prev])
      setNewTradeOpen(false)
      setFormData(initialFormData)
      toast({
        title: 'تم بنجاح',
        description: 'تم إضافة الصفقة بنجاح',
      })
    } catch (error) {
      console.error('Error creating trade:', error)
      toast({
        title: 'خطأ',
        description: 'فشل في إضافة الصفقة',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Update trade
  const updateTrade = async () => {
    if (!editTrade) return

    setSaving(true)
    try {
      const response = await fetch(`/api/trades/${editTrade.id}`, {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify({
          symbol: formData.symbol.toUpperCase(),
          type: formData.type,
          entryPrice: parseFloat(formData.entryPrice),
          quantity: parseFloat(formData.quantity),
          stopLoss: formData.stopLoss ? parseFloat(formData.stopLoss) : null,
          takeProfit: formData.takeProfit ? parseFloat(formData.takeProfit) : null,
          notes: formData.notes || null,
          strategy: formData.strategy || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update trade')
      }

      const updatedTrade = await response.json()
      setTrades(prev => prev.map(t => t.id === updatedTrade.id ? updatedTrade : t))
      setEditTradeOpen(false)
      setEditTrade(null)
      setFormData(initialFormData)
      toast({
        title: 'تم بنجاح',
        description: 'تم تحديث الصفقة بنجاح',
      })
    } catch (error) {
      console.error('Error updating trade:', error)
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث الصفقة',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Close trade
  const closeTrade = async (trade: Trade, exitPrice: number) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/trades/${trade.id}`, {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify({
          status: 'closed',
          exitPrice: exitPrice,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to close trade')
      }

      const updatedTrade = await response.json()
      setTrades(prev => prev.map(t => t.id === updatedTrade.id ? updatedTrade : t))
      toast({
        title: 'تم بنجاح',
        description: 'تم إغلاق الصفقة بنجاح',
      })
    } catch (error) {
      console.error('Error closing trade:', error)
      toast({
        title: 'خطأ',
        description: 'فشل في إغلاق الصفقة',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Delete trade
  const deleteTrade = async () => {
    if (!tradeToDelete) return

    setSaving(true)
    try {
      const response = await fetch(`/api/trades/${tradeToDelete.id}`, {
        method: 'DELETE',
        headers: getApiHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to delete trade')
      }

      setTrades(prev => prev.filter(t => t.id !== tradeToDelete.id))
      setDeleteConfirmOpen(false)
      setTradeToDelete(null)
      toast({
        title: 'تم بنجاح',
        description: 'تم حذف الصفقة بنجاح',
      })
    } catch (error) {
      console.error('Error deleting trade:', error)
      toast({
        title: 'خطأ',
        description: 'فشل في حذف الصفقة',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Open edit dialog with trade data
  const openEditDialog = (trade: Trade) => {
    setEditTrade(trade)
    setFormData({
      symbol: trade.symbol,
      type: trade.type,
      entryPrice: trade.entryPrice.toString(),
      quantity: trade.quantity.toString(),
      stopLoss: trade.stopLoss?.toString() || '',
      takeProfit: trade.takeProfit?.toString() || '',
      notes: trade.notes || '',
      strategy: trade.strategy || '',
    })
    setEditTradeOpen(true)
  }

  // Calculate stats
  const openTrades = trades.filter(t => t.status === 'open')
  const closedTrades = trades.filter(t => t.status === 'closed')
  const openPnL = openTrades.reduce((sum, t) => sum + t.profitLoss, 0)
  const winningTrades = closedTrades.filter(t => t.profitLoss > 0)
  const winRate = closedTrades.length > 0 
    ? Math.round((winningTrades.length / closedTrades.length) * 100) 
    : 0

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Play className="h-4 w-4" />
              الصفقات المفتوحة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTrades.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              الربح المفتوح
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn('text-2xl font-bold', openPnL >= 0 ? 'text-profit' : 'text-loss')}>
              {openPnL >= 0 ? '+' : ''}{openPnL.toFixed(2)}$
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              الصفقات المغلقة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{closedTrades.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              نسبة الفوز
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trades" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trades">الصفقات</TabsTrigger>
          <TabsTrigger value="plans">الخطط</TabsTrigger>
          <TabsTrigger value="setups">الإعدادات</TabsTrigger>
          <TabsTrigger value="playbook">دليل التشغيل</TabsTrigger>
        </TabsList>

        {/* Trades Tab */}
        <TabsContent value="trades" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">إدارة الصفقات</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={fetchTrades} disabled={loading}>
                <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
              </Button>
              <Dialog open={newTradeOpen} onOpenChange={setNewTradeOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 ml-2" />
                    صفقة جديدة
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>إضافة صفقة جديدة</DialogTitle>
                    <DialogDescription>
                      أدخل بيانات الصفقة الجديدة
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>الرمز *</Label>
                        <Input 
                          placeholder="BTC/USD" 
                          value={formData.symbol}
                          onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>النوع</Label>
                        <Select 
                          value={formData.type} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر النوع" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="buy">شراء</SelectItem>
                            <SelectItem value="sell">بيع</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>سعر الدخول *</Label>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          value={formData.entryPrice}
                          onChange={(e) => setFormData(prev => ({ ...prev, entryPrice: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>الكمية *</Label>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          value={formData.quantity}
                          onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>وقف الخسارة</Label>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          value={formData.stopLoss}
                          onChange={(e) => setFormData(prev => ({ ...prev, stopLoss: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>جني الأرباح</Label>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          value={formData.takeProfit}
                          onChange={(e) => setFormData(prev => ({ ...prev, takeProfit: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>الاستراتيجية</Label>
                      <Input 
                        placeholder="اسم الاستراتيجية" 
                        value={formData.strategy}
                        onChange={(e) => setFormData(prev => ({ ...prev, strategy: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>ملاحظات</Label>
                      <Textarea 
                        placeholder="سبب الدخول، الاستراتيجية..." 
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={createTrade}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                          جاري الحفظ...
                        </>
                      ) : (
                        'فتح الصفقة'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">جاري تحميل الصفقات...</span>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!loading && trades.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد صفقات حتى الآن</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setNewTradeOpen(true)}
                >
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة صفقة جديدة
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Trades Table */}
          {!loading && trades.length > 0 && (
            <Card>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الرمز</TableHead>
                        <TableHead>النوع</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>سعر الدخول</TableHead>
                        <TableHead>سعر الخروج</TableHead>
                        <TableHead>الكمية</TableHead>
                        <TableHead>وقف الخسارة</TableHead>
                        <TableHead>جني الأرباح</TableHead>
                        <TableHead>الربح/الخسارة</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trades.map((trade) => (
                        <TableRow key={trade.id}>
                          <TableCell className="font-medium">{trade.symbol}</TableCell>
                          <TableCell>
                            <Badge variant={trade.type === 'buy' ? 'default' : 'secondary'}>
                              {trade.type === 'buy' ? 'شراء' : 'بيع'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={trade.status === 'open' ? 'default' : 'outline'}>
                              {trade.status === 'open' ? 'مفتوحة' : 'مغلقة'}
                            </Badge>
                          </TableCell>
                          <TableCell>{trade.entryPrice}</TableCell>
                          <TableCell>{trade.exitPrice || '-'}</TableCell>
                          <TableCell>{trade.quantity}</TableCell>
                          <TableCell>{trade.stopLoss || '-'}</TableCell>
                          <TableCell>{trade.takeProfit || '-'}</TableCell>
                          <TableCell className={cn('font-medium', trade.profitLoss >= 0 ? 'text-profit' : 'text-loss')}>
                            {trade.profitLoss >= 0 ? '+' : ''}{trade.profitLoss.toFixed(2)}$
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => openEditDialog(trade)}
                                title="تعديل"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {trade.status === 'open' && (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    const exitPrice = prompt('أدخل سعر الخروج:', trade.entryPrice.toString())
                                    if (exitPrice) {
                                      closeTrade(trade, parseFloat(exitPrice))
                                    }
                                  }}
                                  title="إغلاق الصفقة"
                                >
                                  <Target className="h-4 w-4" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-loss"
                                onClick={() => {
                                  setTradeToDelete(trade)
                                  setDeleteConfirmOpen(true)
                                }}
                                title="حذف"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">خطط التداول</h3>
            <Dialog open={newPlanOpen} onOpenChange={setNewPlanOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 ml-2" />
                  خطة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إضافة خطة جديدة</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>العنوان</Label>
                    <Input placeholder="عنوان الخطة" />
                  </div>
                  <div className="grid gap-2">
                    <Label>النوع</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر النوع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">يومي</SelectItem>
                        <SelectItem value="weekly">أسبوعي</SelectItem>
                        <SelectItem value="monthly">شهري</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>الأهداف</Label>
                    <Textarea placeholder="أهداف الخطة..." />
                  </div>
                  <div className="grid gap-2">
                    <Label>القواعد</Label>
                    <Textarea placeholder="قواعد التداول..." />
                  </div>
                  <Button className="w-full" onClick={() => setNewPlanOpen(false)}>
                    إنشاء الخطة
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {tradingPlans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{plan.title}</CardTitle>
                      <CardDescription>
                        <Badge variant="outline" className="mt-2">
                          {plan.type === 'daily' ? 'يومي' : plan.type === 'weekly' ? 'أسبوعي' : 'شهري'}
                        </Badge>
                      </CardDescription>
                    </div>
                    <Badge>نشطة</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">الأهداف</Label>
                    <p className="mt-1">{plan.goals}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">القواعد</Label>
                    <p className="mt-1">{plan.rules}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 ml-2" />
                      تعديل
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 ml-2" />
                      تفاصيل
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Setups Tab */}
        <TabsContent value="setups" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">الإعدادات والأنماط</h3>
            <Dialog open={newSetupOpen} onOpenChange={setNewSetupOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 ml-2" />
                  إعداد جديد
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إضافة إعداد جديد</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>الاسم</Label>
                    <Input placeholder="اسم الإعداد" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>الفئة</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الفئة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pattern">نموذج</SelectItem>
                          <SelectItem value="indicator">مؤشر</SelectItem>
                          <SelectItem value="strategy">استراتيجية</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>الإطار الزمني</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الإطار" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M15">15 دقيقة</SelectItem>
                          <SelectItem value="H1">ساعة</SelectItem>
                          <SelectItem value="H4">4 ساعات</SelectItem>
                          <SelectItem value="D">يومي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>الوصف</Label>
                    <Textarea placeholder="وصف الإعداد..." />
                  </div>
                  <Button className="w-full" onClick={() => setNewSetupOpen(false)}>
                    إنشاء الإعداد
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {setups.map((setup) => (
              <Card key={setup.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{setup.name}</CardTitle>
                      <CardDescription>{setup.description}</CardDescription>
                    </div>
                    <Badge variant="outline">{setup.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">الإطار الزمني</p>
                      <p className="font-medium">{setup.timeframe}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">نسبة النجاح</p>
                      <p className="font-medium text-profit">{setup.successRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">المخاطرة/العائد</p>
                      <p className="font-medium">{setup.riskReward}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Playbook Tab */}
        <TabsContent value="playbook" className="space-y-4">
          <h3 className="text-lg font-semibold">دليل التشغيل (TOP Playbook)</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {playbookItems.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm whitespace-pre-wrap text-muted-foreground font-sans">
                    {item.content}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Trade Dialog */}
      <Dialog open={editTradeOpen} onOpenChange={setEditTradeOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تعديل الصفقة</DialogTitle>
            <DialogDescription>
              تعديل بيانات الصفقة
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>الرمز</Label>
                <Input 
                  placeholder="BTC/USD" 
                  value={formData.symbol}
                  onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>النوع</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buy">شراء</SelectItem>
                    <SelectItem value="sell">بيع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>سعر الدخول</Label>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  value={formData.entryPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, entryPrice: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>الكمية</Label>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>وقف الخسارة</Label>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  value={formData.stopLoss}
                  onChange={(e) => setFormData(prev => ({ ...prev, stopLoss: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>جني الأرباح</Label>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  value={formData.takeProfit}
                  onChange={(e) => setFormData(prev => ({ ...prev, takeProfit: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>الاستراتيجية</Label>
              <Input 
                placeholder="اسم الاستراتيجية" 
                value={formData.strategy}
                onChange={(e) => setFormData(prev => ({ ...prev, strategy: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>ملاحظات</Label>
              <Textarea 
                placeholder="سبب الدخول، الاستراتيجية..." 
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setEditTradeOpen(false)
                  setFormData(initialFormData)
                }}
              >
                إلغاء
              </Button>
              <Button 
                className="flex-1"
                onClick={updateTrade}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  'حفظ التغييرات'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف هذه الصفقة؟ هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                setDeleteConfirmOpen(false)
                setTradeToDelete(null)
              }}
            >
              إلغاء
            </Button>
            <Button 
              variant="destructive"
              className="flex-1"
              onClick={deleteTrade}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                'حذف'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
