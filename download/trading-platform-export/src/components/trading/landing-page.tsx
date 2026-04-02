'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/lib/i18n'
import { PLANS } from '@/lib/subscription'
import {
  Brain,
  Video,
  Shield,
  ChevronRight,
  Check,
  Zap,
  LineChart,
  MessageSquare,
  FileText,
  Calendar,
  Target,
  TrendingUp,
  Users,
  Star
} from 'lucide-react'

interface LandingPageProps {
  onGetStarted: () => void
  onLogin: () => void
}

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const { t, language, direction } = useI18n()
  const isRTL = language === 'ar'

  const features = [
    {
      icon: Brain,
      title: t('hero.features.feature1.title'),
      description: t('hero.features.feature1.description'),
      color: 'text-purple-500'
    },
    {
      icon: Video,
      title: t('hero.features.feature2.title'),
      description: t('hero.features.feature2.description'),
      color: 'text-blue-500'
    },
    {
      icon: Shield,
      title: t('hero.features.feature3.title'),
      description: t('hero.features.feature3.description'),
      color: 'text-green-500'
    }
  ]

  const howItWorks = [
    {
      step: '01',
      title: isRTL ? 'أنشئ حسابك' : 'Create Your Account',
      description: isRTL ? 'سجل مجاناً في دقائق معدودة' : 'Sign up for free in minutes'
    },
    {
      step: '02',
      title: isRTL ? 'سجل صفقاتك' : 'Log Your Trades',
      description: isRTL ? 'أضف صفقاتك وتتبع أداءك' : 'Add your trades and track your performance'
    },
    {
      step: '03',
      title: isRTL ? 'احصل على رؤى ذكية' : 'Get AI Insights',
      description: isRTL ? 'تلقي تحليلات وتوصيات مخصصة' : 'Receive personalized analytics and recommendations'
    },
    {
      step: '04',
      title: isRTL ? 'حسّن أداءك' : 'Improve Your Results',
      description: isRTL ? 'طور استراتيجياتك وأصبح مربحاً' : 'Refine your strategies and become profitable'
    }
  ]

  const testimonials = [
    {
      name: 'Ahmed K.',
      role: isRTL ? 'متداول فوركس' : 'Forex Trader',
      content: isRTL ? 'هذه المنصة غيرت طريقة تداولي تماماً. التحليلات الذكية ساعدتني على تحسين نسبة فوزي بنسبة 30%.' : 'This platform completely changed my trading. The AI insights helped me improve my win rate by 30%.',
      rating: 5
    },
    {
      name: 'Sarah M.',
      role: isRTL ? 'متداولة أسهم' : 'Stock Trader',
      content: isRTL ? 'وضع ZEN والتتبع النفسي ساعداني على التحكم في عواطفي أثناء التداول.' : 'The ZEN mode and psychology tracking helped me control my emotions during trading.',
      rating: 5
    },
    {
      name: 'Omar R.',
      role: isRTL ? 'متداول عملات رقمية' : 'Crypto Trader',
      content: isRTL ? 'تسجيل الجلسات ميزة رائعة. أستطيع مراجعة صفقاتي وتحسينها.' : 'Session recording is amazing. I can review my trades and improve them.',
      rating: 5
    }
  ]

  const stats = [
    { value: '10K+', label: isRTL ? 'متداول نشط' : 'Active Traders' },
    { value: '2M+', label: isRTL ? 'صفقة مسجلة' : 'Trades Logged' },
    { value: '85%', label: isRTL ? 'تحسن في الأداء' : 'Performance Improvement' },
    { value: '4.9', label: isRTL ? 'تقييم المستخدمين' : 'User Rating' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">TradeMaster</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onLogin}>
                {isRTL ? 'تسجيل الدخول' : 'Login'}
              </Button>
              <Button onClick={onGetStarted} className="bg-green-500 hover:bg-green-600">
                {isRTL ? 'ابدأ مجاناً' : 'Start Free'}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-6 px-4 py-2 border-green-500/30 bg-green-500/10">
            <Zap className="w-4 h-4 mr-2 text-green-500" />
            {isRTL ? 'مدعوم بالذكاء الاصطناعي' : 'AI-Powered Trading Platform'}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {isRTL ? 'أتقن رحلة تداولك' : 'Master Your Trading Journey'}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {isRTL 
              ? 'منصة يومية تداول وتحليلات ذكية لمساعدتك على أن تصبح متداول مربح باستمرار'
              : 'AI-powered trading journal and analytics platform to help you become a consistently profitable trader'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={onGetStarted} className="bg-green-500 hover:bg-green-600 text-lg px-8">
              {isRTL ? 'ابدأ التجربة المجانية' : 'Start Free Trial'}
              <ChevronRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              {isRTL ? 'اعرف المزيد' : 'Learn More'}
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-500">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isRTL ? 'لماذا تختار منصتنا؟' : 'Why Choose Our Platform?'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {isRTL 
              ? 'أدوات متقدمة لمساعدتك على اتخاذ قرارات أفضل وتحسين أدائك'
              : 'Advanced tools to help you make better decisions and improve your performance'}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-green-500/10 hover:border-green-500/30">
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="container mx-auto px-4 py-20 bg-muted/30 rounded-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isRTL ? 'كل ما تحتاجه للنجاح' : 'Everything You Need to Succeed'}
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: LineChart, title: isRTL ? 'تحليل متقدم' : 'Advanced Analytics' },
            { icon: MessageSquare, title: isRTL ? 'مساعد ذكي' : 'AI Assistant' },
            { icon: FileText, title: isRTL ? 'يومية تداول' : 'Trading Journal' },
            { icon: Calendar, title: isRTL ? 'تسجيل الجلسات' : 'Session Recording' },
            { icon: Target, title: isRTL ? 'إدارة المخاطر' : 'Risk Management' },
            { icon: Brain, title: isRTL ? 'علم النفس' : 'Psychology' },
            { icon: TrendingUp, title: isRTL ? 'تتبع الأداء' : 'Performance Tracking' },
            { icon: Users, title: isRTL ? 'مجتمع المتداولين' : 'Trading Community' },
          ].map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-background hover:bg-green-500/5 transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <item.icon className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-sm font-medium text-center">{item.title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isRTL ? 'كيف يعمل' : 'How It Works'}
          </h2>
          <p className="text-muted-foreground">
            {isRTL ? 'ابدأ رحلتك في أربع خطوات بسيطة' : 'Start your journey in four simple steps'}
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {howItWorks.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-6xl font-bold text-green-500/10 mb-4">{step.step}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
              {index < howItWorks.length - 1 && (
                <ChevronRight className={`hidden md:block absolute top-8 ${isRTL ? '-left-4 rotate-180' : '-right-4'} w-8 h-8 text-green-500/30`} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20" id="pricing">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isRTL ? 'خطط الأسعار' : 'Pricing Plans'}
          </h2>
          <p className="text-muted-foreground">
            {isRTL ? 'اختر الخطة المناسبة لاحتياجاتك' : 'Choose the plan that fits your needs'}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PLANS.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative overflow-hidden ${plan.highlighted ? 'border-green-500 shadow-lg shadow-green-500/10' : ''}`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-3 py-1 rounded-bl-lg">
                  {isRTL ? 'الأكثر شعبية' : 'Most Popular'}
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{isRTL ? plan.nameAr : plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/{isRTL ? 'شهر' : 'month'}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-3">
                      <Check className={`w-5 h-5 ${feature.included ? 'text-green-500' : 'text-muted-foreground/30'}`} />
                      <span className={feature.included ? '' : 'text-muted-foreground/50'}>
                        {isRTL ? feature.nameAr : feature.name}
                        {feature.limit && ` (${feature.limit}${isRTL ? '/شهر' : '/month'})`}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full ${plan.highlighted ? 'bg-green-500 hover:bg-green-600' : ''}`}
                  variant={plan.highlighted ? 'default' : 'outline'}
                  onClick={onGetStarted}
                >
                  {plan.price === 0 
                    ? (isRTL ? 'ابدأ مجاناً' : 'Start Free')
                    : (isRTL ? 'اشترك الآن' : 'Subscribe Now')}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isRTL ? 'ماذا يقول متداولونا' : 'What Our Traders Say'}
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <CardDescription className="text-base">{testimonial.content}</CardDescription>
              </CardHeader>
              <CardFooter>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-3xl p-12 text-center border border-green-500/20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isRTL ? 'مستعد لتحسين تداولك؟' : 'Ready to Improve Your Trading?'}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            {isRTL 
              ? 'انضم إلى آلاف المتداولين الذين يحسنون أداءهم يومياً'
              : 'Join thousands of traders improving their performance every day'}
          </p>
          <Button size="lg" onClick={onGetStarted} className="bg-green-500 hover:bg-green-600 text-lg px-8">
            {isRTL ? 'ابدأ مجاناً الآن' : 'Start Free Now'}
            <ChevronRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">TradeMaster</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {isRTL 
                  ? 'منصة تداول ذكية لمساعدتك على النجاح'
                  : 'Smart trading platform to help you succeed'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{isRTL ? 'المنتج' : 'Product'}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer">{isRTL ? 'المميزات' : 'Features'}</li>
                <li className="hover:text-foreground cursor-pointer">{isRTL ? 'الأسعار' : 'Pricing'}</li>
                <li className="hover:text-foreground cursor-pointer">{isRTL ? 'الأسئلة الشائعة' : 'FAQ'}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{isRTL ? 'الشركة' : 'Company'}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer">{isRTL ? 'من نحن' : 'About Us'}</li>
                <li className="hover:text-foreground cursor-pointer">{isRTL ? 'المدونة' : 'Blog'}</li>
                <li className="hover:text-foreground cursor-pointer">{isRTL ? 'وظائف' : 'Careers'}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{isRTL ? 'الدعم' : 'Support'}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer">{isRTL ? 'مركز المساعدة' : 'Help Center'}</li>
                <li className="hover:text-foreground cursor-pointer">{isRTL ? 'تواصل معنا' : 'Contact Us'}</li>
                <li className="hover:text-foreground cursor-pointer">{isRTL ? 'الشروط والأحكام' : 'Terms & Conditions'}</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2024 TradeMaster. {isRTL ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </div>
        </div>
      </footer>
    </div>
  )
}
