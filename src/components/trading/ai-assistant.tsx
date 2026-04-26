import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Sparkles, TrendingUp, ShieldAlert, Loader2 } from "lucide-react"

export default function AIAssistant() {
  const [insight, setInsight] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAIAnalysis() {
      try {
        const response = await fetch('/api/ai-analysis', { credentials: 'include' })
        const data = await response.json()
        setInsight(data)
      } catch (error) {
        console.error("Failed to fetch AI insights", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAIAnalysis()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-4 text-primary animate-pulse">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>جاري استدعاء ذكاء Gemma التحليلي...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-primary w-6 h-6" />
        <h2 className="text-2xl font-bold text-white">Gemma AI Coach</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* التحليل الفني SMC */}
        <Card className="bg-navy-dark border-primary/30">
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingUp className="text-primary w-5 h-5" />
            <CardTitle className="text-primary">التحليل الفني (SMC)</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-200">
            {insight?.technical || "قم بإضافة صفقات جديدة ليبدأ Gemma في تحليل هيكل السوق الخاص بك."}
          </CardContent>
        </Card>

        {/* التحليل النفسي (Mark Douglas Logic) */}
        <Card className="bg-navy-dark border-blue-400/30">
          <CardHeader className="flex flex-row items-center gap-2">
            <Brain className="text-blue-400 w-5 h-5" />
            <CardTitle className="text-blue-400">الجانب النفسي والسلوكي</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-200">
            {insight?.psychological || "سجل مشاعرك في قسم Psychology للحصول على تحليل لسلوكك التداولي."}
          </CardContent>
        </Card>
      </div>

      {/* نصيحة الحماية من المخاطر */}
      <Card className="bg-red-900/10 border-red-500/30">
        <CardContent className="flex items-start gap-3 pt-6">
          <ShieldAlert className="text-red-500 w-6 h-6 shrink-0" />
          <p className="text-sm text-gray-300">
            <span className="font-bold text-red-500">تنبيه المخاطر:</span> نصائح Gemma تعتمد على بياناتك المسجلة، تأكد دائماً من إدارة المخاطر الخاصة بك قبل الدخول في أي صفقة.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}