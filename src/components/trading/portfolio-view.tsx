'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { 
  Plus, 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  PieChart,
  Link2,
  Building2,
  Server,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  CreditCard,
  BarChart3,
  LineChart,
  Coins,
  Landmark,
  ChartLine,
  Loader2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

// Types
interface Asset {
  id: string
  name: string
  assetType: 'forex' | 'stocks' | 'crypto' | 'commodities' | 'indices'
  symbol: string | null
  quantity: number
  entryPrice: number
  currentPrice: number
  currency: string
  connectionMethod: 'manual' | 'mt4' | 'mt5' | 'tradingview' | 'other'
  platform: string | null
  broker: string | null
  server: string | null
  accountNumber: string | null
  status: 'active' | 'inactive' | 'connected' | 'disconnected' | 'syncing' | 'error'
  lastSync: Date | null
  autoSync: boolean
  currentValue: number
  profitLoss: number
  profitLossPercent: number
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

interface FormData {
  name: string
  assetType: 'forex' | 'stocks' | 'crypto' | 'commodities' | 'indices'
  symbol: string
  quantity: string
  entryPrice: string
  currentPrice: string
  currency: string
  connectionMethod: 'manual' | 'mt4' | 'mt5' | 'tradingview' | 'other'
  platform: string
  broker: string
  server: string
  accountNumber: string
  password: string
  apiKey: string
  apiSecret: string
  autoSync: boolean
  notes: string
}

const initialFormData: FormData = {
  name: '',
  assetType: 'forex',
  symbol: '',
  quantity: '',
  entryPrice: '',
  currentPrice: '',
  currency: 'USD',
  connectionMethod: 'manual',
  platform: '',
  broker: '',
  server: '',
  accountNumber: '',
  password: '',
  apiKey: '',
  apiSecret: '',
  autoSync: false,
  notes: ''
}

// Colors for pie chart
const COLORS = ['#22C55E', '#3B82F6', '#A855F7', '#F59E0B', '#EF4444']

export function PortfolioView() {
  const { t, language } = useI18n()
  const { toast } = useToast()
  const isRTL = language === 'ar'
  
  // State
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [connectionTab, setConnectionTab] = useState<'manual' | 'mt4' | 'mt5' | 'tradingview' | 'other'>('manual')
  
  // Fetch assets
  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/assets')
      if (response.ok) {
        const data = await response.json()
        setAssets(data)
      }
    } catch (error) {
      console.error('Error fetching assets:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  // Calculate portfolio stats
  const stats = {
    totalValue: assets.reduce((sum, a) => sum + a.currentValue, 0),
    totalProfitLoss: assets.reduce((sum, a) => sum + a.profitLoss, 0),
    totalInvested: assets.reduce((sum, a) => sum + (a.quantity * a.entryPrice), 0),
    connectedAccounts: assets.filter(a => a.status === 'connected' || a.status === 'active').length,
    totalAccounts: assets.length
  }
  
  const totalProfitLossPercent = stats.totalInvested > 0 
    ? (stats.totalProfitLoss / stats.totalInvested) * 100 
    : 0

  // Asset distribution data for pie chart
  const distributionByType = assets.reduce((acc, asset) => {
    const type = asset.assetType
    const existing = acc.find(a => a.name === type)
    if (existing) {
      existing.value += asset.currentValue
    } else {
      acc.push({ 
        name: type, 
        value: asset.currentValue,
        label: language === 'ar' 
          ? t(`assets.types.${type}`) 
          : type.charAt(0).toUpperCase() + type.slice(1)
      })
    }
    return acc
  }, [] as { name: string; value: number; label: string }[])

  // Distribution by connection method
  const distributionByConnection = assets.reduce((acc, asset) => {
    const method = asset.connectionMethod
    const existing = acc.find(a => a.name === method)
    if (existing) {
      existing.count += 1
    } else {
      acc.push({ 
        name: method, 
        count: 1,
        label: t(`assets.connection.${method}`)
      })
    }
    return acc
  }, [] as { name: string; count: number; label: string }[])

  // Handle add asset
  const handleAddAsset = async () => {
    if (!formData.name) {
      toast({
        title: t('assets.messages.requiredFields'),
        variant: 'destructive'
      })
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: parseFloat(formData.quantity) || 0,
          entryPrice: parseFloat(formData.entryPrice) || 0,
          currentPrice: parseFloat(formData.currentPrice) || 0,
          connectionMethod: connectionTab,
          userId: 'default-user'
        })
      })

