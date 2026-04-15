'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
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
  Brain,
  Plus,
  Smile,
  Frown,
  Meh,
  Heart,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Calendar,
  Activity,
  Zap,
  Clock,
  Loader2,
  RefreshCw,
  Trash2,
  Edit,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import { getApiHeaders, apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Types
interface PsychologyLog {
  id: string
  date: string
  type: string
  emotion: string | null
  emotionIntensity: number | null
  stress: number | null
  discipline: number | null
  patience: number | null
  confidence: number | null
  trigger: string | null
  copingStrategy: string | null
  notes: string | null
}

interface PsychologyFormData {
  date: string
  type: string
  emotion: string
  emotionIntensity: number
  stress: number
  discipline: number
  patience: number
  confidence: number
  trigger: string
  copingStrategy: string
  notes: string
}

const initialFormData: PsychologyFormData = {
  date: new Date().toISOString().split('T')[0],
  type: 'check-in',
  emotion: '',
  emotionIntensity: 5,
  stress: 3,
  discipline: 7,
  patience: 6,
  confidence: 7,
  trigger: '',
  copingStrategy: '',
  notes: '',
}

const recommendations = [
  {
    id: 1,
    type: 'stress',
    title: 'إدارة الضغط النفسي',
    description: 'عند الشعور بالضغط، خذ استراحة قصيرة وتنفس بعمق. لا تتخذ قرارات تداول في حالة توتر.',
    icon: AlertTriangle,
  },
  {
    id: 2,
    type: 'confidence',
    title: 'الحفاظ على الثقة المتوازنة',
    description: 'الثقة الزائدة قد تؤدي إلى مخاطر غير محسوبة. راجع دائماً تحليلك وكن مستعداً للخطأ.',
    icon: Target,
  },
  {
    id: 3,
    type: 'discipline',
    title: 'تقوية الانضباط',
    description: 'التزم بخطتك التداولية ولا تنحرف عنها. سجل كل انتهاك للقواعد وراجعها أسبوعياً.',
    icon: Activity,
  },
  {
    id: 4,
    type: 'patience',
    title: 'تنمية الصبر',
    description: 'انتظر الفرص المناسبة ولا تطاردها. الصفقات الجيدة تأتي للمستعدين والصبورين.',
    icon: Clock,
  },
]

const emotionLabels: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  happy: { label: 'سعيد', icon: Smile, color: 'text-profit' },
  sad: { label: 'حزين', icon: Frown, color: 'text-loss' },
  angry: { label: 'غاضب', icon: Frown, color: 'text-loss' },
  fearful: { label: 'خائف', icon: AlertTriangle, color: 'text-warning' },
  greedy: { label: 'طماع', icon: TrendingUp, color: 'text-warning' },
  confident: { label: 'واثق', icon: Target, color: 'text-profit' },
  anxious: { label: 'قلق', icon: AlertTriangle, color: 'text-warning' },
  satisfied: { label: 'راض', icon: Smile, color: 'text-profit' },
}

