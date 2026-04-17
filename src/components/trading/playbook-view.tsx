'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
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
import { ScrollArea } from '@/components/ui/scroll-area'
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
  ListChecks,
  ImageIcon,
  X,
  CheckCircle2
} from 'lucide-react'

interface Playbook {
  id: string
  name: string
  description: string | null
  category: string | null
  timeframe: string | null
  entryRules: string | null
  exitRules: string | null
  riskRules: string | null
  setupName: string | null
  rulesChecklist: string | null // Stringified JSON
  setupScreenshotUrl: string | null
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

interface ChecklistItem {
  id: string
  text: string
  required: boolean
}

interface PlaybookFormData {
  name: string
  description: string
  category: string
  timeframe: string
  entryRules: string
  exitRules: string
  riskRules: string
  setupName: string
  rulesChecklist: ChecklistItem[]
  setupScreenshotUrl: string
}

const initialFormData: PlaybookFormData = {
  name: '',
  description: '',
  category: 'technical',
  timeframe: 'H1',
  entryRules: '',
  exitRules: '',
  riskRules: '',
  setupName: '',
  rulesChecklist: [],
  setupScreenshotUrl: ''
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
  const [formData, setFormData] = useState<PlaybookFormData>(initialFormData)
  const [newChecklistItem, setNewChecklistItem] = useState('')

  const categories = [
    { value: 'technical', label: isRTL ? 'تحليل فني' : 'Technical' },
    { value: 'fundamental', label: isRTL ? 'تحليل أساسي' : 'Fundamental' },
    { value: 'smc', label: isRTL ? 'SMC/ICT' : 'SMC/ICT' },
    { value: 'price-action', label: isRTL ? 'برايس أكشن' : 'Price Action' },
    { value: 'hybrid', label: isRTL ? 'مختلط' : 'Hybrid' }
  ]

  const timeframes = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1']

  // Fetch playbooks
  const fetchPlaybooks = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/playbook', {
        method: 'GET',
        headers: getApiHeaders(),
      })
      
      if (!response.ok) throw new Error('Failed to fetch playbooks')
      
      const data = await response.json()
      setPlaybooks(data)
    } catch (error) {
      console.error('Error fetching playbooks:', error)
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في تحميل كتيب القواعد' : 'Failed to load playbook',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, isRTL])

  useEffect(() => {
    fetchPlaybooks()
  }, [fetchPlaybooks])

  // Checklist Handlers
  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return
    const newItem: ChecklistItem = {
      id: Math.random().toString(36).substr(2, 9),
      text: newChecklistItem.trim(),
      required: true
    }
    setFormData({
      ...formData,
      rulesChecklist: [...formData.rulesChecklist, newItem]
    })
    setNewChecklistItem('')
  }

  const removeChecklistItem = (id: string) => {
    setFormData({
      ...formData,
      rulesChecklist: formData.rulesChecklist.filter(item => item.id !== id)
    })
  }

  // Create Playbook
  const handleSavePlaybook = async (isUpdate = false) => {
    if (!formData.name.trim()) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'يرجى إدخال اسم الكتيب' : 'Please enter a name',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSaving(true)
      const url = '/api/playbook'
      const method = isUpdate ? 'PUT' : 'POST'
      
      const payload = {
        ...formData,
        id: isUpdate ? selectedPlaybook?.id : undefined,
      }

      const response = await fetch(url, {
        method,
        headers: getApiHeaders(),
        body: JSON.stringify(payload),
      })
      
      if (!response.ok) throw new Error('Failed to save playbook')
      
      const saved = await response.json()
      
      if (isUpdate) {
        setPlaybooks(playbooks.map(p => p.id === saved.id ? saved : p))
        setIsEditDialogOpen(false)
      } else {
        setPlaybooks([saved, ...playbooks])
        setIsAddDialogOpen(false)
      }
      
      setFormData(initialFormData)
      toast({
        title: isRTL ? 'نجاح' : 'Success',
        description: isRTL ? 'تم حفظ كتيب القواعد بنجاح' : 'Playbook saved successfully',
      })
    } catch (error) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في الحفظ' : 'Failed to save',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeletePlaybook = async (id: string) => {
    try {
      setIsSaving(true)
      const response = await fetch(`/api/playbook?id=${id}`, {
        method: 'DELETE',
        headers: getApiHeaders(),
      })
      
      if (!response.ok) throw new Error('Failed to delete')
      
      setPlaybooks(playbooks.filter(p => p.id !== id))
      setPlaybookToDelete(null)
      setSelectedPlaybook(null)
      
      toast({
        title: isRTL ? 'نجاح' : 'Success',
        description: isRTL ? 'تم الحذف بنجاح' : 'Deleted successfully',
      })
    } catch (error) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في الحذف' : 'Failed to delete',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const openEditDialog = (playbook: Playbook) => {
    setSelectedPlaybook(playbook)
    setFormData({
      name: playbook.name,
      description: playbook.description || '',
      category: playbook.category || 'technical',
      timeframe: playbook.timeframe || 'H1',
      entryRules: playbook.entryRules || '',
      exitRules: playbook.exitRules || '',
      riskRules: playbook.riskRules || '',
      setupName: playbook.setupName || '',
      rulesChecklist: playbook.rulesChecklist ? JSON.parse(playbook.rulesChecklist) : [],
      setupScreenshotUrl: playbook.setupScreenshotUrl || ''
    })
    setIsEditDialogOpen(true)
  }

  const getCategoryBadge = (category: string | null) => {
    const cat = category || 'technical'
    const colors: Record<string, string> = {
      technical: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      fundamental: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      smc: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'price-action': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      hybrid: 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    }
    const filtered = categories.find(c => c.value === cat)
    return (
      <Badge variant="outline" className={colors[cat]}>
        {filtered?.label || cat}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ListChecks className="w-6 h-6 text-green-500" />
            {isRTL ? 'نماذج التداول' : 'Trading Models'}
          </h2>
          <p className="text-muted-foreground">
            {isRTL ? 'وثق نماذج دخولك وقواعدك بوضوح' : 'Document your setups and rules clearly'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchPlaybooks} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            onClick={() => {
              setFormData(initialFormData)
              setIsAddDialogOpen(true)
            }} 
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:shadow-green-500/20 transition-all font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isRTL ? 'إضافة نموذج' : 'Add Setup'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold">{playbooks.length}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  {isRTL ? 'إجمالي النماذج' : 'Total Setups'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* ... Other stats could go here ... */}
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {playbooks.map((playbook) => (
          <Card 
            key={playbook.id} 
            className="group hover:border-green-500/30 transition-all duration-300 bg-card/50 backdrop-blur-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(playbook)} className="h-8 w-8">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setPlaybookToDelete(playbook)} className="h-8 w-8 text-red-500">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/20">
                  <CheckCircle2 className="h-7 w-7 text-green-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg leading-tight">{playbook.name}</CardTitle>
                    {getCategoryBadge(playbook.category)}
                  </div>
                  <CardDescription className="line-clamp-1">{playbook.setupName || playbook.description || 'No description'}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-3 rounded-xl">
                  <div>
                    <span className="text-muted-foreground block text-xs">{isRTL ? 'الإطار الزمني' : 'Timeframe'}</span>
                    <span className="font-semibold">{playbook.timeframe || '-'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">{isRTL ? 'الربح الإجمالي' : 'Total Profit'}</span>
                    <span className={playbook.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}>
                      ${Math.abs(playbook.profitLoss).toLocaleString()}
                    </span>
                  </div>
                </div>

                {playbook.rulesChecklist && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                      <ListChecks className="w-3.5 h-3.5" />
                      {isRTL ? 'قائمة القواعد' : 'Rule Checklist'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {JSON.parse(playbook.rulesChecklist).slice(0, 3).map((item: any) => (
                        <Badge key={item.id} variant="secondary" className="px-2 py-0 text-[10px] bg-background">
                          {item.text}
                        </Badge>
                      ))}
                      {JSON.parse(playbook.rulesChecklist).length > 3 && (
                        <Badge variant="outline" className="text-[10px] border-dashed">
                          +{JSON.parse(playbook.rulesChecklist).length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                {playbook.setupScreenshotUrl && (
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-xs text-green-500"
                    onClick={() => window.open(playbook.setupScreenshotUrl!, '_blank')}
                  >
                    <ImageIcon className="w-3.5 h-3.5 mr-1" />
                    {isRTL ? 'عرض صورة النموذج' : 'View Setup Screenshot'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={isAddDialogOpen || isEditDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false)
            setIsEditDialogOpen(false)
          }
        }}
      >
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen ? (isRTL ? 'تعديل النموذج' : 'Edit Setup') : (isRTL ? 'إضافة نموذج جديد' : 'New Playbook Setup')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'اسم النموذج العام' : 'Setup Name'} *</Label>
                <Input 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. MSS + FVG"
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'اسم النموذج التفصيلي' : 'Entry Setup Name'}</Label>
                <Input 
                  value={formData.setupName} 
                  onChange={e => setFormData({...formData, setupName: e.target.value})}
                  placeholder="e.g. Bearish Breaker"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'الفئة' : 'Category'}</Label>
                  <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isRTL ? 'الإطار الزمني' : 'Timeframe'}</Label>
                  <Select value={formData.timeframe} onValueChange={v => setFormData({...formData, timeframe: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {timeframes.map(tf => <SelectItem key={tf} value={tf}>{tf}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'رابط صورة النموذج' : 'Setup Screenshot URL'}</Label>
                <div className="flex gap-2">
                  <Input 
                    value={formData.setupScreenshotUrl} 
                    onChange={e => setFormData({...formData, setupScreenshotUrl: e.target.value})}
                    placeholder="https://..."
                  />
                  <Button size="icon" variant="outline"><ImageIcon className="h-4 w-4"/></Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center justify-between">
                  <span>{isRTL ? 'قائمة التحقق (Checklist)' : 'Rule Checklist'}</span>
                  <Badge variant="secondary" className="text-[10px]">{formData.rulesChecklist.length}</Badge>
                </Label>
                <div className="flex gap-2">
                  <Input 
                    value={newChecklistItem} 
                    onChange={e => setNewChecklistItem(e.target.value)}
                    placeholder={isRTL ? 'أضف قاعدة جديدة...' : 'Add a rule...'}
                    onKeyDown={e => e.key === 'Enter' && addChecklistItem()}
                  />
                  <Button size="icon" onClick={addChecklistItem}><Plus className="h-4 w-4"/></Button>
                </div>
                <ScrollArea className="h-[200px] border rounded-lg p-3 bg-muted/20">
                  <div className="space-y-2">
                    {formData.rulesChecklist.map((item) => (
                      <div key={item.id} className="flex items-center justify-between group bg-card p-2 rounded-md border shadow-sm">
                        <div className="flex items-center gap-2">
                          <Checkbox checked disabled />
                          <span className="text-sm">{item.text}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 text-red-500"
                          onClick={() => removeChecklistItem(item.id)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    {formData.rulesChecklist.length === 0 && (
                      <div className="text-center py-10 text-muted-foreground text-xs italic">
                        No rules added yet
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>

          <div className="space-y-2 py-2">
            <Label>{isRTL ? 'وصف أو ملاحظات' : 'Description/Notes'}</Label>
            <Textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); setIsEditDialogOpen(false); }}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              onClick={() => handleSavePlaybook(isEditDialogOpen)} 
              className="bg-green-500"
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditDialogOpen ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'حفظ النموذج' : 'Save Trading Model')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!playbookToDelete} onOpenChange={() => setPlaybookToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isRTL ? 'تأكيد الحذف' : 'Confirm Delete'}</DialogTitle>
            <DialogDescription>
              {isRTL ? 'هل أنت متأكد من حذف هذا النموذج؟' : 'Are you sure you want to delete this setup?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlaybookToDelete(null)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => playbookToDelete && handleDeletePlaybook(playbookToDelete.id)}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isRTL ? 'حذف نهائي' : 'Delete Permanent'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
