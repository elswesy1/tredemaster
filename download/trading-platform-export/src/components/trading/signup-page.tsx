'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/lib/i18n'
import { TrendingUp, Mail, Lock, User, Eye, EyeOff, Check, X, ArrowLeft } from 'lucide-react'

interface SignupPageProps {
  onSignup: (data: { email: string; password: string; name: string }) => void
  onLogin: () => void
  onBack: () => void
}

export function SignupPage({ onSignup, onLogin, onBack }: SignupPageProps) {
  const { language } = useI18n()
  const isRTL = language === 'ar'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const passwordChecks = [
    { label: isRTL ? '8 أحرف على الأقل' : 'At least 8 characters', valid: formData.password.length >= 8 },
    { label: isRTL ? 'حرف كبير' : 'Uppercase letter', valid: /[A-Z]/.test(formData.password) },
    { label: isRTL ? 'حرف صغير' : 'Lowercase letter', valid: /[a-z]/.test(formData.password) },
    { label: isRTL ? 'رقم' : 'Number', valid: /[0-9]/.test(formData.password) },
  ]

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = isRTL ? 'الاسم مطلوب' : 'Name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = isRTL ? 'البريد الإلكتروني مطلوب' : 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = isRTL ? 'البريد الإلكتروني غير صالح' : 'Invalid email address'
    }
    
    if (!formData.password) {
      newErrors.password = isRTL ? 'كلمة المرور مطلوبة' : 'Password is required'
    } else if (!passwordChecks.every(c => c.valid)) {
      newErrors.password = isRTL ? 'كلمة المرور لا تستوفي الشروط' : 'Password does not meet requirements'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match'
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      onSignup({
        name: formData.name,
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
              {isRTL ? 'إنشاء حساب جديد' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {isRTL 
                ? 'ابدأ رحلتك في التداول الذكي'
                : 'Start your smart trading journey'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">{isRTL ? 'الاسم الكامل' : 'Full Name'}</Label>
              <div className="relative">
                <User className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
                <Input
                  id="name"
                  type="text"
                  placeholder={isRTL ? 'أدخل اسمك' : 'Enter your name'}
                  className={`${isRTL ? 'pr-10' : 'pl-10'} ${errors.name ? 'border-red-500' : ''}`}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

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
              
              {/* Password Strength Indicators */}
              {formData.password && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {passwordChecks.map((check, index) => (
                    <div key={index} className={`flex items-center gap-2 text-xs ${check.valid ? 'text-green-500' : 'text-muted-foreground'}`}>
                      {check.valid ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {check.label}
                    </div>
                  ))}
                </div>
              )}
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}</Label>
              <div className="relative">
                <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-4 w-4 text-muted-foreground`} />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`${isRTL ? 'pr-10' : 'pl-10'} ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              className="w-full bg-green-500 hover:bg-green-600" 
              onClick={handleSubmit}
            >
              {isRTL ? 'إنشاء الحساب' : 'Create Account'}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              {isRTL ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
              <button onClick={onLogin} className="text-green-500 hover:underline font-medium">
                {isRTL ? 'تسجيل الدخول' : 'Login'}
              </button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
