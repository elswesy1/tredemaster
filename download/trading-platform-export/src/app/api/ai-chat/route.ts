import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
    const zai = await ZAI.create()
    
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an AI trading assistant. You help traders analyze their performance, understand their mistakes, and improve their trading strategies. 
            
You have access to the following user statistics:
- Win Rate: 68.4%
- Risk-to-Reward Ratio: 1:1.85
- Average Win: $156
- Average Loss: $85
- Profit Factor: 1.82
- Best Trading Time: 08:00-12:00 UTC
- Most Profitable Setup: Breakout Strategy ($2,450)
- Max Consecutive Losses: 5
- Common Mistakes: Overtrading after losses, Moving stop loss, Trading against trend

Provide helpful, actionable advice based on this data. Be concise and professional.`
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const response = completion.choices[0]?.message?.content || 'I apologize, I could not process your request.'
    
    return NextResponse.json({ response })
  } catch (error) {
    console.error('AI Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
