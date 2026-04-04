import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { Resend } from 'resend'

const prisma = new PrismaClient()
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      )
    }

    // البحث عن المستخدم
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // لا نكشف إذا كان الإيميل موجود أو لا (للأمان)
    if (!user) {
      return NextResponse.json({ success: true })
    }

    // إنشاء توكن الاستعادة
    const resetToken = Math.random().toString(36).substring(2) + 
                       Math.random().toString(36).substring(2)
    const resetTokenExpiry = new Date(Date.now() + 3600000) // ساعة واحدة

    // حفظ التوكن في قاعدة البيانات
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // رابط الاستعادة
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`

    // إرسال الإيميل
    await resend.emails.send({
      from: 'TradeMaster <onboarding@resend.dev>',
      to: email,
      subject: 'استعادة الباسوورد - TradeMaster',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981;">TradeMaster</h1>
          </div>
          <div style="background: #1a1a1a; border-radius: 10px; padding: 30px; border: 1px solid #10b981;">
            <h2 style="color: #fff; margin-bottom: 20px;">استعادة الباسوورد</h2>
            <p style="color: #9ca3af; margin-bottom: 20px;">
              تم طلب استعادة الباسوورد لحسابك. اضغط على الزر أدناه لإنشاء باسوورد جديد:
            </p>
            <a href="${resetUrl}" style="display: inline-block; background: #10b981; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              استعادة الباسوورد
            </a>
            <p style="color: #6b7280; margin-top: 20px; font-size: 12px;">
              هذا الرابط صالح لمدة ساعة واحدة فقط.<br>
              إذا لم تطلب هذا، يمكنك تجاهل هذا الإيميل.
            </p>
          </div>
        </div>
      `
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء المعالجة' },
      { status: 500 }
    )
  }
}