'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n'
import { TrendingUp, ArrowLeft, Loader2, Eye, EyeOff, Mail, Shield } from 'lucide-react'
import Link from 'next/link'

interface LoginPageProps {
  onLogin: (data: { email: string; password: string }) => void
  onSignup: () => void
  onBack: () => void
}

export function LoginPage({ onLogin, onSignup, onBack }: LoginPageProps) {
  const { t, language } = useI18n()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center p-4">
        <div className="w-8 h-8 rounded-full border-4 border-green-500 border-t-transparent animate-spin" />
      </div>
    )
  }
  
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requiresVerification, setRequiresVerification] = useState(false)
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [show2FA, setShow2FA] = useState(false)
  const [tempToken, setTempToken] = useState<string | null>(null)
  const [twoFactorCode, setTwoFactorCode] = useState('')
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
        // ✅ معالجة Rate Limiting (429)
        if (response.status === 429) {
          const retryAfter = data.retryAfter || 60
          setError(
            language === 'ar' 
              ? `عدد محاولات كثيرة، يرجى الانتظار ${retryAfter} ثانية`
              : `Too many attempts. Please wait ${retryAfter} seconds.`
          )
          setIsLoading(false)
          return
        }
        
        setError(data.error || (language === 'ar' ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials'))
        if (data.requiresVerification) {
          setRequiresVerification(true)
          setVerifyEmail(data.email || formData.email)
        }
        setIsLoading(false)
        return
      }

      // التحقق من 2FA
      if (data.twoFactorRequired) {
        setShow2FA(true)
        setTempToken(data.tempToken)
        setIsLoading(false)
        return
      }
      
      setRequiresVerification(false)
      setVerifyEmail(null)
      await onLogin(formData)
    } catch (err) {
      setError(language === 'ar' ? 'حدث خطأ في الاتصال' : 'Connection error')
    }

    setIsLoading(false)
  }

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: twoFactorCode, tempToken })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || (language === 'ar' ? 'كود التحقق غير صحيح' : 'Invalid 2FA code'))
        setIsLoading(false)
        return
      }

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

          {!show2FA ? (
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
                          ? 'تم إرسال رابط التأكيد إلى بريدك الإلكتروني.'
                          : 'A verification link was sent to your email.'}
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
                        ) : language === 'ar' ? 'إعادة إرسال' : 'Resend'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {emailSent && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-sm">
                  {language === 'ar' 
                    ? 'تم إرسال رابط التأكيد بنجاح!'
                    : 'Verification link sent successfully!'}
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
              
              <div className="text-center">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition"
                >
                  {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handle2FASubmit} className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto">
                  <Shield className="h-6 w-6 text-yellow-500" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {language === 'ar' ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}
                </h3>
                <p className="text-sm text-zinc-400">
                  {language === 'ar' 
                    ? 'يرجى إدخال الكود المكون من 6 أرقام من تطبيق المصادقة الخاص بك.' 
                    : 'Please enter the 6-digit code from your authenticator app.'}
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm text-center">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-[0.5em] font-mono h-14 bg-white/5 border-white/10"
                  autoFocus
                  required
                />
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-6"
                  disabled={isLoading || twoFactorCode.length !== 6}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    language === 'ar' ? 'تحقق ودخول' : 'Verify & Login'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full text-zinc-500"
                  onClick={() => setShow2FA(false)}
                >
                  {language === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
                </Button>
              </div>
            </form>
          )}

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