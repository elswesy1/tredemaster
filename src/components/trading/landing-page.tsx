'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n'
import { 
  TrendingUp, 
  Shield, 
  BarChart3, 
  Brain,
  Wallet,
  LineChart,
  BookOpen,
  CheckCircle
} from 'lucide-react'

interface LandingPageProps {
  onGetStarted: () => void
  onLogin: () => void
}

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const { t, language } = useI18n()

  const features = [
    {
      icon: Wallet,
      title: t('sidebar.portfolio'),
      description: language === 'ar' 
        ? 'تتبع وإدارة محافظك الاستثمارية بسهولة' 
        : 'Track and manage your investment portfolios easily'
    },
    {
      icon: Shield,
      title: t('sidebar.risk'),
      description: language === 'ar' 
        ? 'تحديد ومراقبة معايير المخاطر' 
        : 'Define and monitor risk parameters'
    },
    {
      icon: LineChart,
      title: t('sidebar.trading'),
      description: language === 'ar' 
        ? 'سجل وحلل جميع صفقاتك' 
        : 'Log and analyze all your trades'
    },
    {
      icon: BookOpen,
      title: t('sidebar.journal'),
      description: language === 'ar' 
        ? 'سجل أفكارك وملاحظاتك اليومية' 
        : 'Record your daily thoughts and observations'
    },
    {
      icon: Brain,
      title: language === 'ar' ? 'تحليل السيكولوجي' : 'Psychology Analysis',
      description: language === 'ar' 
        ? 'راقب حالتك النفسية أثناء التداول' 
        : 'Monitor your psychological state while trading'
    },
    {
      icon: BarChart3,
      title: t('sidebar.statistics'),
      description: language === 'ar' 
        ? 'تحليلات مفصلة لأدائك' 
        : 'Detailed analytics of your performance'
    }
  ]

  const pricingPlans = [
    {
      name: t('landing.free'),
      price: '$0',
      features: [
        t('landing.onePortfolio'),
        t('landing.tradesPerMonth'),
        t('landing.tradingJournal'),
        t('landing.basicStats')
      ]
    },
    {
      name: 'Pro',
      price: '$15',
      period: language === 'ar' ? '/شهر' : '/month',
      features: [
        t('landing.unlimitedPortfolios'),
        t('landing.unlimitedTrades'),
        t('landing.mtIntegration'),
        t('landing.psychologyAnalysis'),
        t('landing.advancedReports'),
        t('landing.aiAssistant')
      ],
      popular: true
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">TradeMaster</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={onLogin}>
                {t('auth.login')}
              </Button>
              <Button onClick={onGetStarted} className="bg-gradient-to-r from-green-500 to-emerald-600">
                {language === 'ar' ? 'ابدأ الآن' : 'Get Started'}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
          {t('landing.heroTitle1')}
          <span className="block bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            {t('landing.heroTitle2')}
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          {t('landing.heroSubtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={onGetStarted} className="bg-gradient-to-r from-green-500 to-emerald-600">
            {t('landing.startFree')}
          </Button>
          <Button size="lg" variant="outline" onClick={onLogin}>
            {t('landing.haveAccount')}
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          {t('landing.features')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          {t('landing.pricing')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card key={index} className={plan.popular ? 'border-green-500 relative' : ''}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-3 py-1 rounded-full">
                    {t('landing.mostPopular')}
                  </span>
                </div>
              )}
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full mt-6 ${plan.popular ? 'bg-gradient-to-r from-green-500 to-emerald-600' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={onGetStarted}
                >
                  {t('landing.getStarted')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 TradeMaster. {language === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.</p>
        </div>
      </footer>
    </div>
  )
}
