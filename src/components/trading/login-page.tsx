'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n'
import { TrendingUp, ArrowLeft, Loader2, Eye, EyeOff, Mail } from 'lucide-react'

interface LoginPageProps {
  onLogin: (data: { email: string; password: string }) => void
  onSignup: () => void
  onBack: () => void
}

export function LoginPage({ onLogin, onSignup, onBack }: LoginPageProps) {
  const { t, language } = useI18n()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requiresVerification, setRequiresVerification] = useState(false)
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || (language === 'ar' ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials'))
        if (data.requiresVerification) {
          setRequiresVerification(true)
          setVerifyEmail(data.email || formData.email)
        }
        setIsLoading(false)
        return
      }
      
      // إعادة تعيين حالة التحقق عند النجاح
      setRequiresVerification(false)
      setVerifyEmail(null)

      // نجاح الدخول - استدعاء callback
      await onLogin(formData)
    } catch (err) {
      setError(language === 'ar' ? 'حدث خطأ في الاتصال' : 'Connection error')
    }

    setIsLoading(false)
  }

  const handleResendVerification = async () => {
    if (!verifyEmail) return
    
    setResendingEmail(true)
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifyEmail })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setEmailSent(true)
        setError(null)
      } else {
        setError(data.error || (language === 'ar' ? 'فشل في إرسال البريد' : 'Failed to send email'))
      }
    } catch (err) {
      setError(language === 'ar' ? 'حدث خطأ في الاتصال' : 'Connection error')
    }
    setResendingEmail(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-7 w-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            {t('auth.loginTitle')}
          </CardTitle>
          <CardDescription>
            {t('auth.loginSubtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && !requiresVerification && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                {error}
              </div>
            )}
            
            {requiresVerification && !emailSent && (
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 text-sm">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium mb-2">
                      {language === 'ar' ? 'يرجى تأكيد بريدك الإلكتروني' : 'Please verify your email'}
                    </p>
                    <p className="mb-3">
                      {language === 'ar' 
                        ? 'تم إرسال رابط التأكيد إلى بريدك الإلكتروني. إذا لم تستلمه، يمكنك إعادة الإرسال.'
                        : 'A verification link was sent to your email. If you didn\'t receive it, you can resend.'}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResendVerification}
                      disabled={resendingEmail}
                    >
                      {resendingEmail ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : language === 'ar' ? 'إعادة إرسال رابط التأكيد' : 'Resend verification link'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {emailSent && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-sm">
                {language === 'ar' 
                  ? 'تم إرسال رابط التأكيد إلى بريدك الإلكتروني بنجاح!'
                  : 'Verification link sent to your email successfully!'}
              </div>
            )}

            <div className="space-y-2">
              <Label>{t('auth.email')}</Label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>{t('auth.password')}</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                language === 'ar' ? 'دخول' : 'Login'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              {t('auth.noAccount')}{' '}
              <Button variant="link" className="p-0" onClick={onSignup}>
                {t('auth.signup')}
              </Button>
            </p>
          </div>

          <Button variant="ghost" className="w-full mt-4" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('auth.back')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
