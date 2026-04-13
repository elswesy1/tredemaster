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
import { Checkbox } from '@/components/ui/checkbox'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
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
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Upload,
  X,
  Globe
} from 'lucide-react'

// Playbook Interface - Updated with new fields
interface Playbook {
  id: string
  name: string
  description: string | null
  setupName: string | null
  imageUrl: string | null
  confluences: string | null  // JSON string from database
  killZones: string | null    // JSON string from database
  hardRules: string | null
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
  imageUrl: string
  confluences: string[]
  killZones: string[]
  hardRules: string
  category: string
  timeframe: string
  entryRules: string
  exitRules: string
}

const initialFormData: PlaybookFormData = {
  name: '',
  description: '',
  setupName: '',
  imageUrl: '',
  confluences: [],
  killZones: [],
  hardRules: '',
  category: 'smc',
  timeframe: 'H1',
  entryRules: '',
  exitRules: ''
}

// Confluence Options
const CONFLUENCE_OPTIONS = [
  { value: 'liquidity_swept', label: { ar: 'اكتساح السيولة', en: 'Liquidity Swept' } },
  { value: 'choch', label: { ar: 'ChoCH (تغيير الاتجاه)', en: 'ChoCH (Change of Character)' } },
  { value: 'bos', label: { ar: 'BOS (كسر الهيكل)', en: 'BOS (Break of Structure)' } },
  { value: 'fvg', label: { ar: 'FVG (فجوة عادلة)', en: 'FVG (Fair Value Gap)' } },
  { value: 'ob', label: { ar: 'Order Block', en: 'Order Block' } },
  { value: 'pd_array', label: { ar: 'Premium/Discount Array', en: 'Premium/Discount Array' } },
  { value: 'equilibrium', label: { ar: 'نقطة التوازن', en: 'Equilibrium' } },
  { value: 'optimal_entry', label: { ar: 'دخول مثالي', en: 'Optimal Entry' } },
  { value: 'snr', label: { ar: 'دعم/مقاومة قوية', en: 'Strong Support/Resistance' } },
  { value: 'trend_alignment', label: { ar: 'توافق الترند', en: 'Trend Alignment' } },
]

// Kill Zones (Trading Sessions)
const KILL_ZONE_OPTIONS = [
  { value: 'asia', label: { ar: 'آسيا', en: 'Asia' }, time: '00:00 - 08:00 UTC' },
  { value: 'london', label: { ar: 'لندن', en: 'London' }, time: '08:00 - 16:00 UTC' },
  { value: 'ny_am', label: { ar: 'نيويورك صباحاً', en: 'NY AM' }, time: '13:30 - 16:00 UTC' },
  { value: 'ny_pm', label: { ar: 'نيويورك مساءً', en: 'NY PM' }, time: '16:00 - 21:00 UTC' },
]

