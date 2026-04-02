'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useI18n } from '@/lib/i18n'
import { getApiHeaders, apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
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
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Play,
  Pause,
  Square,
  Clock,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Save,
  X,
  Video,
  Timer,
  Loader2,
  RefreshCw,
  Trash2,
  Edit,
} from 'lucide-react'

type RecordingStatus = 'stopped' | 'recording' | 'paused'

// Session type matching the database schema
interface SessionReview {
  id: string
  userId: string
  date: string
  session: string // london, new_york, tokyo, asian
  marketOpen: boolean
  marketCondition?: string
  volatility?: string // low, medium, high
  volume?: string // low, medium, high
  tradesPlanned: number
  tradesTaken: number
  tradesWon: number
  tradesLost: number
  profitLoss: number
  rulesFollowed?: boolean
  emotions?: string
  mistakes?: string
  improvements?: string
  notes?: string
  rating?: number // 1-5 scale
  createdAt: string
  updatedAt: string
}

interface SessionFormData {
  name: string
  session: string
  notes: string
  tags: string
  tradesWon: number
  tradesLost: number
  profitLoss: number
  emotions: string
  mistakes: string
  improvements: string
  rulesFollowed: boolean
  rating: number
}

const initialFormData: SessionFormData = {
  name: '',
  session: 'london',
  notes: '',
  tags: '',
  tradesWon: 0,
  tradesLost: 0,
  profitLoss: 0,
  emotions: '',
  mistakes: '',
  improvements: '',
  rulesFollowed: true,
  rating: 3,
}

