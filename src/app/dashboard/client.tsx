"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
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
  Loader2,
} from "lucide-react";

// Loading skeleton component
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-800 rounded-xl animate-pulse" />
            <div className="space-y-2">
              <div className="w-32 h-5 bg-zinc-800 rounded animate-pulse" />
              <div className="w-24 h-3 bg-zinc-800 rounded animate-pulse" />
            </div>
          </div>
          <div className="w-24 h-8 bg-zinc-800 rounded-lg animate-pulse" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-zinc-800/50 rounded-xl animate-pulse" />
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-zinc-800/50 rounded-xl animate-pulse" />
          <div className="h-80 bg-zinc-800/50 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardClient() {
  const [mounted, setMounted] = useState(false);
  const [timeframe, setTimeframe] = useState<"today" | "week" | "month" | "year">("week");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading skeleton during hydration
  if (!mounted) {
    return <DashboardSkeleton />;
  }

  // Mock data for dashboard
  const stats = {
    totalTrades: 248,
    winRate: 68.5,
    profitFactor: 2.1,
    totalPnL: 15420.5,
    avgRRR: 2.4,
    maxDrawdown: -8.2,
    sharpeRatio: 1.85,
    expectancy: 62.15,
  };

  const recentTrades = [
    { id: 1, symbol: "DAX", type: "long", entry: 18250, exit: 18280, pnl: 300, result: "win", date: "2026-04-06" },
    { id: 2, symbol: "NAS100", type: "short", entry: 15420, exit: 15450, pnl: -150, result: "loss", date: "2026-04-05" },
    { id: 3, symbol: "XAU/USD", type: "long", entry: 2350, exit: 2380, pnl: 450, result: "win", date: "2026-04-04" },
    { id: 4, symbol: "DAX", type: "short", entry: 18200, exit: 18150, pnl: 200, result: "win", date: "2026-04-03" },
  ];

  const portfolioAssets = [
    { name: "المؤشرات", value: 45, color: "#eab308" },
    { name: "العملات", value: 25, color: "#22c55e" },
    { name: "المعادن", value: 15, color: "#f59e0b" },
    { name: "الطاقة", value: 10, color: "#ef4444" },
    { name: "كريبتو", value: 5, color: "#8b5cf6" },
  ];

  const psychologicalScore = {
    overall: 78,
    discipline: 82,
    emotionalControl: 75,
    focus: 80,
    stressLevel: 35,
  };

  const weeklyGoals = [
    { id: 1, title: "تحقيق 2% أسبوعياً", progress: 75, completed: false },
    { id: 2, title: "الالتزام بخطة التداول", progress: 90, completed: false },
    { id: 3, title: "تدوين 5 صفقات على الأقل", progress: 100, completed: true },
    { id: 4, title: "مراجعة الأداء الأسبوعي", progress: 50, completed: false },
  ];

  const quickLinks = [
    { href: "/charts", icon: BarChart3, label: "الرسوم البيانية", color: "from-blue-500 to-blue-600" },
    { href: "/academy", icon: BookOpen, label: "الأكاديمية", color: "from-green-500 to-green-600" },
    { href: "/journal", icon: FileText, label: "يومية التداول", color: "from-purple-500 to-purple-600" },
    { href: "/settings", icon: Settings, label: "الإعدادات", color: "from-zinc-500 to-zinc-600" },
  ];

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
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400 text-sm">إجمالي الصفقات</span>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalTrades}</p>
            <p className="text-xs text-green-500 mt-1">+12 هذا الأسبوع</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400 text-sm">نسبة الفوز</span>
              <Percent className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.winRate}%</p>
            <p className="text-xs text-blue-500 mt-1">+2.5% عن الشهر الماضي</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400 text-sm">إجمالي الربح/الخسارة</span>
              <DollarSign className="w-4 h-4 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-white">${stats.totalPnL.toLocaleString()}</p>
            <p className="text-xs text-green-500 mt-1">+15.2% هذا الشهر</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400 text-sm">معدل الربح/الخسارة</span>
              <Award className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-white">1:{stats.avgRRR}</p>
            <p className="text-xs text-purple-500 mt-1">أفضل من المتوسط</p>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">توزيع المحفظة</h3>
            <div className="flex items-center justify-center h-48">
              <PieChart className="w-32 h-32 text-zinc-700" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {portfolioAssets.map((asset, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.color }} />
                  <span className="text-sm text-zinc-400">{asset.name}</span>
                  <span className="text-sm font-medium text-white mr-auto">{asset.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Trades */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">آخر الصفقات</h3>
            <div className="space-y-3">
              {recentTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${trade.type === "long" ? "bg-green-500/20" : "bg-red-500/20"}`}>
                      {trade.type === "long" ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">{trade.symbol}</p>
                      <p className="text-xs text-zinc-500">{trade.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${trade.pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {trade.pnl >= 0 ? "+" : ""}${trade.pnl}
                    </p>
                    <p className="text-xs text-zinc-500">{trade.result === "win" ? "ربح" : "خسارة"}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Psychology & Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Psychological Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-white">الحالة النفسية</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                <p className="text-3xl font-bold text-purple-500">{psychologicalScore.overall}</p>
                <p className="text-sm text-zinc-400">النتيجة الإجمالية</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">الانضباط</span>
                  <span className="font-medium text-green-500">{psychologicalScore.discipline}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">التحكم العاطفي</span>
                  <span className="font-medium text-yellow-500">{psychologicalScore.emotionalControl}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">التركيز</span>
                  <span className="font-medium text-blue-500">{psychologicalScore.focus}%</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Weekly Goals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-white">الأهداف الأسبوعية</h3>
              </div>
              <span className="text-sm text-zinc-500">75% مكتمل</span>
            </div>
            <div className="space-y-3">
              {weeklyGoals.map((goal) => (
                <div key={goal.id} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${goal.completed ? "bg-green-500" : "border-2 border-zinc-600"}`}>
                    {goal.completed && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-sm ${goal.completed ? "text-zinc-400 line-through" : "text-white"}`}>
                        {goal.title}
                      </span>
                      <span className="text-xs text-zinc-500">{goal.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${goal.completed ? "bg-green-500" : "bg-orange-500"}`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickLinks.map((link, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + i * 0.1 }}
            >
              <Link
                href={link.href}
                className={`flex flex-col items-center justify-center p-6 bg-gradient-to-br ${link.color} rounded-xl hover:scale-105 transition-transform`}
              >
                <link.icon className="w-8 h-8 text-white mb-2" />
                <span className="text-sm font-medium text-white">{link.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
