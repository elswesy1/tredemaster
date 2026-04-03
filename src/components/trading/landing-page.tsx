use client
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n'
import { useState } from 'react'
import { TrendingUp, Shield, BarChart3, Brain, Wallet, LineChart, BookOpen, CheckCircle, Users, Star, Award, Play, Pause, Calendar, Clock, DollarSign } from 'lucide-react'

interface LandingPageProps {
  onGetStarted: () => void
  onLogin: () => void
}

function TrustBadges({ language }: { language: string }) {
  const badges = [
    { icon: Shield, title: language === 'ar' ? 'تشفير AES-256' : 'AES-256 Encryption', desc: language === 'ar' ? 'حماية بياناتك' : 'Protected' },
    { icon: CheckCircle, title: language === 'ar' ? 'خوادم آمنة' : 'Secure Servers', desc: '24/7' },
    { icon: Star, title: language === 'ar' ? 'تقييم 4.9' : '4.9 Rating', desc: '2000+' },
    { icon: Award, title: language === 'ar' ? 'معتمد' : 'Certified', desc: 'SOC2' }
  ]
  return (
    <section className="py-12 bg-gradient-to-r from-emerald-900/20 to-cyan-900/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge, i) => (
            <div key={i} className="flex flex-col items-center text-center p-4 rounded-xl bg-black/20 border border-emerald-500/20">
              <badge.icon className="w-8 h-8 text-emerald-400 mb-3" />
              <h3 className="font-semibold text-white text-sm">{badge.title}</h3>
              <p className="text-xs text-gray-400 mt-1">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SocialProof({ language }: { language: string }) {
  const stats = [
    { value: '10,000+', label: language === 'ar' ? 'متداول' : 'Traders', icon: Users },
    { value: '98%', label: language === 'ar' ? 'رضا' : 'Satisfaction', icon: Star },
    { value: '150+', label: language === 'ar' ? 'دولة' : 'Countries', icon: Award },
    { value: '$50M+', label: language === 'ar' ? 'محافظ' : 'Assets', icon: DollarSign }
  ]
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="text-center p-6 rounded-2xl bg-gradient-to-b from-emerald-900/30 border border-emerald-500/10">
              <stat.icon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function LiveDemo({ language }: { language: string }) {
  const [playing, setPlaying] = useState(false)
  return (
    <section className="py-16 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">{language === 'ar' ? 'شاهد كيف يعمل' : 'See How It Works'}</h2>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-900/50 to-cyan-900/50 border border-emerald-500/30 aspect-video flex items-center justify-center max-w-2xl mx-auto">
          <button onClick={() => setPlaying(!playing)} className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center">
            {playing ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
          </button>
        </div>
      </div>
    </section>
  )
}

function BlogSEO({ language }: { language: string }) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">{language === 'ar' ? 'المدونة' : 'Blog'}</h2>
        <p className="text-gray-400 mb-8">{language === 'ar' ? 'قريباً...' : 'Coming soon...'}</p>
      </div>
    </section>
  )
}

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const { t, language } = useI18n()
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-emerald-950">
      <nav className="border-b border-emerald-500/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-emerald-400" />
            <span className="text-xl font-bold text-white">TradeMaster</span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="text-gray-300" onClick={onLogin}>{t('auth.login')}</Button>
            <Button className="bg-emerald-500 text-black" onClick={onGetStarted}>{language === 'ar' ? 'ابدأ' : 'Start'}</Button>
          </div>
        </div>
      </nav>
      <section className="py-20 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">{t('landing.heroTitle1')}<br /><span className="text-emerald-400">{t('landing.heroTitle2')}</span></h1>
        <p className="text-xl text-gray-400 mb-8">{t('landing.heroSubtitle')}</p>
      </section>
      <TrustBadges language={language} />
      <SocialProof language={language} />
      <LiveDemo language={language} />
      <BlogSEO language={language} />
    </div>
  )
}