export function SessionRecording() {
  const { t, language } = useI18n()
  const { toast } = useToast()
  
  // Recording state
  const [status, setStatus] = useState<RecordingStatus>('stopped')
  const [elapsedTime, setElapsedTime] = useState(0)
  const [tradesPlaced, setTradesPlaced] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  // API state
  const [sessionHistory, setSessionHistory] = useState<SessionReview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Dialog state
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedSession, setSelectedSession] = useState<SessionReview | null>(null)
  const [formData, setFormData] = useState<SessionFormData>(initialFormData)

  // Fetch sessions from API
  const fetchSessions = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiGet<{ sessions: SessionReview[] }>('/api/sessions')
      setSessionHistory(response.sessions || [])
    } catch (err) {
      console.error('Error fetching sessions:', err)
      setError(err instanceof Error ? err.message : 'Failed to load sessions')
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في تحميل الجلسات' : 'Failed to load sessions',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, language])

  // Initial fetch
  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  // Timer effect
  useEffect(() => {
    if (status === 'recording') {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1)
      }, 1000)
    } else if (status === 'paused' && timerRef.current) {
      clearInterval(timerRef.current)
    } else if (status === 'stopped' && timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [status])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartRecording = () => {
    setStatus('recording')
    setElapsedTime(0)
    setTradesPlaced(0)
    setFormData(initialFormData)
  }

  const handlePauseRecording = () => {
    setStatus('paused')
  }

  const handleResumeRecording = () => {
    setStatus('recording')
  }

  const handleStopRecording = () => {
    setStatus('stopped')
    setShowSaveDialog(true)
  }

  // Create new session
  const handleSaveSession = async () => {
    try {
      setIsSaving(true)
      
      const sessionData = {
        session: formData.session,
        tradesPlanned: tradesPlaced,
        tradesTaken: tradesPlaced,
        tradesWon: formData.tradesWon,
        tradesLost: formData.tradesLost,
        profitLoss: formData.profitLoss,
        notes: formData.notes || formData.name,
        emotions: formData.emotions,
        mistakes: formData.mistakes,
        improvements: formData.improvements,
        rulesFollowed: formData.rulesFollowed,
        rating: formData.rating,
        marketOpen: true,
      }

      await apiPost('/api/sessions', sessionData)
      
      toast({
        title: language === 'ar' ? 'تم الحفظ' : 'Saved',
        description: language === 'ar' ? 'تم حفظ الجلسة بنجاح' : 'Session saved successfully',
      })

      setShowSaveDialog(false)
      setElapsedTime(0)
      setTradesPlaced(0)
      setFormData(initialFormData)
      
      // Refresh the list
      fetchSessions()
    } catch (err) {
      console.error('Error saving session:', err)
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في حفظ الجلسة' : 'Failed to save session',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Update existing session
  const handleUpdateSession = async () => {
    if (!selectedSession) return
    
    try {
      setIsSaving(true)
      
      const updateData = {
        id: selectedSession.id,
        tradesTaken: formData.tradesWon + formData.tradesLost,
        tradesWon: formData.tradesWon,
        tradesLost: formData.tradesLost,
        profitLoss: formData.profitLoss,
        emotions: formData.emotions,
        mistakes: formData.mistakes,
        improvements: formData.improvements,
        notes: formData.notes,
        rating: formData.rating,
      }

      await apiPut('/api/sessions', updateData)
      
      toast({
        title: language === 'ar' ? 'تم التحديث' : 'Updated',
        description: language === 'ar' ? 'تم تحديث الجلسة بنجاح' : 'Session updated successfully',
      })

      setShowEditDialog(false)
      setSelectedSession(null)
      setFormData(initialFormData)
      
      // Refresh the list
      fetchSessions()
    } catch (err) {
      console.error('Error updating session:', err)
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في تحديث الجلسة' : 'Failed to update session',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Delete session
  const handleDeleteSession = async () => {
    if (!selectedSession) return
    
    try {
      setIsSaving(true)
      
      await apiDelete(`/api/sessions?id=${selectedSession.id}`)
      
      toast({
        title: language === 'ar' ? 'تم الحذف' : 'Deleted',
        description: language === 'ar' ? 'تم حذف الجلسة بنجاح' : 'Session deleted successfully',
      })

      setShowDeleteDialog(false)
      setSelectedSession(null)
      
      // Refresh the list
      fetchSessions()
    } catch (err) {
      console.error('Error deleting session:', err)
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل في حذف الجلسة' : 'Failed to delete session',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDiscardSession = () => {
    setShowSaveDialog(false)
    setElapsedTime(0)
    setTradesPlaced(0)
    setFormData(initialFormData)
  }

  const openEditDialog = (session: SessionReview) => {
    setSelectedSession(session)
    setFormData({
      name: session.notes || '',
      session: session.session,
      notes: session.notes || '',
      tags: '',
      tradesWon: session.tradesWon,
      tradesLost: session.tradesLost,
      profitLoss: session.profitLoss,
      emotions: session.emotions || '',
      mistakes: session.mistakes || '',
      improvements: session.improvements || '',
      rulesFollowed: session.rulesFollowed ?? true,
      rating: session.rating ?? 3,
    })
    setShowEditDialog(true)
  }

  const openDeleteDialog = (session: SessionReview) => {
    setSelectedSession(session)
    setShowDeleteDialog(true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getSessionName = (sessionType: string): string => {
    const names: Record<string, string> = {
      london: language === 'ar' ? 'جلسة لندن' : 'London Session',
      new_york: language === 'ar' ? 'جلسة نيويورك' : 'New York Session',
      tokyo: language === 'ar' ? 'جلسة طوكيو' : 'Tokyo Session',
      asian: language === 'ar' ? 'جلسة آسيا' : 'Asian Session',
    }
    return names[sessionType] || sessionType
  }

  const getStatusBadge = () => {
    switch (status) {
      case 'recording':
        return (
          <Badge variant="default" className="bg-red-500 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse" />
            {t('sessions.recording')}
          </Badge>
        )
      case 'paused':
        return (
          <Badge variant="default" className="bg-yellow-500">
            {t('sessions.paused')}
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            {t('sessions.stopped')}
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Session Recording */}
      <Card className="border-2 border-dashed">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                {t('sessions.currentSession')}
              </CardTitle>
              <CardDescription>{t('sessions.subtitle')}</CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          {/* Timer Display */}
          <div className="text-center mb-6">
            <div className="text-6xl font-mono font-bold mb-4">
              {formatTime(elapsedTime)}
            </div>
            <div className="flex items-center justify-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                <span>{t('sessions.duration')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span>{t('sessions.tradesPlaced')}: {tradesPlaced}</span>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4">
            {status === 'stopped' && (
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-lg px-8"
                onClick={handleStartRecording}
              >
                <Play className="h-5 w-5 mr-2" />
                {t('sessions.startRecording')}
              </Button>
            )}

            {status === 'recording' && (
              <>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handlePauseRecording}
                >
                  <Pause className="h-5 w-5 mr-2" />
                  {t('sessions.pauseRecording')}
                </Button>
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={handleStopRecording}
                >
                  <Square className="h-5 w-5 mr-2" />
                  {t('sessions.stopRecording')}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setTradesPlaced((prev) => prev + 1)}
                >
                  <TrendingUp className="h-5 w-5 mr-2" />
                  + {t('sessions.tradesPlaced')}
                </Button>
              </>
            )}

            {status === 'paused' && (
              <>
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleResumeRecording}
                >
                  <Play className="h-5 w-5 mr-2" />
                  {t('sessions.resumeRecording')}
                </Button>
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={handleStopRecording}
                >
                  <Square className="h-5 w-5 mr-2" />
                  {t('sessions.stopRecording')}
                </Button>
              </>
            )}
          </div>

          {/* Quick Stats during recording */}
          {status !== 'stopped' && (
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <TrendingUp className="h-5 w-5 mx-auto mb-2 text-green-500" />
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'رابحة' : 'Winning'}
                </p>
                <p className="text-xl font-bold">{formData.tradesWon}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <TrendingDown className="h-5 w-5 mx-auto mb-2 text-red-500" />
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'خاسرة' : 'Losing'}
                </p>
                <p className="text-xl font-bold">{formData.tradesLost}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Target className="h-5 w-5 mx-auto mb-2 text-blue-500" />
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'تعادل' : 'Breakeven'}
                </p>
                <p className="text-xl font-bold">{tradesPlaced - formData.tradesWon - formData.tradesLost}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('sessions.sessionHistory')}</CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'سجل جلسات التداول السابقة' 
                  : 'History of your trading sessions'}
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchSessions}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <p>{error}</p>
              <Button variant="outline" className="mt-4" onClick={fetchSessions}>
                {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {sessionHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('sessions.noSessions')}</p>
                </div>
              ) : (
                sessionHistory.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">
                          {getSessionName(session.session)}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(session.date)}
                        </p>
                      </div>
                      <div className="text-right flex items-start gap-2">
                        <div>
                          <p className={`text-sm font-medium ${
                            session.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {session.profitLoss >= 0 ? '+' : ''}${session.profitLoss.toFixed(2)}
                          </p>
                          {session.rating && (
                            <div className="flex justify-end mt-1">
                              {[...Array(5)].map((_, i) => (
                                <span 
                                  key={i} 
                                  className={`text-xs ${i < session.rating! ? 'text-yellow-500' : 'text-gray-300'}`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span>{t('sessions.tradesPlaced')}: {session.tradesTaken}</span>
                      <span className="text-green-500">{language === 'ar' ? 'رابحة:' : 'Won:'} {session.tradesWon}</span>
                      <span className="text-red-500">{language === 'ar' ? 'خاسرة:' : 'Lost:'} {session.tradesLost}</span>
                    </div>
                    {session.notes && (
                      <p className="text-sm text-muted-foreground mt-2 italic">
                        &quot;{session.notes}&quot;
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(session)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        {language === 'ar' ? 'تعديل' : 'Edit'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => openDeleteDialog(session)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        {language === 'ar' ? 'حذف' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Session Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('sessions.saveSession')}</DialogTitle>
            <DialogDescription>
              {t('sessions.duration')}: {formatTime(elapsedTime)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="sessionType">
                {language === 'ar' ? 'نوع الجلسة' : 'Session Type'}
              </Label>
              <Select
                value={formData.session}
                onValueChange={(value) => setFormData({ ...formData, session: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="london">{language === 'ar' ? 'جلسة لندن' : 'London Session'}</SelectItem>
                  <SelectItem value="new_york">{language === 'ar' ? 'جلسة نيويورك' : 'New York Session'}</SelectItem>
                  <SelectItem value="tokyo">{language === 'ar' ? 'جلسة طوكيو' : 'Tokyo Session'}</SelectItem>
                  <SelectItem value="asian">{language === 'ar' ? 'جلسة آسيا' : 'Asian Session'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tradesWon">
                  {language === 'ar' ? 'صفقات رابحة' : 'Winning Trades'}
                </Label>
                <Input
                  id="tradesWon"
                  type="number"
                  min="0"
                  value={formData.tradesWon}
                  onChange={(e) => setFormData({ ...formData, tradesWon: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tradesLost">
                  {language === 'ar' ? 'صفقات خاسرة' : 'Losing Trades'}
                </Label>
                <Input
                  id="tradesLost"
                  type="number"
                  min="0"
                  value={formData.tradesLost}
                  onChange={(e) => setFormData({ ...formData, tradesLost: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profitLoss">
                {language === 'ar' ? 'الربح/الخسارة ($)' : 'Profit/Loss ($)'}
              </Label>
              <Input
                id="profitLoss"
                type="number"
                step="0.01"
                value={formData.profitLoss}
                onChange={(e) => setFormData({ ...formData, profitLoss: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">
                {language === 'ar' ? 'التقييم (1-5)' : 'Rating (1-5)'}
              </Label>
              <Select
                value={formData.rating.toString()}
                onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <SelectItem key={r} value={r.toString()}>
                      {'★'.repeat(r)}{'☆'.repeat(5 - r)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t('sessions.notes')}</Label>
              <Textarea
                id="notes"
                placeholder={language === 'ar' ? 'كيف كانت الجلسة؟ ماذا تعلمت؟' : 'How did the session go? What did you learn?'}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emotions">
                {language === 'ar' ? 'المشاعر' : 'Emotions'}
              </Label>
              <Textarea
                id="emotions"
                placeholder={language === 'ar' ? 'كيف شعرت أثناء التداول؟' : 'How did you feel during trading?'}
                value={formData.emotions}
                onChange={(e) => setFormData({ ...formData, emotions: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mistakes">
                {language === 'ar' ? 'الأخطاء' : 'Mistakes'}
              </Label>
              <Textarea
                id="mistakes"
                placeholder={language === 'ar' ? 'ما الأخطاء التي ارتكبتها؟' : 'What mistakes did you make?'}
                value={formData.mistakes}
                onChange={(e) => setFormData({ ...formData, mistakes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="improvements">
                {language === 'ar' ? 'التحسينات' : 'Improvements'}
              </Label>
              <Textarea
                id="improvements"
                placeholder={language === 'ar' ? 'ما الذي يمكن تحسينه؟' : 'What can be improved?'}
                value={formData.improvements}
                onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleDiscardSession}>
              <X className="h-4 w-4 mr-2" />
              {t('sessions.discardSession')}
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700" 
              onClick={handleSaveSession}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {t('sessions.saveSession')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Session Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{language === 'ar' ? 'تعديل الجلسة' : 'Edit Session'}</DialogTitle>
            <DialogDescription>
              {selectedSession && formatDate(selectedSession.date)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editTradesWon">
                  {language === 'ar' ? 'صفقات رابحة' : 'Winning Trades'}
                </Label>
                <Input
                  id="editTradesWon"
                  type="number"
                  min="0"
                  value={formData.tradesWon}
                  onChange={(e) => setFormData({ ...formData, tradesWon: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editTradesLost">
                  {language === 'ar' ? 'صفقات خاسرة' : 'Losing Trades'}
                </Label>
                <Input
                  id="editTradesLost"
                  type="number"
                  min="0"
                  value={formData.tradesLost}
                  onChange={(e) => setFormData({ ...formData, tradesLost: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editProfitLoss">
                {language === 'ar' ? 'الربح/الخسارة ($)' : 'Profit/Loss ($)'}
              </Label>
              <Input
                id="editProfitLoss"
                type="number"
                step="0.01"
                value={formData.profitLoss}
                onChange={(e) => setFormData({ ...formData, profitLoss: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editRating">
                {language === 'ar' ? 'التقييم (1-5)' : 'Rating (1-5)'}
              </Label>
              <Select
                value={formData.rating.toString()}
                onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <SelectItem key={r} value={r.toString()}>
                      {'★'.repeat(r)}{'☆'.repeat(5 - r)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editNotes">{t('sessions.notes')}</Label>
              <Textarea
                id="editNotes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editEmotions">
                {language === 'ar' ? 'المشاعر' : 'Emotions'}
              </Label>
              <Textarea
                id="editEmotions"
                value={formData.emotions}
                onChange={(e) => setFormData({ ...formData, emotions: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editMistakes">
                {language === 'ar' ? 'الأخطاء' : 'Mistakes'}
              </Label>
              <Textarea
                id="editMistakes"
                value={formData.mistakes}
                onChange={(e) => setFormData({ ...formData, mistakes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editImprovements">
                {language === 'ar' ? 'التحسينات' : 'Improvements'}
              </Label>
              <Textarea
                id="editImprovements"
                value={formData.improvements}
                onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              <X className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700" 
              onClick={handleUpdateSession}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'ar' ? 'حذف الجلسة' : 'Delete Session'}</DialogTitle>
            <DialogDescription>
              {language === 'ar' 
                ? 'هل أنت متأكد من حذف هذه الجلسة؟ لا يمكن التراجع عن هذا الإجراء.' 
                : 'Are you sure you want to delete this session? This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteSession}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {language === 'ar' ? 'حذف' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
