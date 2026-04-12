'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { 
  TrendingUp, 
  ChevronDown, 
  BookOpen, 
  Brain, 
  Sparkles, 
  CreditCard,
  Globe,
  Menu,
  X,
  LogIn,
  LineChart,
  BarChart3,
  Shield,
  Wallet,
  Target,
  Layers,
  PieChart
} from 'lucide-react'

interface HeaderProps {
  onLogin?: () => void
  onGetStarted?: () => void
  variant?: 'landing' | 'dashboard'
}

// Feature Category Header
function FeatureCategory({ title, icon: Icon }: { title: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gold/80 uppercase tracking-wider">
      <Icon className="h-3.5 w-3.5" />
      {title}
    </div>
  )
}

// Feature Item
function FeatureItem({ 
  icon: Icon, 
  title, 
  description, 
  href,
  onClick,
  language
}: { 
  icon: React.ElementType
  title: string
  description: string
  href?: string
  onClick?: () => void
  language: string
}) {
  const content = (
    <div className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-cyan-500/5 transition-colors cursor-pointer group">
      <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/30 transition-colors flex-shrink-0">
        <Icon className="h-4 w-4 text-cyan-400" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors truncate">{title}</div>
        <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{description}</div>
      </div>
    </div>
  )

  if (onClick) {
    return <div onClick={onClick}>{content}</div>
  }

  return <Link href={href || '#'}>{content}</Link>
}

