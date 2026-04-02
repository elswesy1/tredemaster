import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'

// GET - Fetch login history for authenticated user
export async function GET(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'غير مصارح - يجب تسجيل الدخول' },
        { status: 401 }
      )
    }

    // جلب آخر 20 سجل دخول
    const history = await prisma.loginHistory.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    // تنسيق البيانات للعرض
    const formattedHistory = history.map((entry) => ({
      id: entry.id,
      date: entry.createdAt,
      ipAddress: entry.ipAddress || 'غير معروف',
      device: parseUserAgent(entry.userAgent),
      successful: entry.successful,
      method: entry.method,
    }))

    return NextResponse.json({ history: formattedHistory })
  } catch (error) {
    console.error('Error fetching login history:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب السجل' },
      { status: 500 }
    )
  }
}

// Helper لتحليل User Agent
function parseUserAgent(userAgent: string | null): { browser: string; os: string; device: string } {
  if (!userAgent) {
    return { browser: 'غير معروف', os: 'غير معروف', device: 'غير معروف' }
  }

  const ua = userAgent.toLowerCase()

  // تحديد المتصفح
  let browser = 'غير معروف'
  if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome'
  else if (ua.includes('firefox')) browser = 'Firefox'
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari'
  else if (ua.includes('edg')) browser = 'Edge'
  else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera'

  // تحديد نظام التشغيل
  let os = 'غير معروف'
  if (ua.includes('windows')) os = 'Windows'
  else if (ua.includes('mac os')) os = 'macOS'
  else if (ua.includes('linux')) os = 'Linux'
  else if (ua.includes('android')) os = 'Android'
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS'

  // تحديد نوع الجهاز
  let device = 'كمبيوتر'
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    device = 'هاتف محمول'
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    device = 'تابلت'
  }

  return { browser, os, device }
}
