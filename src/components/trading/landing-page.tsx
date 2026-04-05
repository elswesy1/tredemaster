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
  DollarSign,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  AlertTriangle,
  ChevronRight,
  Activity
} from 'lucide-react'

interface LandingPageProps {
  onGetStarted: () => void
  onLogin: () => void
}

// ============================================
// 1️⃣ HERO SECTION - محسّن بأسلوب TradePath
// ============================================
function HeroSection({ language, onGetStarted, onLogin }: { language: string; onGetStarted: () => void; onLogin: () => void }) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-black to-cyan-950/30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full" style={{
          backgroundImage: 'linear-gradient(to right, rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(6, 182, 212, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-8">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-400">
              {language === 'ar' ? 'منصة إدارة التداول الشاملة الأولى للعالم العربي' : 'The First Complete Trading Management Platform for Arab Traders'}
            </span>
          </div>

          {/* Main Headline - 3 Words Like TradePath */}
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
            {language === 'ar' ? (
              <>
                تتبع. <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">حلّل.</span> احترف.
              </>
            ) : (
              <>
                Track. <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Analyze.</span> Master.
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto">
            {language === 'ar' 
              ? 'منصة ذكية لإدارة محافظك، تتبع صفقاتك، وتحليل أدائك السيكولوجي لتصبح متداول محترف'
              : 'An intelligent platform to manage portfolios, track trades, and analyze your psychological performance to become a professional trader'}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-bold px-8 py-6 text-lg hover:opacity-90 transition-all shadow-lg shadow-cyan-500/20"
              onClick={onGetStarted}
            >
              {language === 'ar' ? 'ابدأ مجاناً' : 'Start Free'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 px-8 py-6 text-lg"
              onClick={onLogin}
            >
              {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
            </Button>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>{language === 'ar' ? '+10,000 متداول' : '10,000+ Traders'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>4.9/5</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" />
              <span>{language === 'ar' ? '+150 دولة' : '150+ Countries'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================
// 2️⃣ TRUST BADGES - مع Glow Effects
// ============================================
function TrustBadges({ lng }: { lng: string }) {
  const items = [
    { icon: Shield, title: lng === 'ar' ? 'تشفير AES-256' : 'AES-256 Encryption', sub: lng === 'ar' ? 'حماية بياناتك' : 'Your Data Protected' },
    { icon: CheckCircle, title: lng === 'ar' ? 'خوادم آمنة' : 'Secure Servers', sub: '24/7' },
    { icon: Star, title: lng === 'ar' ? 'تقييم 4.9' : '4.9 Rating', sub: '2000+' },
    { icon: Award, title: lng === 'ar' ? 'معتمد' : 'Certified', sub: 'SOC2' }
  ]
  return (
    <section className="py-12 bg-gradient-to-r from-cyan-900/10 via-emerald-900/10 to-cyan-900/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <div key={i} className="group flex flex-col items-center text-center p-4 rounded-xl bg-black/20 border border-cyan-500/20 hover:border-cyan-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-3 group-hover:shadow-lg group-hover:shadow-cyan-500/20 transition-all">
                <item.icon className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="font-semibold text-white text-sm">{item.title}</h3>
              <p className="text-xs text-gray-400 mt-1">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================
// 3️⃣ SOCIAL PROOF - Stats محسّنة
// ============================================
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
            <div key={i} className="text-center p-6 rounded-2xl bg-gradient-to-b from-cyan-900/20 to-emerald-900/20 border border-cyan-500/10 hover:border-cyan-500/30 transition-all">
              <d.ico className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{d.num}</div>
              <div className="text-sm text-gray-400">{d.txt}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================
// 4️⃣ FEATURES SECTION - مع Glow Effects
// ============================================
function FeaturesSection({ language }: { language: string }) {
  const features = [
    {
      icon: Wallet,
      title: language === 'ar' ? 'إدارة المحافظ' : 'Portfolio Management',
      description: language === 'ar' 
        ? 'تتبع وإدارة محافظك الاستثمارية بسهولة تامة مع تحديثات لحظية وتقارير تفصيلية'
        : 'Track and manage your investment portfolios with ease, real-time updates, and detailed reports',
      color: 'cyan'
    },
    {
      icon: Shield,
      title: language === 'ar' ? 'إدارة المخاطر' : 'Risk Management',
      description: language === 'ar'
        ? 'تحديد ومراقبة معايير المخاطر مع تنبيهات ذكية تحمي رأس مالك'
        : 'Define and monitor risk parameters with smart alerts that protect your capital',
      color: 'emerald'
    },
    {
      icon: LineChart,
      title: language === 'ar' ? 'سجل الصفقات' : 'Trade Journal',
      description: language === 'ar'
        ? 'سجل وحلل جميع صفقاتك مع استخراج الأنماط والرؤى القيمة'
        : 'Log and analyze all your trades with pattern extraction and valuable insights',
      color: 'cyan'
    },
    {
      icon: Brain,
      title: language === 'ar' ? 'تحليل السيكولوجي' : 'Psychology Analysis',
      description: language === 'ar'
        ? 'راقب حالتك النفسية وابنِ عادات تداول صحية تدوم'
        : 'Monitor your psychological state and build sustainable healthy trading habits',
      color: 'emerald'
    },
    {
      icon: BarChart3,
      title: language === 'ar' ? 'إحصائيات الأداء' : 'Performance Statistics',
      description: language === 'ar'
        ? 'تحليلات مفصلة لأدائك مع رسوم بيانية تفاعلية ومقاييس مهمة'
        : 'Detailed analytics of your performance with interactive charts and key metrics',
      color: 'cyan'
    },
    {
      icon: Zap,
      title: language === 'ar' ? 'AI المساعد الذكي' : 'AI Assistant',
      description: language === 'ar'
        ? 'مساعد ذكي يتعلم من أسلوبك ويقدم توصيات شخصية'
        : 'Smart assistant that learns your style and provides personalized recommendations',
      color: 'emerald'
    }
  ]

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {language === 'ar' ? 'كل ما تحتاجه في مكان واحد' : 'Everything You Need in One Place'}
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {language === 'ar' 
              ? 'أدوات احترافية مصممة خصيصاً للمتداولين العرب'
              : 'Professional tools designed specifically for Arab traders'}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group p-6 rounded-2xl bg-gradient-to-br from-gray-900/50 to-black border border-gray-800 hover:border-cyan-500/50 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-xl ${
                feature.color === 'cyan' 
                  ? 'bg-cyan-500/10 border-cyan-500/30' 
                  : 'bg-emerald-500/10 border-emerald-500/30'
              } border flex items-center justify-center mb-4 group-hover:shadow-lg ${
                feature.color === 'cyan' 
                  ? 'group-hover:shadow-cyan-500/20' 
                  : 'group-hover:shadow-emerald-500/20'
              } transition-all`}>
                <feature.icon className={`w-7 h-7 ${
                  feature.color === 'cyan' ? 'text-cyan-400' : 'text-emerald-400'
                }`} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================
// 5️⃣ PAIN POINT SECTION - مع تصميم جذاب
// ============================================
function PainPointSection({ language }: { language: string }) {
  const painPoints = [
    {
      icon: AlertTriangle,
      text: language === 'ar' ? 'خسائر متكررة بسبب قرارات متهورة' : 'Repeated losses due to rash decisions'
    },
    {
      icon: Target,
      text: language === 'ar' ? 'صعوبة تتبع أدائك الحقيقي' : 'Difficulty tracking your real performance'
    },
    {
      icon: Brain,
      text: language === 'ar' ? 'عدم السيطرة على المشاعر أثناء التداول' : 'Lack of emotional control while trading'
    },
    {
      icon: Shield,
      text: language === 'ar' ? 'إدارة مخاطر ضعيفة تهدد رأس المال' : 'Weak risk management threatening your capital'
    }
  ]

  return (
    <section className="py-24 bg-gradient-to-r from-red-900/10 via-orange-900/10 to-red-900/10 border-y border-red-500/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {language === 'ar' ? (
              <>
                التداول يتطلب انضباط. <span className="text-red-400">أنت تحتاج نظام.</span>
              </>
            ) : (
              <>
                Trading requires discipline. <span className="text-red-400">You need a system.</span>
              </>
            )}
          </h2>
          
          <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
            {language === 'ar' 
              ? 'معظم المتداولين يخسرون المال لأنهم يفتقدون الأدوات المناسبة للإدارة والتحليل'
              : 'Most traders lose money because they lack the right tools for management and analysis'}
          </p>

          {/* Pain Points */}
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            {painPoints.map((point, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-right">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <point.icon className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-gray-300">{point.text}</p>
              </div>
            ))}
          </div>

          {/* Solution Box */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-cyan-900/30 to-emerald-900/30 border border-cyan-500/20">
            <div className="flex items-center justify-center gap-3 mb-4">
              <CheckCircle className="w-8 h-8 text-cyan-400" />
              <h3 className="text-2xl font-bold text-white">
                {language === 'ar' ? 'TradeMaster هو الحل' : 'TradeMaster is the Solution'}
              </h3>
            </div>
            <p className="text-gray-400 mb-6">
              {language === 'ar' 
                ? 'منصة متكاملة تمنحك الأدوات التي تحتاجها لإدارة تداولاتك بثقة وانضباط'
                : 'A complete platform that gives you the tools you need to manage your trades with confidence and discipline'}
            </p>
            <ul className="flex flex-wrap justify-center gap-3">
              {[
                language === 'ar' ? 'تتبع الصفقات' : 'Track Trades',
                language === 'ar' ? 'تحليل الأداء' : 'Analyze Performance',
                language === 'ar' ? 'إدارة المخاطر' : 'Risk Management',
                language === 'ar' ? 'تحسين السيكولوجي' : 'Psychology Improvement'
              ].map((item, i) => (
                <li key={i} className="px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-sm text-cyan-400">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================
// 6️⃣ DASHBOARD PREVIEW - مع تصميم Mac-like
// ============================================
function DashboardPreview({ language }: { language: string }) {
  const [activeTab, setActiveTab] = useState('overview')
  
  const tabs = [
    { id: 'overview', label: language === 'ar' ? 'نظرة عامة' : 'Overview' },
    { id: 'trades', label: language === 'ar' ? 'الصفقات' : 'Trades' },
    { id: 'psychology', label: language === 'ar' ? 'السيكولوجي' : 'Psychology' }
  ]

  const stats = [
    { label: language === 'ar' ? 'صافي الربح' : 'Net P&L', value: '+$4,300', positive: true },
    { label: language === 'ar' ? 'نسبة الفوز' : 'Win Rate', value: '68%', positive: true },
    { label: language === 'ar' ? 'الصفقات' : 'Trades', value: '156', positive: null },
    { label: language === 'ar' ? 'أفضل صفقة' : 'Best Trade', value: '+$850', positive: true }
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {language === 'ar' ? 'لوحة تحكم ذكية' : 'Smart Dashboard'}
          </h2>
          <p className="text-gray-400 text-lg">
            {language === 'ar' 
              ? 'كل بياناتك في مكان واحد مع تحليلات فورية'
              : 'All your data in one place with instant analytics'}
          </p>
        </div>

        {/* Mac-like Window */}
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl bg-gray-900 border border-gray-800 shadow-2xl shadow-cyan-500/10 overflow-hidden">
            {/* Window Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 border-b border-gray-700">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-4 text-sm text-gray-400">TradeMaster Dashboard</span>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-4 pt-4">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-t-lg text-sm transition-all ${
                    activeTab === tab.id 
                      ? 'bg-gray-800 text-cyan-400 border-t border-x border-gray-700' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 bg-gray-800/30 min-h-[400px]">
              {activeTab === 'overview' && (
                <>
                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {stats.map((stat, i) => (
                      <div key={i} className="p-4 rounded-xl bg-gray-900/50 border border-gray-700">
                        <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
                        <p className={`text-2xl font-bold ${
                          stat.positive === true ? 'text-emerald-400' : 
                          stat.positive === false ? 'text-red-400' : 'text-white'
                        }`}>
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Chart Placeholder */}
                  <div className="h-48 rounded-xl bg-gradient-to-br from-cyan-900/20 to-emerald-900/20 border border-gray-700 flex items-center justify-center">
                    <div className="text-center">
                      <Activity className="w-12 h-12 text-cyan-400 mx-auto mb-2 opacity-50" />
                      <p className="text-gray-500 text-sm">
                        {language === 'ar' ? 'منحنى الأداء' : 'Performance Chart'}
                      </p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                    <span>{language === 'ar' ? 'آخر تحديث' : 'Last updated'}: اليوم 14:30</span>
                    <span>{language === 'ar' ? 'يناير 2024' : 'January 2024'}</span>
                  </div>
                </>
              )}

              {activeTab === 'trades' && (
                <div className="text-center py-12">
                  <LineChart className="w-12 h-12 text-cyan-400 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-500">
                    {language === 'ar' ? 'سجل الصفقات يظهر هنا' : 'Trade journal appears here'}
                  </p>
                </div>
              )}

              {activeTab === 'psychology' && (
                <div className="text-center py-12">
                  <Brain className="w-12 h-12 text-emerald-400 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-500">
                    {language === 'ar' ? 'تحليل السيكولوجي يظهر هنا' : 'Psychology analysis appears here'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================
// 7️⃣ PRICING SECTION
// ============================================
function PricingSection({ language, onGetStarted }: { language: string; onGetStarted: () => void }) {
  const plans = [
    {
      name: language === 'ar' ? 'مجاني' : 'Free',
      price: '$0',
      features: [
        language === 'ar' ? 'محفظة واحدة' : '1 Portfolio',
        language === 'ar' ? '10 صفقات/شهر' : '10 Trades/Month',
        language === 'ar' ? 'يومية التداول' : 'Trading Journal',
        language === 'ar' ? 'إحصائيات أساسية' : 'Basic Statistics'
      ]
    },
    {
      name: 'Pro',
      price: '$15',
      period: language === 'ar' ? '/شهر' : '/month',
      features: [
        language === 'ar' ? 'محافظ غير محدودة' : 'Unlimited Portfolios',
        language === 'ar' ? 'صفقات غير محدودة' : 'Unlimited Trades',
        language === 'ar' ? 'تكامل MT4/MT5' : 'MT4/MT5 Integration',
        language === 'ar' ? 'تحليل السيكولوجي' : 'Psychology Analysis',
        language === 'ar' ? 'تقارير متقدمة' : 'Advanced Reports',
        language === 'ar' ? 'مساعد AI' : 'AI Assistant'
      ],
      popular: true
    }
  ]

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {language === 'ar' ? 'خطط بسيطة ومناسبة' : 'Simple & Fair Pricing'}
          </h2>
          <p className="text-gray-400 text-lg">
            {language === 'ar' 
              ? 'ابدأ مجاناً وترقٍ عند الحاجة'
              : 'Start free and upgrade when needed'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`p-8 rounded-2xl ${
                plan.popular 
                  ? 'bg-gradient-to-br from-cyan-900/30 to-emerald-900/30 border-2 border-cyan-500/50' 
                  : 'bg-gray-900/50 border border-gray-800'
              }`}
            >
              {plan.popular && (
                <span className="inline-block px-3 py-1 text-xs font-semibold bg-cyan-500 text-black rounded-full mb-4">
                  {language === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}
                </span>
              )}
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                {plan.period && <span className="text-gray-400">{plan.period}</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-cyan-400' : 'text-gray-500'}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className={`w-full ${plan.popular ? 'bg-cyan-500 hover:bg-cyan-600 text-black' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                onClick={onGetStarted}
              >
                {language === 'ar' ? 'ابدأ الآن' : 'Get Started'}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================
// 8️⃣ LIVE DEMO SECTION
// ============================================
function LiveDemo({ lng }: { lng: string }) {
  const [play, setPlay] = useState(false)
  return (
    <section className="py-16 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">{lng === 'ar' ? 'شاهد كيف يعمل' : 'See How It Works'}</h2>
        <div className="rounded-2xl bg-gradient-to-br from-cyan-900/50 to-emerald-900/50 border border-cyan-500/30 aspect-video flex items-center justify-center max-w-2xl mx-auto">
          <button onClick={() => setPlay(!play)} className="w-20 h-20 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center hover:bg-cyan-500/30 transition-all">
            {play ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
          </button>
        </div>
      </div>
    </section>
  )
}

// ============================================
// MAIN LANDING PAGE COMPONENT
// ============================================
export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const { t, language } = useI18n()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800 bg-gray-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-black" />
              </div>
              <span className="text-xl font-bold text-white">TradeMaster</span>
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800" onClick={onLogin}>
                {t('auth.login')}
              </Button>
              <Button 
                className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-90 text-black font-semibold" 
                onClick={onGetStarted}
              >
                {language === 'ar' ? 'ابدأ مجاناً' : 'Start Free'}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sections */}
      <div className="pt-16">
        <HeroSection language={language} onGetStarted={onGetStarted} onLogin={onLogin} />
        <FeaturesSection language={language} />
        <PainPointSection language={language} />
        <DashboardPreview language={language} />
        <PricingSection language={language} onGetStarted={onGetStarted} />
        <LiveDemo lng={language} />
        <TrustBadges lng={language} />
        <SocialProof lng={language} />
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              <span className="text-white font-semibold">TradeMaster</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2024 TradeMaster. {language === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}