'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  Settings,
  ArrowLeft,
  Monitor,
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic imports for TradingView widgets (client-side only)
const TradingViewWidget = dynamic(
  () => import('@/components/trading/TradingViewWidget'),
  { ssr: false }
);

const MarketOverview = dynamic(
  () => import('@/components/trading/MarketOverview'),
  { ssr: false }
);

const EconomicCalendar = dynamic(
  () => import('@/components/trading/EconomicCalendar'),
  { ssr: false }
);

const popularSymbols = [
  { symbol: 'OANDA:GER40USD', name: 'DAX 40', category: 'مؤشرات' },
  { symbol: 'CURRENCYCOM:US100', name: 'NAS100', category: 'مؤشرات' },
  { symbol: 'PEPPERSTONE:US500', name: 'US500', category: 'مؤشرات' },
  { symbol: 'OANDA:XAUUSD', name: 'XAU/USD', category: 'معادن' },
  { symbol: 'OANDA:WTIUSD', name: 'WTI', category: 'طاقة' },
  { symbol: 'BINANCE:BTCUSDT', name: 'BTC/USDT', category: 'كريبتو' },
  { symbol: 'OANDA:EURUSD', name: 'EUR/USD', category: 'عملات' },
  { symbol: 'OANDA:GBPUSD', name: 'GBP/USD', category: 'عملات' },
];

const intervals = [
  { label: '1 دقيقة', value: '1' },
  { label: '5 دقائق', value: '5' },
  { label: '15 دقيقة', value: '15' },
  { label: '30 دقيقة', value: '30' },
  { label: 'ساعة', value: '60' },
  { label: '4 ساعات', value: '240' },
  { label: 'يومي', value: 'D' },
  { label: 'أسبوعي', value: 'W' },
];

export default function ChartsClient() {
  const [selectedSymbol, setSelectedSymbol] = useState('OANDA:GER40USD');
  const [selectedInterval, setSelectedInterval] = useState('1');
  const [activeTab, setActiveTab] = useState<'chart' | 'market' | 'calendar'>('chart');

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-black" />
              </div>
              <span className="text-xl font-bold text-white">TradeMaster Charts</span>
            </Link>
            <nav className="hidden md:flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                لوحة التحكم
              </Link>
              <Link
                href="/academy"
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <TrendingUp className="w-4 h-4" />
                الأكاديمية
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="border-b border-white/10 bg-zinc-900/50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center gap-4">
            {/* Symbol Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500">الرمز:</span>
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500"
              >
                {popularSymbols.map((s) => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Interval Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500">الإطار:</span>
              <div className="flex gap-1">
                {intervals.slice(0, 5).map((int) => (
                  <button
                    key={int.value}
                    onClick={() => setSelectedInterval(int.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedInterval === int.value
                        ? 'bg-yellow-500 text-black'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {int.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mr-auto">
              {[
                { id: 'chart', icon: TrendingUp, label: 'الرسم البياني' },
                { id: 'market', icon: Monitor, label: 'نظرة السوق' },
                { id: 'calendar', icon: Calendar, label: 'التقويم' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'chart' && (
            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-lg font-semibold text-white">
                    {popularSymbols.find((s) => s.symbol === selectedSymbol)?.name}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div style={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}>
                <TradingViewWidget
                  symbol={selectedSymbol}
                  interval={selectedInterval}
                  theme="dark"
                  locale="ar"
                  height="100%"
                  width="100%"
                />
              </div>
            </div>
          )}

          {activeTab === 'market' && (
            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden p-4">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-yellow-500" />
                نظرة عامة على السوق
              </h2>
              <div style={{ height: 'calc(100vh - 350px)', minHeight: '400px' }}>
                <MarketOverview
                  theme="dark"
                  locale="ar"
                  height="100%"
                  width="100%"
                />
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden p-4">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-yellow-500" />
                التقويم الاقتصادي
              </h2>
              <div style={{ height: 'calc(100vh - 350px)', minHeight: '400px' }}>
                <EconomicCalendar
                  theme="dark"
                  locale="ar"
                  height="100%"
                  width="100%"
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'المؤشرات المتاحة', value: '50+' },
            { label: 'أزواج العملات', value: '80+' },
            { label: 'المؤشرات الفنية', value: '100+' },
            { label: 'الأطر الزمنية', value: '14' },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-zinc-900/50 border border-white/10 rounded-xl p-4"
            >
              <div className="text-2xl font-bold text-yellow-500">{stat.value}</div>
              <div className="text-sm text-zinc-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
