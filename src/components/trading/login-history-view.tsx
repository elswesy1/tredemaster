'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useI18n } from '@/lib/i18n'
import { getApiHeaders } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import {
  History,
  Monitor,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  Smartphone,
  Laptop,
  Tablet,
  RefreshCw,
  Loader2,
  LogOut,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoginEntry {
  id: string
  date: string
  ipAddress: string
  device: {
    browser: string
    os: string
    device: string
  }
  successful: boolean
  method: string
}

export function LoginHistoryView() {
  const { t, language } = useI18n()
  const isRTL = language === 'ar'
  const { toast } = useToast()
  
  const [history, setHistory] = useState<LoginEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/auth/login-history', {
        method: 'GET',
        headers: getApiHeaders(),
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch history')
      }
      
      const data = await response.json()
      setHistory(data.history || [])
    } catch (error) {
      console.error('Error fetching login history:', error)
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل في تحميل سجل الدخول' : 'Failed to load login history',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [isRTL, toast])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'هاتف محمول':
      case 'mobile':
        return <Smartphone className="h-4 w-4" />
      case 'تابلت':
      case 'tablet':
        return <Tablet className="h-4 w-4" />
      default:
        return <Laptop className="h-4 w-4" />
    }
  }

  const getMethodBadge = (method: string) => {
    const methodLabels: Record<string, { labelAr: string; labelEn: string; color: string }> = {
      password: { labelAr: 'كلمة مرور', labelEn: 'Password', color: 'bg-blue-500/10 text-blue-500' },
      oauth: { labelAr: 'تسجيل اجتماعي', labelEn: 'OAuth', color: 'bg-purple-500/10 text-purple-500' },
      register: { labelAr: 'تسجيل جديد', labelEn: 'Register', color: 'bg-green-500/10 text-green-500' },
      '2fa': { labelAr: 'مصادقة ثنائية', labelEn: '2FA', color: 'bg-amber-500/10 text-amber-500' },
    }
    const m = methodLabels[method] || { labelAr: method, labelEn: method, color: 'bg-gray-500/10 text-gray-500' }
    return (
      <Badge variant="outline" className={m.color}>
        {isRTL ? m.labelAr : m.labelEn}
      </Badge>
    )
  }

  // Stats
  const totalLogins = history.length
  const successfulLogins = history.filter(h => h.successful).length
  const failedLogins = totalLogins - successfulLogins

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-500" />
            {isRTL ? 'سجل تسجيلات الدخول' : 'Login History'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {isRTL ? 'تتبع جميع عمليات تسجيل الدخول إلى حسابك' : 'Track all login attempts to your account'}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchHistory}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          {isRTL ? 'تحديث' : 'Refresh'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <History className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalLogins}</div>
                <div className="text-sm text-muted-foreground">
                  {isRTL ? 'إجمالي المحاولات' : 'Total Attempts'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/10 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">{successfulLogins}</div>
                <div className="text-sm text-muted-foreground">
                  {isRTL ? 'ناجحة' : 'Successful'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-500/10 border-red-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">{failedLogins}</div>
                <div className="text-sm text-muted-foreground">
                  {isRTL ? 'فاشلة' : 'Failed'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Warning */}
      {failedLogins > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-amber-500">
                  {isRTL ? 'تنبيه أمني' : 'Security Alert'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isRTL 
                    ? `تم اكتشاف ${failedLogins} محاولات دخول فاشلة. إذا لم تكن أنت، يُنصح بتغيير كلمة المرور.`
                    : `${failedLogins} failed login attempts detected. If this wasn't you, consider changing your password.`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Login History List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {isRTL ? 'آخر النشاطات' : 'Recent Activity'}
          </CardTitle>
          <CardDescription>
            {isRTL ? 'آخر 20 عملية تسجيل دخول' : 'Last 20 login attempts'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{isRTL ? 'لا يوجد سجل دخول بعد' : 'No login history yet'}</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {Array.isArray(history) && history.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border transition-colors",
                      entry.successful 
                        ? "border-green-500/10 bg-green-500/5 hover:bg-green-500/10" 
                        : "border-red-500/10 bg-red-500/5 hover:bg-red-500/10"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {/* Status Icon */}
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        entry.successful ? "bg-green-500/20" : "bg-red-500/20"
                      )}>
                        {entry.successful ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      
                      {/* Device Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(entry.device.device)}
                          <span className="font-medium">
                            {entry.device.browser} • {entry.device.os}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          <span>{entry.ipAddress}</span>
                          <span className="text-muted-foreground/50">•</span>
                          <span>{entry.device.device}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Side */}
                    <div className="flex flex-col items-end gap-2">
                      {getMethodBadge(entry.method)}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(entry.date)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
