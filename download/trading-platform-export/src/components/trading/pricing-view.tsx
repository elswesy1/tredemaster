'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/lib/i18n'
import { PLANS } from '@/lib/subscription'
import { Check, Zap, Crown, Star } from 'lucide-react'

interface PricingViewProps {
  onSelectPlan?: (plan: 'free' | 'pro') => void
  currentPlan?: 'free' | 'pro'
}

export function PricingView({ onSelectPlan, currentPlan = 'free' }: PricingViewProps) {
  const { language } = useI18n()
  const isRTL = language === 'ar'
  const [isAnnual, setIsAnnual] = useState(false)

  const getPrice = (price: number) => {
    if (price === 0) return isRTL ? 'مجاني' : 'Free'
    if (isAnnual) {
      return `$${price * 10}` // 2 months free
    }
    return `$${price}`
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <Badge variant="outline" className="mb-4 px-4 py-2 border-green-500/30 bg-green-500/10">
          <Zap className="w-4 h-4 mr-2 text-green-500" />
          {isRTL ? 'خطط مرنة' : 'Flexible Plans'}
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {isRTL ? 'اختر خطتك المثالية' : 'Choose Your Perfect Plan'}
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          {isRTL 
            ? 'ابدأ مجاناً وترقِ عندما تكون مستعداً للمميزات المتقدمة'
            : 'Start free and upgrade when you\'re ready for advanced features'}
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <Label className={isAnnual ? '' : 'text-foreground font-medium'}>
          {isRTL ? 'شهري' : 'Monthly'}
        </Label>
        <Switch
          checked={isAnnual}
          onCheckedChange={setIsAnnual}
        />
        <div className="flex items-center gap-2">
          <Label className={isAnnual ? 'text-foreground font-medium' : ''}>
            {isRTL ? 'سنوي' : 'Annual'}
          </Label>
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
            {isRTL ? 'وفر 17%' : 'Save 17%'}
          </Badge>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {PLANS.map((plan, index) => (
          <Card 
            key={plan.name}
            className={`relative overflow-hidden transition-all ${
              plan.highlighted 
                ? 'border-green-500 shadow-lg shadow-green-500/10 scale-105' 
                : ''
            }`}
          >
            {plan.highlighted && (
              <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-3 py-1 rounded-bl-lg flex items-center gap-1">
                <Star className="w-3 h-3" />
                {isRTL ? 'الأكثر شعبية' : 'Most Popular'}
              </div>
            )}
            
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  plan.highlighted 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                    : 'bg-muted'
                }`}>
                  {plan.highlighted ? 
                    <Crown className="w-6 h-6 text-white" /> : 
                    <Zap className="w-6 h-6 text-muted-foreground" />
                  }
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {isRTL ? plan.nameAr : plan.name}
                  </CardTitle>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">
                    {getPrice(plan.price)}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">
                      /{isAnnual ? (isRTL ? 'سنة' : 'year') : (isRTL ? 'شهر' : 'month')}
                    </span>
                  )}
                </div>
                {isAnnual && plan.price > 0 && (
                  <div className="text-sm text-green-500 mt-1">
                    {isRTL ? `${plan.price * 10}$ بدلاً من ${plan.price * 12}$` : `$${plan.price * 10} instead of $${plan.price * 12}`}
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      feature.included ? 'bg-green-500/10' : 'bg-muted'
                    }`}>
                      <Check className={`w-3 h-3 ${
                        feature.included ? 'text-green-500' : 'text-muted-foreground/50'
                      }`} />
                    </div>
                    <div className={feature.included ? '' : 'text-muted-foreground/50'}>
                      {isRTL ? feature.nameAr : feature.name}
                      {feature.limit && (
                        <span className="text-xs ml-1 text-muted-foreground">
                          ({feature.limit}{isRTL ? '/شهر' : '/mo'})
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
            
            <CardFooter>
              <Button 
                className={`w-full ${plan.highlighted ? 'bg-green-500 hover:bg-green-600' : ''}`}
                variant={plan.highlighted ? 'default' : 'outline'}
                onClick={() => onSelectPlan?.(plan.name.toLowerCase() as 'free' | 'pro')}
                disabled={currentPlan === plan.name.toLowerCase()}
              >
                {currentPlan === plan.name.toLowerCase() ? (
                  isRTL ? 'خطتك الحالية' : 'Current Plan'
                ) : plan.price === 0 ? (
                  isRTL ? 'ابدأ مجاناً' : 'Start Free'
                ) : (
                  isRTL ? 'اشترك الآن' : 'Subscribe Now'
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="max-w-2xl mx-auto pt-8">
        <h3 className="text-xl font-semibold text-center mb-6">
          {isRTL ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
        </h3>
        <div className="space-y-4">
          {[
            {
              q: isRTL ? 'هل يمكنني إلغاء الاشتراك في أي وقت؟' : 'Can I cancel anytime?',
              a: isRTL ? 'نعم، يمكنك إلغاء اشتراكك في أي وقت دون رسوم إضافية.' : 'Yes, you can cancel your subscription at any time without any additional fees.'
            },
            {
              q: isRTL ? 'هل تقدمون استرداد الأموال؟' : 'Do you offer refunds?',
              a: isRTL ? 'نعم، نقدم استرداداً كاملاً خلال 14 يوماً من الشراء.' : 'Yes, we offer a full refund within 14 days of purchase.'
            },
            {
              q: isRTL ? 'كيف أترقى من الخطة المجانية؟' : 'How do I upgrade from the free plan?',
              a: isRTL ? 'يمكنك الترقية من إعدادات حسابك في أي وقت.' : 'You can upgrade from your account settings at any time.'
            }
          ].map((faq, index) => (
            <Card key={index} className="bg-muted/30">
              <CardContent className="pt-4">
                <div className="font-medium mb-2">{faq.q}</div>
                <div className="text-sm text-muted-foreground">{faq.a}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
