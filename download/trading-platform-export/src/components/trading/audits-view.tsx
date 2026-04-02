'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  ClipboardCheck,
  Plus,
  Wallet,
  LineChart,
  Shield,
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Edit,
  FileText,
  Trash2,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { getApiHeaders } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

// Types
interface Finding {
  item: string
  status: 'pass' | 'warning' | 'fail'
  note: string
}

interface Audit {
  id: string
  type: string
  title: string
  description?: string
  period?: string
  startDate?: string | null
  endDate?: string | null
  findings?: string | null
  recommendations?: string
  improvements?: string
  status: string
  score?: number | null
  completedAt?: string | null
  createdAt: string
  updatedAt: string
}

interface AuditStats {
  total: number
  completed: number
  inProgress: number
  pending: number
  avgScore: number
}

interface ImprovementItem {
  id: string
  title: string
  priority: string
  status: string
  progress: number
}

// Initial state for new audit form
const initialFormData = {
  type: '',
  title: '',
  description: '',
  period: '',
  startDate: '',
  endDate: '',
  findings: [] as Finding[],
  recommendations: '',
  improvements: '',
}

export function AuditsView() {
  const { toast } = useToast()
  
  // State
  const [audits, setAudits] = useState<Audit[]>([])
  const [improvementItems, setImprovementItems] = useState<ImprovementItem[]>([])
  const [stats, setStats] = useState<AuditStats>({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    avgScore: 0,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  
  // Dialog states
  const [newAuditOpen, setNewAuditOpen] = useState(false)
  const [editAuditOpen, setEditAuditOpen] = useState(false)
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null)
  const [formData, setFormData] = useState(initialFormData)
  const [activeTab, setActiveTab] = useState('all')

  // Fetch audits from API
  const fetchAudits = useCallback(async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const response = await fetch('/api/audits', {
        method: 'GET',
        headers: getApiHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch audits')
      }

      const data: Audit[] = await response.json()
      setAudits(data)

      // Calculate stats
      const total = data.length
      const completed = data.filter(a => a.status === 'completed').length
      const inProgress = data.filter(a => a.status === 'in-progress').length
      const pending = data.filter(a => a.status === 'pending').length
      
      const scoresWithValue = data.filter(a => a.status === 'completed' && a.score !== null)
      const avgScore = scoresWithValue.length > 0
        ? Math.round(scoresWithValue.reduce((sum, a) => sum + (a.score || 0), 0) / scoresWithValue.length)
        : 0

      setStats({ total, completed, inProgress, pending, avgScore })

      // Extract improvement items from audits
      const improvements: ImprovementItem[] = []
      data.forEach(audit => {
        if (audit.improvements) {
          improvements.push({
            id: `imp-${audit.id}`,
            title: audit.improvements,
            priority: audit.score && audit.score < 70 ? 'high' : audit.score && audit.score < 85 ? 'medium' : 'low',
            status: audit.status === 'completed' ? 'completed' : audit.status === 'in-progress' ? 'in-progress' : 'pending',
            progress: audit.status === 'completed' ? 100 : audit.status === 'in-progress' ? 50 : 0,
          })
        }
      })
      setImprovementItems(improvements)
    } catch (error) {
      console.error('Error fetching audits:', error)
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل التدقيقات',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [toast])

  // Initial fetch
  useEffect(() => {
    fetchAudits()
  }, [fetchAudits])

  // Create new audit
  const handleCreateAudit = async () => {
    if (!formData.type || !formData.title) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء الحقول المطلوبة',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/audits', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          type: formData.type,
          title: formData.title,
          description: formData.description,
          period: formData.period,
          startDate: formData.startDate,
          endDate: formData.endDate,
          findings: JSON.stringify(formData.findings),
          recommendations: formData.recommendations,
          improvements: formData.improvements,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create audit')
      }

      toast({
        title: 'تم بنجاح',
        description: 'تم إنشاء التدقيق بنجاح',
      })

      setNewAuditOpen(false)
      setFormData(initialFormData)
      fetchAudits()
    } catch (error) {
      console.error('Error creating audit:', error)
      toast({
        title: 'خطأ',
        description: 'فشل في إنشاء التدقيق',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Update audit
  const handleUpdateAudit = async () => {
    if (!selectedAudit || !formData.type || !formData.title) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء الحقول المطلوبة',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/audits/${selectedAudit.id}`, {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify({
          type: formData.type,
          title: formData.title,
          description: formData.description,
          period: formData.period,
          startDate: formData.startDate,
          endDate: formData.endDate,
          findings: JSON.stringify(formData.findings),
          recommendations: formData.recommendations,
          improvements: formData.improvements,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update audit')
      }

      toast({
        title: 'تم بنجاح',
        description: 'تم تحديث التدقيق بنجاح',
      })

      setEditAuditOpen(false)
      setSelectedAudit(null)
      setFormData(initialFormData)
      fetchAudits()
    } catch (error) {
      console.error('Error updating audit:', error)
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث التدقيق',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Delete audit
  const handleDeleteAudit = async (id: string) => {
    try {
      setDeleting(id)
      const response = await fetch(`/api/audits/${id}`, {
        method: 'DELETE',
        headers: getApiHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to delete audit')
      }

      toast({
        title: 'تم بنجاح',
        description: 'تم حذف التدقيق بنجاح',
      })

      fetchAudits()
    } catch (error) {
      console.error('Error deleting audit:', error)
      toast({
        title: 'خطأ',
        description: 'فشل في حذف التدقيق',
        variant: 'destructive',
      })
    } finally {
      setDeleting(null)
    }
  }

  // Update audit status
  const handleUpdateStatus = async (audit: Audit, newStatus: string) => {
    try {
      const response = await fetch(`/api/audits/${audit.id}`, {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      toast({
        title: 'تم بنجاح',
        description: 'تم تحديث حالة التدقيق',
      })

      fetchAudits()
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث الحالة',
        variant: 'destructive',
      })
    }
  }

  // Open edit dialog
  const openEditDialog = (audit: Audit) => {
    setSelectedAudit(audit)
    setFormData({
      type: audit.type,
      title: audit.title,
      description: audit.description || '',
      period: audit.period || '',
      startDate: audit.startDate ? audit.startDate.split('T')[0] : '',
      endDate: audit.endDate ? audit.endDate.split('T')[0] : '',
      findings: audit.findings ? JSON.parse(audit.findings) : [],
      recommendations: audit.recommendations || '',
      improvements: audit.improvements || '',
    })
    setEditAuditOpen(true)
  }

  // Parse findings
  const parseFindings = (findingsStr?: string | null): Finding[] => {
    if (!findingsStr) return []
    try {
      return JSON.parse(findingsStr)
    } catch {
      return []
    }
  }

  // Format date
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('ar-SA')
  }

  // Filter audits by type
  const filteredAudits = audits.filter(audit => {
    if (activeTab === 'all') return true
    if (activeTab === 'improvements') return false
    return audit.type === activeTab
  })

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التدقيقات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.total}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">مكتملة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-profit">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.completed}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">قيد التنفيذ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.inProgress}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">معلقة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.pending}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">متوسط النتيجة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${stats.avgScore}%`}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="portfolio">المحفظة</TabsTrigger>
          <TabsTrigger value="trading">التداول</TabsTrigger>
          <TabsTrigger value="risk">المخاطر</TabsTrigger>
          <TabsTrigger value="behaviour">السلوك</TabsTrigger>
          <TabsTrigger value="improvements">التحسين</TabsTrigger>
        </TabsList>

        {/* All Audits Tab */}
        <TabsContent value="all" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">جميع التدقيقات</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => fetchAudits(true)} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ml-2 ${refreshing ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
              <Dialog open={newAuditOpen} onOpenChange={setNewAuditOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 ml-2" />
                    تدقيق جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>إضافة تدقيق جديد</DialogTitle>
                    <DialogDescription>
                      أنشئ تدقيقاً جديداً لتقييم الأداء
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>نوع التدقيق *</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر النوع" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="portfolio">تدقيق المحفظة</SelectItem>
                          <SelectItem value="trading">تدقيق التداول</SelectItem>
                          <SelectItem value="risk">تدقيق المخاطر</SelectItem>
                          <SelectItem value="behaviour">تدقيق السلوك</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>العنوان *</Label>
                      <Input 
                        placeholder="عنوان التدقيق" 
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>الفترة</Label>
                        <Select value={formData.period} onValueChange={(value) => setFormData({ ...formData, period: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الفترة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">يومي</SelectItem>
                            <SelectItem value="weekly">أسبوعي</SelectItem>
                            <SelectItem value="monthly">شهري</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>تاريخ البدء</Label>
                        <Input 
                          type="date" 
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>الوصف</Label>
                      <Textarea 
                        placeholder="وصف التدقيق..." 
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>التوصيات</Label>
                      <Textarea 
                        placeholder="التوصيات..." 
                        value={formData.recommendations}
                        onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>التحسينات</Label>
                      <Textarea 
                        placeholder="التحسينات المقترحة..." 
                        value={formData.improvements}
                        onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                      />
                    </div>
                    <Button className="w-full" onClick={handleCreateAudit} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                          جاري الإنشاء...
                        </>
                      ) : (
                        'إنشاء التدقيق'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredAudits.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد تدقيقات</p>
                <p className="text-sm text-muted-foreground mt-1">اضغط على "تدقيق جديد" لإنشاء أول تدقيق</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredAudits.map((audit) => {
                const findings = parseFindings(audit.findings)
                return (
                  <Card key={audit.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center',
                            audit.type === 'portfolio' && 'bg-primary/20 text-primary',
                            audit.type === 'trading' && 'bg-profit/20 text-profit',
                            audit.type === 'risk' && 'bg-warning/20 text-warning',
                            audit.type === 'behaviour' && 'bg-secondary/20 text-secondary-foreground'
                          )}>
                            {audit.type === 'portfolio' && <Wallet className="h-5 w-5" />}
                            {audit.type === 'trading' && <LineChart className="h-5 w-5" />}
                            {audit.type === 'risk' && <Shield className="h-5 w-5" />}
                            {audit.type === 'behaviour' && <Brain className="h-5 w-5" />}
                          </div>
                          <div>
                            <h3 className="font-semibold">{audit.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{formatDate(audit.createdAt)}</span>
                              {audit.period && (
                                <Badge variant="outline">
                                  {audit.period === 'daily' ? 'يومي' : audit.period === 'weekly' ? 'أسبوعي' : 'شهري'}
                                </Badge>
                              )}
                              <Badge variant={
                                audit.status === 'completed' ? 'default' :
                                audit.status === 'in-progress' ? 'secondary' : 'outline'
                              }>
                                {audit.status === 'completed' ? 'مكتمل' :
                                 audit.status === 'in-progress' ? 'قيد التنفيذ' : 'معلق'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {audit.status === 'completed' && audit.score !== null && (
                          <div className="text-center">
                            <div className="relative w-16 h-16">
                              <svg className="w-16 h-16 transform -rotate-90">
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="28"
                                  stroke="currentColor"
                                  strokeWidth="6"
                                  fill="none"
                                  className="text-muted"
                                />
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="28"
                                  stroke="currentColor"
                                  strokeWidth="6"
                                  fill="none"
                                  strokeDasharray={`${(audit.score || 0) * 1.76} 176`}
                                  className={(audit.score || 0) >= 80 ? 'text-profit' : (audit.score || 0) >= 60 ? 'text-warning' : 'text-loss'}
                                />
                              </svg>
                              <span className="absolute inset-0 flex items-center justify-center font-bold">
                                {audit.score}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {findings.length > 0 && (
                        <div className="space-y-2 mb-4">
                          <Label className="text-muted-foreground text-xs">النتائج</Label>
                          <div className="grid gap-2">
                            {findings.map((finding, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                                {finding.status === 'pass' && <CheckCircle className="h-4 w-4 text-profit" />}
                                {finding.status === 'warning' && <AlertTriangle className="h-4 w-4 text-warning" />}
                                {finding.status === 'fail' && <XCircle className="h-4 w-4 text-loss" />}
                                <span className="flex-1">{finding.item}</span>
                                <span className="text-xs text-muted-foreground">{finding.note}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {audit.recommendations && (
                        <div className="mb-4">
                          <Label className="text-muted-foreground text-xs">التوصيات</Label>
                          <p className="mt-1 text-sm">{audit.recommendations}</p>
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap">
                        {audit.status === 'pending' && (
                          <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(audit, 'in-progress')}>
                            بدء التدقيق
                          </Button>
                        )}
                        {audit.status === 'in-progress' && (
                          <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(audit, 'completed')}>
                            إكمال التدقيق
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(audit)}>
                          <Edit className="h-4 w-4 ml-2" />
                          تعديل
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive">
                              <Trash2 className="h-4 w-4 ml-2" />
                              حذف
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>حذف التدقيق</AlertDialogTitle>
                              <AlertDialogDescription>
                                هل أنت متأكد من حذف هذا التدقيق؟ لا يمكن التراجع عن هذا الإجراء.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteAudit(audit.id)}
                                disabled={deleting === audit.id}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {deleting === audit.id ? (
                                  <>
                                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                                    جاري الحذف...
                                  </>
                                ) : (
                                  'حذف'
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Portfolio Audits Tab */}
        <TabsContent value="portfolio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                تدقيق المحفظة
              </CardTitle>
              <CardDescription>مراجعة شاملة لأداء المحفظة وتوزيع الأصول</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                قم بإنشاء تدقيق جديد لمراجعة أداء المحفظة وتوزيع الأصول والتأكد من تناسبها مع أهدافك الاستثمارية.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trading Audits Tab */}
        <TabsContent value="trading" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                تدقيق التداول
              </CardTitle>
              <CardDescription>مراجعة أداء التداول والصفقات</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                قم بإنشاء تدقيق جديد لمراجعة أداء التداول وتحليل الصفقات وتحديد مجالات التحسين.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Audits Tab */}
        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                تدقيق المخاطر
              </CardTitle>
              <CardDescription>مراجعة إدارة المخاطر والحدود</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                قم بإنشاء تدقيق جديد لمراجعة إدارة المخاطر والتأكد من الالتزام بالحدود المحددة.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behaviour Audits Tab */}
        <TabsContent value="behaviour" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                تدقيق السلوك
              </CardTitle>
              <CardDescription>مراجعة السلوك التداولي والانضباط</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                قم بإنشاء تدقيق جديد لمراجعة السلوك التداولي والانضباط والالتزام بالقواعد.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Improvements Tab */}
        <TabsContent value="improvements" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">خطة التحسين</h3>
          </div>

          {improvementItems.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد عناصر تحسين</p>
                <p className="text-sm text-muted-foreground mt-1">أضف تحسينات في التدقيقات لرؤيتها هنا</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {improvementItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-2 h-8 rounded-full',
                          item.priority === 'high' ? 'bg-loss' :
                          item.priority === 'medium' ? 'bg-warning' : 'bg-muted-foreground'
                        )} />
                        <div>
                          <h4 className="font-medium">{item.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">
                              {item.priority === 'high' ? 'أولوية عالية' :
                               item.priority === 'medium' ? 'أولوية متوسطة' : 'أولوية منخفضة'}
                            </Badge>
                            <Badge variant={
                              item.status === 'completed' ? 'default' :
                              item.status === 'in-progress' ? 'secondary' : 'outline'
                            }>
                              {item.status === 'completed' ? 'مكتمل' :
                               item.status === 'in-progress' ? 'قيد التنفيذ' : 'معلق'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32">
                          <Progress value={item.progress} />
                        </div>
                        <span className="text-sm font-medium">{item.progress}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Audit Dialog */}
      <Dialog open={editAuditOpen} onOpenChange={setEditAuditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تعديل التدقيق</DialogTitle>
            <DialogDescription>
              قم بتعديل بيانات التدقيق
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>نوع التدقيق *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portfolio">تدقيق المحفظة</SelectItem>
                  <SelectItem value="trading">تدقيق التداول</SelectItem>
                  <SelectItem value="risk">تدقيق المخاطر</SelectItem>
                  <SelectItem value="behaviour">تدقيق السلوك</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>العنوان *</Label>
              <Input 
                placeholder="عنوان التدقيق" 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>الفترة</Label>
                <Select value={formData.period} onValueChange={(value) => setFormData({ ...formData, period: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفترة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">يومي</SelectItem>
                    <SelectItem value="weekly">أسبوعي</SelectItem>
                    <SelectItem value="monthly">شهري</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>تاريخ البدء</Label>
                <Input 
                  type="date" 
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>الوصف</Label>
              <Textarea 
                placeholder="وصف التدقيق..." 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>التوصيات</Label>
              <Textarea 
                placeholder="التوصيات..." 
                value={formData.recommendations}
                onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>التحسينات</Label>
              <Textarea 
                placeholder="التحسينات المقترحة..." 
                value={formData.improvements}
                onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">إلغاء</Button>
              </DialogClose>
              <Button onClick={handleUpdateAudit} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  'حفظ التغييرات'
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
