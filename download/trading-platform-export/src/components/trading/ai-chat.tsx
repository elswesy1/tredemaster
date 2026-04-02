'use client'

import { useState, useRef, useEffect } from 'react'
import { useI18n } from '@/lib/i18n'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Bot,
  Send,
  User,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// Mock AI responses based on suggestions
const mockResponses: Record<string, string> = {
  winRate: `Based on your trading data this month:

**Win Rate Analysis:**
- Overall Win Rate: **68.4%**
- Winning Trades: 52 out of 76 trades
- Best Performing: EUR/USD (78% win rate)
- Needs Improvement: GBP/JPY (45% win rate)

**Recommendations:**
1. Focus more on EUR/USD pairs where you have the highest success rate
2. Consider avoiding GBP/JPY during volatile market conditions
3. Your win rate has improved by 5% compared to last month`,

  profitableSetup: `Analyzing your most profitable setups:

**Top 3 Profitable Setups:**

1. **Breakout Strategy** - $2,450 profit
   - Win Rate: 72%
   - Avg R:R: 1:2.3
   - Best pairs: XAU/USD, EUR/USD

2. **Trend Following** - $1,890 profit
   - Win Rate: 68%
   - Avg R:R: 1:1.8
   - Best pairs: USD/JPY, AUD/USD

3. **Support/Resistance Bounce** - $1,340 profit
   - Win Rate: 65%
   - Avg R:R: 1:1.5
   - Best pairs: EUR/GBP, NZD/USD

**Recommendation:** Consider allocating more capital to your breakout strategy as it shows the best risk-adjusted returns.`,

  mistakes: `Based on your trading history, here are your common mistakes:

**Top Trading Mistakes:**

1. **Overtrading After Losses** (23 occurrences)
   - Average additional loss: -$85
   - Recommendation: Implement a mandatory 15-minute break after any loss

2. **Moving Stop Loss** (18 occurrences)
   - Average additional loss: -$120
   - Recommendation: Use set-and-forget approach or trailing stops only

3. **Trading Against Trend** (15 occurrences)
   - Average loss: -$95
   - Recommendation: Always confirm trend direction on higher timeframes

4. **Entering Without Clear Setup** (12 occurrences)
   - Average loss: -$75
   - Recommendation: Create a checklist and don't trade without all criteria met

**Total Cost of Mistakes:** -$4,890 this month

**Action Plan:**
- Review your rules before each trade
- Set alerts instead of watching charts continuously
- Journal every trade with emotional state`,

  bestTime: `Your optimal trading times analysis:

**Best Performing Hours:**

| Time (UTC) | Win Rate | Avg Profit | Trades |
|------------|----------|------------|--------|
| 08:00-10:00 | 75% | +$45 | 24 |
| 14:00-16:00 | 71% | +$38 | 18 |
| 10:00-12:00 | 68% | +$32 | 22 |

**Best Days:**
- Tuesday: 72% win rate, +$1,240
- Wednesday: 70% win rate, +$980
- Thursday: 69% win rate, +$850

**Avoid Trading:**
- Fridays after 15:00 UTC (52% win rate)
- Mondays before 08:00 UTC (48% win rate)

**Recommendations:**
1. Focus 80% of your trading during 08:00-16:00 UTC window
2. Consider reducing activity on Mondays
3. Avoid late Friday trading sessions`,
}

const suggestedQuestions = [
  { key: 'question1', icon: Target, response: 'winRate' },
  { key: 'question2', icon: TrendingUp, response: 'profitableSetup' },
  { key: 'question3', icon: AlertTriangle, response: 'mistakes' },
  { key: 'question4', icon: Clock, response: 'bestTime' },
]

export function AIChat() {
  const { t } = useI18n()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI response delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Determine which mock response to use
    let responseKey = 'winRate'
    const lowerInput = input.toLowerCase()
    
    if (lowerInput.includes('win rate') || lowerInput.includes('نسبة الفوز')) {
      responseKey = 'winRate'
    } else if (lowerInput.includes('profitable') || lowerInput.includes('ربح') || lowerInput.includes('setup')) {
      responseKey = 'profitableSetup'
    } else if (lowerInput.includes('mistake') || lowerInput.includes('خطأ') || lowerInput.includes('error')) {
      responseKey = 'mistakes'
    } else if (lowerInput.includes('time') || lowerInput.includes('وقت') || lowerInput.includes('best')) {
      responseKey = 'bestTime'
    }

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: mockResponses[responseKey] || mockResponses.winRate,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, aiMessage])
    setIsLoading(false)
  }

  const handleSuggestionClick = (key: string, responseKey: string) => {
    const question = t(`aiChat.suggestions.${key}`)
    setInput(question)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main Chat */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>{t('aiChat.title')}</CardTitle>
              <CardDescription>{t('aiChat.subtitle')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Messages Area */}
          <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t('aiChat.title')}
                </h3>
                <p className="text-muted-foreground max-w-sm">
                  {t('aiChat.subtitle')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="prose prose-sm dark:prose-invert">
                        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                      </div>
                      <p className="text-xs opacity-70 mt-1">
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">
                          {t('aiChat.thinking')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                placeholder={t('aiChat.placeholder')}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions & Session Analysis */}
      <div className="space-y-6">
        {/* Suggested Questions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              {t('aiChat.suggestions.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {suggestedQuestions.map(({ key, icon: Icon, response }) => (
                <Button
                  key={key}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto py-2"
                  onClick={() => handleSuggestionClick(key, response)}
                >
                  <Icon className="h-4 w-4 mr-2 shrink-0" />
                  <span className="text-sm">{t(`aiChat.suggestions.${key}`)}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Session Analysis Preview */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              {t('aiChat.analysis.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium">{t('aiChat.analysis.strengths')}</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 ps-6">
                <li>Good risk management on losing trades</li>
                <li>Patience on entry execution</li>
              </ul>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium">{t('aiChat.analysis.weaknesses')}</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 ps-6">
                <li>Overtrading during news events</li>
                <li>Emotional decisions after losses</li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium">{t('aiChat.analysis.patterns')}</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 ps-6">
                <li>Best performance: 08:00-10:00 UTC</li>
                <li>Most profitable: EUR/USD breakout</li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium">{t('aiChat.analysis.recommendations')}</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 ps-6">
                <li>Reduce trading during high-impact news</li>
                <li>Set max 3 trades per session</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
