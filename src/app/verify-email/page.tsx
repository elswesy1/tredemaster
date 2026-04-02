'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  Mail, 
  Loader2, 
  ArrowRight,
  RefreshCw,
  Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('pending')
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState<string>('')
  const [isResending, setIsResending] = useState(false)

  const token = searchParams.get('token')
  const emailParam = searchParams.get('email')
  const success = searchParams.get('success')
  const errorParam = searchParams.get('error')

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam)
    }
    
    if (success === 'true') {
      setStatus('success')
      return
    }
    
    if (errorParam) {
      setStatus('error')
      switch (errorParam) {
        case 'missing-params':
          setError('رابط التأكيد غير صالح')
          break
        case 'user-not-found':
          setError('المستخدم غير موجود')
          break
        case 'invalid-token':
          setError('رابط التأكيد غير صحيح')
          break
        case 'expired-token':
          setError('رابط التأكيد منتهي الصلاحية')
          break
        default:
          setError('حدث خطأ أثناء التحقق')
      }
      return
    }

    if (token && emailParam) {
      setStatus('loading')
      // التحقق التلقائي
      verifyEmail(token, emailParam)
    }
  }, [token, emailParam, success, errorParam])

  const verifyEmail = async (token: string, email: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`)
      
      if (response.redirected) {
        // إعادة التوجيه تمت بنجاح
        const redirectUrl = new URL(response.url)
        if (redirectUrl.searchParams.get('success') === 'true') {
          setStatus('success')
        } else {
          setStatus('error')
          setError(redirectUrl.searchParams.get('error') || 'حدث خطأ')
        }
      }
    } catch (err) {
      setStatus('error')
      setError('حدث خطأ أثناء التحقق')
    }
  }

  const handleResendVerification = async () => {
    if (!email) return
    
    setIsResending(true)
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setStatus('pending')
        setError(null)
        alert('تم إرسال رابط التأكيد الجديد إلى بريدك الإلكتروني')
      } else {
        alert(data.error || 'حدث خطأ')
      }
    } catch (err) {
      alert('حدث خطأ أثناء إرسال البريد')
    } finally {
      setIsResending(false)
    }
  }

  const handleGoToLogin = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">تأكيد البريد الإلكتروني</CardTitle>
          <CardDescription>
            TradeMaster - منصة التداول الاحترافية
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Loading State */}
          {status === 'loading' && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">جاري التحقق من البريد الإلكتروني...</p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">تم تأكيد البريد بنجاح! 🎉</h3>
              <p className="text-muted-foreground mb-6">
                تم تأكيد بريدك الإلكتروني بنجاح. يمكنك الآن تسجيل الدخول والبدء في استخدام المنصة.
              </p>
              <Button 
                onClick={handleGoToLogin}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
              >
                الذهاب للصفحة الرئيسية
                <ArrowRight className="h-4 w-4 mr-2" />
              </Button>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-red-500">فشل التحقق</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              
              {error === 'رابط التأكيد منتهي الصلاحية' && (
                <div className="space-y-4 mt-6">
                  <p className="text-sm text-muted-foreground">
                    يمكنك طلب رابط تأكيد جديد
                  </p>
                  <div className="space-y-2">
                    <Label>البريد الإلكتروني</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="أدخل بريدك الإلكتروني"
                        dir="ltr"
                      />
                      <Button 
                        onClick={handleResendVerification}
                        disabled={isResending || !email}
                        variant="outline"
                      >
                        {isResending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              <Button 
                onClick={handleGoToLogin}
                variant="outline"
                className="w-full mt-4"
              >
                العودة للصفحة الرئيسية
              </Button>
            </div>
          )}

          {/* Pending State - Waiting for verification */}
          {status === 'pending' && !token && (
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-12 w-12 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">تحقق من بريدك الإلكتروني</h3>
              <p className="text-muted-foreground mb-4">
                لقد أرسلنا رابط تأكيد إلى بريدك الإلكتروني. يرجى الضغط على الرابط لتأكيد حسابك.
              </p>
              
              {emailParam && (
                <Badge variant="outline" className="mb-4">
                  <Mail className="h-3 w-3 mr-1" />
                  {emailParam}
                </Badge>
              )}
              
              <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground mb-6">
                <p>لم تستلم البريد؟ تحقق من مجلد البريد المزعج (Spam)</p>
                <p className="mt-1">الرابط صالح لمدة 24 ساعة</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  أعد إرسال رابط التأكيد
                </p>
                <div className="flex gap-2">
                  <Input 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="أدخل بريدك الإلكتروني"
                    dir="ltr"
                  />
                  <Button 
                    onClick={handleResendVerification}
                    disabled={isResending || !email}
                    className="bg-green-500"
                  >
                    {isResending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'إرسال'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
