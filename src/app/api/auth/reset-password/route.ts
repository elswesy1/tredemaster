export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';


import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'البيانات غير مكتملة' },
        { status: 400 }
      )
    }

    // البحث عن المستخدم بالتوكن
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'الرابط غير صالح أو منتهي الصلاحية' },
        { status: 400 }
      )
    }

    // تشفير الباسوورد الجديد
    const hashedPassword = await bcrypt.hash(password, 10)

    // تحديث الباسوورد وحذف التوكن
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء المعالجة' },
      { status: 500 }
    )
  }
}