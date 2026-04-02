'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
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
  BookOpen,
  Plus,
  Calendar,
  Sun,
  Moon,
  Clock,
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  Edit,
  Trash2,
  Search,
  Filter,
  Loader2,
} from 'lucide-react'
import { getApiHeaders } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

// Types
interface JournalEntry {
  id: string
  date: string
  type: string
  title: string | null
  marketCondition: string | null
  sentiment: string | null
  keyLevels: string | null
  plannedTrades: string | null
  actualTrades: string | null
  lessons: string | null
  mistakes: string | null
  improvements: string | null
  mood: number | null
  energy: number | null
  focus: number | null
  confidence: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

interface SessionReview {
  id: string
  date: string
  session: string
  tradesPlanned: number
  tradesTaken: number
  tradesWon: number
  tradesLost: number
  profitLoss: number
  rating: number | null
  rulesFollowed: boolean | null
  notes: string | null
}

// Form state interface
interface JournalFormData {
  date: string
  type: string
  title: string
  marketCondition: string
  sentiment: string
  mood: number
  energy: number
  focus: number
  confidence: number
  plannedTrades: string
  actualTrades: string
  lessons: string
  mistakes: string
  notes: string
}

const initialFormData: JournalFormData = {
  date: new Date().toISOString().split('T')[0],
  type: 'daily',
  title: '',
  marketCondition: '',
  sentiment: 'neutral',
  mood: 7,
  energy: 7,
  focus: 7,
  confidence: 7,
  plannedTrades: '',
  actualTrades: '',
  lessons: '',
  mistakes: '',
  notes: '',
}

// Empty session reviews - no mock data
const sessionReviews: SessionReview[] = []

export function JournalView() {
  const [newEntryOpen, setNewEntryOpen] = useState(false)
  const [newReviewOpen, setNewReviewOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<JournalFormData>(initialFormData)
  const { toast } = useToast()

  // Fetch journal entries on mount
  useEffect(() => {
    fetchJournalEntries()
  }, [])

  const fetchJournalEntries = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/journal', {
        method: 'GET',
        headers: getApiHeaders(),
      })
      
      if (!response.ok) {
        throw new Error('فشل في جلب البيانات')
      }
      
