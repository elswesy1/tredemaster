'use client'

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setError('رابط غير صالح')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
      } else {
        setError(data.error || 'حدث خطأ')
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-black to-emerald-950 p-4">
        <Card className="w-full max-w-md bg-black/50 border-emerald-500/20">
          <CardContent className="pt-6 text-center">
            <p className="text-emerald-400 text-lg">تم تغيير كلمة المرور بنجاح!</p>
            <Button 
              className="mt-4 bg-emerald-500 text-black"
              onClick={() => window.location.href = '/auth/login'}
            >
              تسجيل الدخول
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-black to-emerald-950 p-4">
      <Card className="w-full max-w-md bg-black/50 border-emerald-500/20">
        <CardHeader>
          <CardTitle className="text-white text-center">
            إعادة تعيين كلمة المرور
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm">كلمة المرور الجديدة</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 p-2 rounded bg-gray-900 border border-emerald-500/20 text-white"
                required
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm">تأكيد كلمة المرور</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mt-1 p-2 rounded bg-gray-900 border border-emerald-500/20 text-white"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-emerald-500 text-black"
              disabled={loading}
            >
              {loading ? 'جاري الحفظ...' : 'حفظ كلمة المرور'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-black to-emerald-950">
        <p className="text-gray-400">جاري التحميل...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}