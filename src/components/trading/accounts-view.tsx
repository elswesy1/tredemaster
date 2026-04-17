'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useI18n } from '@/lib/i18n'
import { useToast } from '@/hooks/use-toast'
import { 
  Plus, 
  Link2, 
  CheckCircle,
  XCircle,
  RefreshCw,
  Shield,
  TrendingUp,
  DollarSign,
  Clock,
  ExternalLink,
  Settings,
  MoreVertical,
  Edit2,
  Trash2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTradingStore } from '@/lib/store'

interface Account {
  id: string
  name: string
  broker?: string
  accountNumber?: string
  type: string
  balance: number
  equity: number
  currency: string
  lastSync?: string
  isActive: boolean
  createdAt: string
}

interface RiskProfile {
  id: string
  name: string
  accountId?: string
  accountName?: string
  riskTolerance: string
  riskDegree: number
  maxDailyLoss?: number
  maxRiskPerTrade?: number
  stopLossRequired: boolean
  takeProfitRequired: boolean
  isConfigured: boolean
}

export function AccountsView() {
  const { t, language } = useI18n()
  const { toast } = useToast()
  const { setConnectedAccounts, addConnectedAccount, removeConnectedAccount } = useTradingStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [riskProfiles, setRiskProfiles] = useState<RiskProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [syncingId, setSyncingId] = useState<string | null>(null)

  // Form state for new account
  const [formData, setFormData] = useState({
    name: '',
    platform: 'MT4',
    server: '',
    accountNumber: '',
    password: '',
    type: 'live',
    balance: '',
    currency: 'USD',
  })

  const isRTL = language === 'ar'

  // Fetch accounts and risk profiles
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountsRes, profilesRes] = await Promise.all([
          fetch('/api/accounts'),
          fetch('/api/risk-profiles')
        ])
        
        if (accountsRes.ok) {
          const accountsData = await accountsRes.json()
          setAccounts(accountsData)
          
          // Sync with global store
          setConnectedAccounts(accountsData.map((a: any) => ({
            id: a.id,
            name: a.name,
            type: a.accountType || 'broker',
            currency: a.currency,
            balance: a.balance,
            status: a.isActive ? 'connected' : 'disconnected',
            broker: a.broker,
            accountNumber: a.accountNumber
          })))
        }
        
        if (profilesRes.ok) {
          const profilesData = await profilesRes.json()
          setRiskProfiles(profilesData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const handleCreateAccount = async () => {
    if (!formData.name || isCreating) return

    try {
      setIsCreating(true)
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          broker: formData.platform,
          accountNumber: formData.accountNumber,
          type: formData.type,
          balance: formData.balance ? parseFloat(formData.balance) : 0,
          currency: formData.currency,
        })
      })

      if (response.ok) {
        const newAccount = await response.json()
        setAccounts([newAccount, ...accounts])
        
        // Update global store
        addConnectedAccount({
          id: newAccount.id,
          name: newAccount.name,
          type: newAccount.accountType || 'broker',
          currency: newAccount.currency,
          balance: newAccount.balance,
          status: 'connected',
          broker: newAccount.broker,
          accountNumber: newAccount.accountNumber
        })
        
        setShowAddForm(false)
        setFormData({
          name: '',
          platform: 'MT4',
          server: '',
          accountNumber: '',
          password: '',
          type: 'live',
          balance: '',
          currency: 'USD',
        })
        toast({
          title: language === 'ar' ? 'تم الربط بنجاح' : 'Connected Successfully',
          description: language === 'ar' ? 'تمت إضافة حساب التداول بنجاح' : 'Trading account added successfully',
        })
      } else {
        toast({
          title: language === 'ar' ? 'خطأ في الربط' : 'Connection Error',
          description: language === 'ar' ? 'فشل في إضافة الحساب' : 'Failed to add account',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error creating account:', error)
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteAccount = async (accountId: string) => {
    try {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setAccounts(accounts.filter(a => a.id !== accountId))
        removeConnectedAccount(accountId)
        toast({
          title: language === 'ar' ? 'تم الحذف' : 'Deleted',
          description: language === 'ar' ? 'تم حذف الحساب بنجاح' : 'Account deleted successfully',
        })
      } else {
        toast({
          title: language === 'ar' ? 'خطأ' : 'Error',
          description: language === 'ar' ? 'فشل في حذف الحساب' : 'Failed to delete account',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'حدث خطأ أثناء الحذف' : 'An error occurred during deletion',
        variant: 'destructive',
      })
    }
  }

  const handleSync = async (accountId: string) => {
    setSyncingId(accountId)
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000))
    setSyncingId(null)
  }

  const getRiskProfileForAccount = (accountId: string) => {
    return riskProfiles.find(p => p.accountId === accountId)
  }

  const getRiskToleranceColor = (tolerance: string) => {
    switch (tolerance) {
      case 'conservative': return 'bg-green-500'
      case 'moderate': return 'bg-yellow-500'
      case 'aggressive': return 'bg-red-500'
      default: return 'bg-blue-500'
    }
  }

  const getPlatformIcon = (platform?: string) => {
    switch (platform?.toLowerCase()) {
      case 'mt4':
      case 'mt5':
        return '📈'
      case 'tradingview':
        return '📊'
      default:
        return '💼'
    }
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Link2 className="h-6 w-6 text-cyan-500" />
            {t('accounts.title')}
          </h2>
          <p className="text-muted-foreground mt-1">
            {t('accounts.subtitle')}
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-gradient-to-r from-cyan-500 to-blue-600">
          <Plus className="h-4 w-4 mr-2" />
          {t('accounts.connectAccount')}
        </Button>
      </div>

      {/* Add Account Form */}
      {showAddForm && (
        <Card className="border-2 border-cyan-500/20">
          <CardHeader>
            <CardTitle>{t('accounts.connectNew')}</CardTitle>
            <CardDescription>
              {language === 'ar' 
                ? 'أدخل بيانات حسابك للربط أو أضف حساب يدوي' 
                : 'Enter your account details to connect or add manually'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'اسم الحساب' : 'Account Name'}</Label>
                <Input 
                  placeholder={language === 'ar' ? 'مثال: حساب التداول الرئيسي' : 'e.g., Main Trading Account'} 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('accounts.platform')}</Label>
                <Select 
                  value={formData.platform} 
                  onValueChange={(value) => setFormData({ ...formData, platform: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MT4">MetaTrader 4 (MT4)</SelectItem>
                    <SelectItem value="MT5">MetaTrader 5 (MT5)</SelectItem>
                    <SelectItem value="TradingView">TradingView</SelectItem>
                    <SelectItem value="Manual">{language === 'ar' ? 'يدوي' : 'Manual'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('accounts.server')}</Label>
                <Input 
                  placeholder={language === 'ar' ? 'اسم الخادم' : 'Server name'} 
                  value={formData.server}
                  onChange={(e) => setFormData({ ...formData, server: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('accounts.accountNumber')}</Label>
                <Input 
                  placeholder="12345678" 
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('accounts.password')}</Label>
                <Input 
                  type="password" 
                  placeholder="********" 
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'نوع الحساب' : 'Account Type'}</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="live">{language === 'ar' ? 'حقيقي' : 'Live'}</SelectItem>
                    <SelectItem value="demo">{language === 'ar' ? 'تجريبي' : 'Demo'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الرصيد الأولي' : 'Initial Balance'}</Label>
                <Input 
                  type="number" 
                  placeholder="10000" 
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'العملة' : 'Currency'}</Label>
                <Select 
                  value={formData.currency} 
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="JPY">JPY</SelectItem>
                    <SelectItem value="SAR">SAR</SelectItem>
                    <SelectItem value="AED">AED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={handleCreateAccount}
                className="bg-gradient-to-r from-cyan-500 to-blue-600"
                disabled={!formData.name || isCreating}
              >
                {isCreating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                {t('accounts.connect')}
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                {t('common.cancel')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accounts List */}
      {accounts.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {accounts.map((account) => {
            const riskProfile = getRiskProfileForAccount(account.id)
            
            return (
              <Card key={account.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-2xl">
                        {getPlatformIcon(account.broker)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{account.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <span>{account.broker || 'Manual'}</span>
                          {account.accountNumber && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <span className="font-mono text-xs">{account.accountNumber}</span>
                            </>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={account.type === 'live' ? 'default' : 'secondary'}>
                        {account.type === 'live' 
                          ? (language === 'ar' ? 'حقيقي' : 'Live')
                          : (language === 'ar' ? 'تجريبي' : 'Demo')
                        }
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleSync(account.id)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {language === 'ar' ? 'مزامنة' : 'Sync'}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit2 className="h-4 w-4 mr-2" />
                            {t('common.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteAccount(account.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('common.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Balance & Equity */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-xs">{t('accounts.balance')}</span>
                      </div>
                      <p className="text-xl font-bold">
                        {account.currency} {account.balance.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs">{t('accounts.equity')}</span>
                      </div>
                      <p className="text-xl font-bold">
                        {account.currency} {account.equity.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Last Sync */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{t('accounts.lastSync')}:</span>
                    </div>
                    <span>{account.lastSync 
                      ? new Date(account.lastSync).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')
                      : (language === 'ar' ? 'لم تتم المزامنة' : 'Not synced')
                    }</span>
                  </div>

                  {/* Risk Profile Section */}
                  <div className="border-t pt-4">
                    {riskProfile ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Shield className={`h-4 w-4 ${riskProfile.riskTolerance === 'conservative' ? 'text-green-500' : riskProfile.riskTolerance === 'moderate' ? 'text-yellow-500' : 'text-red-500'}`} />
                            <span className="font-medium">{t('accounts.riskProfile')}</span>
                          </div>
                          <Badge className={`${getRiskToleranceColor(riskProfile.riskTolerance)} text-white`}>
                            {riskProfile.name}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {riskProfile.maxDailyLoss && (
                            <Badge variant="outline" className="text-xs">
                              {language === 'ar' ? 'يومي' : 'Daily'}: ${riskProfile.maxDailyLoss}
                            </Badge>
                          )}
                          {riskProfile.maxRiskPerTrade && (
                            <Badge variant="outline" className="text-xs">
                              {language === 'ar' ? 'للصفقة' : 'Per Trade'}: {riskProfile.maxRiskPerTrade}%
                            </Badge>
                          )}
                          {riskProfile.stopLossRequired && (
                            <Badge variant="outline" className="text-xs bg-green-500/10">
                              SL {language === 'ar' ? 'إلزامي' : 'Required'}
                            </Badge>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full mt-2"
                          onClick={() => window.location.href = '/#risk'}
                        >
                          <ExternalLink className="h-3 w-3 mr-2" />
                          {language === 'ar' ? 'عرض ملف المخاطر' : 'View Risk Profile'}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-3">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Shield className="h-4 w-4" />
                          <span>{t('accounts.noRiskProfile')}</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = '/#risk'}
                        >
                          <Plus className="h-3 w-3 mr-2" />
                          {t('accounts.createRiskProfile')}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* Empty State */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Link2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">
              {t('accounts.noAccounts')}
            </h3>
            <p className="text-muted-foreground text-center mt-2 max-w-md">
              {t('accounts.connectYourAccount')}
            </p>
            <Button 
              onClick={() => setShowAddForm(true)} 
              className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('accounts.connectAccount')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
