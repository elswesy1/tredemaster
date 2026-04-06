'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  TrendingUp,
  Brain,
  Shield,
  Target,
  Clock,
  Award,
  Users,
  Play,
  Lock,
  Check,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

const courses = [
  {
    id: 'intro-trading',
    title: 'مقدمة في الأسواق المالية',
    description: 'تعرف على الأسواق المالية وأنواعها وكيفية عملها',
    level: 'مبتدئ',
    duration: '4 ساعات',
    lessons: 12,
    icon: BookOpen,
    color: 'from-blue-500 to-blue-600',
    isFree: true,
    topics: ['ما هي الأسواق المالية؟', 'أنواع الأصول المالية', 'كيف تعمل البورصة', 'مفاهيم أساسية'],
  },
  {
    id: 'technical-analysis',
    title: 'التحليل الفني الشامل',
    description: 'إتقان التحليل الفني من الأساسيات إلى التقنيات المتقدمة',
    level: 'متوسط',
    duration: '12 ساعة',
    lessons: 36,
    icon: TrendingUp,
    color: 'from-green-500 to-green-600',
    isFree: false,
    topics: ['قراءة الشموع اليابانية', 'أنماط السعر', 'المؤشرات الفنية', 'خطوط الاتجاه', 'الدعم والمقاومة'],
  },
  {
    id: 'fundamental-analysis',
    title: 'التحليل الأساسي',
    description: 'فهم العوامل الاقتصادية المؤثرة على الأسواق',
    level: 'متوسط',
    duration: '8 ساعات',
    lessons: 24,
    icon: Target,
    color: 'from-purple-500 to-purple-600',
    isFree: false,
    topics: ['الأخبار الاقتصادية', 'قرارات البنوك المركزية', 'التقارير الاقتصادية', 'الناتج المحلي الإجمالي'],
  },
  {
    id: 'risk-management',
    title: 'إدارة المخاطر والأموال',
    description: 'تعلم كيفية حماية رأس المال وإدارة المخاطر بشكل احترافي',
    level: 'متقدم',
    duration: '6 ساعات',
    lessons: 18,
    icon: Shield,
    color: 'from-red-500 to-red-600',
    isFree: false,
    topics: ['حساب حجم الصفقة', 'وقف الخسارة', 'إدارة المخاطر', 'تنويع المحفظة'],
  },
  {
    id: 'trading-psychology',
    title: 'سيكولوجية التداول',
    description: 'تغلب على المشاعر السلبية وطور العقلية الصحيحة للتداول',
    level: 'متقدم',
    duration: '5 ساعات',
    lessons: 15,
    icon: Brain,
    color: 'from-pink-500 to-pink-600',
    isFree: false,
    topics: ['الخوف والطمع', 'الانضباط الذاتي', 'التداول العاطفي', 'بناء الثقة'],
  },
  {
    id: 'scalping-mastery',
    title: 'احتراف السكالبنج',
    description: 'استراتيجيات السكالبنج على DAX و NASDAQ',
    level: 'محترف',
    duration: '10 ساعات',
    lessons: 30,
    icon: Clock,
    color: 'from-yellow-500 to-yellow-600',
    isFree: false,
    topics: ['استراتيجيات SMC', 'نقاط الدخول والخروج', 'إدارة الصفقات السريعة', 'التوقيت الأمثل'],
  },
];

const levels = ['الكل', 'مبتدئ', 'متوسط', 'متقدم', 'محترف'];

export default function AcademyClient() {
  const [selectedLevel, setSelectedLevel] = useState('الكل');
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const filteredCourses =
    selectedLevel === 'الكل'
      ? courses
      : courses.filter((course) => course.level === selectedLevel);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-black" />
              </div>
              <span className="text-xl font-bold text-white">TradeMaster Academy</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
                لوحة التحكم
              </Link>
              <Link href="/journal" className="text-zinc-400 hover:text-white transition-colors">
                يومية التداول
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              أكاديمية <span className="text-yellow-500">التداول</span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto mb-8">
              من الصفر إلى الاحتراف - تعلم التداول مع أفضل الدورات والاستراتيجيات من خبراء السوق
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12">
            {[
              { label: 'دورة متخصصة', value: '6+' },
              { label: 'درس تعليمي', value: '135+' },
              { label: 'ساعة محتوى', value: '45+' },
              { label: 'طالب نشط', value: '5000+' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-4"
              >
                <div className="text-3xl font-bold text-yellow-500">{stat.value}</div>
                <div className="text-sm text-zinc-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter */}
      <section className="px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedLevel === level
                    ? 'bg-yellow-500 text-black'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="relative bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden hover:border-yellow-500/50 transition-all duration-300">
                  {/* Course Header */}
                  <div className={`bg-gradient-to-r ${course.color} p-6`}>
                    <div className="flex items-start justify-between">
                      <course.icon className="w-12 h-12 text-white" />
                      {course.isFree && (
                        <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-white">
                          مجاني
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white mt-4">{course.title}</h3>
                    <p className="text-white/80 text-sm mt-2">{course.description}</p>
                  </div>

                  {/* Course Info */}
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-zinc-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {course.lessons} درس
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          course.level === 'مبتدئ'
                            ? 'bg-green-500/20 text-green-500'
                            : course.level === 'متوسط'
                            ? 'bg-blue-500/20 text-blue-500'
                            : course.level === 'متقدم'
                            ? 'bg-purple-500/20 text-purple-500'
                            : 'bg-yellow-500/20 text-yellow-500'
                        }`}
                      >
                        {course.level}
                      </span>
                    </div>

                    {/* Topics Preview */}
                    <button
                      onClick={() =>
                        setExpandedCourse(expandedCourse === course.id ? null : course.id)
                      }
                      className="w-full text-left text-sm text-zinc-500 hover:text-zinc-300 transition-colors flex items-center justify-between"
                    >
                      <span>المحتوى التعليمي</span>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          expandedCourse === course.id ? 'rotate-90' : ''
                        }`}
                      />
                    </button>

                    {expandedCourse === course.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 space-y-2"
                      >
                        {course.topics.map((topic, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-xs text-zinc-400"
                          >
                            <Check className="w-3 h-3 text-yellow-500" />
                            {topic}
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {/* CTA Button */}
                    <button
                      className={`w-full mt-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                        course.isFree
                          ? 'bg-yellow-500 hover:bg-yellow-400 text-black'
                          : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                      }`}
                    >
                      {course.isFree ? (
                        <>
                          <Play className="w-4 h-4" />
                          ابدأ التعلم الآن
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          قريباً
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-y border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">هل أنت مستعد للبدء؟</h2>
          <p className="text-zinc-400 mb-8">
            انضم إلى آلاف المتداولين الذين بدأوا رحلتهم معنا
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-medium px-8 py-4 rounded-xl transition-all"
          >
            <Users className="w-5 h-5" />
            ابدأ الآن مجاناً
          </Link>
        </div>
      </section>
    </div>
  );
}
