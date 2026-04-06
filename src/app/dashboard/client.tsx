'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Brain,
  BookOpen,
  Settings,
  Bell,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  DollarSign,
  Percent,
  Award,
  Zap,
  FileText,
  Users,
} from 'lucide-react';

// Mock data for dashboard
const stats = {
  totalTrades: 248,
  winRate: 68.5,
  profitFactor: 2.1,
  totalPnL: 15420.50,
  avgRRR: 2.4,
  maxDrawdown: -8.2,
  sharpeRatio: 1.85,
  expectancy: 62.15,
};

const recentTrades = [
  { id: 1, symbol: 'DAX', type: 'long', entry: 18250, exit: 18280, pnl: 300, result: 'win', date: '2026-04-06' },
  { id: 2, symbol: 'NAS100', type: 'short', entry: 15420, exit: 15450, pnl: -150, result: 'loss', date: '2026-04-05' },
  { id: 3, symbol: 'XAU/USD', type: 'long', entry: 2350, exit: 2380, pnl: 450, result: 'win', date: '2026-04-04' },
  { id: 4, symbol: 'DAX', type: 'short', entry: 18200, exit: 18150, pnl: 200, result: 'win', date: '2026-04-03' },
];

const portfolioAssets = [
  { name: 'المؤشرات', value: 45, color: '#eab308' },
  { name: 'العملات', value: 25, color: '#22c55e' },
  { name: 'المعادن', value: 15, color: '#f59e0b' },
  { name: 'الطاقة', value: 10, color: '#ef4444' },
  { name: 'كريبتو', value: 5, color: '#8b5cf6' },
];

const psychologicalScore = {
  overall: 78,
  discipline: 82,
  emotionalControl: 75,
  focus: 80,
  stressLevel: 35,
};

const weeklyGoals = [
  { id: 1, title: 'تحقيق 2% أسبوعياً', progress: 75, completed: false },
  { id: 2, title: 'الالتزام بخطة التداول', progress: 90, completed: false },
  { id: 3, title: 'تدوين 5 صفقات على الأقل', progress: 100, completed: true },
  { id: 4, title: 'مراجعة الأداء الأسبوعي', progress: 50, completed: false },
];

const quickLinks = [
  { href: '/charts', icon: BarChart3, label: 'الرسوم البيانية', color: 'from-blue-500 to-blue-600' },
  { href: '/academy', icon: BookOpen, label: 'الأكاديمية', color: 'from-green-500 to-green-600' },
  { href: '/journal', icon: FileText, label: 'يومية التداول', color: 'from-purple-500 to-purple-600' },
  { href: '/settings', icon: Settings, label: 'الإعدادات', color: 'from-zinc-500 to-zinc-600' },
];

export default function DashboardClient() {
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'year'>('week');

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">لوحة التحكم</h1>
                <p className="text-xs text-zinc-500">أهلاً بك، Mohamed Ali</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Bell className="w-5 h-5 text-zinc-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full"></span>
              </button>
              <Link href="/settings" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Settings className="w-5 h-5 text-zinc-400" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                صباح الخير، Mohamed! ☀️
              </h2>
              <p className="text-zinc-400">
                لديك جلسة تداول ممتازة اليوم. استمر في الالتزام بخطتك!
              </p>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-2 bg-zinc-900/50 rounded-xl px-4 py-2">
                <Activity className="w-5 h-5 text-green-500" />
                <span className="text-sm text-white">السوق مفتوح</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { id: 'today', label: 'اليوم' },
            { id: 'week', label: 'الأسبوع' },
            { id: 'month', label: 'الشهر' },
            { id: 'year', label: 'السنة' },
          ].map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id as typeof timeframe)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                timeframe === tf.id
                  ? 'bg-yellow-500 text-black'
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'إجمالي الصفقات', value: stats.totalTrades, icon: BarChart3, color: 'from-blue-500 to-blue-600', change: '+12' },
            { label: 'نسبة الفوز', value: `${stats.winRate}%`, icon: Target, color: 'from-green-500 to-green-600', change: '+2.5%' },
            { label: 'معامل الربح', value: stats.profitFactor, icon: DollarSign, color: 'from-yellow-500 to-yellow-600', change: '+0.3' },
            { label: 'صافي الربح', value: `$${stats.totalPnL.toLocaleString()}`, icon: TrendingUp, color: 'from-purple-500 to-purple-600', change: '+$1,420' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-zinc-900/50 border border-white/10 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-green-500 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-zinc-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Trades */}
          <div className="lg:col-span-2 bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                آخر الصفقات
              </h3>
              <Link href="/journal" className="text-sm text-yellow-500 hover:text-yellow-400">
                عرض الكل
              </Link>
            </div>
            <div className="space-y-3">
              {recentTrades.map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        trade.result === 'win'
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-red-500/20 text-red-500'
                      }`}
                    >
                      {trade.type === 'long' ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-white">{trade.symbol}</div>
                      <div className="text-xs text-zinc-500">
                        {trade.type === 'long' ? 'شراء' : 'بيع'} @ {trade.entry}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-semibold ${
                        trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {trade.pnl >= 0 ? '+' : ''}${trade.pnl}
                    </div>
                    <div className="text-xs text-zinc-500">{trade.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio Distribution */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
              <PieChart className="w-5 h-5 text-yellow-500" />
              توزيع المحفظة
            </h3>
            <div className="space-y-4">
              {portfolioAssets.map((asset, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">{asset.name}</span>
                    <span className="text-sm text-zinc-400">{asset.value}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${asset.value}%` }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: asset.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Psychology & Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Psychological Score */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
              <Brain className="w-5 h-5 text-yellow-500" />
              الحالة النفسية
            </h3>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-white/5"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${psychologicalScore.overall * 3.51} 351`}
                    className="text-yellow-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{psychologicalScore.overall}%</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'الانضباط', value: psychologicalScore.discipline },
                { label: 'التحكم العاطفي', value: psychologicalScore.emotionalControl },
                { label: 'التركيز', value: psychologicalScore.focus },
                { label: 'مستوى الإجهاد', value: psychologicalScore.stressLevel },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-3">
                  <div className="text-xs text-zinc-400 mb-1">{item.label}</div>
                  <div className="text-lg font-semibold text-white">{item.value}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Goals */}
          <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-yellow-500" />
              أهداف الأسبوع
            </h3>
            <div className="space-y-4">
              {weeklyGoals.map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300 flex items-center gap-2">
                      {goal.completed && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {goal.title}
                    </span>
                    <span className="text-xs text-zinc-400">{goal.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{ duration: 0.5 }}
                      className={`h-full rounded-full ${
                        goal.completed ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickLinks.map((link, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={link.href}
                className={`block bg-gradient-to-br ${link.color} rounded-2xl p-6 text-white hover:opacity-90 transition-opacity`}
              >
                <link.icon className="w-8 h-8 mb-3" />
                <div className="font-semibold">{link.label}</div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Advanced Metrics */}
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-yellow-500" />
            مقاييس متقدمة
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'متوسط R:R', value: `1:${stats.avgRRR}`, icon: Zap },
              { label: 'أقصى خسارة', value: `${stats.maxDrawdown}%`, icon: TrendingDown },
              { label: 'نسبة شارب', value: stats.sharpeRatio, icon: Percent },
              { label: 'القيمة المتوقعة', value: `$${stats.expectancy}`, icon: DollarSign },
            ].map((metric, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-4 text-center">
                <metric.icon className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <div className="text-xl font-bold text-white">{metric.value}</div>
                <div className="text-xs text-zinc-500">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