export function PsychologyView() {
  const [logs, setLogs] = useState<PsychologyLog[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newLogOpen, setNewLogOpen] = useState(false)
  const [editLogOpen, setEditLogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<PsychologyLog | null>(null)
  const [formData, setFormData] = useState<PsychologyFormData>(initialFormData)

  // Fetch psychology logs
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      const data = await apiGet<PsychologyLog[]>('/api/psychology')
      setLogs(data)
    } catch (error) {
      console.error('Error fetching psychology logs:', error)
      toast.error('فشل في جلب سجلات علم النفس')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Calculate metrics
  const currentMetrics = {
    avgConfidence: logs.length > 0 
      ? logs.reduce((acc, log) => acc + (log.confidence || 0), 0) / logs.length 
      : 0,
    avgDiscipline: logs.length > 0 
      ? logs.reduce((acc, log) => acc + (log.discipline || 0), 0) / logs.length 
      : 0,
    avgPatience: logs.length > 0 
      ? logs.reduce((acc, log) => acc + (log.patience || 0), 0) / logs.length 
      : 0,
    avgStress: logs.length > 0 
      ? logs.reduce((acc, log) => acc + (log.stress || 0), 0) / logs.length 
      : 0,
    emotionTrend: 'improving',
  }

  // Prepare chart data from logs
  const emotionHistory = logs.slice(0, 7).reverse().map((log, index) => ({
    date: new Date(log.date).toLocaleDateString('ar-SA', { month: 'numeric', day: 'numeric' }),
    confidence: log.confidence || 0,
    discipline: log.discipline || 0,
    patience: log.patience || 0,
  }))

  const radarData = [
    { metric: 'الثقة', value: currentMetrics.avgConfidence },
    { metric: 'الانضباط', value: currentMetrics.avgDiscipline },
    { metric: 'الصبر', value: currentMetrics.avgPatience },
    { metric: 'التركيز', value: (currentMetrics.avgDiscipline + currentMetrics.avgPatience) / 2 },
    { metric: 'إدارة المشاعر', value: 10 - currentMetrics.avgStress },
    { metric: 'اتخاذ القرار', value: (currentMetrics.avgConfidence + currentMetrics.avgDiscipline) / 2 },
  ]

  // Create psychology log
  const handleCreate = async () => {
    try {
      setSaving(true)
      const newLog = await apiPost<PsychologyLog>('/api/psychology', {
        ...formData,
        date: new Date(formData.date).toISOString(),
        userId: 'default-user',
      })
      setLogs([newLog, ...logs])
      setNewLogOpen(false)
      setFormData(initialFormData)
      toast.success('تم إنشاء السجل النفسي بنجاح')
    } catch (error) {
      console.error('Error creating psychology log:', error)
      toast.error('فشل في إنشاء السجل النفسي')
    } finally {
      setSaving(false)
    }
  }

  // Update psychology log
  const handleUpdate = async () => {
    if (!selectedLog) return
    try {
      setSaving(true)
      const updatedLog = await apiPut<PsychologyLog>(`/api/psychology/${selectedLog.id}`, {
        ...formData,
        date: new Date(formData.date).toISOString(),
      })
      setLogs(logs.map(log => log.id === selectedLog.id ? updatedLog : log))
      setEditLogOpen(false)
      setSelectedLog(null)
      setFormData(initialFormData)
      toast.success('تم تحديث السجل النفسي بنجاح')
    } catch (error) {
      console.error('Error updating psychology log:', error)
      toast.error('فشل في تحديث السجل النفسي')
    } finally {
      setSaving(false)
    }
  }

  // Delete psychology log
  const handleDelete = async () => {
    if (!selectedLog) return
    try {
      setSaving(true)
      await apiDelete(`/api/psychology/${selectedLog.id}`)
      setLogs(logs.filter(log => log.id !== selectedLog.id))
      setDeleteDialogOpen(false)
      setSelectedLog(null)
      toast.success('تم حذف السجل النفسي بنجاح')
    } catch (error) {
      console.error('Error deleting psychology log:', error)
      toast.error('فشل في حذف السجل النفسي')
    } finally {
      setSaving(false)
    }
  }

  // Open edit dialog
  const openEditDialog = (log: PsychologyLog) => {
    setSelectedLog(log)
    setFormData({
      date: new Date(log.date).toISOString().split('T')[0],
      type: log.type || 'check-in',
      emotion: log.emotion || '',
      emotionIntensity: log.emotionIntensity || 5,
      stress: log.stress || 3,
      discipline: log.discipline || 7,
      patience: log.patience || 6,
      confidence: log.confidence || 7,
      trigger: log.trigger || '',
      copingStrategy: log.copingStrategy || '',
      notes: log.notes || '',
    })
    setEditLogOpen(true)
  }

  // Open delete dialog
  const openDeleteDialog = (log: PsychologyLog) => {
    setSelectedLog(log)
    setDeleteDialogOpen(true)
  }

  // Form component
  const PsychologyForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>التاريخ</Label>
          <Input 
            type="date" 
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label>النوع</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="اختر النوع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="check-in">تسجيل دخول</SelectItem>
              <SelectItem value="post-trade">بعد صفقة</SelectItem>
              <SelectItem value="end-day">نهاية اليوم</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label>المشاعر الحالية</Label>
        <Select value={formData.emotion} onValueChange={(value) => setFormData({ ...formData, emotion: value })}>
          <SelectTrigger>
            <SelectValue placeholder="كيف تشعر؟" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="happy">سعيد</SelectItem>
            <SelectItem value="sad">حزين</SelectItem>
            <SelectItem value="angry">غاضب</SelectItem>
            <SelectItem value="fearful">خائف</SelectItem>
            <SelectItem value="greedy">طماع</SelectItem>
            <SelectItem value="confident">واثق</SelectItem>
            <SelectItem value="anxious">قلق</SelectItem>
            <SelectItem value="satisfied">راض</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>شدة المشاعر ({formData.emotionIntensity}/10)</Label>
        <Slider 
          value={[formData.emotionIntensity]} 
          max={10} 
          step={1} 
          onValueChange={(value) => setFormData({ ...formData, emotionIntensity: value[0] })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>مستوى الضغط ({formData.stress}/10)</Label>
          <Slider 
            value={[formData.stress]} 
            max={10} 
            step={1} 
            onValueChange={(value) => setFormData({ ...formData, stress: value[0] })}
          />
        </div>
        <div className="space-y-2">
          <Label>الانضباط ({formData.discipline}/10)</Label>
          <Slider 
            value={[formData.discipline]} 
            max={10} 
            step={1} 
            onValueChange={(value) => setFormData({ ...formData, discipline: value[0] })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>الصبر ({formData.patience}/10)</Label>
          <Slider 
            value={[formData.patience]} 
            max={10} 
            step={1} 
            onValueChange={(value) => setFormData({ ...formData, patience: value[0] })}
          />
        </div>
        <div className="space-y-2">
          <Label>الثقة ({formData.confidence}/10)</Label>
          <Slider 
            value={[formData.confidence]} 
            max={10} 
            step={1} 
            onValueChange={(value) => setFormData({ ...formData, confidence: value[0] })}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>المحفز</Label>
        <Input 
          placeholder="ما الذي سبب هذا الشعور؟" 
          value={formData.trigger}
          onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label>استراتيجية التأقلم</Label>
        <Textarea 
          placeholder="كيف تتعامل مع هذا الشعور؟" 
          value={formData.copingStrategy}
          onChange={(e) => setFormData({ ...formData, copingStrategy: e.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label>ملاحظات إضافية</Label>
        <Textarea 
          placeholder="أي ملاحظات إضافية..." 
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>
      <Button className="w-full" onClick={onSubmit} disabled={saving}>
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 ml-2 animate-spin" />
            جاري الحفظ...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              متوسط الثقة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.avgConfidence.toFixed(1)}/10</div>
            <Progress value={currentMetrics.avgConfidence * 10} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              متوسط الانضباط
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.avgDiscipline.toFixed(1)}/10</div>
            <Progress value={currentMetrics.avgDiscipline * 10} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              متوسط الصبر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.avgPatience.toFixed(1)}/10</div>
            <Progress value={currentMetrics.avgPatience * 10} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              متوسط الضغط
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.avgStress.toFixed(1)}/10</div>
            <Progress value={currentMetrics.avgStress * 10} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {currentMetrics.avgStress < 4 ? 'مستوى جيد' : currentMetrics.avgStress < 7 ? 'يحتاج انتباه' : 'مستوى مرتفع'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tracking" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tracking">تتبع الحالة</TabsTrigger>
          <TabsTrigger value="recommendations">التوصيات النفسية</TabsTrigger>
          <TabsTrigger value="analysis">التحليل</TabsTrigger>
        </TabsList>

        {/* Tracking Tab */}
        <TabsContent value="tracking" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">سجل الحالة النفسية</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={fetchLogs} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Dialog open={newLogOpen} onOpenChange={(open) => {
                setNewLogOpen(open)
                if (open) setFormData(initialFormData)
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 ml-2" />
                    تسجيل جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>تسجيل الحالة النفسية</DialogTitle>
                    <DialogDescription>
                      سجل حالتك النفسية الحالية
                    </DialogDescription>
                  </DialogHeader>
                  <PsychologyForm onSubmit={handleCreate} submitLabel="حفظ التسجيل" />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد سجلات نفسية بعد</p>
                <p className="text-sm text-muted-foreground">اضغط على "تسجيل جديد" للبدء</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {Array.isArray(logs) && logs.map((log) => {
                const emotionInfo = emotionLabels[log.emotion || ''] || { label: log.emotion || 'غير محدد', icon: Meh, color: 'text-muted-foreground' }
                return (
                  <Card key={log.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center bg-muted',
                            emotionInfo.color
                          )}>
                            <emotionInfo.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{emotionInfo.label}</h3>
                              <Badge variant="outline">
                                {log.type === 'check-in' ? 'تسجيل دخول' :
                                 log.type === 'post-trade' ? 'بعد صفقة' : 'نهاية اليوم'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {new Date(log.date).toLocaleDateString('ar-SA')}
                              </span>
                              {log.emotionIntensity && (
                                <span className="text-xs text-muted-foreground">• شدة: {log.emotionIntensity}/10</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openEditDialog(log)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-loss hover:text-loss"
                            onClick={() => openDeleteDialog(log)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-2 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">الضغط</p>
                          <p className={cn(
                            'text-lg font-bold',
                            (log.stress || 0) <= 3 ? 'text-profit' : (log.stress || 0) <= 6 ? 'text-warning' : 'text-loss'
                          )}>{log.stress || 0}/10</p>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">الانضباط</p>
                          <p className="text-lg font-bold">{log.discipline || 0}/10</p>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">الصبر</p>
                          <p className="text-lg font-bold">{log.patience || 0}/10</p>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">الثقة</p>
                          <p className="text-lg font-bold">{log.confidence || 0}/10</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {log.trigger && (
                          <div>
                            <Label className="text-muted-foreground text-xs">المحفز</Label>
                            <p className="text-sm">{log.trigger}</p>
                          </div>
                        )}
                        {log.copingStrategy && (
                          <div>
                            <Label className="text-muted-foreground text-xs">استراتيجية التأقلم</Label>
                            <p className="text-sm">{log.copingStrategy}</p>
                          </div>
                        )}
                        {log.notes && (
                          <div>
                            <Label className="text-muted-foreground text-xs">ملاحظات</Label>
                            <p className="text-sm">{log.notes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                التوصيات النفسية
              </CardTitle>
              <CardDescription>نصائح وإرشادات لتحسين حالتك النفسية والتداول</CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      rec.type === 'stress' && 'bg-warning/20 text-warning',
                      rec.type === 'confidence' && 'bg-profit/20 text-profit',
                      rec.type === 'discipline' && 'bg-primary/20 text-primary',
                      rec.type === 'patience' && 'bg-secondary/20 text-secondary-foreground'
                    )}>
                      <rec.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{rec.title}</h3>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-loss" />
                نصائح يومية للحفاظ على التوازن النفسي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-warning" />
                  ابدأ يومك بتأكيدات إيجابية ومراجعة خطتك
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-warning" />
                  خذ فترات راحة منتظمة كل 90 دقيقة
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-warning" />
                  لا تتداول وأنت مرهق أو تحت تأثير مشاعر قوية
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-warning" />
                  احتفل بالنجاحات الصغيرة وتعلم من الأخطاء
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-warning" />
                  حافظ على نمط حياة صحي: نوم كافي، رياضة، تغذية سليمة
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>تطور الحالة النفسية</CardTitle>
                <CardDescription>متابعة تطور الثقة والانضباط والصبر</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {emotionHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={emotionHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 250)" />
                        <XAxis dataKey="date" stroke="oklch(0.5 0.02 250)" fontSize={12} />
                        <YAxis stroke="oklch(0.5 0.02 250)" fontSize={12} domain={[0, 10]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'oklch(0.17 0.025 250)',
                            border: '1px solid oklch(0.3 0.03 250)',
                            borderRadius: '8px',
                          }}
                        />
                        <Line type="monotone" dataKey="confidence" stroke="oklch(0.7 0.2 145)" strokeWidth={2} dot={{ fill: 'oklch(0.7 0.2 145)' }} />
                        <Line type="monotone" dataKey="discipline" stroke="oklch(0.65 0.2 25)" strokeWidth={2} dot={{ fill: 'oklch(0.65 0.2 25)' }} />
                        <Line type="monotone" dataKey="patience" stroke="oklch(0.55 0.15 250)" strokeWidth={2} dot={{ fill: 'oklch(0.55 0.15 250)' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      لا توجد بيانات كافية للعرض
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>مخطط القدرات</CardTitle>
                <CardDescription>نظرة شاملة على قدراتك النفسية</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {logs.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="oklch(0.3 0.02 250)" />
                        <PolarAngleAxis dataKey="metric" stroke="oklch(0.5 0.02 250)" fontSize={12} />
                        <PolarRadiusAxis domain={[0, 10]} stroke="oklch(0.5 0.02 250)" fontSize={10} />
                        <Radar
                          name="القدرات"
                          dataKey="value"
                          stroke="oklch(0.7 0.12 200)"
                          fill="oklch(0.7 0.12 200)"
                          fillOpacity={0.3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      لا توجد بيانات كافية للعرض
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editLogOpen} onOpenChange={setEditLogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تعديل السجل النفسي</DialogTitle>
            <DialogDescription>
              قم بتعديل بيانات السجل النفسي
            </DialogDescription>
          </DialogHeader>
          <PsychologyForm onSubmit={handleUpdate} submitLabel="تحديث السجل" />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف هذا السجل النفسي؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={saving}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
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
