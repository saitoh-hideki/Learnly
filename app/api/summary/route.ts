import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { title, summary, category } = await req.json()

    if (!title || !summary) {
      return NextResponse.json(
        { error: 'Title and summary are required' },
        { status: 400 }
      )
    }

    const systemPrompt = `あなたは優秀なニュース要約アシスタントです。
以下の方針でニュース記事の重要なポイントを簡潔にまとめてください：

1. 最も重要な情報を最初に述べる
2. 背景や文脈を簡潔に説明する
3. 今後の影響や展望を含める
4. 一般読者が理解しやすい表現を使用する
5. 箇条書きや段落分けを適切に使用する
6. 日本語で丁寧に、かつ読みやすくまとめる

カテゴリ: ${category || '一般'}
タイトル: ${title}

このニュース記事の重要なポイントを要約してください。`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `以下のニュース記事を要約してください：\n\nタイトル：${title}\n\n内容：${summary}` }
      ],
      temperature: 0.3,
      max_tokens: 800,
    })

    const response = completion.choices[0]?.message?.content || '要約の生成に失敗しました。'

    return NextResponse.json({ 
      summary: response,
      success: true 
    })

  } catch (error) {
    console.error('Summary API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate summary',
        success: false 
      },
      { status: 500 }
    )
  }
} 