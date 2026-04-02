// Subscription types and utilities
export type PlanType = 'free' | 'pro'

export interface PlanDetails {
  name: string
  nameAr: string
  price: number
  priceId?: string
  features: {
    key: string
    name: string
    nameAr: string
    included: boolean
    limit?: number
  }[]
  highlighted?: boolean
}

export const PLANS: PlanDetails[] = [
  {
    name: 'Free',
    nameAr: 'مجاني',
    price: 0,
    features: [
      { key: 'dashboard', name: 'Basic Dashboard', nameAr: 'لوحة التحكم الأساسية', included: true },
      { key: 'trades', name: 'Trade Tracking', nameAr: 'تتبع الصفقات', included: true, limit: 10 },
      { key: 'journal', name: 'Basic Trading Journal', nameAr: 'يومية التداول الأساسية', included: true },
      { key: 'statistics', name: 'Limited Statistics', nameAr: 'إحصائيات محدودة', included: true },
      { key: 'sessions', name: 'Session Recording', nameAr: 'تسجيل الجلسات', included: false },
      { key: 'ai_chat', name: 'AI Chat Assistant', nameAr: 'المساعد الذكي', included: false },
      { key: 'advanced_stats', name: 'Advanced Statistics', nameAr: 'إحصائيات متقدمة', included: false },
      { key: 'mt4_mt5', name: 'MT4/MT5 Connection', nameAr: 'ربط MT4/MT5', included: false },
      { key: 'exports', name: 'Export Reports', nameAr: 'تصدير التقارير', included: false },
      { key: 'zen_mode', name: 'ZEN Mode', nameAr: 'وضع ZEN', included: false },
    ],
  },
  {
    name: 'Pro',
    nameAr: 'احترافي',
    price: 15,
    highlighted: true,
    features: [
      { key: 'dashboard', name: 'Basic Dashboard', nameAr: 'لوحة التحكم الأساسية', included: true },
      { key: 'trades', name: 'Unlimited Trade Tracking', nameAr: 'تتبع صفقات غير محدود', included: true },
      { key: 'journal', name: 'Advanced Trading Journal', nameAr: 'يومية تداول متقدمة', included: true },
      { key: 'statistics', name: 'Full Statistics', nameAr: 'إحصائيات كاملة', included: true },
      { key: 'sessions', name: 'Unlimited Session Recording', nameAr: 'تسجيل جلسات غير محدود', included: true },
      { key: 'ai_chat', name: 'AI Chat Assistant', nameAr: 'المساعد الذكي', included: true },
      { key: 'advanced_stats', name: 'Advanced Statistics', nameAr: 'إحصائيات متقدمة', included: true },
      { key: 'mt4_mt5', name: 'MT4/MT5 Connection', nameAr: 'ربط MT4/MT5', included: true },
      { key: 'exports', name: 'Export Reports', nameAr: 'تصدير التقارير', included: true },
      { key: 'zen_mode', name: 'ZEN Mode', nameAr: 'وضع ZEN', included: true },
    ],
  },
]

export const FREE_PLAN_LIMITS = {
  trades: 10,
  sessions: 0,
  ai_chats: 0,
  exports: 0,
}

export function getPlanDetails(plan: PlanType): PlanDetails {
  return PLANS.find(p => p.name.toLowerCase() === plan) || PLANS[0]
}

export function isFeatureAvailable(plan: PlanType, featureKey: string): boolean {
  const planDetails = getPlanDetails(plan)
  const feature = planDetails.features.find(f => f.key === featureKey)
  return feature?.included ?? false
}

export function getFeatureLimit(plan: PlanType, featureKey: string): number | undefined {
  const planDetails = getPlanDetails(plan)
  const feature = planDetails.features.find(f => f.key === featureKey)
  return feature?.limit
}
