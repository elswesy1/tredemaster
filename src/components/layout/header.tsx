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
  LogIn
} from 'lucide-react'

interface HeaderProps {
  onLogin?: () => void
  onGetStarted?: () => void
  variant?: 'landing' | 'dashboard'
}

// Features Dropdown Item
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
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-navy-light/50 transition-colors cursor-pointer group">
      <div className="p-2 rounded-lg bg-gold/10 border border-gold/20 group-hover:bg-gold/20 transition-colors">
        <Icon className="h-5 w-5 text-gold" />
      </div>
      <div>
        <div className="font-medium text-white group-hover:text-gold transition-colors">{title}</div>
        <div className="text-xs text-gray-400 mt-0.5">{description}</div>
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

  // Features data
  const features = [
    {
      icon: BookOpen,
      title: language === 'ar' ? 'يومية التداول' : 'Trading Journal',
      description: language === 'ar' ? 'سجل صفقاتك وقيّم أداءك' : 'Log trades and evaluate performance',
      href: '#journal'
    },
    {
      icon: Brain,
      title: language === 'ar' ? 'تحليل السيكولوجية' : 'Psychology Analysis',
      description: language === 'ar' ? 'تتبع مشاعرك وحسّن انضباطك' : 'Track emotions and improve discipline',
      href: '#psychology'
    },
    {
      icon: Sparkles,
      title: language === 'ar' ? 'رؤى AI' : 'AI Insights',
      description: language === 'ar' ? 'تحليلات ذكية لصفقاتك' : 'Smart analysis for your trades',
      href: '#ai-insights'
    }
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gold/10 bg-navy-dark/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-lg shadow-gold/20 group-hover:shadow-gold/40 transition-shadow">
              <TrendingUp className="w-6 h-6 text-navy-dark" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
              TradeMaster
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Features Dropdown */}
            <div className="relative" ref={featuresRef}>
              <button
                onClick={() => setFeaturesOpen(!featuresOpen)}
                className={cn(
                  "flex items-center gap-1 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-navy-light/50 transition-colors",
                  featuresOpen && "bg-navy-light/50 text-white"
                )}
              >
                {language === 'ar' ? 'المميزات' : 'Features'}
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  featuresOpen && "rotate-180"
                )} />
              </button>

              {/* Dropdown Menu */}
              {featuresOpen && (
                <div className={cn(
                  "absolute top-full mt-2 w-72 rounded-xl border border-gold/20 bg-navy-dark/95 backdrop-blur-xl shadow-xl shadow-black/50 z-50",
                  "animate-in fade-in-0 zoom-in-95 duration-200",
                  isRTL ? "right-0" : "left-0"
                )}>
                  <div className="p-2">
                    {features.map((feature, index) => (
                      <FeatureItem
                        key={index}
                        {...feature}
                        language={language}
                        onClick={() => setFeaturesOpen(false)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Link */}
            <Link 
              href="#pricing"
              className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-navy-light/50 transition-colors"
            >
              {language === 'ar' ? 'الأسعار' : 'Pricing'}
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <div className="flex items-center bg-navy-light/50 rounded-lg p-0.5 border border-gold/10">
              <button
                onClick={() => setLanguage('ar')}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  language === 'ar' 
                    ? "bg-gold text-navy-dark" 
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
                    ? "bg-gold text-navy-dark" 
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
                className="hidden sm:flex text-gray-300 hover:text-gold hover:bg-navy-light/50 border border-gold/10"
                onClick={onLogin}
              >
                <LogIn className="w-4 h-4 mr-2" />
                {t('auth.login')}
              </Button>
            )}

            {/* Get Started Button */}
            {onGetStarted && (
              <Button 
                className="bg-gradient-to-r from-gold to-gold-light hover:opacity-90 text-navy-dark font-semibold shadow-lg shadow-gold/20 hover:shadow-gold/40 transition-shadow"
                onClick={onGetStarted}
              >
                {language === 'ar' ? 'ابدأ مجاناً' : 'Start Free'}
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-navy-light/50 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gold/10 py-4 animate-in fade-in-0 slide-in-from-top-5 duration-200">
            {/* Mobile Features */}
            <div className="space-y-1 mb-4">
              <div className="px-3 py-2 text-xs font-semibold text-gold uppercase tracking-wider">
                {language === 'ar' ? 'المميزات' : 'Features'}
              </div>
              {features.map((feature, index) => (
                <Link
                  key={index}
                  href={feature.href || '#'}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-navy-light/50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <feature.icon className="h-5 w-5 text-gold" />
                  <span>{feature.title}</span>
                </Link>
              ))}
            </div>

            {/* Mobile Pricing */}
            <Link
              href="#pricing"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-navy-light/50 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <CreditCard className="h-5 w-5 text-gold" />
              <span>{language === 'ar' ? 'الأسعار' : 'Pricing'}</span>
            </Link>

            {/* Mobile Auth Buttons */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-gold/10">
              {onLogin && (
                <Button 
                  variant="outline" 
                  className="flex-1 border-gold/30 text-gold hover:bg-gold/10"
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
                  className="flex-1 bg-gradient-to-r from-gold to-gold-light text-navy-dark font-semibold"
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
