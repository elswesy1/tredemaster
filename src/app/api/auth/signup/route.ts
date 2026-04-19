import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import nodemailer from 'nodemailer'
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// إعدادات البريد الإلكتروني
function getEmailTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  })
}

// POST /api/auth/signup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'صيغة البريد الإلكتروني غير صحيحة' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate verification token
    const verifyToken = randomBytes(32).toString('hex')
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user (not verified yet)
    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'trader',
        isActive: true,
        verifyToken,
        verifyTokenExpiry,
      }
    })

    // Create free subscription
    await db.subscription.create({
      data: {
        userId: user.id,
        plan: 'free',
        status: 'active',
      }
    })

    // Create usage records
    const subscription = await db.subscription.findUnique({
      where: { userId: user.id }
    })

    if (subscription) {
      await db.usage.createMany({
        data: [
          { subscriptionId: subscription.id, userId: user.id, type: 'trades', count: 0, limit: 10 },
          { subscriptionId: subscription.id, userId: user.id, type: 'sessions', count: 0, limit: 0 },
          { subscriptionId: subscription.id, userId: user.id, type: 'ai_chats', count: 0, limit: 0 },
          { subscriptionId: subscription.id, userId: user.id, type: 'exports', count: 0, limit: 0 },
        ]
      })
    }

    // Create verification URL
    const baseUrl = process.env.NEXTAUTH_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      'http://localhost:3000'
    const verifyUrl = `${baseUrl}/verify-email?token=${verifyToken}&email=${encodeURIComponent(email)}`

    // Try to send email
    let emailSent = false
    let devMode = false

    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        const transporter = getEmailTransporter()
        
        await transporter.sendMail({
          from: `"TradeMaster" <${process.env.SMTP_USER}>`,
          to: email,
          subject: 'تأكيد البريد الإلكتروني - TradeMaster',
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #10b981; margin: 0;">TradeMaster</h1>
                <p style="color: #666;">منصة التداول الاحترافية</p>
              </div>
              
              <div style="background: #f9fafb; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
                <h2 style="color: #1f2937; margin-top: 0;">مرحباً ${name}! 👋</h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                  شكراً لإنشاء حسابك على TradeMaster! يرجى تأكيد بريدك الإلكتروني للبدء في استخدام المنصة.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${verifyUrl}" 
                     style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                            color: white; 
                            padding: 14px 32px; 
                            border-radius: 8px; 
                            text-decoration: none; 
                            font-size: 16px; 
                            font-weight: bold;
                            display: inline-block;">
                    تأكيد البريد الإلكتروني
                  </a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px;">
                  أو انسخ هذا الرابط في المتصفح:
                </p>
                <p style="background: #e5e7eb; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 12px; color: #374151;">
                  ${verifyUrl}
                </p>
              </div>
              
              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px;">
                  هذا الرابط صالح لمدة 24 ساعة فقط.<br>
                  إذا لم تطلب هذا البريد، يمكنك تجاهله بأمان.
                </p>
              </div>
              
              <div style="text-align: center; margin-top: 20px;">
                <p style="color: #6b7280; font-size: 12px;">
                  © ${new Date().getFullYear()} TradeMaster. جميع الحقوق محفوظة.
                </p>
              </div>
            </div>
          `
        })
        emailSent = true
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      devMode = process.env.NODE_ENV === 'development'
    }

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      requiresVerification: true,
      emailSent,
      devMode,
      verifyUrl: (devMode || !emailSent) ? verifyUrl : undefined,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الحساب' },
      { status: 500 }
    )
  }
}