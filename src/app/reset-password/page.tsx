'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, CheckCircle, XCircle } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [tokenValid, setTokenValid] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setTokenValid(false)
    }
  }, [token])

  const passwordRequirements = [
    { met: password.length >= 8, text: '8 أحرف على الأقل' },
    { met: /[A-Z]/.test(password), text: 'حرف كبير' },
    { met: /[a-z]/.test(password), text: 'حرف صغير' },
    { met: /[0-9]/.test(password), text: 'رقم' },
    { met: /[^A-Za-z0-9]/.test(password), text: 'رمز خاص' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('الباسوورد غير متطابق')
      setLoading(false)
      return
    }

    if (!passwordRequirements.every(r => r.met)) {
      setError('الباسوورد لا يفي بالمتطلبات')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => router.push('/login'), 3000)
      } else {
        setError(data.error || 'حدث خطأ')
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال')
    } finally {
      setLoading(false)
    }
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-black to-emerald-950 p-4">
        <Card className="w-full max-w-md bg-gray-900/50 border-emerald-500/20">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">رابط غير صالح</h2>
            <p className="text-gray-400">
              هذا الرابط غير صالح أو منتهي الصلاحية
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-black to-emerald-950 p-4">
        <Card className="w-full max-w-md bg-gray-900/50 border-emerald-500/20">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">تم التحديث!</h2>
            <p className="text-gray-400">
              تم تحديث الباسوورد بنجاح. جاري التحويل لصفحة تسجيل الدخول...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-black to-emerald-950 p-4">
      <Card className="w-full max-w-md bg-gray-900/50 border-emerald-500/20">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <Lock className="w-12 h-12 text-emerald-400" />
          </div>
          <CardTitle className="text-2xl text-center text-white">
            تعيين باسوورد جديد
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-red-400 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">الباسوورد الجديد</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-emerald-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            
            {/* متطلبات الباسوورد */}
            <div className="space-y-1">
              {passwordRequirements.map((req, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? 'bg-emerald-500' : 'bg-gray-700'}`}>
                    {req.met && <CheckCircle className="w-3 h-3 text-black" />}
                  </div>
                  <span className={req.met ? 'text-emerald-400' : 'text-gray-500'}>
                    {req.text}
                  </span>
                </div>
              ))}
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">تأكيد الباسوورد</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-black/50 border border-emerald-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-emerald-500 text-black hover:bg-emerald-600"
              disabled={loading}
            >
              {loading ? 'جاري التحديث...' : 'تحديث الباسوورد'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}