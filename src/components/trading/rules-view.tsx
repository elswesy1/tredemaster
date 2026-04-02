'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  Shield,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  Edit,
  Trash2,
  DollarSign,
  Loader2,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface TradingRule {
  id: string
  name: string
  description: string
  category: 'entry' | 'exit' | 'risk' | 'psychology'
  compliance: number
  violations: number
  violationCost: number
  active: boolean
}

const categoryIcons = {
  entry: Target,
  exit: TrendingUp,
  risk: Shield,
  psychology: Brain,
}

const categoryColors = {
  entry: 'text-blue-500 bg-blue-500/20',
  exit: 'text-green-500 bg-green-500/20',
  risk: 'text-orange-500 bg-orange-500/20',
  psychology: 'text-purple-500 bg-purple-500/20',
}

export function RulesView() {
  const { t } = useI18n()
  const [rules, setRules] = useState<TradingRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    category: 'entry' as TradingRule['category'],
  })
  const [activeTab, setActiveTab] = useState('all')

  // Fetch rules from API
  useEffect(() => {
    fetchRules()
  }, [])

  const fetchRules = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/rules')
      if (response.ok) {
        const data = await response.json()
        setRules(data)
      }
    } catch (error) {
      console.error('Error fetching rules:', error)
      toast({
        title: 'Error',
        description: 'Failed to load trading rules',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const totalViolations = rules.reduce((sum, rule) => sum + rule.violations, 0)
  const totalCost = rules.reduce((sum, rule) => sum + rule.violationCost, 0)
  const avgCompliance = rules.length > 0 ? rules.reduce((sum, rule) => sum + rule.compliance, 0) / rules.length : 0

  const handleAddRule = async () => {
    try {
      setIsSubmitting(true)
      const response = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule)
      })

      if (response.ok) {
        const savedRule = await response.json()
        setRules([...rules, savedRule])
        setIsAddDialogOpen(false)
        setNewRule({ name: '', description: '', category: 'entry' })
        toast({
          title: 'Success',
          description: 'Trading rule added successfully',
        })
      } else {
        throw new Error('Failed to add rule')
      }
    } catch (error) {
      console.error('Error adding rule:', error)
      toast({
        title: 'Error',
        description: 'Failed to add trading rule',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRule = async (id: string) => {
    try {
      const response = await fetch(`/api/rules?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setRules(rules.filter((rule) => rule.id !== id))
        toast({
          title: 'Deleted',
          description: 'Trading rule deleted successfully',
        })
      }
    } catch (error) {
      console.error('Error deleting rule:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete trading rule',
        variant: 'destructive'
      })
    }
  }

  const toggleRuleActive = async (id: string) => {
    try {
      const rule = rules.find(r => r.id === id)
      if (!rule) return

      const response = await fetch('/api/rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !rule.active })
      })

      if (response.ok) {
        setRules(
          rules.map((rule) =>
            rule.id === id ? { ...rule, active: !rule.active } : rule
          )
        )
      }
    } catch (error) {
      console.error('Error updating rule:', error)
      toast({
        title: 'Error',
        description: 'Failed to update trading rule',
        variant: 'destructive'
      })
    }
  }

  const filteredRules = activeTab === 'all' 
    ? rules 
    : rules.filter((rule) => rule.category === activeTab)

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 90) return 'text-green-500'
    if (compliance >= 70) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/20">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('rules.compliance')}</p>
                <p className="text-2xl font-bold text-green-500">
                  {avgCompliance.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-500/20">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('rules.totalViolations')}</p>
                <p className="text-2xl font-bold text-orange-500">
                  {totalViolations}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-rose-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-500/20">
                <DollarSign className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('rules.violationCost')}</p>
                <p className="text-2xl font-bold text-red-500">
                  ${totalCost.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rules Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('rules.title')}</h2>
          <p className="text-muted-foreground">{t('rules.subtitle')}</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              {t('rules.addRule')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('rules.addRule')}</DialogTitle>
              <DialogDescription>
                Define a new trading rule to track your compliance
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="ruleName">{t('rules.ruleName')}</Label>
                <Input
                  id="ruleName"
                  placeholder="e.g., Always use stop loss"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ruleDescription">{t('rules.ruleDescription')}</Label>
                <Textarea
                  id="ruleDescription"
                  placeholder="Describe the rule in detail..."
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ruleCategory">Category</Label>
                <Select
                  value={newRule.category}
                  onValueChange={(value: TradingRule['category']) =>
                    setNewRule({ ...newRule, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">{t('rules.ruleCategories.entry')}</SelectItem>
                    <SelectItem value="exit">{t('rules.ruleCategories.exit')}</SelectItem>
                    <SelectItem value="risk">{t('rules.ruleCategories.risk')}</SelectItem>
                    <SelectItem value="psychology">{t('rules.ruleCategories.psychology')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleAddRule}
                disabled={!newRule.name}
              >
                {t('rules.addRule')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rules Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">{t('rules.activeRules')}</TabsTrigger>
          <TabsTrigger value="entry" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            {t('rules.ruleCategories.entry')}
          </TabsTrigger>
          <TabsTrigger value="exit" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {t('rules.ruleCategories.exit')}
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t('rules.ruleCategories.risk')}
          </TabsTrigger>
          <TabsTrigger value="psychology" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            {t('rules.ruleCategories.psychology')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid gap-4">
            {filteredRules.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('rules.noRules')}</h3>
                  <Button
                    className="bg-green-600 hover:bg-green-700 mt-4"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('rules.addRule')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredRules.map((rule) => {
                const Icon = categoryIcons[rule.category]
                return (
                  <Card
                    key={rule.id}
                    className={`transition-all hover:shadow-lg ${
                      !rule.active ? 'opacity-60' : ''
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${categoryColors[rule.category]}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{rule.name}</h3>
                              <Badge variant={rule.active ? 'default' : 'secondary'}>
                                {rule.active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {rule.description}
                            </p>
                            <div className="flex items-center gap-6 text-sm">
                              <div>
                                <span className="text-muted-foreground">
                                  {t('rules.compliance')}:
                                </span>{' '}
                                <span className={`font-medium ${getComplianceColor(rule.compliance)}`}>
                                  {rule.compliance}%
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  {t('rules.totalViolations')}:
                                </span>{' '}
                                <span className="font-medium text-orange-500">
                                  {rule.violations}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  {t('rules.violationCost')}:
                                </span>{' '}
                                <span className="font-medium text-red-500">
                                  ${rule.violationCost}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleRuleActive(rule.id)}
                          >
                            {rule.active ? (
                              <XCircle className="h-4 w-4" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteRule(rule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Progress
                          value={rule.compliance}
                          className={`h-2 ${
                            rule.compliance >= 90
                              ? '[&>div]:bg-green-500'
                              : rule.compliance >= 70
                              ? '[&>div]:bg-yellow-500'
                              : '[&>div]:bg-red-500'
                          }`}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Rule Suggestions */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            Suggested Rules
          </CardTitle>
          <CardDescription>
            Common rules that successful traders follow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            {Object.entries(t('rules.examples')).map(([key, rule]) => (
              <Button
                key={key}
                variant="outline"
                className="justify-start h-auto py-2"
                onClick={() => {
                  setNewRule({
                    name: rule as string,
                    description: '',
                    category: key.includes('1') || key.includes('3') ? 'entry' : 
                              key.includes('2') ? 'risk' : 'psychology',
                  })
                  setIsAddDialogOpen(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2 shrink-0" />
                <span className="text-sm">{rule}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
