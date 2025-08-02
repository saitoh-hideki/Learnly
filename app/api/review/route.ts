import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { messages, mode } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    const conversationText = messages
      .map(m => `${m.role === 'user' ? 'ユーザー' : 'AI'}: ${m.content}`)
      .join('\n\n')

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `あなたは学習内容を整理・要約する専門家です。
以下の会話から重要なポイントを抽出し、学習レビューを作成してください。

出力形式：
{
  "title": "学習セッションの簡潔なタイトル",
  "summary": "200文字程度の要約",
  "keyPoints": ["重要ポイント1", "重要ポイント2", "重要ポイント3"],
  "insights": "学習から得られた洞察や気づき（100文字程度）",
  "nextSteps": ["次に学ぶべきこと1", "次に学ぶべきこと2"]
}

JSONフォーマットで出力してください。`
        },
        {
          role: 'user',
          content: `以下の「${mode?.name || '学習'}」に関する会話をレビューしてください：\n\n${conversationText}`
        }
      ],
      temperature: 0.3,
      max_tokens: 800,
      response_format: { type: "json_object" }
    })

    const reviewContent = completion.choices[0]?.message?.content
    if (!reviewContent) {
      throw new Error('Failed to generate review')
    }

    const review = JSON.parse(reviewContent)
    
    return NextResponse.json({ review })
  } catch (error) {
    console.error('Review API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate review' },
      { status: 500 }
    )
  }
}