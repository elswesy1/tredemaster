import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import nodemailer from 'nodemailer'

import { prisma } from '@/lib/prisma'
import { rateLimit, getRateLimitKey, getClientIp } from '@/lib/rate-limiter'

export async function POST(request: NextRequest) {
  try {
    // ✅ Rate Limiting على إرسال استعادة كلمة المرور
    const ip = getClientIp(request)
    const rl = rateLimit(getRateLimitKey(null, 'password_reset', ip), 'password_reset')
    if (!rl.success) {
      return NextResponse.json(
        { error: 'عدد محاولات كثيرة، حاول بعد ' + rl.retryAfter + ' ثانية' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      )
    }

    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { email } })
    
    if (!user) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    const resetToken = Math.random().toString(36).substring(2, 15)
    const resetTokenExpiry = new Date(Date.now() + 3600000)

    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry }
    })

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_URL}/reset-password?token=${resetToken}`
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'استعادة كلمة المرور - TradeMaster',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #06B6D4;">استعادة كلمة المرور</h2>
          <p>اضغط على الزر التالي لإعادة تعيين كلمة المرور:</p>
          <a href="${resetUrl}" style="display: inline-block; background: #06B6D4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">إعادة تعيين كلمة المرور</a>
          <p style="color: #6B7280; font-size: 14px;">هذا الرابط ينتهي خلال ساعة واحدة.</p>
        </div>
      `
    })

    return NextResponse.json(
      { message: 'تم إرسال رابط استعادة كلمة المرور' }
    )
  } catch (error) {
    console.error('Reset error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ' },
      { status: 500 }
    )
  }
}