export function Header({ onLogin, onGetStarted, variant = 'landing' }: HeaderProps) {
  const { t, language, setLanguage } = useI18n()
  const [featuresOpen, setFeaturesOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const featuresRef = useRef<HTMLDivElement>(null)

  const isRTL = language === 'ar'

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (featuresRef.current && !featuresRef.current.contains(event.target as Node)) {
        setFeaturesOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Features organized by category
  const featureCategories = [
    {
      title: language === 'ar' ? 'التحليل' : 'Analysis',
      icon: BarChart3,
      items: [
        {
          icon: BookOpen,
          title: language === 'ar' ? 'يومية التداول الذكية' : 'Smart Trading Journal',
          description: language === 'ar' ? 'سجل جلساتك بثلاث مراحل' : 'Track sessions in 3 phases',
          href: '#journal'
        },
        {
          icon: LineChart,
          title: language === 'ar' ? 'تحليل الأداء المتعمق' : 'Deep Performance Analytics',
          description: language === 'ar' ? 'إحصائيات ومقاييس متقدمة' : 'Advanced stats and metrics',
          href: '#analytics'
        }
      ]
    },
    {
      title: language === 'ar' ? 'مدعوم بالذكاء الاصطناعي' : 'AI Powered',
      icon: Sparkles,
      items: [
        {
          icon: Brain,
          title: language === 'ar' ? 'مُوجه التداول الذكي' : 'AI Trading Mentor',
          description: language === 'ar' ? 'توصيات SMC مخصصة' : 'Personalized SMC recommendations',
          href: '#ai-mentor'
        },
        {
          icon: Target,
          title: language === 'ar' ? 'مساعد علم النفس' : 'Psychology Assistant',
          description: language === 'ar' ? 'مراقبة المشاعر والانضباط' : 'Monitor emotions & discipline',
          href: '#psychology'
        }
      ]
    },
    {
      title: language === 'ar' ? 'الاستراتيجية' : 'Strategy',
      icon: Layers,
      items: [
        {
          icon: Target,
          title: language === 'ar' ? 'باني الـ Playbook' : 'Playbook Builder',
          description: language === 'ar' ? 'قواعد الدخول والخروج' : 'Entry & exit rules',
          href: '#playbook'
        },
        {
          icon: LineChart,
          title: language === 'ar' ? 'جناح الاختبار الخلفي' : 'Backtesting Suite',
          description: language === 'ar' ? 'اختبر استراتيجياتك' : 'Test your strategies',
          href: '#backtesting'
        }
      ]
    },
    {
      title: language === 'ar' ? 'الإدارة' : 'Management',
      icon: Wallet,
      items: [
        {
          icon: Shield,
          title: language === 'ar' ? 'أدوات إدارة المخاطر' : 'Risk Management Tools',
          description: language === 'ar' ? 'حدود ومراقبة ذكية' : 'Limits & smart monitoring',
          href: '#risk'
        },
        {
          icon: PieChart,
          title: language === 'ar' ? 'محفظة متعددة الحسابات' : 'Multi-Account Portfolio',
          description: language === 'ar' ? 'إدارة 8+ حسابات' : 'Manage 8+ accounts',
          href: '#portfolio'
        }
      ]
    }
  ]

  // Flatten features for mobile
  const allFeatures = featureCategories.flatMap(cat => cat.items)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800 bg-gray-900/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow">
              <TrendingUp className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-bold text-white">
              TradeMaster
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Features Dropdown */}
            <div className="relative" ref={featuresRef}>
              <button
                onClick={() => setFeaturesOpen(!featuresOpen)}
                className={cn(
                  "flex items-center gap-1 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors",
                  featuresOpen && "bg-gray-800/50 text-white"
                )}
              >
                {language === 'ar' ? 'المميزات' : 'Features'}
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  featuresOpen && "rotate-180"
                )} />
              </button>

              {/* Dropdown Menu - Grid Layout */}
              {featuresOpen && (
                <div className={cn(
                  "absolute top-full mt-2 w-[600px] rounded-xl border border-gray-700 bg-gray-900/98 backdrop-blur-xl shadow-2xl shadow-black/50 z-50",
                  "animate-in fade-in-0 zoom-in-95 duration-200",
                  isRTL ? "right-0" : "left-0"
                )}>
                  <div className="p-4">
                    {/* Grid Layout - 2 columns */}
                    <div className="grid grid-cols-2 gap-4">
                      {featureCategories.map((category, catIndex) => (
                        <div key={catIndex} className="space-y-1">
                          <FeatureCategory title={category.title} icon={category.icon} />
                          {category.items.map((item, itemIndex) => (
                            <FeatureItem
                              key={itemIndex}
                              {...item}
                              language={language}
                              onClick={() => setFeaturesOpen(false)}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                    
                    {/* Bottom CTA */}
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <Link 
                        href="#features"
                        onClick={() => setFeaturesOpen(false)}
                        className="flex items-center justify-center gap-2 p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-colors group"
                      >
                        <Sparkles className="h-4 w-4 text-cyan-400" />
                        <span className="text-sm text-white group-hover:text-cyan-400 transition-colors">
                          {language === 'ar' ? 'استكشف كل المميزات' : 'Explore All Features'}
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Link */}
            <Link 
              href="#pricing"
              className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
            >
              {language === 'ar' ? 'الأسعار' : 'Pricing'}
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <div className="flex items-center bg-gray-800/50 rounded-lg p-0.5 border border-gray-700">
              <button
                onClick={() => setLanguage('ar')}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  language === 'ar' 
                    ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-black" 
                    : "text-gray-400 hover:text-white"
                )}
              >
                AR
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  language === 'en' 
                    ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-black" 
                    : "text-gray-400 hover:text-white"
                )}
              >
                EN
              </button>
            </div>

            {/* Login Button */}
            {onLogin && (
              <Button 
                variant="ghost" 
                className="hidden sm:flex text-gray-300 hover:text-cyan-400 hover:bg-gray-800/50 border border-gray-700"
                onClick={onLogin}
              >
                <LogIn className="w-4 h-4 mr-2" />
                {t('auth.login')}
              </Button>
            )}

            {/* Get Started Button */}
            {onGetStarted && (
              <Button 
                className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-90 text-black font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-shadow"
                onClick={onGetStarted}
              >
                {language === 'ar' ? 'ابدأ مجاناً' : 'Start Free'}
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-800 py-4 animate-in fade-in-0 slide-in-from-top-5 duration-200">
            {/* Mobile Features by Category */}
            {featureCategories.map((category, catIndex) => (
              <div key={catIndex} className="mb-4">
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                  <category.icon className="h-3.5 w-3.5" />
                  {category.title}
                </div>
                {category.items.map((item, itemIndex) => (
                  <Link
                    key={itemIndex}
                    href={item.href || '#'}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5 text-cyan-400" />
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            ))}

            {/* Mobile Pricing */}
            <Link
              href="#pricing"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <CreditCard className="h-5 w-5 text-cyan-400" />
              <span>{language === 'ar' ? 'الأسعار' : 'Pricing'}</span>
            </Link>

            {/* Mobile Auth Buttons */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-800">
              {onLogin && (
                <Button 
                  variant="outline" 
                  className="flex-1 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    onLogin()
                  }}
                >
                  {t('auth.login')}
                </Button>
              )}
              {onGetStarted && (
                <Button 
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-emerald-500 text-black font-semibold"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    onGetStarted()
                  }}
                >
                  {language === 'ar' ? 'ابدأ مجاناً' : 'Start Free'}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