      if (response.ok) {
        toast({
          title: t('assets.messages.addedSuccess')
        })
        setShowAddDialog(false)
        setFormData(initialFormData)
        setConnectionTab('manual')
        fetchAssets()
      } else {
        throw new Error('Failed to add asset')
      }
    } catch (error) {
      console.error('Error adding asset:', error)
      toast({
        title: t('assets.messages.connectionError'),
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  // Handle edit asset
  const handleEditAsset = async () => {
    if (!selectedAsset || !formData.name) {
      toast({
        title: t('assets.messages.requiredFields'),
        variant: 'destructive'
      })
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/assets/${selectedAsset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: parseFloat(formData.quantity) || 0,
          entryPrice: parseFloat(formData.entryPrice) || 0,
          currentPrice: parseFloat(formData.currentPrice) || 0,
        })
      })

      if (response.ok) {
        toast({
          title: t('assets.messages.updatedSuccess')
        })
        setShowEditDialog(false)
        setSelectedAsset(null)
        setFormData(initialFormData)
        fetchAssets()
      } else {
        throw new Error('Failed to update asset')
      }
    } catch (error) {
      console.error('Error updating asset:', error)
      toast({
        title: t('assets.messages.connectionError'),
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  // Handle delete asset
  const handleDeleteAsset = async () => {
    if (!selectedAsset) return

    try {
      const response = await fetch(`/api/assets/${selectedAsset.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: t('assets.messages.deletedSuccess')
        })
        setShowDeleteDialog(false)
        setSelectedAsset(null)
        fetchAssets()
      } else {
        throw new Error('Failed to delete asset')
      }
    } catch (error) {
      console.error('Error deleting asset:', error)
      toast({
        title: t('assets.messages.connectionError'),
        variant: 'destructive'
      })
    }
  }

  // Handle sync
  const handleSync = async (asset: Asset) => {
    // Update to syncing status
    setAssets(assets.map(a => 
      a.id === asset.id ? { ...a, status: 'syncing' as const } : a
    ))
    
    try {
      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const response = await fetch(`/api/assets/${asset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'connected',
          lastSync: new Date()
        })
      })

      if (response.ok) {
        toast({
          title: t('assets.messages.syncSuccess')
        })
        fetchAssets()
      }
    } catch (error) {
      console.error('Error syncing:', error)
      setAssets(assets.map(a => 
        a.id === asset.id ? { ...a, status: 'error' as const } : a
      ))
    }
  }

  // Open edit dialog
  const openEditDialog = (asset: Asset) => {
    setSelectedAsset(asset)
    setFormData({
      name: asset.name,
      assetType: asset.assetType,
      symbol: asset.symbol || '',
      quantity: asset.quantity.toString(),
      entryPrice: asset.entryPrice.toString(),
      currentPrice: asset.currentPrice.toString(),
      currency: asset.currency,
      connectionMethod: asset.connectionMethod,
      platform: asset.platform || '',
      broker: asset.broker || '',
      server: asset.server || '',
      accountNumber: asset.accountNumber || '',
      password: '',
      apiKey: '',
      apiSecret: '',
      autoSync: asset.autoSync,
      notes: asset.notes || ''
    })
    setConnectionTab(asset.connectionMethod)
    setShowEditDialog(true)
  }

  // Get status icon
  const getStatusIcon = (status: Asset['status']) => {
    switch (status) {
      case 'connected':
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'disconnected':
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  // Get status badge
  const getStatusBadge = (status: Asset['status']) => {
    const variants: Record<Asset['status'], { color: string; text: string }> = {
      active: { color: 'bg-green-500/20 text-green-500 border-green-500/30', text: t('assets.status.active') },
      inactive: { color: 'bg-gray-500/20 text-gray-500 border-gray-500/30', text: t('assets.status.inactive') },
      connected: { color: 'bg-green-500/20 text-green-500 border-green-500/30', text: t('assets.status.connected') },
      disconnected: { color: 'bg-red-500/20 text-red-500 border-red-500/30', text: t('assets.status.disconnected') },
      syncing: { color: 'bg-blue-500/20 text-blue-500 border-blue-500/30', text: t('assets.status.syncing') },
      error: { color: 'bg-red-500/20 text-red-500 border-red-500/30', text: t('assets.status.error') }
    }
    return variants[status]
  }

  // Get asset type icon
  const getAssetTypeIcon = (type: Asset['assetType']) => {
    switch (type) {
      case 'forex':
        return <DollarSign className="h-5 w-5" />
      case 'stocks':
        return <LineChart className="h-5 w-5" />
      case 'crypto':
        return <Coins className="h-5 w-5" />
      case 'commodities':
        return <Landmark className="h-5 w-5" />
      case 'indices':
        return <ChartLine className="h-5 w-5" />
    }
  }

  // Get connection method icon
  const getConnectionIcon = (method: Asset['connectionMethod']) => {
    switch (method) {
      case 'manual':
        return <Edit className="h-4 w-4" />
      case 'mt4':
      case 'mt5':
        return <Building2 className="h-4 w-4" />
      case 'tradingview':
        return <LineChart className="h-4 w-4" />
      case 'other':
        return <Link2 className="h-4 w-4" />
    }
  }

  // Render add/edit form content
  const renderFormContent = (isEdit: boolean = false) => (
    <div className="space-y-6">
      {/* Connection Method Tabs */}
      <div className="space-y-2">
        <Label>{t('assets.connection.title')}</Label>
        <Tabs value={connectionTab} onValueChange={(v) => setConnectionTab(v as typeof connectionTab)} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="manual">{t('assets.connection.manual')}</TabsTrigger>
            <TabsTrigger value="mt4">MT4</TabsTrigger>
            <TabsTrigger value="mt5">MT5</TabsTrigger>
            <TabsTrigger value="tradingview">TV</TabsTrigger>
            <TabsTrigger value="other">{t('assets.connection.other')}</TabsTrigger>
          </TabsList>

          {/* Manual Entry Tab */}
          <TabsContent value="manual" className="space-y-4 mt-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-green-400">{t('assets.connection.manualDesc')}</p>
            </div>
          </TabsContent>

          {/* MT4 Tab */}
          <TabsContent value="mt4" className="space-y-4 mt-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-400">{t('assets.connection.mt4Desc')}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('assets.connectionFields.broker')}</Label>
                <Input 
                  placeholder={t('assets.connectionFields.brokerPlaceholder')}
                  value={formData.broker}
                  onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('assets.connectionFields.server')}</Label>
                <Input 
                  placeholder={t('assets.connectionFields.serverPlaceholder')}
                  value={formData.server}
                  onChange={(e) => setFormData({ ...formData, server: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('assets.connectionFields.accountNumber')}</Label>
                <Input 
                  placeholder={t('assets.connectionFields.accountNumberPlaceholder')}
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('assets.connectionFields.password')}</Label>
                <div className="relative">
                  <Input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="********"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn("absolute top-1/2 -translate-y-1/2", isRTL ? "left-2" : "right-2")}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* MT5 Tab */}
          <TabsContent value="mt5" className="space-y-4 mt-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-400">{t('assets.connection.mt5Desc')}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('assets.connectionFields.broker')}</Label>
                <Input 
                  placeholder={t('assets.connectionFields.brokerPlaceholder')}
                  value={formData.broker}
                  onChange={(e) => setFormData({ ...formData, broker: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('assets.connectionFields.server')}</Label>
                <Input 
                  placeholder={t('assets.connectionFields.serverPlaceholder')}
                  value={formData.server}
                  onChange={(e) => setFormData({ ...formData, server: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('assets.connectionFields.accountNumber')}</Label>
                <Input 
                  placeholder={t('assets.connectionFields.accountNumberPlaceholder')}
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('assets.connectionFields.password')}</Label>
                <div className="relative">
                  <Input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="********"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn("absolute top-1/2 -translate-y-1/2", isRTL ? "left-2" : "right-2")}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TradingView Tab */}
          <TabsContent value="tradingview" className="space-y-4 mt-4">
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-purple-400">{t('assets.connection.tradingviewDesc')}</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('assets.connectionFields.apiKey')}</Label>
                <Input 
                  placeholder={t('assets.connectionFields.apiKeyPlaceholder')}
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('assets.connectionFields.apiSecret')}</Label>
                <Input 
                  type="password"
                  placeholder={t('assets.connectionFields.apiSecretPlaceholder')}
                  value={formData.apiSecret}
                  onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                />
              </div>
            </div>
          </TabsContent>

          {/* Other Tab */}
          <TabsContent value="other" className="space-y-4 mt-4">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-400">{t('assets.connection.otherDesc')}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('assets.connectionFields.platform')}</Label>
                <Input 
                  placeholder={t('assets.connectionFields.selectPlatform')}
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('assets.connectionFields.apiKey')}</Label>
                <Input 
                  placeholder={t('assets.connectionFields.apiKeyPlaceholder')}
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Asset Details */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('assets.assetName')} *</Label>
            <Input 
              placeholder={t('assets.assetNamePlaceholder')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('assets.assetType')} *</Label>
            <Select value={formData.assetType} onValueChange={(v) => setFormData({ ...formData, assetType: v as FormData['assetType'] })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="forex">{t('assets.types.forex')}</SelectItem>
                <SelectItem value="stocks">{t('assets.types.stocks')}</SelectItem>
                <SelectItem value="crypto">{t('assets.types.crypto')}</SelectItem>
                <SelectItem value="commodities">{t('assets.types.commodities')}</SelectItem>
                <SelectItem value="indices">{t('assets.types.indices')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>{t('assets.symbol')}</Label>
            <Input 
              placeholder={t('assets.symbolPlaceholder')}
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('assets.quantity')} *</Label>
            <Input 
              type="number"
              placeholder={t('assets.quantityPlaceholder')}
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('assets.currency')}</Label>
            <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="SAR">SAR</SelectItem>
                <SelectItem value="AED">AED</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('assets.entryPrice')} *</Label>
            <Input 
              type="number"
              step="0.00001"
              placeholder={t('assets.entryPricePlaceholder')}
              value={formData.entryPrice}
              onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('assets.currentPrice')}</Label>
            <Input 
              type="number"
              step="0.00001"
              placeholder={t('assets.currentPricePlaceholder')}
              value={formData.currentPrice}
              onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('assets.notes')}</Label>
          <Textarea 
            placeholder={t('assets.notesPlaceholder')}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
          />
        </div>

        {connectionTab !== 'manual' && (
          <div className="flex items-center justify-between">
            <div>
              <Label>{t('assets.autoSync')}</Label>
              <p className="text-xs text-muted-foreground">{t('assets.enableAutoSync')}</p>
            </div>
            <Switch 
              checked={formData.autoSync}
              onCheckedChange={(checked) => setFormData({ ...formData, autoSync: checked })}
            />
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6 text-green-500" />
            {t('portfolio.title')}
          </h2>
          <p className="text-muted-foreground mt-1">
            {language === 'ar' 
              ? 'إدارة جميع حساباتك وأصولك في مكان واحد' 
              : 'Manage all your accounts and assets in one place'}
          </p>
        </div>
        <Button 
          className="bg-gradient-to-r from-green-500 to-emerald-600"
          onClick={() => {
            setFormData(initialFormData)
            setConnectionTab('manual')
            setShowAddDialog(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('portfolio.addAccountAsset')}
        </Button>
      </div>

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('portfolio.totalBalance')}
                </p>
                <p className="text-2xl font-bold">
                  ${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('portfolio.totalEquity')}
                </p>
                <p className="text-2xl font-bold">
                  ${(stats.totalValue + stats.totalProfitLoss).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "bg-gradient-to-br border",
          stats.totalProfitLoss >= 0 
            ? "from-emerald-500/10 to-green-500/5 border-emerald-500/20"
            : "from-red-500/10 to-rose-500/5 border-red-500/20"
        )}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('portfolio.profitLoss')}
                </p>
                <p className={cn(
                  "text-2xl font-bold flex items-center gap-1",
                  stats.totalProfitLoss >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {stats.totalProfitLoss >= 0 
                    ? <ArrowUpRight className="h-5 w-5" />
                    : <ArrowDownRight className="h-5 w-5" />
                  }
                  {stats.totalProfitLoss >= 0 ? '+' : ''}
                  ${stats.totalProfitLoss.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className={cn(
                  "text-sm",
                  stats.totalProfitLoss >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  ({totalProfitLossPercent >= 0 ? '+' : ''}{totalProfitLossPercent.toFixed(2)}%)
                </p>
              </div>
              <div className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center",
                stats.totalProfitLoss >= 0 ? "bg-green-500/20" : "bg-red-500/20"
              )}>
                {stats.totalProfitLoss >= 0 
                  ? <TrendingUp className="h-6 w-6 text-green-500" />
                  : <TrendingDown className="h-6 w-6 text-red-500" />
                }
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/5 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('portfolio.connectedAccounts')}
                </p>
                <p className="text-2xl font-bold">
                  {stats.connectedAccounts} / {stats.totalAccounts}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Link2 className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assets List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t('portfolio.accountsAssets')}
            </CardTitle>
            <CardDescription>
              {t('portfolio.allConnectedAccounts')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : assets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Wallet className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">
                  {t('portfolio.noAssetsYet')}
                </h3>
                <p className="text-muted-foreground text-center mt-2 max-w-md">
                  {t('portfolio.addFirstAccount')}
                </p>
                <div className="flex flex-wrap gap-2 mt-6 justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setFormData(initialFormData)
                      setConnectionTab('manual')
                      setShowAddDialog(true)
                    }}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {t('portfolio.manualEntry')}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setFormData(initialFormData)
                      setConnectionTab('mt4')
                      setShowAddDialog(true)
                    }}
                    className="gap-2"
                  >
                    <Building2 className="h-4 w-4" />
                    MT4/MT5
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setFormData(initialFormData)
                      setConnectionTab('tradingview')
                      setShowAddDialog(true)
                    }}
                    className="gap-2"
                  >
                    <LineChart className="h-4 w-4" />
                    TradingView
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {assets.map((asset) => (
                  <div 
                    key={asset.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center",
                        asset.profitLoss >= 0 
                          ? "bg-green-500/20" 
                          : "bg-red-500/20"
                      )}>
                        {getAssetTypeIcon(asset.assetType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{asset.name}</p>
                          <Badge variant="outline" className={cn("text-xs", getStatusBadge(asset.status).color)}>
                            {getStatusIcon(asset.status)}
                            <span className={cn("mx-1", isRTL ? "mr-1" : "ml-1")}>{getStatusBadge(asset.status).text}</span>
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {getConnectionIcon(asset.connectionMethod)}
                            <span className={cn("mx-1", isRTL ? "mr-1" : "ml-1")}>{t(`assets.connection.${asset.connectionMethod}`)}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t(`assets.types.${asset.assetType}`)}
                          {asset.symbol && ` • ${asset.symbol}`}
                          {asset.broker && ` • ${asset.broker}`}
                          {asset.accountNumber && ` • #${asset.accountNumber}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className={cn("text-right", isRTL && "text-left")}>
                        <p className="font-bold">
                          ${asset.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <p className={cn(
                          "text-sm flex items-center gap-1 justify-end",
                          isRTL && "flex-row-reverse",
                          asset.profitLoss >= 0 ? "text-green-500" : "text-red-500"
                        )}>
                          {asset.profitLoss >= 0 ? '+' : ''}
                          ${asset.profitLoss.toFixed(2)} ({asset.profitLossPercent.toFixed(2)}%)
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {asset.connectionMethod !== 'manual' && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleSync(asset)}
                            disabled={asset.status === 'syncing'}
                            title={t('assets.syncNow')}
                          >
                            <RefreshCw className={cn("h-4 w-4", asset.status === 'syncing' && "animate-spin")} />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEditDialog(asset)}
                          title={t('common.edit')}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setSelectedAsset(asset)
                            setShowDeleteDialog(true)
                          }}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          title={t('common.delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              {t('assets.distribution.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <PieChart className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('assets.distribution.noData')}</p>
              </div>
            ) : (
              <>
                <Tabs defaultValue="byType" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="byType">{t('assets.distribution.byType')}</TabsTrigger>
                    <TabsTrigger value="byConnection">{t('assets.distribution.byConnection')}</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="byType">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={distributionByType}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {distributionByType.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => `$${value.toLocaleString()}`}
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend 
                            formatter={(value: string) => t(`assets.types.${value}`)}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="byConnection">
                    <div className="space-y-3">
                      {distributionByConnection.map((item, index) => (
                        <div key={item.name} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div 
                              className="h-3 w-3 rounded-full" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm font-medium">{item.label}</span>
                          </div>
                          <Badge variant="secondary">{item.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className="hover:border-blue-500/50 transition-colors cursor-pointer" 
          onClick={() => {
            setFormData(initialFormData)
            setConnectionTab('mt4')
            setShowAddDialog(true)
          }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">{t('portfolio.connectMetaTrader')}</p>
                <p className="text-sm text-muted-foreground">MT4 / MT5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="hover:border-purple-500/50 transition-colors cursor-pointer"
          onClick={() => {
            setFormData(initialFormData)
            setConnectionTab('tradingview')
            setShowAddDialog(true)
          }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <LineChart className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="font-medium">{t('portfolio.connectTradingView')}</p>
                <p className="text-sm text-muted-foreground">{t('portfolio.syncPortfolio')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="hover:border-green-500/50 transition-colors cursor-pointer"
          onClick={() => {
            setFormData(initialFormData)
            setConnectionTab('manual')
            setShowAddDialog(true)
          }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Plus className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="font-medium">{t('portfolio.manualEntry')}</p>
                <p className="text-sm text-muted-foreground">{t('portfolio.accountOrAsset')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="hover:border-amber-500/50 transition-colors cursor-pointer"
          onClick={() => {
            setFormData(initialFormData)
            setConnectionTab('other')
            setShowAddDialog(true)
          }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Link2 className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="font-medium">{t('assets.connection.other')}</p>
                <p className="text-sm text-muted-foreground">{language === 'ar' ? 'وسيط آخر' : 'Other broker'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('assets.addNew')}</DialogTitle>
            <DialogDescription>
              {language === 'ar' 
                ? 'أدخل بيانات حسابك يدوياً أو اتصل تلقائياً عبر MetaQuotes أو TradingView'
                : 'Enter your account details manually or connect automatically via MetaQuotes or TradingView'}
            </DialogDescription>
          </DialogHeader>
          
          {renderFormContent()}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button 
              className="bg-gradient-to-r from-green-500 to-emerald-600"
              onClick={handleAddAsset}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('assets.connecting')}
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-2" />
                  {connectionTab === 'manual' ? t('assets.add') : t('assets.connect')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('assets.editAsset')}</DialogTitle>
            <DialogDescription>
              {language === 'ar' 
                ? 'تعديل بيانات الأصل أو الحساب'
                : 'Edit asset or account details'}
            </DialogDescription>
          </DialogHeader>
          
          {renderFormContent(true)}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button 
              className="bg-gradient-to-r from-green-500 to-emerald-600"
              onClick={handleEditAsset}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t('assets.save')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('assets.deleteAsset')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('assets.confirmDelete')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAsset}
              className="bg-red-500 hover:bg-red-600"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
