'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  PieChart,
  Edit,
  Trash2,
  Building2,
  Coins,
  Shield,
  Loader2,
  FolderOpen,
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
import { useI18n } from '@/lib/i18n'
import { apiPost } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

// Account/Asset interface
interface AccountAsset {
  id: string
  name: string
  type: 'account' | 'asset'
  category: string
  broker?: string
  quantity: number
  value: number
  profit: number
  profitPercent: number
  allocation: number
}

const COLORS = ['oklch(0.65 0.2 145)', 'oklch(0.65 0.2 25)', 'oklch(0.55 0.15 250)', 'oklch(0.7 0.15 45)', 'oklch(0.6 0.2 320)']

export function PortfolioView() {
  const { language } = useI18n()
  const { toast } = useToast()
  const isRTL = language === 'ar'
  
  // Start with empty array - no mock data
  const [accountsAssets, setAccountsAssets] = useState<AccountAsset[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [newAccountAsset, setNewAccountAsset] = useState({
    name: '',
    type: 'account' as 'account' | 'asset',
    category: '',
    broker: '',
    quantity: 0,
    value: 0,
  })

  const totalValue = accountsAssets.reduce((sum, item) => sum + item.value, 0)
  const totalProfit = accountsAssets.reduce((sum, item) => sum + item.profit, 0)
  const accountsCount = accountsAssets.filter(a => a.type === 'account').length
  const assetsCount = accountsAssets.filter(a => a.type === 'asset').length

  // Calculate distribution dynamically
  const getDistributionData = () => {
    const distribution: Record<string, number> = {}
    accountsAssets.forEach(item => {
      const category = item.category
      distribution[category] = (distribution[category] || 0) + item.value
    })
    
    return Object.entries(distribution).map(([name, value], index) => ({
      name,
      value: totalValue > 0 ? (value / totalValue) * 100 : 0,
      amount: value,
      color: COLORS[index % COLORS.length],
    }))
  }

  const performanceData = accountsAssets.map(item => ({
    name: item.name.length > 15 ? item.name.slice(0, 15) + '...' : item.name,
    profit: item.profit,
  }))

  // Add account/asset with automatic risk profile creation
  const handleAddAccountAsset = async () => {
    setIsAdding(true)
    try {
      const newItem: AccountAsset = {
        id: Date.now().toString(),
        name: newAccountAsset.name,
        type: newAccountAsset.type,
        category: newAccountAsset.category,
        broker: newAccountAsset.type === 'account' ? newAccountAsset.broker : undefined,
        quantity: newAccountAsset.quantity,
        value: newAccountAsset.value,
        profit: 0,
        profitPercent: 0,
        allocation: totalValue > 0 ? (newAccountAsset.value / (totalValue + newAccountAsset.value)) * 100 : 100,
      }

      // Create empty risk profile automatically
      const riskProfileData = {
        accountId: newItem.id,
        accountName: newItem.name,
        accountType: newItem.type,
        name: `${isRTL ? 'ملف مخاطر' : 'Risk Profile'} - ${newItem.name}`,
        description: isRTL 
          ? `ملف مخاطر مخصص لـ ${newItem.name}`
          : `Risk profile for ${newItem.name}`,
        riskTolerance: 'moderate',
        riskDegree: 5,
        isConfigured: false,
      }

      // Try to create risk profile
      try {
        await apiPost('/api/risk-profiles', riskProfileData)
      } catch (e) {
        console.log('Risk profile creation skipped:', e)
      }

      // Recalculate allocations
      const newTotal = totalValue + newItem.value
      const updatedAssets = accountsAssets.map(item => ({
        ...item,
        allocation: (item.value / newTotal) * 100,
      }))
      newItem.allocation = (newItem.value / newTotal) * 100

      setAccountsAssets([...updatedAssets, newItem])
      setIsAddDialogOpen(false)
      setNewAccountAsset({
        name: '',
        type: 'account',
        category: '',
        broker: '',
        quantity: 0,
        value: 0,
      })

      toast({
        title: isRTL ? 'تم بنجاح' : 'Success',
        description: isRTL 
          ? `تم إضافة ${newItem.type === 'account' ? 'الحساب' : 'الأصل'} وإنشاء ملف مخاطر فارغ تلقائياً`
          : `${newItem.type === 'account' ? 'Account' : 'Asset'} added with empty risk profile`,
      })
    } catch (error) {
      console.error('Error adding account/asset:', error)
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في إضافة الحساب/الأصل' : 'Failed to add account/asset',
        variant: 'destructive',
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleDelete = (id: string) => {
    const remaining = accountsAssets.filter(item => item.id !== id)
    const newTotal = remaining.reduce((sum, item) => sum + item.value, 0)
    
    // Recalculate allocations
    const updated = remaining.map(item => ({
      ...item,
      allocation: newTotal > 0 ? (item.value / newTotal) * 100 : 0,
    }))
    
    setAccountsAssets(updated)
    toast({
      title: isRTL ? 'تم الحذف' : 'Deleted',
      description: isRTL ? 'تم حذف الحساب/الأصل' : 'Account/Asset deleted',
    })
  }

  // Empty state
  if (accountsAssets.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Wallet className="h-6 w-6" />
              {isRTL ? 'إدارة المحفظة' : 'Portfolio Management'}
            </h2>
            <p className="text-muted-foreground">
              {isRTL ? 'إدارة حساباتك وأصولك المالية' : 'Manage your trading accounts and assets'}
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                {isRTL ? 'إضافة حساب/أصل' : 'Add Account/Asset'}
              </Button>
            </DialogTrigger>
            {renderAddDialog()}
          </Dialog>
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderOpen className="h-20 w-20 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {isRTL ? 'محفظتك فارغة' : 'Your Portfolio is Empty'}
            </h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              {isRTL 
                ? 'ابدأ بإضافة حساباتك التداولية أو أصولك المالية لتتبعها وإدارة مخاطرها'
                : 'Start by adding your trading accounts or financial assets to track and manage their risks'
              }
            </p>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg">
                  <Plus className="h-4 w-4 ml-2" />
                  {isRTL ? 'إضافة أول حساب/أصل' : 'Add Your First Account/Asset'}
                </Button>
              </DialogTrigger>
              {renderAddDialog()}
            </Dialog>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              {isRTL ? 'إجمالي المحفظة' : 'Total Portfolio'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {totalProfit >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              {isRTL ? 'إجمالي الربح/الخسارة' : 'Total P/L'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn('text-2xl font-bold', totalProfit >= 0 ? 'text-green-500' : 'text-red-500')}>
              ${totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {isRTL ? 'عدد الحسابات/الأصول' : 'Accounts/Assets'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accountsAssets.length}</div>
            <p className="text-xs text-muted-foreground">
              {isRTL 
                ? `${accountsCount} حساب · ${assetsCount} أصل` 
                : `${accountsCount} accounts · ${assetsCount} assets`
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {isRTL ? 'الأفضل أداءً' : 'Best Performer'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {accountsAssets.length > 0 ? (
              <>
                <div className="text-lg font-bold truncate">
                  {accountsAssets.reduce((best, item) => 
                    item.profitPercent > best.profitPercent ? item : best
                  , accountsAssets[0])?.name}
                </div>
                <p className="text-xs text-green-500">
                  +{Math.max(...accountsAssets.map(a => a.profitPercent)).toFixed(1)}%
                </p>
              </>
            ) : (
              <div className="text-muted-foreground">-</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">
            {isRTL ? 'الحسابات والأصول' : 'Accounts & Assets'}
          </TabsTrigger>
          <TabsTrigger value="distribution">
            {isRTL ? 'التوزيع' : 'Distribution'}
          </TabsTrigger>
          <TabsTrigger value="performance">
            {isRTL ? 'الأداء' : 'Performance'}
          </TabsTrigger>
        </TabsList>

        {/* Accounts & Assets Tab */}
        <TabsContent value="accounts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {isRTL ? 'الحسابات والأصول' : 'Accounts & Assets'} ({accountsAssets.length})
            </h3>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 ml-2" />
                  {isRTL ? 'إضافة حساب/أصل' : 'Add Account/Asset'}
                </Button>
              </DialogTrigger>
              {renderAddDialog()}
            </Dialog>
          </div>

          <div className="grid gap-4">
            {accountsAssets.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center text-white',
                        item.profit >= 0 ? 'bg-green-500' : 'bg-red-500'
                      )}>
                        {item.type === 'account' ? (
                          <Building2 className="h-6 w-6" />
                        ) : (
                          <Coins className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold">{item.name}</h4>
                          <Badge variant={item.type === 'account' ? 'default' : 'secondary'}>
                            {item.type === 'account' 
                              ? (isRTL ? 'حساب' : 'Account')
                              : (isRTL ? 'أصل' : 'Asset')
                            }
                          </Badge>
                          <Badge variant="outline">{item.category}</Badge>
                        </div>
                        {item.broker && (
                          <p className="text-sm text-muted-foreground">
                            {isRTL ? 'الوسيط:' : 'Broker:'} {item.broker}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 flex-wrap">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? 'الكمية' : 'Quantity'}
                        </p>
                        <p className="font-medium">{item.quantity}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? 'القيمة' : 'Value'}
                        </p>
                        <p className="font-medium">${item.value.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? 'الربح/الخسارة' : 'P/L'}
                        </p>
                        <p className={cn('font-medium', item.profit >= 0 ? 'text-green-500' : 'text-red-500')}>
                          {item.profit >= 0 ? '+' : ''}${item.profit.toLocaleString()}
                          <span className="text-xs mr-1">
                            ({item.profitPercent >= 0 ? '+' : ''}{item.profitPercent.toFixed(1)}%)
                          </span>
                        </p>
                      </div>
                      <div className="text-center w-24">
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? 'التخصيص' : 'Allocation'}
                        </p>
                        <Progress value={item.allocation} className="mt-1" />
                        <p className="text-xs text-muted-foreground">{item.allocation.toFixed(1)}%</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  {isRTL ? 'توزيع المحفظة' : 'Portfolio Distribution'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'توزيع الحسابات والأصول حسب الفئة' : 'Distribution by category'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getDistributionData().length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={getDistributionData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                        >
                          {getDistributionData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'oklch(0.17 0.025 250)',
                            border: '1px solid oklch(0.3 0.03 250)',
                            borderRadius: '8px',
                          }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    {isRTL ? 'لا توجد بيانات' : 'No data available'}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {isRTL ? 'تفاصيل التوزيع' : 'Distribution Details'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'نسبة كل فئة من إجمالي المحفظة' : 'Percentage of each category'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {getDistributionData().map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="font-bold">{item.value.toFixed(1)}%</span>
                    </div>
                    <Progress value={item.value} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {isRTL ? 'أداء الحسابات والأصول' : 'Performance'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'الربح/الخسارة لكل حساب أو أصل' : 'P/L for each account or asset'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {performanceData.length > 0 ? (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 250)" />
                      <XAxis type="number" stroke="oklch(0.5 0.02 250)" />
                      <YAxis dataKey="name" type="category" stroke="oklch(0.5 0.02 250)" width={120} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'oklch(0.17 0.025 250)',
                          border: '1px solid oklch(0.3 0.03 250)',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [`$${value}`, isRTL ? 'الربح/الخسارة' : 'P/L']}
                      />
                      <Bar
                        dataKey="profit"
                        fill="oklch(0.65 0.2 145)"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  {isRTL ? 'لا توجد بيانات' : 'No data available'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )

  function renderAddDialog() {
    return (
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isRTL ? 'إضافة حساب/أصل جديد' : 'Add New Account/Asset'}
          </DialogTitle>
          <DialogDescription>
            {isRTL 
              ? 'أدخل بيانات الحساب أو الأصل الجديد لإضافته إلى محفظتك'
              : 'Enter details for the new account or asset'
            }
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>{isRTL ? 'النوع' : 'Type'}</Label>
            <Select 
              value={newAccountAsset.type} 
              onValueChange={(value: 'account' | 'asset') => 
                setNewAccountAsset({...newAccountAsset, type: value})
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="account">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {isRTL ? 'حساب تداول' : 'Trading Account'}
                  </div>
                </SelectItem>
                <SelectItem value="asset">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4" />
                    {isRTL ? 'أصل' : 'Asset'}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">
              {isRTL ? 'اسم الحساب/الأصل' : 'Account/Asset Name'} *
            </Label>
            <Input 
              id="name" 
              placeholder={isRTL 
                ? 'مثال: حساب Binance، محفظة Bitcoin'
                : 'e.g., Binance Account, Bitcoin Wallet'
              }
              value={newAccountAsset.name}
              onChange={(e) => setNewAccountAsset({...newAccountAsset, name: e.target.value})}
            />
          </div>

          <div className="grid gap-2">
            <Label>{isRTL ? 'الفئة' : 'Category'} *</Label>
            <Select 
              value={newAccountAsset.category}
              onValueChange={(value) => setNewAccountAsset({...newAccountAsset, category: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder={isRTL ? 'اختر الفئة' : 'Select category'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="crypto">{isRTL ? 'عملة رقمية' : 'Crypto'}</SelectItem>
                <SelectItem value="forex">{isRTL ? 'فوركس' : 'Forex'}</SelectItem>
                <SelectItem value="stocks">{isRTL ? 'أسهم' : 'Stocks'}</SelectItem>
                <SelectItem value="commodities">{isRTL ? 'سلع' : 'Commodities'}</SelectItem>
                <SelectItem value="indices">{isRTL ? 'مؤشرات' : 'Indices'}</SelectItem>
                <SelectItem value="other">{isRTL ? 'أخرى' : 'Other'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {newAccountAsset.type === 'account' && (
            <div className="grid gap-2">
              <Label htmlFor="broker">
                {isRTL ? 'اسم الوسيط/المنصة' : 'Broker/Platform'}
              </Label>
              <Input 
                id="broker" 
                placeholder={isRTL 
                  ? 'مثال: Binance, IC Markets, Exness'
                  : 'e.g., Binance, IC Markets, Exness'
                }
                value={newAccountAsset.broker}
                onChange={(e) => setNewAccountAsset({...newAccountAsset, broker: e.target.value})}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="quantity">
                {isRTL ? 'الكمية/الحجم' : 'Quantity'}
              </Label>
              <Input 
                id="quantity" 
                type="number" 
                placeholder="0.00"
                value={newAccountAsset.quantity || ''}
                onChange={(e) => setNewAccountAsset({...newAccountAsset, quantity: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="value">
                {isRTL ? 'القيمة ($)' : 'Value ($)'} *
              </Label>
              <Input 
                id="value" 
                type="number" 
                placeholder="0.00"
                value={newAccountAsset.value || ''}
                onChange={(e) => setNewAccountAsset({...newAccountAsset, value: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <Button 
            className="w-full mt-4" 
            onClick={handleAddAccountAsset}
            disabled={!newAccountAsset.name || !newAccountAsset.category || !newAccountAsset.value || isAdding}
          >
            {isAdding ? (
              <>
                <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                {isRTL ? 'جاري الإضافة...' : 'Adding...'}
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 ml-2" />
                {isRTL ? 'إضافة مع ملف مخاطر' : 'Add with Risk Profile'}
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            {isRTL 
              ? 'سيتم إنشاء ملف مخاطر فارغ تلقائياً يمكنك تحديد معاييره لاحقاً'
              : 'An empty risk profile will be created automatically for you to configure later'
            }
          </p>
        </div>
      </DialogContent>
    )
  }
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
