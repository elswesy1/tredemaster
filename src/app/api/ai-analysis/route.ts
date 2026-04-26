export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';


import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. جلب بيانات التداول وسجلات علم النفس
    const [trades, psychologyLogs] = await Promise.all([
      prisma.trade.findMany({ 
        where: { userId: user.userId }, 
        take: 10, 
        orderBy: { createdAt: 'desc' } 
      }),
      prisma.psychologyLog.findMany({ 
        where: { userId: user.userId }, 
        take: 5, 
        orderBy: { createdAt: 'desc' } 
      })
    ])

    // 2. تجهيز البيانات لإرسالها للوكيل (Gemma Logic)
    // هنا نقوم بصياغة البيانات بشكل يفهمه المحلل الذكي
    const analysisContext = {
      recentTrades: trades,
      psychologyNotes: psychologyLogs,
      rulesPath: '.agents/prompts/analyst.md'
    }

    // 3. محاكاة رد الوكيل (بانتظار ربط API Gemma الفعلي)
    // ملاحظة: بمجرد تفعيل API المحرك، سنستبدل هذا الجزء بطلب حقيقي
    const aiInsight = {
      technical: "بناءً على صفقاتك الأخيرة، لاحظت فجوة (FVG) في زوج اليورو/دولار لم يتم احترامها، انتبه لمنطقة الـ Discount.",
      psychological: "هناك تكرار في دخول صفقات 'انتقامية' بعد الخسارة مباشرة. تذكر نصيحة مارك دوغلاس: السوق لا يدين لك بشيء.",
      status: "Success",
      context: analysisContext
    }

    return NextResponse.json(aiInsight)
  } catch (error) {
    console.error('AI Analysis Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}