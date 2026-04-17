export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';


import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import nodemailer from 'nodemailer'

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

// POST /api/auth/send-verification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name } = body

    if (!email) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      )
    }

    // التحقق من وجود المستخدم
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser?.emailVerified) {
      return NextResponse.json(
        { error: 'هذا البريد الإلكتروني تم تأكيده بالفعل' },
        { status: 400 }
      )
    }

    // إنشاء رمز التحقق
    const verifyToken = randomBytes(32).toString('hex')
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 ساعة

    // حفظ الرمز في قاعدة البيانات
    if (existingUser) {
      await prisma.user.update({
        where: { email },
        data: {
          verifyToken,
          verifyTokenExpiry,
        }
      })
    }

    // إنشاء رابط التحقق
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'
    const verifyUrl = `${baseUrl}/verify-email?token=${verifyToken}&email=${encodeURIComponent(email)}`

    // إرسال البريد الإلكتروني
    try {
      const transporter = getEmailTransporter()
      
      await transporter.sendMail({
        from: `"TradeMaster" <${process.env.SMTP_USER || 'noreply@trademaster.com'}>`,
        to: email,
        subject: 'تأكيد البريد الإلكتروني - TradeMaster',
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #10b981; margin: 0;">TradeMaster</h1>
              <p style="color: #666;">منصة التداول الاحترافية</p>
            </div>
            
            <div style="background: #f9fafb; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
              <h2 style="color: #1f2937; margin-top: 0;">مرحباً ${name || 'بك'}! 👋</h2>
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
        `,
        text: `
مرحباً ${name || 'بك'}!

شكراً لإنشاء حسابك على TradeMaster!

يرجى تأكيد بريدك الإلكتروني من خلال الرابط التالي:
${verifyUrl}

هذا الرابط صالح لمدة 24 ساعة فقط.

إذا لم تطلب هذا البريد، يمكنك تجاهله بأمان.

© ${new Date().getFullYear()} TradeMaster
        `
      })

      return NextResponse.json({
        success: true,
        message: 'تم إرسال بريد التأكيد بنجاح'
      })

    } catch (emailError) {
      console.error('Email error:', emailError)
      
      // في حالة فشل الإرسال، نرجع الرابط للتطوير
      return NextResponse.json({
        success: true,
        message: 'تم إنشاء الحساب',
        verifyUrl: process.env.NODE_ENV === 'development' ? verifyUrl : undefined,
        devMode: process.env.NODE_ENV === 'development'
      })
    }

  } catch (error) {
    console.error('Send verification error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إرسال بريد التأكيد' },
      { status: 500 }
    )
  }
}
