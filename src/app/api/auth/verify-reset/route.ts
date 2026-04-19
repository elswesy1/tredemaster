import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()
    
    if (!token || !password) {
      return NextResponse.json(
        { error: 'البيانات مطلوبة' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() }
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'الرابط غير صالح أو منتهي' },
        { status: 400 }
      )
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password,
        resetToken: null,
        resetTokenExpiry: null
      }
    })

    return NextResponse.json(
      { message: 'تم تغيير كلمة المرور بنجاح' }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'حدث خطأ' },
      { status: 500 }
    )
  }
}