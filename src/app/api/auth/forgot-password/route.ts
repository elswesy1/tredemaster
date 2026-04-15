import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit, getRateLimitKey, getClientIp } from '@/lib/rate-limiter'

export async function POST(request: NextRequest) {
  try {
    // ✅ Rate Limiting على forgot-password
    const ip = getClientIp(request)
    const rl = rateLimit(getRateLimitKey(null, 'password_reset', ip), 'password_reset')
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Too many password reset requests', retryAfter: rl.retryAfter },
        { status: 429 }
      )
    }

    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'إذا كان البريد مسجلاً، ستصلك رسالة' },
        { status: 200 }
      )
    }

    const resetToken = Math.random().toString(36).substring(2) + 
                       Math.random().toString(36).substring(2)
    const resetTokenExpiry = new Date(Date.now() + 3600000)

    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry }
    })

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const nodemailer = await import('nodemailer')
      
      const transporter = nodemailer.default.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      })

      const baseUrl = process.env.NEXTAUTH_URL || 
                      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
                      'https://trademaster-omega.vercel.app'
      
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

      await transporter.sendMail({
        from: `"TradeMaster" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'استعادة كلمة المرور - TradeMaster',
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #10b981;">استعادة كلمة المرور</h2>
            <p>اضغط على الزر أدناه لإعادة تعيين كلمة المرور:</p>
            <a href="${resetUrl}" 
               style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
              إعادة تعيين كلمة المرور
            </a>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              هذا الرابط صالح لمدة ساعة واحدة فقط.
            </p>
          </div>
        `
      })
    }

    return NextResponse.json(
      { message: 'إذا كان البريد مسجلاً، ستصلك رسالة' }
    )

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ' },
      { status: 500 }
    )
  }
}