export function PlaybookView() {
  const { t, language } = useI18n()
  const isRTL = language === 'ar'
  
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
  
  // File Upload State
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  const categories = [
    { value: 'smc', label: isRTL ? 'SMC (Smart Money)' : 'SMC (Smart Money)' },
    { value: 'technical', label: isRTL ? 'تحليل فني' : 'Technical' },
    { value: 'fundamental', label: isRTL ? 'تحليل أساسي' : 'Fundamental' },
    { value: 'hybrid', label: isRTL ? 'مختلط' : 'Hybrid' }
  ]

  const timeframes = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1']

  // Fetch playbooks from API
  const fetchPlaybooks = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/playbooks', {
        method: 'GET',
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch playbooks')
      }
      
      const data = await response.json()
      setPlaybooks(data)
    } catch (error) {
      console.error('Error fetching playbooks:', error)
      toast.error(isRTL ? 'فشل في تحميل نماذج التداول' : 'Failed to load trading models')
    } finally {
      setIsLoading(false)
    }
  }, [isRTL])

  // Fetch on mount
  useEffect(() => {
    fetchPlaybooks()
  }, [fetchPlaybooks])

  // File Upload Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error(isRTL ? 'يرجى اختيار ملف صورة' : 'Please select an image file')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error(isRTL ? 'حجم الملف يجب أن يكون أقل من 5MB' : 'File size must be less than 5MB')
      return
    }
    
    setUploadedFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const clearUploadedFile = () => {
    setUploadedFile(null)
    setPreviewUrl('')
  }

  // Confluence Handlers
  const toggleConfluence = (value: string, isEdit: boolean = false) => {
    const formData = isEdit ? editPlaybook : newPlaybook
    const setFormData = isEdit ? setEditPlaybook : setNewPlaybook
    
    const current = formData.confluences
    const updated = current.includes(value)
      ? current.filter(c => c !== value)
      : [...current, value]
    
    setFormData({ ...formData, confluences: updated })
  }

  // Kill Zone Handlers
  const toggleKillZone = (value: string, isEdit: boolean = false) => {
    const formData = isEdit ? editPlaybook : newPlaybook
    const setFormData = isEdit ? setEditPlaybook : setNewPlaybook
    
    const current = formData.killZones
    const updated = current.includes(value)
      ? current.filter(k => k !== value)
      : [...current, value]
    
    setFormData({ ...formData, killZones: updated })
  }

  // Create new playbook
  const handleAddPlaybook = async () => {
    if (!newPlaybook.name.trim()) {
      toast.error(isRTL ? 'يرجى إدخال اسم النموذج' : 'Please enter a model name')
      return
    }

    try {
      setIsSaving(true)
      
      const response = await fetch('/api/playbooks', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPlaybook,
          confluences: JSON.stringify(newPlaybook.confluences),
          killZones: JSON.stringify(newPlaybook.killZones),
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create playbook')
      }
      
      const createdPlaybook = await response.json()
      setPlaybooks([createdPlaybook, ...playbooks])
      setIsAddDialogOpen(false)
      setNewPlaybook(initialFormData)
      clearUploadedFile()
      
      toast.success(isRTL ? 'تم إضافة نموذج التداول بنجاح' : 'Trading model added successfully')
    } catch (error) {
      console.error('Error creating playbook:', error)
      toast.error(isRTL ? 'فشل في إضافة نموذج التداول' : 'Failed to add trading model')
    } finally {
      setIsSaving(false)
    }
  }

  // Update playbook
  const handleUpdatePlaybook = async () => {
    if (!selectedPlaybook || !editPlaybook.name.trim()) {
      toast.error(isRTL ? 'يرجى إدخال اسم النموذج' : 'Please enter a model name')
      return
    }

    try {
      setIsSaving(true)
      
      const response = await fetch(`/api/playbooks/${selectedPlaybook.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editPlaybook,
          confluences: JSON.stringify(editPlaybook.confluences),
          killZones: JSON.stringify(editPlaybook.killZones),
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update playbook')
      }
      
      const updatedPlaybook = await response.json()
      setPlaybooks(playbooks.map(p => p.id === selectedPlaybook.id ? updatedPlaybook : p))
      setIsEditDialogOpen(false)
      setSelectedPlaybook(null)
      setEditPlaybook(initialFormData)
      
      toast.success(isRTL ? 'تم تحديث نموذج التداول بنجاح' : 'Trading model updated successfully')
    } catch (error) {
      console.error('Error updating playbook:', error)
      toast.error(isRTL ? 'فشل في تحديث نموذج التداول' : 'Failed to update trading model')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete playbook
  const handleDeletePlaybook = async () => {
    if (!playbookToDelete) return

    try {
      const response = await fetch(`/api/playbooks/${playbookToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete playbook')
      }
      
      setPlaybooks(playbooks.filter(p => p.id !== playbookToDelete.id))
      setPlaybookToDelete(null)
      
      toast.success(isRTL ? 'تم حذف نموذج التداول بنجاح' : 'Trading model deleted successfully')
    } catch (error) {
      console.error('Error deleting playbook:', error)
      toast.error(isRTL ? 'فشل في حذف نموذج التداول' : 'Failed to delete trading model')
    }
  }

  // Open edit dialog
  const openEditDialog = (playbook: Playbook) => {
    setSelectedPlaybook(playbook)
    setEditPlaybook({
      name: playbook.name,
      description: playbook.description || '',
      setupName: playbook.setupName || '',
      imageUrl: playbook.imageUrl || '',
      confluences: playbook.confluences ? JSON.parse(playbook.confluences) : [],
      killZones: playbook.killZones ? JSON.parse(playbook.killZones) : [],
      hardRules: playbook.hardRules || '',
      category: playbook.category || 'smc',
      timeframe: playbook.timeframe || 'H1',
      entryRules: playbook.entryRules || '',
      exitRules: playbook.exitRules || '',
    })
    setIsEditDialogOpen(true)
  }

  // Form Component
  const PlaybookForm = ({ formData, setFormData, isEdit = false }: { 
    formData: PlaybookFormData
    setFormData: React.Dispatch<React.SetStateAction<PlaybookFormData>>
    isEdit?: boolean 
  }) => (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto px-1">
      {/* Basic Info */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{isRTL ? 'اسم النموذج' : 'Model Name'} *</Label>
            <Input 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={isRTL ? 'مثال: DAX ChoCH Setup' : 'e.g., DAX ChoCH Setup'}
            />
          </div>
          <div className="space-y-2">
            <Label>{isRTL ? 'اسم الإعداد (A+ Setup)' : 'Setup Name (A+ Setup)'}</Label>
            <Input 
              value={formData.setupName}
              onChange={(e) => setFormData({ ...formData, setupName: e.target.value })}
              placeholder={isRTL ? 'مثال: London Kill Zone ChoCH' : 'e.g., London Kill Zone ChoCH'}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>{isRTL ? 'الوصف' : 'Description'}</Label>
          <Textarea 
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={isRTL ? 'وصف مختصر للنموذج...' : 'Brief description of the model...'}
            rows={2}
          />
        </div>
      </div>

      {/* Reference Chart Upload */}
      <div className="space-y-2">
        <Label>{isRTL ? 'الرسم البياني المرجعي (A+ Setup)' : 'Reference Chart (A+ Setup)'}</Label>
        
        {!previewUrl ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
              isDragging ? "border-cyan-500 bg-cyan-500/10" : "border-gray-700 hover:border-gray-600"
            )}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-400">
                {isRTL 
                  ? 'اسحب وأفلت صورة هنا أو انقر للاختيار' 
                  : 'Drag and drop an image here or click to select'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {isRTL ? 'PNG, JPG حتى 5MB' : 'PNG, JPG up to 5MB'}
              </p>
            </label>
          </div>
        ) : (
          <div className="relative rounded-lg overflow-hidden border border-gray-700">
            <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover" />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={clearUploadedFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Confluence Checklist */}
      <div className="space-y-3">
        <Label>{isRTL ? 'قائمة التقاء الشروط (Confluence Checklist)' : 'Confluence Checklist'}</Label>
        <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-muted/30 border border-border">
          {CONFLUENCE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
            >
              <Checkbox
                checked={formData.confluences.includes(option.value)}
                onCheckedChange={() => toggleConfluence(option.value, isEdit)}
              />
              <span className="text-sm">
                {isRTL ? option.label.ar : option.label.en}
              </span>
            </label>
          ))}
        </div>
        {formData.confluences.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {formData.confluences.map((c) => (
              <Badge key={c} variant="secondary" className="text-xs">
                {isRTL 
                  ? CONFLUENCE_OPTIONS.find(o => o.value === c)?.label.ar 
                  : CONFLUENCE_OPTIONS.find(o => o.value === c)?.label.en}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Kill Zones */}
      <div className="space-y-3">
        <Label>{isRTL ? 'مناطق التداول (Kill Zones)' : 'Kill Zones'}</Label>
        <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-muted/30 border border-border">
          {KILL_ZONE_OPTIONS.map((zone) => (
            <label
              key={zone.value}
              className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
            >
              <Checkbox
                checked={formData.killZones.includes(zone.value)}
                onCheckedChange={() => toggleKillZone(zone.value, isEdit)}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {isRTL ? zone.label.ar : zone.label.en}
                </span>
                <span className="text-xs text-muted-foreground">{zone.time}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Hard Rules */}
      <div className="space-y-2">
        <Label>{isRTL ? 'قواعد التنفيذ والملاحظات' : 'Execution Rules & Notes'}</Label>
        <Textarea 
          value={formData.hardRules}
          onChange={(e) => setFormData({ ...formData, hardRules: e.target.value })}
          placeholder={isRTL 
            ? 'مثال:\n- لا تدخل بدون 3 شروط على الأقل\n- وقف الخسارة دائماً عند الـ swing low\n- لا تتداول خلال الأخبار العالية...' 
            : 'e.g.:\n- No entry without at least 3 conditions\n- Stop loss always at swing low\n- No trading during high-impact news...'}
          rows={5}
          className="font-mono text-sm"
        />
      </div>

      {/* Category & Timeframe */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{isRTL ? 'الفئة' : 'Category'}</Label>
          <Select 
            value={formData.category} 
            onValueChange={(v) => setFormData({ ...formData, category: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{isRTL ? 'الإطار الزمني' : 'Timeframe'}</Label>
          <Select 
            value={formData.timeframe} 
            onValueChange={(v) => setFormData({ ...formData, timeframe: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeframes.map((tf) => (
                <SelectItem key={tf} value={tf}>
                  {tf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Entry & Exit Rules */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{isRTL ? 'قواعد الدخول' : 'Entry Rules'}</Label>
          <Textarea 
            value={formData.entryRules}
            onChange={(e) => setFormData({ ...formData, entryRules: e.target.value })}
            placeholder={isRTL ? 'قواعد الدخول...' : 'Entry rules...'}
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>{isRTL ? 'قواعد الخروج' : 'Exit Rules'}</Label>
          <Textarea 
            value={formData.exitRules}
            onChange={(e) => setFormData({ ...formData, exitRules: e.target.value })}
            placeholder={isRTL ? 'قواعد الخروج...' : 'Exit rules...'}
            rows={3}
          />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-cyan-500" />
            {isRTL ? 'نماذج التداول' : 'Trading Models'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {isRTL 
              ? 'أنشئ وأدر نماذج التداول الخاصة بك مع قواعد محددة' 
              : 'Create and manage your trading models with defined rules'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={fetchPlaybooks}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
          <Button 
            className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-black"
            onClick={() => {
              setNewPlaybook(initialFormData)
              clearUploadedFile()
              setIsAddDialogOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isRTL ? 'إنشاء نموذج' : 'Create Model'}
          </Button>
        </div>
      </div>

      {/* Playbooks List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : playbooks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {isRTL ? 'لا توجد نماذج تداول بعد' : 'No trading models yet'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {isRTL ? 'ابدأ بإنشاء نموذجك الأول' : 'Start by creating your first model'}
            </p>
            <Button 
              className="mt-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-black"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {isRTL ? 'إنشاء نموذج' : 'Create Model'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {playbooks.map((playbook) => {
            const winRate = playbook.totalTrades > 0 
              ? (playbook.winningTrades / playbook.totalTrades) * 100 
              : 0
            
            const confluences = playbook.confluences 
              ? JSON.parse(playbook.confluences) as string[]
              : []
            
            const killZones = playbook.killZones 
              ? JSON.parse(playbook.killZones) as string[]
              : []

            return (
              <Card key={playbook.id} className="hover:border-cyan-500/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{playbook.name}</CardTitle>
                      {playbook.setupName && (
                        <CardDescription className="text-cyan-400">
                          {playbook.setupName}
                        </CardDescription>
                      )}
                    </div>
                    <Badge variant={playbook.isActive ? "default" : "secondary"}>
                      {playbook.category?.toUpperCase() || 'SMC'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground">{isRTL ? 'الصفقات' : 'Trades'}</p>
                      <p className="font-bold">{playbook.totalTrades}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground">{isRTL ? 'نسبة الفوز' : 'Win Rate'}</p>
                      <p className={cn(
                        "font-bold",
                        winRate >= 60 ? "text-green-500" : winRate >= 40 ? "text-yellow-500" : "text-red-500"
                      )}>
                        {winRate.toFixed(0)}%
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground">{isRTL ? 'P/L' : 'P/L'}</p>
                      <p className={cn(
                        "font-bold",
                        playbook.profitLoss >= 0 ? "text-green-500" : "text-red-500"
                      )}>
                        ${playbook.profitLoss.toFixed(0)}
                      </p>
                    </div>
                  </div>

                  {/* Confluences Preview */}
                  {confluences.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {confluences.slice(0, 3).map((c) => (
                        <Badge key={c} variant="outline" className="text-xs">
                          {isRTL 
                            ? CONFLUENCE_OPTIONS.find(o => o.value === c)?.label.ar 
                            : CONFLUENCE_OPTIONS.find(o => o.value === c)?.label.en}
                        </Badge>
                      ))}
                      {confluences.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{confluences.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Kill Zones Preview */}
                  {killZones.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {killZones.map((k) => 
                        isRTL 
                          ? KILL_ZONE_OPTIONS.find(z => z.value === k)?.label.ar 
                          : KILL_ZONE_OPTIONS.find(z => z.value === k)?.label.en
                      ).join(' • ')}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => openEditDialog(playbook)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      {isRTL ? 'تعديل' : 'Edit'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-500 hover:text-red-400"
                      onClick={() => setPlaybookToDelete(playbook)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isRTL ? 'إنشاء نموذج تداول جديد' : 'Create New Trading Model'}
            </DialogTitle>
            <DialogDescription>
              {isRTL 
                ? 'حدد قواعد الدخول والخروج ومناطق التداول' 
                : 'Define your entry/exit rules and trading zones'}
            </DialogDescription>
          </DialogHeader>
          
          <PlaybookForm 
            formData={newPlaybook} 
            setFormData={setNewPlaybook} 
          />
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-black"
              onClick={handleAddPlaybook}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isRTL ? 'جاري الحفظ...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {isRTL ? 'إنشاء' : 'Create'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isRTL ? 'تعديل نموذج التداول' : 'Edit Trading Model'}
            </DialogTitle>
            <DialogDescription>
              {isRTL ? 'تحديث قواعد وإعدادات النموذج' : 'Update model rules and settings'}
            </DialogDescription>
          </DialogHeader>
          
          <PlaybookForm 
            formData={editPlaybook} 
            setFormData={setEditPlaybook}
            isEdit
          />
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-black"
              onClick={handleUpdatePlaybook}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isRTL ? 'جاري التحديث...' : 'Updating...'}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!playbookToDelete} onOpenChange={() => setPlaybookToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-500">
              {isRTL ? 'تأكيد الحذف' : 'Confirm Delete'}
            </DialogTitle>
            <DialogDescription>
              {isRTL 
                ? `هل أنت متأكد من حذف "${playbookToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete "${playbookToDelete?.name}"? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPlaybookToDelete(null)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeletePlaybook}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isRTL ? 'حذف' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}