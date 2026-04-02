'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n'
import { getApiHeaders } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Link2,
  Plus,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  Server,
  User,
  Lock,
  Building2,
  CandlestickChart,
  TrendingUp,
  Trash2,
  Edit,
  Loader2,
} from 'lucide-react'

// Account type definition
interface Account {
  id: string
  name: string
  broker: string | null
  accountNumber: string | null
  type: string
  currency: string
  balance: number
  equity: number
  margin: number
  freeMargin: number
  marginLevel: number
  leverage: number
  isActive: boolean
  lastSync: string | null
  createdAt: string
  portfolio?: { name: string } | null
  _count?: { trades: number }
}

const brokers = [
  'IC Markets',
  'XM',
  'Pepperstone',
  'OANDA',
  'Forex.com',
  'Interactive Brokers',
  'FXCM',
  'Other',
]

export function AccountsView() {
  const { t, language } = useI18n()
  const { toast } = useToast()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [newAccount, setNewAccount] = useState({
    name: '',
    server: '',
    login: '',
    password: '',
    broker: '',
    accountType: 'demo' as 'demo' | 'live',
    platform: 'MT5' as 'MT4' | 'MT5',
    currency: 'USD',
    balance: '',
  })

  // Fetch accounts from API
  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/accounts', {
        method: 'GET',
        headers: getApiHeaders(),
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch accounts')
      }
      
      const data = await response.json()
      setAccounts(data.accounts || [])
    } catch (error) {
      console.error('Error fetching accounts:', error)
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' 
          ? 'فشل في تحميل الحسابات' 
          : 'Failed to load accounts',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Add new account
  const handleAddAccount = async () => {
    if (!newAccount.broker || !newAccount.login) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' 
          ? 'يرجى ملء جميع الحقول المطلوبة' 
          : 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)
      
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          name: `${newAccount.platform} - ${newAccount.broker}`,
          broker: newAccount.broker,
          accountNumber: newAccount.login,
          type: newAccount.accountType,
          currency: newAccount.currency,
          balance: parseFloat(newAccount.balance) || 0,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add account')
      }

      const data = await response.json()
      
      setAccounts([...accounts, data.account])
      setIsAddDialogOpen(false)
      setNewAccount({
        name: '',
        server: '',
        login: '',
        password: '',
        broker: '',
        accountType: 'demo',
        platform: 'MT5',
        currency: 'USD',
        balance: '',
      })
      
      toast({
        title: language === 'ar' ? 'تم بنجاح' : 'Success',
        description: language === 'ar' 
          ? 'تم إضافة الحساب بنجاح' 
          : 'Account added successfully',
      })
    } catch (error) {
      console.error('Error adding account:', error)
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' 
          ? 'فشل في إضافة الحساب' 
          : 'Failed to add account',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Delete account
  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا الحساب؟' : 'Are you sure you want to delete this account?')) {
      return
    }

    try {
      setDeletingId(accountId)
      
      const response = await fetch(`/api/accounts?id=${accountId}`, {
        method: 'DELETE',
        headers: getApiHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to delete account')
      }

      setAccounts(accounts.filter(acc => acc.id !== accountId))
      
      toast({
        title: language === 'ar' ? 'تم بنجاح' : 'Success',
        description: language === 'ar' 
          ? 'تم حذف الحساب بنجاح' 
          : 'Account deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting account:', error)
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' 
          ? 'فشل في حذف الحساب' 
          : 'Failed to delete account',
        variant: 'destructive',
      })
    } finally {
      setDeletingId(null)
    }
  }

  // Sync account (refresh balance)
  const handleSyncAccount = async (accountId: string) => {
    try {
      const response = await fetch(`/api/accounts`, {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify({
          id: accountId,
          lastSync: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to sync account')
      }

      const data = await response.json()
      setAccounts(accounts.map(acc => 
        acc.id === accountId ? { ...acc, ...data.account } : acc
      ))
      
      toast({
        title: language === 'ar' ? 'تم بنجاح' : 'Success',
        description: language === 'ar' 
          ? 'تم تحديث الحساب بنجاح' 
          : 'Account synced successfully',
      })
    } catch (error) {
      console.error('Error syncing account:', error)
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' 
          ? 'فشل في تحديث الحساب' 
          : 'Failed to sync account',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (account: Account) => {
    const isActive = account.isActive
    const lastSync = account.lastSync ? new Date(account.lastSync) : null
    const now = new Date()
    const syncAge = lastSync ? (now.getTime() - lastSync.getTime()) / (1000 * 60) : null // minutes
    
    if (!isActive) {
      return (
        <Badge variant="default" className="bg-gray-500/20 text-gray-500 hover:bg-gray-500/30">
          <XCircle className="h-3 w-3 mr-1" />
          {t('accounts.status.disconnected')}
        </Badge>
      )
    }
    
    if (syncAge === null || syncAge > 60) {
      return (
        <Badge variant="default" className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30">
          <RefreshCw className="h-3 w-3 mr-1" />
          {language === 'ar' ? 'يحتاج تحديث' : 'Needs Sync'}
        </Badge>
      )
    }
    
    return (
      <Badge variant="default" className="bg-green-500/20 text-green-500 hover:bg-green-500/30">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        {t('accounts.status.connected')}
      </Badge>
    )
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return language === 'ar' ? 'غير محدد' : 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('accounts.title')}</h2>
          <p className="text-muted-foreground">{t('accounts.subtitle')}</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              {t('accounts.addAccount')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t('accounts.addAccount')}</DialogTitle>
              <DialogDescription>
                {t('accounts.metaquotes.description')}
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="metaquotes" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="metaquotes">
                  <CandlestickChart className="h-4 w-4 mr-2" />
                  MetaQuotes
                </TabsTrigger>
                <TabsTrigger value="tradingview">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  TradingView
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="metaquotes" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform">Platform</Label>
                    <Select
                      value={newAccount.platform}
                      onValueChange={(value: 'MT4' | 'MT5') => 
                        setNewAccount({ ...newAccount, platform: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MT4">MetaTrader 4</SelectItem>
                        <SelectItem value="MT5">MetaTrader 5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountType">{t('accounts.metaquotes.accountType')}</Label>
                    <Select
                      value={newAccount.accountType}
                      onValueChange={(value: 'demo' | 'live') => 
                        setNewAccount({ ...newAccount, accountType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="demo">{t('accounts.metaquotes.demo')}</SelectItem>
                        <SelectItem value="live">{t('accounts.metaquotes.live')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="server">
                    <Server className="h-4 w-4 inline mr-2" />
                    {t('accounts.metaquotes.server')}
                  </Label>
                  <Input
                    id="server"
                    placeholder={t('accounts.metaquotes.serverPlaceholder')}
                    value={newAccount.server}
                    onChange={(e) => setNewAccount({ ...newAccount, server: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login">
                    <User className="h-4 w-4 inline mr-2" />
                    {t('accounts.metaquotes.login')}
                  </Label>
                  <Input
                    id="login"
                    placeholder={t('accounts.metaquotes.loginPlaceholder')}
                    value={newAccount.login}
                    onChange={(e) => setNewAccount({ ...newAccount, login: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">
                    <Lock className="h-4 w-4 inline mr-2" />
                    {t('accounts.metaquotes.password')}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('accounts.metaquotes.passwordPlaceholder')}
                    value={newAccount.password}
                    onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="broker">
                    <Building2 className="h-4 w-4 inline mr-2" />
                    {t('accounts.metaquotes.broker')}
                  </Label>
                  <Select
                    value={newAccount.broker}
                    onValueChange={(value) => setNewAccount({ ...newAccount, broker: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('accounts.metaquotes.brokerPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {brokers.map((broker) => (
                        <SelectItem key={broker} value={broker}>{broker}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">{language === 'ar' ? 'العملة' : 'Currency'}</Label>
                    <Select
                      value={newAccount.currency}
                      onValueChange={(value) => setNewAccount({ ...newAccount, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="JPY">JPY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="balance">{language === 'ar' ? 'الرصيد' : 'Balance'}</Label>
                    <Input
                      id="balance"
                      type="number"
                      placeholder="0.00"
                      value={newAccount.balance}
                      onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
                    />
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleAddAccount}
                  disabled={!newAccount.broker || !newAccount.login || saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Link2 className="h-4 w-4 mr-2" />
                  )}
                  {saving 
                    ? (language === 'ar' ? 'جاري الإضافة...' : 'Adding...') 
                    : t('accounts.metaquotes.connect')}
                </Button>
              </TabsContent>
              
              <TabsContent value="tradingview" className="space-y-4 mt-4">
                <div className="text-center py-8">
                  <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('accounts.tradingView.title')}</h3>
                  <p className="text-muted-foreground mb-4">
                    {t('accounts.tradingView.description')}
                  </p>
                  <div className="space-y-4">
                    <Button className="w-full" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {t('accounts.tradingView.connectVia')} TradingView
                    </Button>
                    <p className="text-sm text-muted-foreground">— {t('common.or')} —</p>
                    <Button className="w-full" variant="outline">
                      {t('accounts.tradingView.exportData')}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-12 w-12 mx-auto text-muted-foreground animate-spin mb-4" />
            <p className="text-muted-foreground">
              {language === 'ar' ? 'جاري تحميل الحسابات...' : 'Loading accounts...'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Connected Accounts */}
      {!loading && (
        <div className="grid gap-4">
          {accounts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Link2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('accounts.noAccounts')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('accounts.subtitle')}
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('accounts.addAccount')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            accounts.map((account) => (
              <Card key={account.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-blue-500/20">
                        <CandlestickChart className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">
                            {account.name}
                          </h3>
                          {getStatusBadge(account)}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>{t('accounts.metaquotes.broker')}: {account.broker || 'N/A'}</p>
                          <p>{t('accounts.metaquotes.login')}: {account.accountNumber || 'N/A'}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={account.type === 'live' ? 'destructive' : 'secondary'} className="text-xs">
                              {account.type === 'live' ? t('accounts.metaquotes.live') : t('accounts.metaquotes.demo')}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {account.currency}
                            </Badge>
                            {account._count && (
                              <Badge variant="outline" className="text-xs">
                                {account._count.trades} {language === 'ar' ? 'صفقة' : 'trades'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {formatCurrency(account.balance, account.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        {t('accounts.status.lastSync')}: {formatDate(account.lastSync)}
                      </p>
                      <div className="flex gap-2 justify-end">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleSyncAccount(account.id)}
                          title={language === 'ar' ? 'تحديث' : 'Sync'}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          title={language === 'ar' ? 'تعديل' : 'Edit'}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteAccount(account.id)}
                          disabled={deletingId === account.id}
                          title={language === 'ar' ? 'حذف' : 'Delete'}
                        >
                          {deletingId === account.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
