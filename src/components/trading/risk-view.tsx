'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useI18n } from '@/lib/i18n'
import { 
  Plus, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Edit2,
  Trash2,
  Link2,
  Settings,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Account {
  id: string
  name: string
  broker?: string
  accountNumber?: string
  type: string
  balance: number
  currency: string
}

interface RiskProfile {
  id: string
  name: string
  description?: string
  accountId?: string
  accountName?: string
  accountType?: string
  riskTolerance: string
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
}

interface RiskUsage {
  dailyLoss: number
  dailyRiskUsed: number
  weeklyLoss: number
  weeklyRiskUsed: number
  monthlyLoss: number
  monthlyRiskUsed: number
}

export function RiskView() {
  const { t, language } = useI18n()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProfile, setEditingProfile] = useState<RiskProfile | null>(null)
  const [profiles, setProfiles] = useState<RiskProfile[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [profileToDelete, setProfileToDelete] = useState<RiskProfile | null>(null)
  const [expandedProfile, setExpandedProfile] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    accountId: '',
    accountName: '',
    accountType: 'account',
    riskTolerance: 'moderate',
    riskDegree: 5,
    maxDailyLoss: '',
    maxWeeklyLoss: '',
    maxMonthlyLoss: '',
    maxDrawdown: '',
    maxPositionSize: '',
    maxRiskPerTrade: '',
    maxCorrelatedTrades: '',
    maxLeverage: '',
    stopLossRequired: false,
    takeProfitRequired: false,
    riskRewardMin: '',
  })

  const isRTL = language === 'ar'

  // Fetch profiles and accounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profilesRes, accountsRes] = await Promise.all([
          fetch('/api/risk-profiles'),
          fetch('/api/accounts')
        ])
        
        if (profilesRes.ok) {
          const profilesData = await profilesRes.json()
          setProfiles(profilesData)
        }
        
        if (accountsRes.ok) {
          const accountsData = await accountsRes.json()
          setAccounts(accountsData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      accountId: '',
      accountName: '',
      accountType: 'account',
      riskTolerance: 'moderate',
      riskDegree: 5,
      maxDailyLoss: '',
      maxWeeklyLoss: '',
      maxMonthlyLoss: '',
      maxDrawdown: '',
      maxPositionSize: '',
      maxRiskPerTrade: '',
      maxCorrelatedTrades: '',
      maxLeverage: '',
      stopLossRequired: false,
      takeProfitRequired: false,
      riskRewardMin: '',
    })
    setEditingProfile(null)
  }

  const handleCreateProfile = async () => {
    try {
      const selectedAccount = accounts.find(a => a.id === formData.accountId)
      
      const profileData = {
        name: formData.name,
        description: formData.description,
        accountId: formData.accountId || null,
        accountName: selectedAccount?.name || null,
        accountType: formData.accountType,
        riskTolerance: formData.riskTolerance,
        riskDegree: formData.riskDegree,
        maxDailyLoss: formData.maxDailyLoss ? parseFloat(formData.maxDailyLoss) : null,
        maxWeeklyLoss: formData.maxWeeklyLoss ? parseFloat(formData.maxWeeklyLoss) : null,
        maxMonthlyLoss: formData.maxMonthlyLoss ? parseFloat(formData.maxMonthlyLoss) : null,
        maxDrawdown: formData.maxDrawdown ? parseFloat(formData.maxDrawdown) : null,
        maxPositionSize: formData.maxPositionSize ? parseFloat(formData.maxPositionSize) : null,
        maxRiskPerTrade: formData.maxRiskPerTrade ? parseFloat(formData.maxRiskPerTrade) : null,
        maxCorrelatedTrades: formData.maxCorrelatedTrades ? parseInt(formData.maxCorrelatedTrades) : null,
        maxLeverage: formData.maxLeverage ? parseFloat(formData.maxLeverage) : null,
        stopLossRequired: formData.stopLossRequired,
        takeProfitRequired: formData.takeProfitRequired,
        riskRewardMin: formData.riskRewardMin ? parseFloat(formData.riskRewardMin) : null,
        isConfigured: true,
      }

      let response
      if (editingProfile) {
        response = await fetch(`/api/risk-profiles/${editingProfile.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileData)
        })
      } else {
        response = await fetch('/api/risk-profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileData)
        })
      }

      if (response.ok) {
        const savedProfile = await response.json()
        if (editingProfile) {
          setProfiles(profiles.map(p => p.id === savedProfile.id ? savedProfile : p))
        } else {
          setProfiles([savedProfile, ...profiles])
        }
        setShowAddForm(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  const handleEditProfile = (profile: RiskProfile) => {
    setEditingProfile(profile)
    setFormData({
      name: profile.name,
      description: profile.description || '',
      accountId: profile.accountId || '',
      accountName: profile.accountName || '',
      accountType: profile.accountType || 'account',
      riskTolerance: profile.riskTolerance,
      riskDegree: profile.riskDegree,
      maxDailyLoss: profile.maxDailyLoss?.toString() || '',
      maxWeeklyLoss: profile.maxWeeklyLoss?.toString() || '',
      maxMonthlyLoss: profile.maxMonthlyLoss?.toString() || '',
      maxDrawdown: profile.maxDrawdown?.toString() || '',
      maxPositionSize: profile.maxPositionSize?.toString() || '',
      maxRiskPerTrade: profile.maxRiskPerTrade?.toString() || '',
      maxCorrelatedTrades: profile.maxCorrelatedTrades?.toString() || '',
      maxLeverage: profile.maxLeverage?.toString() || '',
      stopLossRequired: profile.stopLossRequired,
      takeProfitRequired: profile.takeProfitRequired,
      riskRewardMin: profile.riskRewardMin?.toString() || '',
    })
    setShowAddForm(true)
  }

  const handleDeleteProfile = async () => {
    if (!profileToDelete) return
    
    try {
      const response = await fetch(`/api/risk-profiles/${profileToDelete.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setProfiles(profiles.filter(p => p.id !== profileToDelete.id))
        setDeleteDialogOpen(false)
        setProfileToDelete(null)
      }
    } catch (error) {
      console.error('Error deleting profile:', error)
    }
  }

  const getRiskToleranceColor = (tolerance: string) => {
    switch (tolerance) {
      case 'conservative': return 'bg-green-500'
      case 'moderate': return 'bg-yellow-500'
      case 'aggressive': return 'bg-red-500'
      default: return 'bg-blue-500'
    }
  }

  const getRiskToleranceLabel = (tolerance: string) => {
    switch (tolerance) {
      case 'conservative': return t('risk.conservative')
      case 'moderate': return t('risk.moderate')
      case 'aggressive': return t('risk.aggressive')
      default: return tolerance
    }
  }

  const getRiskDegreeColor = (degree: number) => {
    if (degree <= 3) return 'text-green-500'
    if (degree <= 6) return 'text-yellow-500'
    return 'text-red-500'
  }

  // Calculate total risk usage across all profiles
  const totalRiskUsage = {
    daily: profiles.reduce((sum, p) => sum + (p.maxDailyLoss || 0), 0),
    weekly: profiles.reduce((sum, p) => sum + (p.maxWeeklyLoss || 0), 0),
    monthly: profiles.reduce((sum, p) => sum + (p.maxMonthlyLoss || 0), 0),
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-500" />
            {t('risk.title')}
          </h2>
          <p className="text-muted-foreground mt-1">
            {t('risk.subtitle')}
          </p>
        </div>
        <Button 
          onClick={() => {
            resetForm()
            setShowAddForm(true)
          }} 
          className="bg-gradient-to-r from-blue-500 to-cyan-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('risk.newProfile')}
        </Button>
      </div>

      {/* Risk Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('risk.dailyRisk')}
                </p>
                <p className="text-2xl font-bold">${totalRiskUsage.daily.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <Progress value={0} className="mt-4 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {profiles.length} {language === 'ar' ? 'ملف مخاطر نشط' : 'active risk profiles'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('risk.weeklyRisk')}
                </p>
                <p className="text-2xl font-bold">${totalRiskUsage.weekly.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
            <Progress value={0} className="mt-4 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {language === 'ar' ? 'الحد الأقصى المحدد' : 'Maximum limit set'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('risk.monthlyRisk')}
                </p>
                <p className="text-2xl font-bold">${totalRiskUsage.monthly.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <Progress value={0} className="mt-4 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {language === 'ar' ? 'إجمالي الحدود' : 'Total limits'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Risk Profile Form */}
      {showAddForm && (
        <Card className="border-2 border-blue-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-500" />
                  {editingProfile ? t('risk.editProfile') : t('risk.createProfile')}
                </CardTitle>
                <CardDescription>
                  {language === 'ar' 
                    ? 'حدد معايير المخاطر لحسابك أو أصل معين' 
                    : 'Define risk parameters for your account or specific asset'}
                </CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setShowAddForm(false)
                  resetForm()
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="basic">{t('risk.basicSettings')}</TabsTrigger>
                <TabsTrigger value="limits">{t('risk.lossLimits')}</TabsTrigger>
                <TabsTrigger value="position">{t('risk.positionSettings')}</TabsTrigger>
                <TabsTrigger value="requirements">{t('risk.requirements')}</TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[400px] pr-4">
                {/* Basic Settings Tab */}
                <TabsContent value="basic" className="space-y-4 mt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('risk.profileName')} *</Label>
                      <Input 
                        placeholder={language === 'ar' ? 'مثال: حساب رئيسي' : 'e.g., Main Account'} 
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('risk.accountOrAsset')}</Label>
                      <Select 
                        value={formData.accountId} 
                        onValueChange={(value) => {
                          const account = accounts.find(a => a.id === value)
                          setFormData({ 
                            ...formData, 
                            accountId: value === 'none' ? '' : value,
                            accountName: account?.name || ''
                          })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('risk.selectAccountPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            <span className="text-muted-foreground">
                              {t('risk.noAccountSelected')}
                            </span>
                          </SelectItem>
                          {accounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              <div className="flex items-center gap-2">
                                <Link2 className="h-3 w-3" />
                                {account.name}
                                <span className="text-xs text-muted-foreground">
                                  ({account.broker || account.type})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('risk.profileDescription')}</Label>
                    <Input 
                      placeholder={language === 'ar' ? 'وصف ملف المخاطر...' : 'Risk profile description...'} 
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('risk.accountType')}</Label>
                      <Select 
                        value={formData.accountType} 
                        onValueChange={(value) => setFormData({ ...formData, accountType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="account">{t('risk.account')}</SelectItem>
                          <SelectItem value="asset">{t('risk.asset')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('risk.riskTolerance')}</Label>
                      <Select 
                        value={formData.riskTolerance} 
                        onValueChange={(value) => setFormData({ ...formData, riskTolerance: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conservative">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-500" />
                              {t('risk.conservative')}
                            </div>
                          </SelectItem>
                          <SelectItem value="moderate">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-yellow-500" />
                              {t('risk.moderate')}
                            </div>
                          </SelectItem>
                          <SelectItem value="aggressive">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-red-500" />
                              {t('risk.aggressive')}
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>{t('risk.riskDegree')}: {formData.riskDegree}</Label>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-green-500">1</span>
                      <Slider
                        value={[formData.riskDegree]}
                        onValueChange={(value) => setFormData({ ...formData, riskDegree: value[0] })}
                        max={10}
                        min={1}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-sm text-red-500">10</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{t('risk.conservative')}</span>
                      <span>{t('risk.moderate')}</span>
                      <span>{t('risk.aggressive')}</span>
                    </div>
                  </div>
                </TabsContent>

                {/* Loss Limits Tab */}
                <TabsContent value="limits" className="space-y-4 mt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>{t('risk.maxDailyLoss')}</Label>
                      <Input 
                        type="number" 
                        placeholder="500"
                        value={formData.maxDailyLoss}
                        onChange={(e) => setFormData({ ...formData, maxDailyLoss: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('risk.maxWeeklyLoss')}</Label>
                      <Input 
                        type="number" 
                        placeholder="1000"
                        value={formData.maxWeeklyLoss}
                        onChange={(e) => setFormData({ ...formData, maxWeeklyLoss: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('risk.maxMonthlyLoss')}</Label>
                      <Input 
                        type="number" 
                        placeholder="2000"
                        value={formData.maxMonthlyLoss}
                        onChange={(e) => setFormData({ ...formData, maxMonthlyLoss: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('risk.maxDrawdown')}</Label>
                      <Input 
                        type="number" 
                        placeholder="10"
                        value={formData.maxDrawdown}
                        onChange={(e) => setFormData({ ...formData, maxDrawdown: e.target.value })}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Position Settings Tab */}
                <TabsContent value="position" className="space-y-4 mt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('risk.maxPositionSize')}</Label>
                      <Input 
                        type="number" 
                        placeholder="1.0"
                        value={formData.maxPositionSize}
                        onChange={(e) => setFormData({ ...formData, maxPositionSize: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('risk.maxRiskPerTrade')}</Label>
                      <Input 
                        type="number" 
                        placeholder="2"
                        value={formData.maxRiskPerTrade}
                        onChange={(e) => setFormData({ ...formData, maxRiskPerTrade: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('risk.maxCorrelatedTrades')}</Label>
                      <Input 
                        type="number" 
                        placeholder="3"
                        value={formData.maxCorrelatedTrades}
                        onChange={(e) => setFormData({ ...formData, maxCorrelatedTrades: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('risk.maxLeverage')}</Label>
                      <Input 
                        type="number" 
                        placeholder="100"
                        value={formData.maxLeverage}
                        onChange={(e) => setFormData({ ...formData, maxLeverage: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('risk.riskRewardMin')}</Label>
                    <Input 
                      type="number" 
                      placeholder="1:2"
                      step="0.1"
                      value={formData.riskRewardMin}
                      onChange={(e) => setFormData({ ...formData, riskRewardMin: e.target.value })}
                    />
                  </div>
                </TabsContent>

                {/* Requirements Tab */}
                <TabsContent value="requirements" className="space-y-4 mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">{t('risk.stopLossRequired')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' 
                            ? 'يجب وضع أمر وقف الخسارة لكل صفقة'
                            : 'Require stop loss for every trade'}
                        </p>
                      </div>
                      <Switch
                        checked={formData.stopLossRequired}
                        onCheckedChange={(checked) => setFormData({ ...formData, stopLossRequired: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label className="text-base">{t('risk.takeProfitRequired')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' 
                            ? 'يجب وضع أمر جني الأرباح لكل صفقة'
                            : 'Require take profit for every trade'}
                        </p>
                      </div>
                      <Switch
                        checked={formData.takeProfitRequired}
                        onCheckedChange={(checked) => setFormData({ ...formData, takeProfitRequired: checked })}
                      />
                    </div>
                  </div>
                </TabsContent>
              </ScrollArea>

              <div className="flex gap-2 mt-6 pt-4 border-t">
                <Button 
                  onClick={handleCreateProfile}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600"
                  disabled={!formData.name}
                >
                  {editingProfile ? t('risk.update') : t('risk.create')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddForm(false)
                    resetForm()
                  }}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Risk Profiles List */}
      {profiles.length > 0 ? (
        <div className="space-y-4">
          {profiles.map((profile) => (
            <Card key={profile.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full ${getRiskToleranceColor(profile.riskTolerance)}/20 flex items-center justify-center`}>
                      <Shield className={`h-5 w-5 ${getRiskToleranceColor(profile.riskTolerance).replace('bg-', 'text-')}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{profile.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        {profile.accountName ? (
                          <>
                            <Link2 className="h-3 w-3" />
                            {t('risk.linkedTo')}: {profile.accountName}
                          </>
                        ) : (
                          <span className="text-muted-foreground">
                            {t('risk.unlinkedProfile')}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={profile.isConfigured ? "default" : "secondary"}>
                      {profile.isConfigured ? t('risk.configured') : t('risk.notConfigured')}
                    </Badge>
                    <Badge variant="outline" className={getRiskDegreeColor(profile.riskDegree)}>
                      {t('risk.riskDegree')}: {profile.riskDegree}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getRiskToleranceColor(profile.riskTolerance)} text-white`}>
                      {getRiskToleranceLabel(profile.riskTolerance)}
                    </Badge>
                    {profile.accountType && (
                      <Badge variant="outline">
                        {profile.accountType === 'account' ? t('risk.account') : t('risk.asset')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setExpandedProfile(expandedProfile === profile.id ? null : profile.id)}
                    >
                      {expandedProfile === profile.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditProfile(profile)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        setProfileToDelete(profile)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedProfile === profile.id && (
                  <div className="border-t pt-4 mt-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {/* Loss Limits */}
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">{t('risk.maxDailyLoss')}</p>
                        <p className="font-semibold">${profile.maxDailyLoss?.toLocaleString() || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">{t('risk.maxWeeklyLoss')}</p>
                        <p className="font-semibold">${profile.maxWeeklyLoss?.toLocaleString() || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">{t('risk.maxMonthlyLoss')}</p>
                        <p className="font-semibold">${profile.maxMonthlyLoss?.toLocaleString() || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">{t('risk.maxDrawdown')}</p>
                        <p className="font-semibold">{profile.maxDrawdown ? `${profile.maxDrawdown}%` : '-'}</p>
                      </div>

                      <Separator className="col-span-full my-2" />

                      {/* Position Settings */}
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">{t('risk.maxPositionSize')}</p>
                        <p className="font-semibold">{profile.maxPositionSize || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">{t('risk.maxRiskPerTrade')}</p>
                        <p className="font-semibold">{profile.maxRiskPerTrade ? `${profile.maxRiskPerTrade}%` : '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">{t('risk.maxCorrelatedTrades')}</p>
                        <p className="font-semibold">{profile.maxCorrelatedTrades || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">{t('risk.maxLeverage')}</p>
                        <p className="font-semibold">{profile.maxLeverage ? `1:${profile.maxLeverage}` : '-'}</p>
                      </div>

                      <Separator className="col-span-full my-2" />

                      {/* Requirements */}
                      <div className="col-span-full flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {profile.stopLossRequired ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm">{t('risk.stopLossRequired')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {profile.takeProfitRequired ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm">{t('risk.takeProfitRequired')}</span>
                        </div>
                        {profile.riskRewardMin && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">R:R ≥ 1:{profile.riskRewardMin}</Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick View */}
                {expandedProfile !== profile.id && (
                  <div className="flex flex-wrap gap-2">
                    {profile.maxDailyLoss && (
                      <Badge variant="secondary" className="text-xs">
                        {language === 'ar' ? 'يومي' : 'Daily'}: ${profile.maxDailyLoss}
                      </Badge>
                    )}
                    {profile.maxRiskPerTrade && (
                      <Badge variant="secondary" className="text-xs">
                        {language === 'ar' ? 'للصفقة' : 'Per Trade'}: {profile.maxRiskPerTrade}%
                      </Badge>
                    )}
                    {profile.stopLossRequired && (
                      <Badge variant="secondary" className="text-xs">
                        SL {language === 'ar' ? 'إلزامي' : 'Required'}
                      </Badge>
                    )}
                    {profile.takeProfitRequired && (
                      <Badge variant="secondary" className="text-xs">
                        TP {language === 'ar' ? 'إلزامي' : 'Required'}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">
              {t('risk.noProfiles')}
            </h3>
            <p className="text-muted-foreground text-center mt-2 max-w-md">
              {t('risk.startCreating')}
            </p>
            <Button 
              onClick={() => setShowAddForm(true)} 
              className="mt-4 bg-gradient-to-r from-blue-500 to-cyan-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('risk.newProfile')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {t('risk.confirmDelete')}
            </DialogTitle>
            <DialogDescription>
              {t('risk.deleteConfirmMessage')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteProfile}>
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
