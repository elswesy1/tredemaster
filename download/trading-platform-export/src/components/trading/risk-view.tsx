'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Shield,
  AlertTriangle,
  Calculator,
  TrendingDown,
  Target,
  Gauge,
  Edit,
  Trash2,
  Plus,
  Loader2,
  RefreshCw,
  Building2,
  Coins,
  CheckCircle2,
  Circle,
  Bell,
  AlertCircle,
  PieChart,
  BarChart3,
  Activity,
  X,
  Info,
} from 'lucide-react'
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useI18n } from '@/lib/i18n'

// Types
interface RiskProfile {
  id: string
  userId: string
  accountId?: string
  accountName?: string
  accountType?: string
  name: string
  description?: string
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  riskDegree: number
  maxDailyLoss?: number
  maxWeeklyLoss?: number
  maxMonthlyLoss?: number
  maxDrawdown?: number
  maxPositionSize?: number
  maxRiskPerTrade?: number
  maxCorrelatedTrades?: number
  maxLeverage?: number
  stopLossRequired: boolean
  takeProfitRequired: boolean
  riskRewardMin?: number
  isConfigured: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface RiskUsage {
  id: string
  dailyLoss: number
  dailyTrades: number
  dailyRiskUsed: number
  weeklyLoss: number
  weeklyTrades: number
  weeklyRiskUsed: number
  monthlyLoss: number
  monthlyTrades: number
  monthlyRiskUsed: number
  openTrades: number
  totalExposure: number
}

interface RiskAlert {
  id: string
  type: string
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  currentValue?: number
  limitValue?: number
  percentage?: number
  isRead: boolean
  createdAt: string
}

// Empty profile template
const emptyProfile: Partial<RiskProfile> = {
  name: '',
  description: '',
  riskTolerance: 'moderate',
  riskDegree: 5,
  maxDailyLoss: undefined,
  maxWeeklyLoss: undefined,
  maxMonthlyLoss: undefined,
  maxDrawdown: undefined,
  maxPositionSize: undefined,
  maxRiskPerTrade: undefined,
  maxCorrelatedTrades: undefined,
  maxLeverage: undefined,
  stopLossRequired: false,
  takeProfitRequired: false,
  riskRewardMin: undefined,
  isConfigured: false,
}

const COLORS = ['oklch(0.65 0.2 145)', 'oklch(0.65 0.2 25)', 'oklch(0.55 0.15 250)', 'oklch(0.7 0.15 45)', 'oklch(0.6 0.2 320)']

export function RiskView() {
  const { toast } = useToast()
  const { language } = useI18n()
  const isRTL = language === 'ar'

  // State
  const [profiles, setProfiles] = useState<RiskProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<RiskProfile | null>(null)
  const [riskUsage, setRiskUsage] = useState<RiskUsage | null>(null)
  const [alerts, setAlerts] = useState<RiskAlert[]>([])
  const [riskBySymbol, setRiskBySymbol] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState<Partial<RiskProfile>>(emptyProfile)

  // Calculator state
  const [accountSize, setAccountSize] = useState(10000)
  const [riskPercent, setRiskPercent] = useState(2)
  const [stopLossPips, setStopLossPips] = useState(50)

  // Fetch profiles
  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiGet<RiskProfile[]>('/api/risk-profiles')
      setProfiles(data)

      if (data.length > 0) {
        setSelectedProfile(data[0])
      }
    } catch (error) {
      console.error('Error fetching risk profiles:', error)
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في تحميل ملفات المخاطر' : 'Failed to load risk profiles',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast, isRTL])

  // Fetch risk usage for selected profile
  const fetchRiskUsage = useCallback(async () => {
    if (!selectedProfile) return

    try {
      const data = await apiGet<{
        usage: RiskUsage
        riskBySymbol: Record<string, number>
      }>(`/api/risk-usage?riskProfileId=${selectedProfile.id}&period=today`)

      setRiskUsage(data.usage)
      setRiskBySymbol(data.riskBySymbol)
    } catch (error) {
      console.error('Error fetching risk usage:', error)
    }
  }, [selectedProfile])

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const data = await apiGet<RiskAlert[]>('/api/risk-alerts?unreadOnly=true')
      setAlerts(data)
    } catch (error) {
      console.error('Error fetching alerts:', error)
    }
  }, [])

  useEffect(() => {
    fetchProfiles()
    fetchAlerts()
  }, [fetchProfiles, fetchAlerts])

  useEffect(() => {
    if (selectedProfile) {
      fetchRiskUsage()
      // Use profile's risk limits for calculator
      if (selectedProfile.maxRiskPerTrade) {
        setRiskPercent(selectedProfile.maxRiskPerTrade)
      }
    }
  }, [selectedProfile, fetchRiskUsage])

  // Create profile
  const handleCreate = async () => {
    if (!formData.name) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'يرجى إدخال اسم الملف' : 'Please enter a profile name',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const newProfile = await apiPost<RiskProfile>('/api/risk-profiles', formData)
      setProfiles(prev => [newProfile, ...prev])
      setSelectedProfile(newProfile)
      setCreateDialogOpen(false)
      setFormData(emptyProfile)
      toast({
        title: isRTL ? 'تم بنجاح' : 'Success',
        description: isRTL ? 'تم إنشاء ملف المخاطر بنجاح' : 'Risk profile created successfully',
      })
    } catch (error) {
      console.error('Error creating risk profile:', error)
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في إنشاء ملف المخاطر' : 'Failed to create risk profile',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Update profile
  const handleUpdate = async () => {
    if (!selectedProfile || !formData.name) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'يرجى إدخال اسم الملف' : 'Please enter a profile name',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const isConfigured =
        formData.maxDailyLoss !== undefined ||
        formData.maxWeeklyLoss !== undefined ||
        formData.maxMonthlyLoss !== undefined ||
        formData.maxDrawdown !== undefined ||
        formData.maxPositionSize !== undefined ||
        formData.maxRiskPerTrade !== undefined

      const updatedProfile = await apiPut<RiskProfile>(`/api/risk-profiles/${selectedProfile.id}`, {
        ...formData,
        isConfigured,
      })

      setProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p))
      setSelectedProfile(updatedProfile)
      setEditDialogOpen(false)
      toast({
        title: isRTL ? 'تم بنجاح' : 'Success',
        description: isRTL ? 'تم تحديث ملف المخاطر بنجاح' : 'Risk profile updated successfully',
      })
    } catch (error) {
      console.error('Error updating risk profile:', error)
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في تحديث ملف المخاطر' : 'Failed to update risk profile',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Delete profile
  const handleDelete = async () => {
    if (!selectedProfile) return

    setSaving(true)
    try {
      await apiDelete(`/api/risk-profiles/${selectedProfile.id}`)
      setProfiles(prev => prev.filter(p => p.id !== selectedProfile.id))
      const nextProfile = profiles.find(p => p.id !== selectedProfile.id)
      setSelectedProfile(nextProfile || null)
      setDeleteDialogOpen(false)
      toast({
        title: isRTL ? 'تم بنجاح' : 'Success',
        description: isRTL ? 'تم حذف ملف المخاطر بنجاح' : 'Risk profile deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting risk profile:', error)
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في حذف ملف المخاطر' : 'Failed to delete risk profile',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Mark alert as read
  const handleMarkAlertRead = async (alertId: string) => {
    try {
      await apiPut('/api/risk-alerts', { alertId, isRead: true })
      setAlerts(prev => prev.filter(a => a.id !== alertId))
    } catch (error) {
      console.error('Error marking alert as read:', error)
    }
  }

  // Open edit dialog
  const openEditDialog = () => {
    if (selectedProfile) {
      setFormData({
        name: selectedProfile.name,
        description: selectedProfile.description,
        riskTolerance: selectedProfile.riskTolerance,
        riskDegree: selectedProfile.riskDegree,
        maxDailyLoss: selectedProfile.maxDailyLoss,
        maxWeeklyLoss: selectedProfile.maxWeeklyLoss,
        maxMonthlyLoss: selectedProfile.maxMonthlyLoss,
        maxDrawdown: selectedProfile.maxDrawdown,
        maxPositionSize: selectedProfile.maxPositionSize,
        maxRiskPerTrade: selectedProfile.maxRiskPerTrade,
        maxCorrelatedTrades: selectedProfile.maxCorrelatedTrades,
        maxLeverage: selectedProfile.maxLeverage,
        stopLossRequired: selectedProfile.stopLossRequired,
        takeProfitRequired: selectedProfile.takeProfitRequired,
        riskRewardMin: selectedProfile.riskRewardMin,
      })
      setEditDialogOpen(true)
    }
  }

  // Calculator values
  const riskAmount = (accountSize * riskPercent) / 100
  const positionSize = stopLossPips > 0 ? riskAmount / stopLossPips : 0

  // Helper functions
  function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ')
  }

  const getToleranceLabel = (tolerance: string) => {
    switch (tolerance) {
      case 'conservative': return isRTL ? 'محافظ' : 'Conservative'
      case 'moderate': return isRTL ? 'متوسط' : 'Moderate'
      case 'aggressive': return isRTL ? 'مضارب' : 'Aggressive'
      default: return isRTL ? 'متوسط' : 'Moderate'
    }
  }

  const getToleranceColor = (tolerance: string) => {
    switch (tolerance) {
      case 'conservative': return 'bg-blue-500'
      case 'moderate': return 'bg-yellow-500'
      case 'aggressive': return 'bg-red-500'
      default: return 'bg-yellow-500'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10'
      case 'warning': return 'text-amber-500 bg-amber-500/10'
      default: return 'text-blue-500 bg-blue-500/10'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  // Calculate risk distribution for chart
  const riskDistributionData = Object.entries(riskBySymbol).map(([symbol, risk], index) => ({
    name: symbol,
    value: risk,
    color: COLORS[index % COLORS.length],
  }))

  // Calculate usage percentages
  const dailyUsagePercent = selectedProfile?.maxDailyLoss && riskUsage
    ? Math.min((riskUsage.dailyLoss / selectedProfile.maxDailyLoss) * 100, 100)
    : 0

  const weeklyUsagePercent = selectedProfile?.maxWeeklyLoss && riskUsage
    ? Math.min((riskUsage.weeklyLoss / selectedProfile.maxWeeklyLoss) * 100, 100)
    : 0

  const monthlyUsagePercent = selectedProfile?.maxMonthlyLoss && riskUsage
    ? Math.min((riskUsage.monthlyLoss / selectedProfile.maxMonthlyLoss) * 100, 100)
    : 0

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">
            {isRTL ? 'جاري تحميل ملفات المخاطر...' : 'Loading risk profiles...'}
          </p>
        </div>
      </div>
    )
  }

  // No profiles state
  if (profiles.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6" />
              {isRTL ? 'إدارة المخاطر' : 'Risk Management'}
            </h2>
            <p className="text-muted-foreground">
              {isRTL ? 'ملفات مخاطر مخصصة لكل حساب وأصل' : 'Custom risk profiles for each account and asset'}
            </p>
          </div>
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Shield className="h-20 w-20 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {isRTL ? 'لا توجد ملفات مخاطر' : 'No Risk Profiles'}
            </h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              {isRTL
                ? 'عند إضافة حساب أو أصل في المحفظة، يتم إنشاء ملف مخاطر فارغ تلقائياً. يمكنك أيضاً إنشاء ملف يدوياً.'
                : 'When you add an account or asset in Portfolio, an empty risk profile is created automatically. You can also create one manually.'
              }
            </p>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setFormData(emptyProfile)}>
                  <Plus className="h-4 w-4 ml-2" />
                  {isRTL ? 'إنشاء ملف مخاطر' : 'Create Risk Profile'}
                </Button>
              </DialogTrigger>
              {renderCreateDialog()}
            </Dialog>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            {isRTL ? 'إدارة المخاطر' : 'Risk Management'}
          </h2>
          <p className="text-muted-foreground">
            {isRTL
              ? `${profiles.length} ملف مخاطر · ${profiles.filter(p => p.isConfigured).length} مُعدّ`
              : `${profiles.length} profiles · ${profiles.filter(p => p.isConfigured).length} configured`
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Alerts Badge */}
          {alerts.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {alerts.length}
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{isRTL ? 'تنبيهات المخاطر' : 'Risk Alerts'}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[400px]">
                  <div className="space-y-2">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={cn('p-3 rounded-lg flex items-start gap-3', getSeverityColor(alert.severity))}
                      >
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{alert.title}</h4>
                          <p className="text-xs opacity-80">{alert.message}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleMarkAlertRead(alert.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          )}

          <Button variant="outline" size="icon" onClick={fetchProfiles} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setFormData(emptyProfile)}>
                <Plus className="h-4 w-4 ml-2" />
                {isRTL ? 'ملف جديد' : 'New Profile'}
              </Button>
            </DialogTrigger>
            {renderCreateDialog()}
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profiles List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-semibold">
            {isRTL ? 'ملفات المخاطر' : 'Risk Profiles'}
          </h3>
          <div className="space-y-2">
            {profiles.map((profile) => (
              <Card
                key={profile.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  selectedProfile?.id === profile.id && 'ring-2 ring-primary'
                )}
                onClick={() => setSelectedProfile(profile)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-white',
                        profile.accountType === 'account' ? 'bg-blue-500' : 'bg-green-500'
                      )}>
                        {profile.accountType === 'account' ? (
                          <Building2 className="h-5 w-5" />
                        ) : profile.accountType === 'asset' ? (
                          <Coins className="h-5 w-5" />
                        ) : (
                          <Shield className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{profile.name}</h4>
                          {profile.isConfigured ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        {profile.accountName && (
                          <p className="text-xs text-muted-foreground">
                            {profile.accountName}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className={getToleranceColor(profile.riskTolerance)}>
                      {getToleranceLabel(profile.riskTolerance)}
                    </Badge>
                  </div>
                  {!profile.isConfigured && (
                    <p className="text-xs text-amber-500 mt-2">
                      {isRTL ? 'لم يتم تحديد المعايير بعد' : 'Not configured yet'}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          {selectedProfile ? (
            <Tabs defaultValue="dashboard" className="space-y-4">
              <TabsList>
                <TabsTrigger value="dashboard">
                  {isRTL ? 'لوحة المخاطر' : 'Dashboard'}
                </TabsTrigger>
                <TabsTrigger value="limits">
                  {isRTL ? 'الحدود' : 'Limits'}
                </TabsTrigger>
                <TabsTrigger value="calculator">
                  {isRTL ? 'الحاسبة' : 'Calculator'}
                </TabsTrigger>
              </TabsList>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="space-y-4">
                {/* Risk Usage Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      {isRTL ? 'نظرة عامة على المخاطر' : 'Risk Overview'}
                    </CardTitle>
                    <CardDescription>
                      {isRTL ? 'المخاطر المستخدمة مقارنة بالحدود المحددة' : 'Risk used vs defined limits'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedProfile.isConfigured ? (
                      <div className="grid gap-6 md:grid-cols-3">
                        {/* Daily Usage */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              {isRTL ? 'الخسارة اليومية' : 'Daily Loss'}
                            </span>
                            <span className={cn(
                              'text-sm font-medium',
                              dailyUsagePercent > 80 ? 'text-red-500' : dailyUsagePercent > 50 ? 'text-amber-500' : 'text-green-500'
                            )}>
                              {riskUsage?.dailyLoss.toFixed(2) || '0'} / ${selectedProfile.maxDailyLoss || 0}
                            </span>
                          </div>
                          <Progress value={dailyUsagePercent} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {dailyUsagePercent.toFixed(1)}% {isRTL ? 'مستخدم' : 'used'}
                          </p>
                        </div>

                        {/* Weekly Usage */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              {isRTL ? 'الخسارة الأسبوعية' : 'Weekly Loss'}
                            </span>
                            <span className={cn(
                              'text-sm font-medium',
                              weeklyUsagePercent > 80 ? 'text-red-500' : weeklyUsagePercent > 50 ? 'text-amber-500' : 'text-green-500'
                            )}>
                              ${riskUsage?.weeklyLoss.toFixed(2) || '0'} / ${selectedProfile.maxWeeklyLoss || 0}
                            </span>
                          </div>
                          <Progress value={weeklyUsagePercent} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {weeklyUsagePercent.toFixed(1)}% {isRTL ? 'مستخدم' : 'used'}
                          </p>
                        </div>

                        {/* Monthly Usage */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              {isRTL ? 'الخسارة الشهرية' : 'Monthly Loss'}
                            </span>
                            <span className={cn(
                              'text-sm font-medium',
                              monthlyUsagePercent > 80 ? 'text-red-500' : monthlyUsagePercent > 50 ? 'text-amber-500' : 'text-green-500'
                            )}>
                              ${riskUsage?.monthlyLoss.toFixed(2) || '0'} / ${selectedProfile.maxMonthlyLoss || 0}
                            </span>
                          </div>
                          <Progress value={monthlyUsagePercent} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {monthlyUsagePercent.toFixed(1)}% {isRTL ? 'مستخدم' : 'used'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-amber-500/10 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <div>
                          <p className="font-medium text-amber-500">
                            {isRTL ? 'لم يتم تحديد معايير المخاطر' : 'Risk criteria not set'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {isRTL ? 'اضغط على علامة التبويب "الحدود" لتحديد معايير المخاطر' : 'Go to "Limits" tab to set risk criteria'}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Risk Distribution & Stats */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Risk by Symbol */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <PieChart className="h-5 w-5" />
                        {isRTL ? 'توزيع المخاطر' : 'Risk Distribution'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {riskDistributionData.length > 0 ? (
                        <div className="h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={riskDistributionData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {riskDistributionData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'oklch(0.17 0.025 250)',
                                  border: '1px solid oklch(0.3 0.03 250)',
                                  borderRadius: '8px',
                                }}
                                formatter={(value: number) => [`$${value.toFixed(2)}`, isRTL ? 'المخاطرة' : 'Risk']}
                              />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                          {isRTL ? 'لا توجد صفقات مفتوحة' : 'No open trades'}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        {isRTL ? 'إحصائيات سريعة' : 'Quick Stats'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <span className="text-muted-foreground">{isRTL ? 'الصفقات المفتوحة' : 'Open Trades'}</span>
                          <span className="font-bold text-lg">{riskUsage?.openTrades || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <span className="text-muted-foreground">{isRTL ? 'صفقات اليوم' : 'Today\'s Trades'}</span>
                          <span className="font-bold text-lg">{riskUsage?.dailyTrades || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <span className="text-muted-foreground">{isRTL ? 'إجمالي التعرض' : 'Total Exposure'}</span>
                          <span className="font-bold text-lg">${riskUsage?.totalExposure.toFixed(2) || '0'}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                          <span className="text-muted-foreground">{isRTL ? 'درجة المخاطر' : 'Risk Degree'}</span>
                          <div className="flex items-center gap-2">
                            <Slider value={[selectedProfile.riskDegree]} min={1} max={10} className="w-20" disabled />
                            <span className="font-bold">{selectedProfile.riskDegree}/10</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Limits Tab */}
              <TabsContent value="limits" className="space-y-4">
                {/* Profile Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-12 h-12 rounded-full flex items-center justify-center text-white',
                          selectedProfile.accountType === 'account' ? 'bg-blue-500' : 'bg-green-500'
                        )}>
                          {selectedProfile.accountType === 'account' ? (
                            <Building2 className="h-6 w-6" />
                          ) : selectedProfile.accountType === 'asset' ? (
                            <Coins className="h-6 w-6" />
                          ) : (
                            <Shield className="h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <CardTitle>{selectedProfile.name}</CardTitle>
                          <CardDescription>
                            {selectedProfile.accountName || (isRTL ? 'ملف مخاطر عام' : 'General risk profile')}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getToleranceColor(selectedProfile.riskTolerance)}>
                          {getToleranceLabel(selectedProfile.riskTolerance)}
                        </Badge>
                        <Button variant="outline" size="icon" onClick={openEditDialog}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="text-destructive" onClick={() => setDeleteDialogOpen(true)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Not Configured Warning */}
                {!selectedProfile.isConfigured && (
                  <Card className="border-amber-500/50 bg-amber-500/5">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-amber-500">
                            {isRTL ? 'لم يتم تحديد المعايير' : 'Profile Not Configured'}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {isRTL
                              ? 'اضغط على زر التعديل لتحديد حدود المخاطر المخصصة لهذا الحساب/الأصل'
                              : 'Click the edit button to set custom risk limits for this account/asset'
                            }
                          </p>
                          <Button variant="outline" size="sm" className="mt-3" onClick={openEditDialog}>
                            <Edit className="h-4 w-4 ml-2" />
                            {isRTL ? 'تحديد المعايير' : 'Configure Now'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Risk Limits */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {isRTL ? 'حدود المخاطر' : 'Risk Limits'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">
                          {isRTL ? 'أقصى خسارة يومية' : 'Max Daily Loss'}
                        </Label>
                        <div className="text-xl font-bold">
                          {selectedProfile.maxDailyLoss
                            ? `$${selectedProfile.maxDailyLoss.toLocaleString()}`
                            : (isRTL ? 'غير محدد' : 'Not set')
                          }
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">
                          {isRTL ? 'أقصى خسارة أسبوعية' : 'Max Weekly Loss'}
                        </Label>
                        <div className="text-xl font-bold">
                          {selectedProfile.maxWeeklyLoss
                            ? `$${selectedProfile.maxWeeklyLoss.toLocaleString()}`
                            : (isRTL ? 'غير محدد' : 'Not set')
                          }
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">
                          {isRTL ? 'أقصى خسارة شهرية' : 'Max Monthly Loss'}
                        </Label>
                        <div className="text-xl font-bold">
                          {selectedProfile.maxMonthlyLoss
                            ? `$${selectedProfile.maxMonthlyLoss.toLocaleString()}`
                            : (isRTL ? 'غير محدد' : 'Not set')
                          }
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">
                          {isRTL ? 'أقصى تراجع' : 'Max Drawdown'}
                        </Label>
                        <div className="text-xl font-bold">
                          {selectedProfile.maxDrawdown
                            ? `${selectedProfile.maxDrawdown}%`
                            : (isRTL ? 'غير محدد' : 'Not set')
                          }
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">
                          {isRTL ? 'حجم المركز الأقصى' : 'Max Position Size'}
                        </Label>
                        <div className="text-xl font-bold">
                          {selectedProfile.maxPositionSize
                            ? `${selectedProfile.maxPositionSize}%`
                            : (isRTL ? 'غير محدد' : 'Not set')
                          }
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">
                          {isRTL ? 'المخاطرة/الصفقة' : 'Risk Per Trade'}
                        </Label>
                        <div className="text-xl font-bold">
                          {selectedProfile.maxRiskPerTrade
                            ? `${selectedProfile.maxRiskPerTrade}%`
                            : (isRTL ? 'غير محدد' : 'Not set')
                          }
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Requirements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {isRTL ? 'المتطلبات' : 'Requirements'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span>{isRTL ? 'وقف الخسارة إلزامي' : 'Stop Loss Required'}</span>
                        <Switch checked={selectedProfile.stopLossRequired} disabled />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span>{isRTL ? 'جني الأرباح إلزامي' : 'Take Profit Required'}</span>
                        <Switch checked={selectedProfile.takeProfitRequired} disabled />
                      </div>
                      {selectedProfile.riskRewardMin && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 md:col-span-2">
                          <span>{isRTL ? 'الحد الأدنى للمخاطرة/العائد' : 'Min Risk/Reward Ratio'}</span>
                          <Badge variant="outline">{selectedProfile.riskRewardMin}:1</Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Calculator Tab */}
              <TabsContent value="calculator" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      {isRTL ? 'حاسبة حجم المركز' : 'Position Size Calculator'}
                    </CardTitle>
                    <CardDescription>
                      {isRTL ? 'احسب الحجم المناسب للصفقة بناءً على معايير المخاطر' : 'Calculate appropriate position size based on risk criteria'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="grid gap-2">
                          <Label>{isRTL ? 'حجم الحساب ($)' : 'Account Size ($)'}</Label>
                          <Input
                            type="number"
                            value={accountSize}
                            onChange={(e) => setAccountSize(Number(e.target.value))}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>{isRTL ? 'نسبة المخاطرة (%)' : 'Risk %'}</Label>
                          <Input
                            type="number"
                            value={riskPercent}
                            onChange={(e) => setRiskPercent(Number(e.target.value))}
                          />
                          {selectedProfile.maxRiskPerTrade && (
                            <p className="text-xs text-muted-foreground">
                              {isRTL ? `الحد الأقصى: ${selectedProfile.maxRiskPerTrade}%` : `Max allowed: ${selectedProfile.maxRiskPerTrade}%`}
                            </p>
                          )}
                        </div>
                        <div className="grid gap-2">
                          <Label>{isRTL ? 'وقف الخسارة (نقاط)' : 'Stop Loss (pips)'}</Label>
                          <Input
                            type="number"
                            value={stopLossPips}
                            onChange={(e) => setStopLossPips(Number(e.target.value))}
                          />
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2 bg-muted/50 p-4 rounded-lg">
                        <div>
                          <Label className="text-muted-foreground">
                            {isRTL ? 'مبلغ المخاطرة' : 'Risk Amount'}
                          </Label>
                          <div className="text-2xl font-bold">${riskAmount.toFixed(2)}</div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">
                            {isRTL ? 'حجم المركز' : 'Position Size'}
                          </Label>
                          <div className="text-2xl font-bold">{positionSize.toFixed(2)} {isRTL ? 'لوت' : 'lots'}</div>
                        </div>
                      </div>
                      {selectedProfile.maxRiskPerTrade && riskPercent > selectedProfile.maxRiskPerTrade && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded-lg text-red-500">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm">
                            {isRTL
                              ? `تحذير: نسبة المخاطرة تتجاوز الحد المسموح (${selectedProfile.maxRiskPerTrade}%)`
                              : `Warning: Risk % exceeds your limit (${selectedProfile.maxRiskPerTrade}%)`
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="flex items-center justify-center min-h-[400px]">
              <CardContent className="text-center">
                <Shield className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {isRTL ? 'اختر ملف مخاطر للعرض' : 'Select a risk profile to view'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isRTL ? 'تعديل ملف المخاطر' : 'Edit Risk Profile'}
            </DialogTitle>
            <DialogDescription>
              {isRTL
                ? 'حدد معايير المخاطر المخصصة. جميع الحقول اختيارية.'
                : 'Set custom risk parameters. All fields are optional.'
              }
            </DialogDescription>
          </DialogHeader>
          {renderProfileForm(true)}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isRTL ? 'تأكيد الحذف' : 'Confirm Delete'}</DialogTitle>
            <DialogDescription>
              {isRTL
                ? `هل أنت متأكد من حذف ملف المخاطر "${selectedProfile?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`
                : `Are you sure you want to delete "${selectedProfile?.name}"? This action cannot be undone.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              {isRTL ? 'حذف' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

  // Render create dialog
  function renderCreateDialog() {
    return (
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isRTL ? 'إنشاء ملف مخاطر جديد' : 'Create New Risk Profile'}
          </DialogTitle>
          <DialogDescription>
            {isRTL
              ? 'أنشئ ملف مخاطر فارغ وحدد المعايير لاحقاً'
              : 'Create an empty risk profile and configure it later'
            }
          </DialogDescription>
        </DialogHeader>
        {renderProfileForm(false)}
      </DialogContent>
    )
  }

  // Render profile form
  function renderProfileForm(isEdit: boolean) {
    return (
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label>{isRTL ? 'اسم الملف *' : 'Profile Name *'}</Label>
          <Input
            value={formData.name || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder={isRTL ? 'مثال: ملف مخاطر Binance' : 'e.g., Binance Risk Profile'}
          />
        </div>

        <div className="grid gap-2">
          <Label>{isRTL ? 'الوصف' : 'Description'}</Label>
          <Input
            value={formData.description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder={isRTL ? 'وصف اختياري' : 'Optional description'}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>{isRTL ? 'نوع المخاطرة' : 'Risk Tolerance'}</Label>
            <Select
              value={formData.riskTolerance || 'moderate'}
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                riskTolerance: value as 'conservative' | 'moderate' | 'aggressive'
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">{isRTL ? 'محافظ' : 'Conservative'}</SelectItem>
                <SelectItem value="moderate">{isRTL ? 'متوسط' : 'Moderate'}</SelectItem>
                <SelectItem value="aggressive">{isRTL ? 'مضارب' : 'Aggressive'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>{isRTL ? 'درجة المخاطر (1-10)' : 'Risk Degree (1-10)'}</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[formData.riskDegree || 5]}
                min={1}
                max={10}
                step={1}
                className="flex-1"
                onValueChange={(v) => setFormData(prev => ({ ...prev, riskDegree: v[0] }))}
              />
              <span className="w-8 text-center font-bold">{formData.riskDegree || 5}</span>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold mb-4">
            {isRTL ? 'حدود المخاطر (اختياري)' : 'Risk Limits (Optional)'}
          </h4>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>{isRTL ? 'أقصى خسارة يومية ($)' : 'Max Daily Loss ($)'}</Label>
              <Input
                type="number"
                value={formData.maxDailyLoss || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  maxDailyLoss: e.target.value ? Number(e.target.value) : undefined
                }))}
                placeholder={isRTL ? 'مثال: 500' : 'e.g., 500'}
              />
            </div>
            <div className="grid gap-2">
              <Label>{isRTL ? 'أقصى خسارة أسبوعية ($)' : 'Max Weekly Loss ($)'}</Label>
              <Input
                type="number"
                value={formData.maxWeeklyLoss || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  maxWeeklyLoss: e.target.value ? Number(e.target.value) : undefined
                }))}
                placeholder={isRTL ? 'مثال: 1000' : 'e.g., 1000'}
              />
            </div>
            <div className="grid gap-2">
              <Label>{isRTL ? 'أقصى خسارة شهرية ($)' : 'Max Monthly Loss ($)'}</Label>
              <Input
                type="number"
                value={formData.maxMonthlyLoss || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  maxMonthlyLoss: e.target.value ? Number(e.target.value) : undefined
                }))}
                placeholder={isRTL ? 'مثال: 3000' : 'e.g., 3000'}
              />
            </div>
            <div className="grid gap-2">
              <Label>{isRTL ? 'أقصى تراجع (%)' : 'Max Drawdown (%)'}</Label>
              <Input
                type="number"
                value={formData.maxDrawdown || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  maxDrawdown: e.target.value ? Number(e.target.value) : undefined
                }))}
                placeholder={isRTL ? 'مثال: 20' : 'e.g., 20'}
              />
            </div>
            <div className="grid gap-2">
              <Label>{isRTL ? 'حجم المركز الأقصى (%)' : 'Max Position Size (%)'}</Label>
              <Input
                type="number"
                step="0.5"
                value={formData.maxPositionSize || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  maxPositionSize: e.target.value ? Number(e.target.value) : undefined
                }))}
                placeholder={isRTL ? 'مثال: 2' : 'e.g., 2'}
              />
            </div>
            <div className="grid gap-2">
              <Label>{isRTL ? 'المخاطرة/الصفقة (%)' : 'Risk Per Trade (%)'}</Label>
              <Input
                type="number"
                step="0.25"
                value={formData.maxRiskPerTrade || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  maxRiskPerTrade: e.target.value ? Number(e.target.value) : undefined
                }))}
                placeholder={isRTL ? 'مثال: 1' : 'e.g., 1'}
              />
            </div>
            <div className="grid gap-2">
              <Label>{isRTL ? 'الحد الأدنى للمخاطرة/العائد' : 'Min Risk/Reward'}</Label>
              <Input
                type="number"
                step="0.5"
                value={formData.riskRewardMin || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  riskRewardMin: e.target.value ? Number(e.target.value) : undefined
                }))}
                placeholder={isRTL ? 'مثال: 1.5' : 'e.g., 1.5'}
              />
            </div>
            <div className="grid gap-2">
              <Label>{isRTL ? 'أقصى رافعة مالية' : 'Max Leverage'}</Label>
              <Input
                type="number"
                value={formData.maxLeverage || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  maxLeverage: e.target.value ? Number(e.target.value) : undefined
                }))}
                placeholder={isRTL ? 'مثال: 10' : 'e.g., 10'}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold mb-4">
            {isRTL ? 'المتطلبات الإلزامية' : 'Mandatory Requirements'}
          </h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <Label>{isRTL ? 'وقف الخسارة إلزامي' : 'Stop Loss Required'}</Label>
              <Switch
                checked={formData.stopLossRequired || false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, stopLossRequired: checked }))}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <Label>{isRTL ? 'جني الأرباح إلزامي' : 'Take Profit Required'}</Label>
              <Switch
                checked={formData.takeProfitRequired || false}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, takeProfitRequired: checked }))}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => isEdit ? setEditDialogOpen(false) : setCreateDialogOpen(false)}
          >
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={isEdit ? handleUpdate : handleCreate} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
            {isEdit
              ? (isRTL ? 'حفظ التغييرات' : 'Save Changes')
              : (isRTL ? 'إنشاء' : 'Create')
            }
          </Button>
        </DialogFooter>
      </div>
    )
  }
}
