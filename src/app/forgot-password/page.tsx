'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      if (res.ok) {
        setSent(true)
      } else {
        setError(data.error || 'حدث خطأ')
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-black to-emerald-950 p-4">
        <Card className="w-full max-w-md bg-gray-900/50 border-emerald-500/20">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">تم الإرسال!</h2>
            <p className="text-gray-400 mb-4">
              تم إرسال رابط استعادة الباسوورد إلى:<br />
              <span className="text-emerald-400">{email}</span>
            </p>
            <p className="text-gray-500 text-sm">
              تحقق من صندوق الوارد ومجلد البريد المزعج
            </p>
            <Link href="/login">
              <Button className="mt-6 bg-emerald-500 text-black hover:bg-emerald-600">
                العودة لتسجيل الدخول
              </Button>
            </Link>
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
            <Mail className="w-12 h-12 text-emerald-400" />
          </div>
          <CardTitle className="text-2xl text-center text-white">
            استعادة الباسوورد
          </CardTitle>
          <p className="text-gray-400 text-center mt-2">
            أدخل بريدك الإلكتروني وسنرسل لك رابط لاستعادة الباسوورد
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-red-400 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-emerald-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                placeholder="example@email.com"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-emerald-500 text-black hover:bg-emerald-600"
              disabled={loading}
            >
              {loading ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
            </Button>
          </form>
          <Link href="/login">
            <Button variant="ghost" className="w-full mt-4 text-gray-400">
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة لتسجيل الدخول
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}