// ⚠️ هذا الكود للتطوير فقط

import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { SignJWT } from 'jose'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(password, 12)

    const verificationToken = await new SignJWT({ email })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(new TextEncoder().encode(process.env.NEXTAUTH_SECRET))

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationToken,
        emailVerified: null
      }
    })

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://trademaster-omega.vercel.app'}/verify-email?token=${verificationToken}`

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      verificationUrl: verificationUrl
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التسجيل' },
      { status: 500 }
    )
  }
}