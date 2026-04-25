'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import { useI18n } from '@/lib/i18n'
import { toast } from 'sonner'
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
  MoreVertical,
  Edit2,
  Trash2,
  Loader2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Types matching Prisma TradingAccount model
interface TradingAccount {
  id: string
  userId: string
  name: string
  accountType: 'broker' | 'propfirm' | 'indices' | 'stocks'
  currency: string
  balance: number
  equity: number
  isActive: boolean
  broker?: string
  platform?: string
  accountNumber?: string
  server?: string
  connectionStatus?: string
  lastSync?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
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

// Delete Account Button Component
function DeleteAccountButton({ 
  accountId, 
  accountName,
  onSuccess 
}: { 
  accountId: string
  accountName: string
  onSuccess: () => void 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { language } = useI18n()
  const router = useRouter()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success(language === 'ar' ? 'تم حذف الحساب بنجاح' : 'Account deleted successfully')
        onSuccess()
        router.refresh()
      } else {
        throw new Error(data.error || 'Failed to delete account')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error(language === 'ar' ? 'فشل في حذف الحساب' : 'Failed to delete account')
    } finally {
      setIsDeleting(false)
      setIsOpen(false)
    }
  }

  return (
    <>
      <DropdownMenuItem 
        className="text-destructive focus:text-destructive"
        onClick={() => setIsOpen(true)}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        {language === 'ar' ? 'حذف' : 'Delete'}
      </DropdownMenuItem>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'ar' ? 'تأكيد حذف الحساب' : 'Confirm Account Deletion'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ar' 
                ? `هل أنت متأكد من حذف حساب "${accountName}"؟ هذا الإجراء لا يمكن التراجع عنه.`
                : `Are you sure you want to delete account "${accountName}"? This action cannot be undone.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {language === 'ar' ? 'جاري الحذف...' : 'Deleting...'}
                </>
              ) : (
                language === 'ar' ? 'حذف' : 'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function AccountsView() {
  const router = useRouter()
  const { t, language } = useI18n()
  const isRTL = language === 'ar'
  const [mounted, setMounted] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [accounts, setAccounts] = useState<TradingAccount[]>([])
  const [riskProfiles, setRiskProfiles] = useState<RiskProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  // Fetch accounts with AbortController and proper dependencies
  const fetchAccounts = useCallback(async (signal?: AbortSignal) => {
    try {
      const [accountsRes, profilesRes] = await Promise.all([
        fetch('/api/accounts', { signal, credentials: 'include' }),
        fetch('/api/risk-profiles', { signal, credentials: 'include' })
      ])
      
      if (!signal?.aborted) {
        if (accountsRes.ok) {
          const accountsData = await accountsRes.json()
          setAccounts(accountsData)
        }
        
        if (profilesRes.ok) {
          const profilesData = await profilesRes.json()
          setRiskProfiles(profilesData)
        }
      }
    } catch (error) {
      if (!signal?.aborted) {
        console.error('Error fetching data:', error)
        toast.error(language === 'ar' ? 'فشل في تحميل البيانات' : 'Failed to load data')
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }, [language])

  useEffect(() => {
    const controller = new AbortController()
    
    setLoading(true)
    fetchAccounts(controller.signal)
    
    return () => {
      controller.abort()
    }
  }, [fetchAccounts])

  const handleCreateAccount = async () => {
    if (!formData.name.trim()) {
      toast.error(language === 'ar' ? 'يرجى إدخال اسم الحساب' : 'Please enter account name')
      return
    }

    try {
      setIsSubmitting(true)
      
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          broker: formData.platform,
          accountNumber: formData.accountNumber,
          accountType: 'broker',
          type: formData.type,
          balance: formData.balance ? parseFloat(formData.balance) : 0,
          currency: formData.currency,
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(language === 'ar' ? 'تم إنشاء الحساب بنجاح' : 'Account created successfully')
        setAccounts([data, ...accounts])
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
        router.refresh()
      } else {
        throw new Error(data.error || 'Failed to create account')
      }
    } catch (error) {
      console.error('Error creating account:', error)
      toast.error(language === 'ar' ? 'فشل في إنشاء الحساب' : 'Failed to create account')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSync = async (accountId: string) => {
    setSyncingId(accountId)
    // Simulate sync - in real app would call actual sync API
    await new Promise(resolve => setTimeout(resolve, 2000))
    setSyncingId(null)
    toast.success(language === 'ar' ? 'تمت المزامنة' : 'Synced successfully')
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

  const removeAccountFromList = (accountId: string) => {
    setAccounts(accounts.filter(a => a.id !== accountId))
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
        <Button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="bg-gradient-to-r from-cyan-500 to-blue-600"
          disabled={isSubmitting}
        >
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
                <Label>{language === 'ar' ? 'اسم الحساب' : 'Account Name'} *</Label>
                <Input 
                  placeholder={language === 'ar' ? 'مثال: حساب التداول الرئيسي' : 'e.g., Main Trading Account'} 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('accounts.platform')}</Label>
                <Select 
                  value={formData.platform} 
                  onValueChange={(value) => setFormData({ ...formData, platform: value })}
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('accounts.accountNumber')}</Label>
                <Input 
                  placeholder="12345678" 
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('accounts.password')}</Label>
                <Input 
                  type="password" 
                  placeholder="********" 
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'نوع الحساب' : 'Account Type'}</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'العملة' : 'Currency'}</Label>
                <Select 
                  value={formData.currency} 
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  disabled={isSubmitting}
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
                disabled={isSubmitting || !formData.name.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {language === 'ar' ? 'جاري الإنشاء...' : 'Creating...'}
                  </>
                ) : (
                  t('accounts.connect')
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
                disabled={isSubmitting}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accounts List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : Array.isArray(accounts) && accounts.length > 0 ? (
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
                      <Badge variant={account.accountType === 'broker' ? 'default' : 'secondary'}>
                        {account.accountType}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleSync(account.id)}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${syncingId === account.id ? 'animate-spin' : ''}`} />
                            {language === 'ar' ? 'مزامنة' : 'Sync'}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit2 className="h-4 w-4 mr-2" />
                            {t('common.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DeleteAccountButton 
                            accountId={account.id}
                            accountName={account.name}
                            onSuccess={() => removeAccountFromList(account.id)}
                          />
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
                          onClick={() => router.push('/#risk')}
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