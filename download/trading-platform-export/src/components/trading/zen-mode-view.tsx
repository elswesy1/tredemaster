'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/lib/i18n'
import {
  Wind,
  Brain,
  Heart,
  Moon,
  Sun,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  TrendingUp,
  Calendar,
  CheckCircle
} from 'lucide-react'

interface ZenSession {
  id: string
  type: 'breathing' | 'meditation' | 'mood_check'
  duration: number
  moodBefore: number
  moodAfter: number
  stressBefore: number
  stressAfter: number
  notes: string
  completedAt: Date
}

const mockSessions: ZenSession[] = [
  {
    id: '1',
    type: 'breathing',
    duration: 300,
    moodBefore: 5,
    moodAfter: 7,
    stressBefore: 8,
    stressAfter: 4,
    notes: 'Felt much calmer after the breathing exercise',
    completedAt: new Date(Date.now() - 3600000)
  },
  {
    id: '2',
    type: 'meditation',
    duration: 600,
    moodBefore: 4,
    moodAfter: 8,
    stressBefore: 7,
    stressAfter: 3,
    notes: 'Great meditation session before trading',
    completedAt: new Date(Date.now() - 86400000)
  }
]

const breathingPatterns = [
  { name: '4-7-8', inhale: 4, hold: 7, exhale: 8, description: 'Relaxation pattern' },
  { name: 'Box Breathing', inhale: 4, hold: 4, exhale: 4, holdAfter: 4, description: 'Focus & calm' },
  { name: '4-4-4', inhale: 4, hold: 4, exhale: 4, description: 'Quick reset' }
]

const meditationGuides = [
  {
    title: 'Pre-Trading Calm',
    duration: 5,
    description: 'Center yourself before the market opens',
    steps: [
      'Find a comfortable position',
      'Close your eyes and take 3 deep breaths',
      'Focus on your intention for today',
      'Release any expectations',
      'Open your eyes when ready'
    ]
  },
  {
    title: 'Mid-Day Reset',
    duration: 3,
    description: 'Reset your focus during trading hours',
    steps: [
      'Step away from your screen',
      'Take 5 deep breaths',
      'Shake out your hands and shoulders',
      'Set your intention for the next session',
      'Return refreshed'
    ]
  },
  {
    title: 'Post-Trading Reflection',
    duration: 10,
    description: 'Process your trading day mindfully',
    steps: [
      'Sit comfortably and close your eyes',
      'Review your trades without judgment',
      'Acknowledge your emotions',
      'Identify one lesson from today',
      'Express gratitude for the experience'
    ]
  }
]

const psychologicalTips = [
  {
    title: 'Control What You Can',
    message: 'Focus on process, not outcomes. You control your entries, exits, and risk—not the market direction.'
  },
  {
    title: 'Embrace Uncertainty',
    message: 'Every trade has an uncertain outcome. Accept this truth and trade your plan without attachment.'
  },
  {
    title: 'Stay Present',
    message: 'Past losses and future worries don\'t exist in this moment. Trade the chart in front of you.'
  },
  {
    title: 'Losses Are Tuition',
    message: 'Every loss teaches you something. What can you learn from today\'s trades?'
  },
  {
    title: 'Patience Pays',
    message: 'The best trades often come from waiting. Don\'t force setups that aren\'t there.'
  }
]

