'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/lib/i18n'
import { TrendingUp, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'

interface LoginPageProps {
  onLogin: (data: { email: string; password: string }) => void
  onSignup: () => void
  onBack: () => void
}

export function LoginPage({ onLogin, onSignup, onBack }: LoginPageProps) {
  const { language } = useI18n()
  const isRTL = language === 'ar'
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.email.trim()) {
      newErrors.email = isRTL ? 'البريد الإلكتروني مطلوب' : 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = isRTL ? 'البريد الإلكتروني غير صالح' : 'Invalid email address'
    }
    
    if (!formData.password) {
      newErrors.password = isRTL ? 'كلمة المرور مطلوبة' : 'Password is required'
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      onLogin({
        email: formData.email,
        password: formData.password
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''} mr-2`} />
          {isRTL ? 'العودة' : 'Back'}
        </Button>

        <Card className="border-green-500/20">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">
              {isRTL ? 'تسجيل الدخول' : 'Welcome Back'}
            </CardTitle>
            <CardDescription>
              {isRTL 
                ? 'سجل دخولك للمتابعة'
                : 'Sign in to continue to your dashboard'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">{isRTL ? 'البريد الإلكتروني' : 'Email'}</Label>
              <div className="relative">
                <Mail className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
                <Input
                  id="email"
                  type="email"
                  placeholder={isRTL ? 'example@email.com' : 'example@email.com'}
                  className={`${isRTL ? 'pr-10' : 'pl-10'} ${errors.email ? 'border-red-500' : ''}`}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">{isRTL ? 'كلمة المرور' : 'Password'}</Label>
              <div className="relative">
                <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'} ${errors.password ? 'border-red-500' : ''}`}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-3 text-muted-foreground hover:text-foreground`}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button className="text-sm text-green-500 hover:underline">
                {isRTL ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
              </button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              className="w-full bg-green-500 hover:bg-green-600" 
              onClick={handleSubmit}
            >
              {isRTL ? 'تسجيل الدخول' : 'Sign In'}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              {isRTL ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
              <button onClick={onSignup} className="text-green-500 hover:underline font-medium">
                {isRTL ? 'إنشاء حساب' : 'Sign Up'}
              </button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
