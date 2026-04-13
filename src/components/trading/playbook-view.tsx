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
  hardRules: string
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

// Core Checklist Items (Permanent Pillars) - Always included
const CORE_CHECK_ITEMS = [
  { value: 'key_levels', key: 'core_check_key_levels' },
  { value: 'liquidity', key: 'core_check_liquidity' },
  { value: 'fvg', key: 'core_check_fvg' },
  { value: 'trend', key: 'core_check_trend' },
  { value: 'sr', key: 'core_check_sr' },
  { value: 'bos', key: 'core_check_bos' },
]

// Confluence Options (Additional)
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
  
  // Custom Rule State
  const [newCustomRule, setNewCustomRule] = useState('')

  const categories = [
    { value: 'smc', label: 'SMC (Smart Money)' },
    { value: 'technical', label: 'Technical' },
    { value: 'fundamental', label: 'Fundamental' },
    { value: 'hybrid', label: 'Hybrid' }
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
      toast.error(t('playbook.failed_to_load'))
    } finally {
      setIsLoading(false)
    }
  }, [t])

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
      toast.error(t('playbook.select_image_file'))
      return
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error(t('playbook.file_size_limit'))
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
      toast.error(t('playbook.enter_model_name'))
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
      
      toast.success(t('playbook.added_successfully'))
    } catch (error) {
      console.error('Error creating playbook:', error)
      toast.error(t('playbook.failed_to_add'))
    } finally {
      setIsSaving(false)
    }
  }

  // Update playbook
  const handleUpdatePlaybook = async () => {
    if (!selectedPlaybook || !editPlaybook.name.trim()) {
      toast.error(t('playbook.enter_model_name'))
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
      
      toast.success(t('playbook.updated_successfully'))
    } catch (error) {
      console.error('Error updating playbook:', error)
      toast.error(t('playbook.failed_to_update'))
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
      
      toast.success(t('playbook.deleted_successfully'))
    } catch (error) {
      console.error('Error deleting playbook:', error)
      toast.error(t('playbook.failed_to_delete'))
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

  // Add Custom Rule
  const addCustomRule = (isEdit: boolean = false) => {
    if (!newCustomRule.trim()) return
    
    const formData = isEdit ? editPlaybook : newPlaybook
    const setFormData = isEdit ? setEditPlaybook : setNewPlaybook
    
    // Add custom rule as a confluence
    const customValue = `custom_${Date.now()}`
    const updated = [...formData.confluences, customValue]
    
    setFormData({ ...formData, confluences: updated })
    setNewCustomRule('')
    
    toast.success(isRTL ? 'تم إضافة القاعدة المخصصة' : 'Custom rule added')
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
            <Label>{t('playbook.model_name')} *</Label>
            <Input 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('playbook.model_name_placeholder')}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('playbook.setup_name')}</Label>
            <Input 
              value={formData.setupName}
              onChange={(e) => setFormData({ ...formData, setupName: e.target.value })}
              placeholder={t('playbook.setup_name_placeholder')}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>{t('playbook.description')}</Label>
          <Textarea 
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={t('playbook.description_placeholder')}
            rows={2}
          />
        </div>
      </div>

      {/* Reference Chart Upload */}
      <div className="space-y-2">
        <Label>{t('playbook.reference_chart')}</Label>
        
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
                {t('playbook.drag_and_drop_image')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {t('playbook.image_size_limit')}
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
        <Label className="flex items-center gap-2">
          {t('playbook.confluence_checklist')}
          <Badge variant="outline" className="text-xs">
            {isRTL ? 'اختر الشروط المطلوبة' : 'Select required conditions'}
          </Badge>
        </Label>
        
        {/* Unified Grid - Core + Additional + Custom */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-muted/20 border border-border">
          {/* Core 6 Items - Permanent with Gold labels */}
          {CORE_CHECK_ITEMS.map((item) => (
            <label
              key={item.value}
              className="flex items-center gap-2 cursor-pointer hover:bg-muted/30 p-2 rounded transition-colors group"
            >
              <Checkbox
                checked={formData.confluences.includes(item.value)}
                onCheckedChange={() => toggleConfluence(item.value, isEdit)}
                className="border-gold/50 data-[state=checked]:bg-gold data-[state=checked]:text-navy-dark"
              />
              <span className="text-sm text-gold group-hover:text-gold-light transition-colors font-medium">
                {t(`playbook.${item.key}`)}
              </span>
            </label>
          ))}
          
          {/* Additional Confluences */}
          {CONFLUENCE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer hover:bg-muted/30 p-2 rounded transition-colors"
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
          
          {/* Custom Rule Input */}
          <div className="col-span-2 flex gap-2 pt-2 border-t border-border mt-2">
            <Input
              placeholder={t('playbook.custom_rule_placeholder')}
              className="flex-1 text-sm"
              value={newCustomRule}
              onChange={(e) => setNewCustomRule(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newCustomRule.trim()) {
                  addCustomRule(isEdit)
                }
              }}
            />
            <Button 
              variant="outline" 
              size="icon"
              className="shrink-0"
              onClick={() => addCustomRule(isEdit)}
              disabled={!newCustomRule.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Selected Confluences Summary */}
        {formData.confluences.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {formData.confluences.map((c) => {
              const isCore = CORE_CHECK_ITEMS.some(item => item.value === c)
              const label = isCore 
                ? t(`playbook.${CORE_CHECK_ITEMS.find(item => item.value === c)?.key || ''}`)
                : (isRTL 
                  ? CONFLUENCE_OPTIONS.find(o => o.value === c)?.label.ar 
                  : CONFLUENCE_OPTIONS.find(o => o.value === c)?.label.en)
              
              return (
                <Badge 
                  key={c} 
                  variant={isCore ? "default" : "secondary"} 
                  className={cn(
                    "text-xs",
                    isCore && "bg-gold text-navy-dark border-gold"
                  )}
                >
                  {label}
                  <button
                    onClick={() => toggleConfluence(c, isEdit)}
                    className="ml-1 hover:opacity-70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
            })}
          </div>
        )}
      </div>

      {/* Kill Zones */}
      <div className="space-y-3">
        <Label>{t('playbook.kill_zones')}</Label>
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
        <Label>{t('playbook.execution_rules')}</Label>
        <Textarea 
          value={formData.hardRules}
          onChange={(e) => setFormData({ ...formData, hardRules: e.target.value })}
          placeholder={t('playbook.execution_rules_placeholder')}
          rows={5}
          className="font-mono text-sm"
        />
      </div>

      {/* Category & Timeframe */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('playbook.category')}</Label>
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
          <Label>{t('playbook.timeframe')}</Label>
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
          <Label>{t('playbook.entry_rules')}</Label>
          <Textarea 
            value={formData.entryRules}
            onChange={(e) => setFormData({ ...formData, entryRules: e.target.value })}
            placeholder={t('playbook.entry_rules_placeholder')}
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>{t('playbook.exit_rules')}</Label>
          <Textarea 
            value={formData.exitRules}
            onChange={(e) => setFormData({ ...formData, exitRules: e.target.value })}
            placeholder={t('playbook.exit_rules_placeholder')}
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
            {t('sidebar.playbook')}
          </h2>
          <p className="text-muted-foreground mt-1">
            {t('playbook.create_and_manage')}
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
            {t('playbook.create_model')}
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
              {t('playbook.no_models_yet')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('playbook.start_by_creating')}
            </p>
            <Button 
              className="mt-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-black"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('playbook.create_model')}
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
                      <p className="text-xs text-muted-foreground">{t('playbook.trades')}</p>
                      <p className="font-bold">{playbook.totalTrades}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground">{t('playbook.win_rate')}</p>
                      <p className={cn(
                        "font-bold",
                        winRate >= 60 ? "text-green-500" : winRate >= 40 ? "text-yellow-500" : "text-red-500"
                      )}>
                        {winRate.toFixed(0)}%
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground">{t('playbook.p_l')}</p>
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
                      {t('playbook.edit')}
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
              {t('playbook.create_new_model')}
            </DialogTitle>
            <DialogDescription>
              {t('playbook.define_rules')}
            </DialogDescription>
          </DialogHeader>
          
          <PlaybookForm 
            formData={newPlaybook} 
            setFormData={setNewPlaybook} 
          />
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t('playbook.cancel')}
            </Button>
            <Button 
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-black"
              onClick={handleAddPlaybook}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('playbook.saving')}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('playbook.create')}
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
              {t('playbook.edit_model')}
            </DialogTitle>
            <DialogDescription>
              {t('playbook.update_rules')}
            </DialogDescription>
          </DialogHeader>
          
          <PlaybookForm 
            formData={editPlaybook} 
            setFormData={setEditPlaybook}
            isEdit
          />
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t('playbook.cancel')}
            </Button>
            <Button 
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-black"
              onClick={handleUpdatePlaybook}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('playbook.updating')}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t('playbook.save_changes')}
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
              {t('playbook.confirm_delete')}
            </DialogTitle>
            <DialogDescription>
              {isRTL 
                ? `هل أنت متأكد من حذف "${playbookToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete "${playbookToDelete?.name}"? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPlaybookToDelete(null)}>
              {t('playbook.cancel')}
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeletePlaybook}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('playbook.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}