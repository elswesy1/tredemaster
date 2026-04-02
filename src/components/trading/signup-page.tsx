'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n'
import { TrendingUp, ArrowLeft, Loader2, Check, X, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SignupPageProps {
  onSignup: (data: { email: string; password: string; name: string }) => void
  onLogin: () => void
  onBack: () => void
}

// التحقق من قوة كلمة المرور
interface PasswordStrength {
  hasMinLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasSpecial: boolean
}

function checkPasswordStrength(password: string): PasswordStrength {
  return {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  }
}

function getPasswordScore(strength: PasswordStrength): number {
  let score = 0
  if (strength.hasMinLength) score++
  if (strength.hasUppercase) score++
  if (strength.hasLowercase) score++
  if (strength.hasNumber) score++
  if (strength.hasSpecial) score++
  return score
}

export function SignupPage({ onSignup, onLogin, onBack }: SignupPageProps) {
  const { t, language } = useI18n()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const passwordStrength = checkPasswordStrength(formData.password)
  const passwordScore = getPasswordScore(passwordStrength)
  const isPasswordValid = passwordScore === 5

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // التحقق من تطابق كلمة المرور
    if (formData.password !== formData.confirmPassword) {
      setError(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match')
      return
    }

    // التحقق من قوة كلمة المرور
    if (!isPasswordValid) {
      setError(language === 'ar' ? 'كلمة المرور لا تستوفي المتطلبات' : 'Password does not meet requirements')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || (language === 'ar' ? 'حدث خطأ أثناء التسجيل' : 'Registration failed'))
        setIsLoading(false)
        return
      }

      // نجاح التسجيل - استدعاء callback
      await onSignup(formData)
    } catch (err) {
      setError(language === 'ar' ? 'حدث خطأ في الاتصال' : 'Connection error')
    }

    setIsLoading(false)
  }

  const requirements = [
    { key: 'hasMinLength', text: language === 'ar' ? '8 أحرف على الأقل' : 'At least 8 characters' },
    { key: 'hasUppercase', text: language === 'ar' ? 'حرف كبير واحد (A-Z)' : 'One uppercase letter (A-Z)' },
    { key: 'hasLowercase', text: language === 'ar' ? 'حرف صغير واحد (a-z)' : 'One lowercase letter (a-z)' },
    { key: 'hasNumber', text: language === 'ar' ? 'رقم واحد (0-9)' : 'One number (0-9)' },
    { key: 'hasSpecial', text: language === 'ar' ? 'رمز خاص واحد (!@#$...)' : 'One special character (!@#$...)' },
  ]

  const getStrengthColor = () => {
    if (passwordScore <= 1) return 'bg-red-500'
    if (passwordScore <= 2) return 'bg-orange-500'
    if (passwordScore <= 3) return 'bg-yellow-500'
    if (passwordScore <= 4) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getStrengthText = () => {
    if (passwordScore <= 1) return language === 'ar' ? 'ضعيفة جداً' : 'Very Weak'
    if (passwordScore <= 2) return language === 'ar' ? 'ضعيفة' : 'Weak'
    if (passwordScore <= 3) return language === 'ar' ? 'متوسطة' : 'Medium'
    if (passwordScore <= 4) return language === 'ar' ? 'جيدة' : 'Good'
    return language === 'ar' ? 'قوية' : 'Strong'
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
            {t('auth.createAccount')}
          </CardTitle>
          <CardDescription>
            {t('auth.enterDetails')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label>{t('auth.name')}</Label>
              <Input
                placeholder={t('auth.enterName')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

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

              {/* شريط قوة كلمة المرور */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          'h-1 flex-1 rounded-full transition-colors',
                          i <= passwordScore ? getStrengthColor() : 'bg-muted'
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar' ? 'القوة:' : 'Strength:'} {getStrengthText()}
                  </p>
                </div>
              )}

              {/* متطلبات كلمة المرور */}
              {formData.password && (
                <div className="space-y-1 p-2 rounded-lg bg-muted/50">
                  {requirements.map((req) => (
                    <div key={req.key} className="flex items-center gap-2 text-xs">
                      {passwordStrength[req.key as keyof PasswordStrength] ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <X className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span className={cn(
                        passwordStrength[req.key as keyof PasswordStrength]
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-muted-foreground'
                      )}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('auth.confirmPassword')}</Label>
              <Input
                type="password"
                placeholder="********"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-500">
                  {language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match'}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
              disabled={isLoading || !isPasswordValid}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('auth.create')
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              {t('auth.haveAccount')}{' '}
              <Button variant="link" className="p-0" onClick={onLogin}>
                {t('auth.login')}
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