      const data: JournalEntry[] = await response.json()
      setJournalEntries(data)
    } catch (error) {
      console.error('Error fetching journal entries:', error)
      toast({
        title: 'خطأ',
        description: 'فشل في جلب المدونات',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle add new entry
  const handleAddEntry = async () => {
    try {
      setSaving(true)
      
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          type: formData.type,
          title: formData.title,
          marketCondition: formData.marketCondition,
          sentiment: formData.sentiment,
          plannedTrades: formData.plannedTrades,
          actualTrades: formData.actualTrades,
          lessons: formData.lessons,
          mistakes: formData.mistakes,
          mood: formData.mood,
          energy: formData.energy,
          focus: formData.focus,
          confidence: formData.confidence,
          notes: formData.notes,
          date: formData.date,
        }),
      })
      
      if (!response.ok) {
        throw new Error('فشل في حفظ التدوينة')
      }
      
      const newEntry = await response.json()
      setJournalEntries(prev => [newEntry, ...prev])
      setNewEntryOpen(false)
      setFormData(initialFormData)
      
      toast({
        title: 'تم بنجاح',
        description: 'تم حفظ التدوينة بنجاح',
      })
    } catch (error) {
      console.error('Error adding journal entry:', error)
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ التدوينة',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Handle delete entry
  const handleDeleteEntry = async (id: string) => {
    try {
      setDeletingId(id)
      
      const response = await fetch(`/api/journal/${id}`, {
        method: 'DELETE',
        headers: getApiHeaders(),
      })
      
      if (!response.ok) {
        throw new Error('فشل في حذف التدوينة')
      }
      
      setJournalEntries(prev => prev.filter(entry => entry.id !== id))
      
      toast({
        title: 'تم بنجاح',
        description: 'تم حذف التدوينة بنجاح',
      })
    } catch (error) {
      console.error('Error deleting journal entry:', error)
      toast({
        title: 'خطأ',
        description: 'فشل في حذف التدوينة',
        variant: 'destructive',
      })
    } finally {
      setDeletingId(null)
    }
  }

  // Calculate weekly stats from entries
  const weeklyStats = {
    totalTrades: journalEntries.reduce((acc, e) => acc + (parseInt(e.actualTrades || '0') || 0), 0),
    avgMood: journalEntries.length > 0 
      ? (journalEntries.reduce((acc, e) => acc + (e.mood || 0), 0) / journalEntries.filter(e => e.mood).length).toFixed(1)
      : '0',
    avgFocus: journalEntries.length > 0 
      ? (journalEntries.reduce((acc, e) => acc + (e.focus || 0), 0) / journalEntries.filter(e => e.focus).length).toFixed(1)
      : '0',
  }

  // Filter entries based on search
  const filteredEntries = journalEntries.filter(entry => 
    entry.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.marketCondition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filter by type
  const dailyEntries = filteredEntries.filter(entry => entry.type === 'daily' || entry.type === 'weekly')
  const preMarketEntries = filteredEntries.filter(entry => entry.type === 'pre-market')

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">المدخلات هذا الأسبوع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : journalEntries.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">متوسط المزاج</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.avgMood}/10</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">متوسط التركيز</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.avgFocus}/10</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">الجلسات المراجعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionReviews.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="entries" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="entries">اليومية</TabsTrigger>
          <TabsTrigger value="pre-market">ما قبل السوق</TabsTrigger>
          <TabsTrigger value="sessions">مراجعات الجلسات</TabsTrigger>
        </TabsList>

        {/* Journal Entries Tab */}
        <TabsContent value="entries" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-9 w-64"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <Dialog open={newEntryOpen} onOpenChange={setNewEntryOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 ml-2" />
                  تدوينة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>إضافة تدوينة جديدة</DialogTitle>
                  <DialogDescription>
                    سجل تجربتك اليومية في التداول
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>التاريخ</Label>
                      <Input 
                        type="date" 
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>النوع</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر النوع" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">يومي</SelectItem>
                          <SelectItem value="pre-market">ما قبل السوق</SelectItem>
                          <SelectItem value="market-in">دخول السوق</SelectItem>
                          <SelectItem value="weekly">أسبوعي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>العنوان</Label>
                    <Input 
                      placeholder="عنوان التدوينة" 
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>حالة السوق</Label>
                    <Textarea 
                      placeholder="وصف حالة السوق..." 
                      value={formData.marketCondition}
                      onChange={(e) => setFormData(prev => ({ ...prev, marketCondition: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>التوجه</Label>
                    <Select 
                      value={formData.sentiment} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, sentiment: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر التوجه" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bullish">صاعد</SelectItem>
                        <SelectItem value="bearish">هابط</SelectItem>
                        <SelectItem value="neutral">محايد</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>المزاج ({formData.mood}/10)</Label>
                      <Slider 
                        value={[formData.mood]} 
                        max={10} 
                        step={1} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, mood: value[0] }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الطاقة ({formData.energy}/10)</Label>
                      <Slider 
                        value={[formData.energy]} 
                        max={10} 
                        step={1} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, energy: value[0] }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>التركيز ({formData.focus}/10)</Label>
                      <Slider 
                        value={[formData.focus]} 
                        max={10} 
                        step={1} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, focus: value[0] }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الثقة ({formData.confidence}/10)</Label>
                      <Slider 
                        value={[formData.confidence]} 
                        max={10} 
                        step={1} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, confidence: value[0] }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>الصفقات المخططة</Label>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        value={formData.plannedTrades}
                        onChange={(e) => setFormData(prev => ({ ...prev, plannedTrades: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>الصفقات المنفذة</Label>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        value={formData.actualTrades}
                        onChange={(e) => setFormData(prev => ({ ...prev, actualTrades: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>الدروس المستفادة</Label>
                    <Textarea 
                      placeholder="ماذا تعلمت اليوم..." 
                      value={formData.lessons}
                      onChange={(e) => setFormData(prev => ({ ...prev, lessons: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>الأخطاء</Label>
                    <Textarea 
                      placeholder="الأخطاء التي ارتكبتها..." 
                      value={formData.mistakes}
                      onChange={(e) => setFormData(prev => ({ ...prev, mistakes: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>ملاحظات إضافية</Label>
                    <Textarea 
                      placeholder="أي ملاحظات أخرى..." 
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleAddEntry}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      'حفظ التدوينة'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : dailyEntries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد تدوينات بعد. أضف أول تدوينة لك!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {dailyEntries.map((entry) => (
                <Card key={entry.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString('ar-SA')}
                          </span>
                          <Badge variant="outline">
                            {entry.type === 'daily' ? 'يومي' : entry.type === 'weekly' ? 'أسبوعي' : entry.type}
                          </Badge>
                          {entry.sentiment && (
                            <Badge variant={entry.sentiment === 'bullish' ? 'default' : entry.sentiment === 'bearish' ? 'destructive' : 'secondary'}>
                              {entry.sentiment === 'bullish' ? 'صاعد' : entry.sentiment === 'bearish' ? 'هابط' : 'محايد'}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold">{entry.title || 'بدون عنوان'}</h3>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-loss hover:text-loss"
                          onClick={() => handleDeleteEntry(entry.id)}
                          disabled={deletingId === entry.id}
                        >
                          {deletingId === entry.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {entry.marketCondition && (
                        <div>
                          <Label className="text-muted-foreground text-xs">حالة السوق</Label>
                          <p className="mt-1">{entry.marketCondition}</p>
                        </div>
                      )}

                      {(entry.mood || entry.energy || entry.focus || entry.confidence) && (
                        <div className="grid grid-cols-4 gap-4">
                          {entry.mood && (
                            <div className="text-center p-2 bg-muted/50 rounded-lg">
                              <p className="text-xs text-muted-foreground">المزاج</p>
                              <p className="text-lg font-bold">{entry.mood}/10</p>
                            </div>
                          )}
                          {entry.energy && (
                            <div className="text-center p-2 bg-muted/50 rounded-lg">
                              <p className="text-xs text-muted-foreground">الطاقة</p>
                              <p className="text-lg font-bold">{entry.energy}/10</p>
                            </div>
                          )}
                          {entry.focus && (
                            <div className="text-center p-2 bg-muted/50 rounded-lg">
                              <p className="text-xs text-muted-foreground">التركيز</p>
                              <p className="text-lg font-bold">{entry.focus}/10</p>
                            </div>
                          )}
                          {entry.confidence && (
                            <div className="text-center p-2 bg-muted/50 rounded-lg">
                              <p className="text-xs text-muted-foreground">الثقة</p>
                              <p className="text-lg font-bold">{entry.confidence}/10</p>
                            </div>
                          )}
                        </div>
                      )}

                      {entry.lessons && (
                        <div>
                          <Label className="text-muted-foreground text-xs">الدروس المستفادة</Label>
                          <p className="mt-1 text-sm">{entry.lessons}</p>
                        </div>
                      )}

                      {entry.mistakes && (
                        <div>
                          <Label className="text-muted-foreground text-xs">الأخطاء</Label>
                          <p className="mt-1 text-sm text-loss">{entry.mistakes}</p>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t">
                        <div className="flex gap-4">
                          <span className="text-sm text-muted-foreground">
                            المخطط: {entry.plannedTrades || 0} صفقات
                          </span>
                          <span className="text-sm text-muted-foreground">
                            المنفذ: {entry.actualTrades || 0} صفقات
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Pre-Market Tab */}
        <TabsContent value="pre-market" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sun className="h-5 w-5" />
              تحليلات ما قبل السوق
            </h3>
            <Button onClick={() => {
              setFormData(prev => ({ ...prev, type: 'pre-market' }))
              setNewEntryOpen(true)
            }}>
              <Plus className="h-4 w-4 ml-2" />
              تحليل جديد
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : preMarketEntries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Sun className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد تحليلات ما قبل السوق بعد.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {preMarketEntries.map((entry) => (
                <Card key={entry.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString('ar-SA')}
                          </span>
                          {entry.sentiment && (
                            <Badge variant={entry.sentiment === 'bullish' ? 'default' : entry.sentiment === 'bearish' ? 'destructive' : 'secondary'}>
                              {entry.sentiment === 'bullish' ? 'صاعد' : entry.sentiment === 'bearish' ? 'هابط' : 'محايد'}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold">{entry.title || 'تحليل ما قبل السوق'}</h3>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-loss hover:text-loss"
                        onClick={() => handleDeleteEntry(entry.id)}
                        disabled={deletingId === entry.id}
                      >
                        {deletingId === entry.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {entry.marketCondition && (
                        <div>
                          <Label className="text-muted-foreground text-xs">حالة السوق</Label>
                          <p className="mt-1">{entry.marketCondition}</p>
                        </div>
                      )}
                      {entry.notes && (
                        <div>
                          <Label className="text-muted-foreground text-xs">الملاحظات</Label>
                          <p className="mt-1 text-sm">{entry.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              مراجعات الجلسات
            </h3>
            <Dialog open={newReviewOpen} onOpenChange={setNewReviewOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 ml-2" />
                  مراجعة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إضافة مراجعة جلسة</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>التاريخ</Label>
                      <Input type="date" />
                    </div>
                    <div className="grid gap-2">
                      <Label>الجلسة</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الجلسة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="london">لندن</SelectItem>
                          <SelectItem value="new_york">نيويورك</SelectItem>
                          <SelectItem value="tokyo">طوكيو</SelectItem>
                          <SelectItem value="asian">آسيوية</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>الصفقات المخططة</Label>
                      <Input type="number" placeholder="0" />
                    </div>
                    <div className="grid gap-2">
                      <Label>الصفقات المنفذة</Label>
                      <Input type="number" placeholder="0" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>صفقات رابحة</Label>
                      <Input type="number" placeholder="0" />
                    </div>
                    <div className="grid gap-2">
                      <Label>صفقات خاسرة</Label>
                      <Input type="number" placeholder="0" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>التقييم (1-10)</Label>
                    <Slider defaultValue={[7]} max={10} step={1} />
                  </div>
                  <div className="grid gap-2">
                    <Label>ملاحظات</Label>
                    <Textarea placeholder="ملاحظات الجلسة..." />
                  </div>
                  <Button className="w-full" onClick={() => setNewReviewOpen(false)}>
                    حفظ المراجعة
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {sessionReviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        جلسة {review.session === 'london' ? 'لندن' : review.session === 'new_york' ? 'نيويورك' : review.session === 'tokyo' ? 'طوكيو' : 'آسيوية'}
                      </CardTitle>
                      <CardDescription>{review.date}</CardDescription>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">التقييم</p>
                      <p className="text-xl font-bold">{review.rating}/10</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2 text-center mb-4">
                    <div className="p-2 bg-muted/50 rounded">
                      <p className="text-xs text-muted-foreground">مخطط</p>
                      <p className="font-bold">{review.tradesPlanned}</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <p className="text-xs text-muted-foreground">منفذ</p>
                      <p className="font-bold">{review.tradesTaken}</p>
                    </div>
                    <div className="p-2 bg-profit/20 rounded">
                      <p className="text-xs text-muted-foreground">رابحة</p>
                      <p className="font-bold text-profit">{review.tradesWon}</p>
                    </div>
                    <div className="p-2 bg-loss/20 rounded">
                      <p className="text-xs text-muted-foreground">خاسرة</p>
                      <p className="font-bold text-loss">{review.tradesLost}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge variant={review.rulesFollowed ? 'default' : 'destructive'}>
                      {review.rulesFollowed ? 'القواعد متبعة' : 'انتهاك القواعد'}
                    </Badge>
                    <span className={cn('font-bold', review.profitLoss >= 0 ? 'text-profit' : 'text-loss')}>
                      {review.profitLoss >= 0 ? '+' : ''}${review.profitLoss}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
