export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';


import { NextResponse } from 'next/server'
import { logoutUser } from '@/lib/auth-simple'

export async function POST() {
  try {
    await logoutUser()
    return NextResponse.json({ success: true, message: 'تم تسجيل الخروج' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ' },
      { status: 500 }
    )
  }
}