export function ZenModeView() {
  const { language } = useI18n()
  const isRTL = language === 'ar'
  const [sessions, setSessions] = useState<ZenSession[]>(mockSessions)
  
  // Breathing state
  const [isBreathing, setIsBreathing] = useState(false)
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale')
  const [breathingTimer, setBreathingTimer] = useState(0)
  const [selectedPattern, setSelectedPattern] = useState(breathingPatterns[0])
  const [breathingCycles, setBreathingCycles] = useState(0)
  
  // Meditation state
  const [isMeditating, setIsMeditating] = useState(false)
  const [selectedMeditation, setSelectedMeditation] = useState(meditationGuides[0])
  const [meditationStep, setMeditationStep] = useState(0)
  const [meditationTimer, setMeditationTimer] = useState(0)
  
  // Mood check state
  const [showMoodCheck, setShowMoodCheck] = useState(false)
  const [moodData, setMoodData] = useState({
    mood: 5,
    stress: 5,
    focus: 5,
    confidence: 5,
    notes: ''
  })
  
  // Sound state
  const [soundEnabled, setSoundEnabled] = useState(true)
  
  // Random tip
  const [currentTip] = useState(() => psychologicalTips[Math.floor(Math.random() * psychologicalTips.length)])

  // Breathing animation
  useEffect(() => {
    if (!isBreathing) return
    
    const interval = setInterval(() => {
      setBreathingTimer(prev => {
        const newTime = prev + 1
        const pattern = selectedPattern
        
        let phaseDuration: number
        if (breathingPhase === 'inhale') {
          phaseDuration = pattern.inhale
        } else if (breathingPhase === 'hold') {
          phaseDuration = pattern.hold
        } else {
          phaseDuration = pattern.exhale
        }
        
        if (newTime >= phaseDuration) {
          // Move to next phase
          if (breathingPhase === 'inhale') {
            setBreathingPhase('hold')
          } else if (breathingPhase === 'hold') {
            setBreathingPhase('exhale')
          } else {
            setBreathingPhase('inhale')
            setBreathingCycles(c => c + 1)
          }
          return 0
        }
        
        return newTime
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [isBreathing, breathingPhase, selectedPattern])

  const startBreathing = () => {
    setIsBreathing(true)
    setBreathingPhase('inhale')
    setBreathingTimer(0)
    setBreathingCycles(0)
  }

  const stopBreathing = () => {
    setIsBreathing(false)
    // Save session
    const session: ZenSession = {
      id: Date.now().toString(),
      type: 'breathing',
      duration: breathingCycles * (selectedPattern.inhale + selectedPattern.hold + selectedPattern.exhale),
      moodBefore: 5,
      moodAfter: 7,
      stressBefore: 6,
      stressAfter: 4,
      notes: `Completed ${breathingCycles} cycles of ${selectedPattern.name}`,
      completedAt: new Date()
    }
    setSessions([session, ...sessions])
  }

  const handleMoodCheck = () => {
    const session: ZenSession = {
      id: Date.now().toString(),
      type: 'mood_check',
      duration: 0,
      moodBefore: moodData.mood,
      moodAfter: moodData.mood,
      stressBefore: moodData.stress,
      stressAfter: moodData.stress,
      notes: `Focus: ${moodData.focus}/10, Confidence: ${moodData.confidence}/10. ${moodData.notes}`,
      completedAt: new Date()
    }
    setSessions([session, ...sessions])
    setShowMoodCheck(false)
    setMoodData({ mood: 5, stress: 5, focus: 5, confidence: 5, notes: '' })
  }

  const getPhaseText = () => {
    switch (breathingPhase) {
      case 'inhale':
        return isRTL ? 'شهيق' : 'Inhale'
      case 'hold':
        return isRTL ? 'احتفاظ' : 'Hold'
      case 'exhale':
        return isRTL ? 'زفير' : 'Exhale'
    }
  }

  const getPhaseColor = () => {
    switch (breathingPhase) {
      case 'inhale':
        return 'from-blue-500 to-cyan-500'
      case 'hold':
        return 'from-purple-500 to-pink-500'
      case 'exhale':
        return 'from-green-500 to-emerald-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Moon className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-bold">ZEN Mode</h2>
        </div>
        <p className="text-muted-foreground">
          {isRTL ? 'مارس الهدوء والتركيز قبل وأثناء وبعد التداول' : 'Practice calm and focus before, during, and after trading'}
        </p>
      </div>

      {/* Quick Mood Check */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-pink-500" />
              <div>
                <div className="font-medium">{isRTL ? 'كيف تشعر الآن؟' : 'How are you feeling?'}</div>
                <div className="text-sm text-muted-foreground">
                  {isRTL ? 'سجل حالتك النفسية' : 'Log your mental state'}
                </div>
              </div>
            </div>
            <Button onClick={() => setShowMoodCheck(true)} variant="outline" className="border-purple-500/30">
              {isRTL ? 'تسجيل' : 'Check In'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Daily Tip */}
      <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Sparkles className="w-5 h-5 text-green-500 shrink-0 mt-1" />
            <div>
              <div className="font-medium text-green-500 mb-1">{currentTip.title}</div>
              <div className="text-sm text-muted-foreground">{currentTip.message}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Breathing Exercise */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-blue-500" />
              {isRTL ? 'تمارين التنفس' : 'Breathing Exercises'}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'تقنيات التنفس للهدوء والتركيز' : 'Breathing techniques for calm and focus'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Pattern Selection */}
            {!isBreathing && (
              <div className="space-y-4 mb-6">
                {breathingPatterns.map((pattern) => (
                  <div 
                    key={pattern.name}
                    onClick={() => setSelectedPattern(pattern)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedPattern.name === pattern.name 
                        ? 'bg-blue-500/10 border-2 border-blue-500' 
                        : 'bg-muted/50 border-2 border-transparent hover:border-blue-500/30'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{pattern.name}</div>
                        <div className="text-sm text-muted-foreground">{pattern.description}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {pattern.inhale}-{pattern.hold}-{pattern.exhale}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Breathing Animation */}
            {isBreathing ? (
              <div className="text-center space-y-6">
                <div className="relative w-48 h-48 mx-auto">
                  <div 
                    className={`absolute inset-0 rounded-full bg-gradient-to-br ${getPhaseColor()} opacity-20 animate-pulse`}
                    style={{
                      transform: breathingPhase === 'inhale' ? 'scale(1.2)' : breathingPhase === 'exhale' ? 'scale(0.8)' : 'scale(1)'
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <div className="text-4xl font-bold">{breathingTimer}</div>
                    <div className="text-lg">{getPhaseText()}</div>
                  </div>
                </div>
                <div className="text-muted-foreground">
                  {isRTL ? `الدورة ${breathingCycles}` : `Cycle ${breathingCycles}`}
                </div>
                <Button onClick={stopBreathing} variant="outline" className="w-full">
                  <Pause className="w-4 h-4 mr-2" />
                  {isRTL ? 'إيقاف' : 'Stop'}
                </Button>
              </div>
            ) : (
              <Button onClick={startBreathing} className="w-full bg-blue-500 hover:bg-blue-600">
                <Play className="w-4 h-4 mr-2" />
                {isRTL ? 'بدء التمرين' : 'Start Exercise'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Meditation Guides */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              {isRTL ? 'تأملات موجهة' : 'Guided Meditations'}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'تأملات قصيرة للمتداولين' : 'Short meditations for traders'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {meditationGuides.map((meditation, index) => (
                <div 
                  key={meditation.title}
                  className={`p-4 rounded-lg transition-all cursor-pointer ${
                    selectedMeditation.title === meditation.title 
                      ? 'bg-purple-500/10 border-2 border-purple-500' 
                      : 'bg-muted/50 border-2 border-transparent hover:border-purple-500/30'
                  }`}
                  onClick={() => setSelectedMeditation(meditation)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">{meditation.title}</div>
                      <div className="text-sm text-muted-foreground">{meditation.description}</div>
                    </div>
                    <Badge variant="outline">{meditation.duration} min</Badge>
                  </div>
                  {selectedMeditation.title === meditation.title && (
                    <div className="mt-4 space-y-2">
                      {meditation.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {isRTL ? 'الجلسات الأخيرة' : 'Recent Sessions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {sessions.map((session) => (
              <div 
                key={session.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    session.type === 'breathing' ? 'bg-blue-500/10' : 
                    session.type === 'meditation' ? 'bg-purple-500/10' : 'bg-pink-500/10'
                  }`}>
                    {session.type === 'breathing' ? <Wind className="w-5 h-5 text-blue-500" /> :
                     session.type === 'meditation' ? <Brain className="w-5 h-5 text-purple-500" /> :
                     <Heart className="w-5 h-5 text-pink-500" />
                    }
                  </div>
                  <div>
                    <div className="font-medium capitalize">{session.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {session.completedAt.toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">
                    {isRTL ? 'المزاج:' : 'Mood:'} {session.moodBefore} → {session.moodAfter}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isRTL ? 'التوتر:' : 'Stress:'} {session.stressBefore} → {session.stressAfter}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mood Check Dialog */}
      {showMoodCheck && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{isRTL ? 'تسجيل الحالة النفسية' : 'Mood Check-In'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mood */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>{isRTL ? 'المزاج العام' : 'Overall Mood'}</Label>
                  <span className="font-medium">{moodData.mood}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodData.mood}
                  onChange={(e) => setMoodData({ ...moodData, mood: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Stress */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>{isRTL ? 'مستوى التوتر' : 'Stress Level'}</Label>
                  <span className="font-medium">{moodData.stress}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodData.stress}
                  onChange={(e) => setMoodData({ ...moodData, stress: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Focus */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>{isRTL ? 'التركيز' : 'Focus Level'}</Label>
                  <span className="font-medium">{moodData.focus}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodData.focus}
                  onChange={(e) => setMoodData({ ...moodData, focus: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Confidence */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>{isRTL ? 'الثقة' : 'Confidence'}</Label>
                  <span className="font-medium">{moodData.confidence}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodData.confidence}
                  onChange={(e) => setMoodData({ ...moodData, confidence: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>{isRTL ? 'ملاحظات' : 'Notes'}</Label>
                <Textarea
                  value={moodData.notes}
                  onChange={(e) => setMoodData({ ...moodData, notes: e.target.value })}
                  placeholder={isRTL ? 'كيف تشعر؟' : 'How are you feeling?'}
                  rows={2}
                />
              </div>
            </CardContent>
            <div className="p-6 pt-0 flex gap-2">
              <Button variant="outline" onClick={() => setShowMoodCheck(false)} className="flex-1">
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={handleMoodCheck} className="flex-1 bg-green-500 hover:bg-green-600">
                {isRTL ? 'حفظ' : 'Save'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
