'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n'
import { useState } from 'react'
import {
  TrendingUp,
  Shield,
  BarChart3,
  Brain,
  Wallet,
  LineChart,
  BookOpen,
  CheckCircle,
  Users,
  Star,
  Award,
  Play,
  Pause,
  Calendar,
  Clock,
  DollarSign
} from 'lucide-react'

interface LandingPageProps {
  onGetStarted: () => void
  onLogin: () => void
}
// === NEW COMPONENTS - ADD HERE ===
function TrustBadges({ lng }: { lng: string }) {
  const items = [
    { icon: Shield, title: lng === 'ar' ? 'تشفير AES-256' : 'AES-256 Encryption', sub: lng === 'ar' ? 'حماية بياناتك' : 'Your Data Protected' },
    { icon: CheckCircle, title: lng === 'ar' ? 'خوادم آمنة' : 'Secure Servers', sub: '24/7' },
    { icon: Star, title: lng === 'ar' ? 'تقييم 4.9' : '4.9 Rating', sub: '2000+' },
    { icon: Award, title: lng === 'ar' ? 'معتمد' : 'Certified', sub: 'SOC2' }
  ]
  return (
    <section className="py-12 bg-gradient-to-r from-emerald-900/20 to-cyan-900/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center p-4 rounded-xl bg-black/20 border border-emerald-500/20">
              <item.icon className="w-8 h-8 text-emerald-400 mb-3" />
              <h3 className="font-semibold text-white text-sm">{item.title}</h3>
              <p className="text-xs text-gray-400 mt-1">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SocialProof({ lng }: { lng: string }) {
  const data = [
    { num: '10,000+', txt: lng === 'ar' ? 'متداول' : 'Traders', ico: Users },
    { num: '98%', txt: lng === 'ar' ? 'رضا' : 'Satisfaction', ico: Star },
    { num: '150+', txt: lng === 'ar' ? 'دولة' : 'Countries', ico: Award },
    { num: '$50M+', txt: lng === 'ar' ? 'محافظ' : 'Assets', ico: DollarSign }
  ]
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {data.map((d, i) => (
            <div key={i} className="text-center p-6 rounded-2xl bg-gradient-to-b from-emerald-900/30 border border-emerald-500/10">
              <d.ico className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{d.num}</div>
              <div className="text-sm text-gray-400">{d.txt}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function LiveDemo({ lng }: { lng: string }) {
  const [play, setPlay] = useState(false)
  return (
    <section className="py-16 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">{lng === 'ar' ? 'شاهد كيف يعمل' : 'See How It Works'}</h2>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-900/50 to-cyan-900/50 border border-emerald-500/30 aspect-video flex items-center justify-center max-w-2xl mx-auto">
          <button onClick={() => setPlay(!play)} className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center">
            {play ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
          </button>
        </div>
      </div>
    </section>
  )
}

function BlogSEO({ lng }: { lng: string }) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">{lng === 'ar' ? 'المدونة' : 'Blog'}</h2>
        <p className="text-gray-400 mb-8">{lng === 'ar' ? 'قريباً...' : 'Coming soon...'}</p>
      </div>
    </section>
  )
}


export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const { t, language } = useI18n()
  const [playing, setPlaying] = useState(false)


  const features = [
    { icon: Wallet, title: t('sidebar.portfolio'), description: language === 'ar' ? 'تتبع وإدارة محافظك الاستثمارية بسهولة' : 'Track and manage your investment portfolios easily' },
    { icon: Shield, title: t('sidebar.risk'), description: language === 'ar' ? 'تحديد ومراقبة معايير المخاطر' : 'Define and monitor risk parameters' },
    { icon: LineChart, title: t('sidebar.trading'), description: language === 'ar' ? 'سجل وحلل جميع صفقاتك' : 'Log and analyze all your trades' },
    { icon: BookOpen, title: t('sidebar.journal'), description: language === 'ar' ? 'سجل أفكارك وملاحظاتك اليومية' : 'Record your daily thoughts and observations' },
    { icon: Brain, title: language === 'ar' ? 'تحليل السيكولوجي' : 'Psychology Analysis', description: language === 'ar' ? 'راقب حالتك النفسية أثناء التداول' : 'Monitor your psychological state while trading' },
    { icon: BarChart3, title: t('sidebar.statistics'), description: language === 'ar' ? 'تحليلات مفصلة لأدائك' : 'Detailed analytics of your performance' }
  ]

  const pricingPlans = [
    { name: t('landing.free'), price: '$0', features: [t('landing.onePortfolio'), t('landing.tradesPerMonth'), t('landing.tradingJournal'), t('landing.basicStats')] },
    { name: 'Pro', price: '$15', period: language === 'ar' ? '/شهر' : '/month', features: [t('landing.unlimitedPortfolios'), t('landing.unlimitedTrades'), t('landing.mtIntegration'), t('landing.psychologyAnalysis'), t('landing.advancedReports'), t('landing.aiAssistant')], popular: true }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-emerald-400" />
              <span className="text-xl font-bold text-white">TradeMaster</span>
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" className="text-gray-300 hover:text-white" onClick={onLogin}>{t('auth.login')}</Button>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold" onClick={onGetStarted}>{language === 'ar' ? 'ابدأ الآن' : 'Get Started'}</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {t('landing.heroTitle1')}
            <span className="text-emerald-400 block mt-2">{t('landing.heroTitle2')}</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">{t('landing.heroSubtitle')}</p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-8" onClick={onGetStarted}>{t('landing.startFree')}</Button>
            <Button size="lg" variant="outline" className="text-white border-gray-600 hover:bg-gray-800" onClick={onLogin}>{t('landing.haveAccount')}</Button>
          </div>
        </div>
      </section>
      <TrustBadges lng={language} />
<SocialProof lng={language} />
<LiveDemo lng={language} />
<BlogSEO lng={language} />

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">{t('landing.features')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700 hover:border-emerald-500/50 transition-all">
                <CardContent className="p-6">
                  <feature.icon className="w-12 h-12 text-emerald-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">{t('landing.pricing')}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`bg-gray-800/50 border-gray-700 ${plan.popular ? 'border-emerald-500 ring-2 ring-emerald-500/20' : ''}`}>
                <CardContent className="p-8">
                  {plan.popular && <span className="inline-block px-3 py-1 text-xs font-semibold bg-emerald-500 text-black rounded-full mb-4">{t('landing.mostPopular')}</span>}
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    {plan.period && <span className="text-gray-400">{plan.period}</span>}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-gray-300">
                        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full ${plan.popular ? 'bg-emerald-500 hover:bg-emerald-600 text-black' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}>{t('landing.getStarted')}</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>© 2024 TradeMaster. {language === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.</p>
        </div>
      </footer>
    </div>
  )
}