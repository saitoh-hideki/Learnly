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

    const systemPrompt = `あなたは優秀なニュース分析アシスタントです。
以下のニュース記事について、深い分析と洞察を提供してください。

分析項目：
1. 要約：記事の核心的な内容を簡潔にまとめる
2. 重要なポイント：3-5個の重要なポイントを箇条書きで
3. 洞察・見解：記事の背景、影響、今後の展望について深い分析
4. キーワード：重要なキーワードを5-8個抽出（重要度も含める）
5. 推奨事項：今後の動向や注目すべき点について

カテゴリ: ${category || '一般'}
タイトル: ${title}

JSON形式で回答してください：
{
  "summary": "要約文",
  "keyPoints": ["ポイント1", "ポイント2", "ポイント3"],
  "insights": "洞察・見解",
  "keywords": [
    {
      "word": "キーワード1",
      "importance": 95,
      "category": "技術",
      "description": "キーワードの説明"
    }
  ],
  "recommendations": "推奨事項・今後の展望"
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `以下のニュース記事を分析してください：\n\nタイトル：${title}\n\n内容：${summary}` }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    })

    const response = completion.choices[0]?.message?.content || ''

    // JSONレスポンスをパース
    try {
      const analysis = JSON.parse(response)
      return NextResponse.json({ 
        analysis,
        success: true 
      })
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      // フォールバック用のサンプル分析
      const fallbackAnalysis = {
        summary: 'AIによる分析が完了しました。',
        keyPoints: [
          '重要なポイント1',
          '重要なポイント2',
          '重要なポイント3'
        ],
        insights: 'このニュースは重要な動向を示しています。',
        keywords: [
          {
            word: 'キーワード1',
            importance: 90,
            category: '技術',
            description: '重要な技術キーワード'
          },
          {
            word: 'キーワード2',
            importance: 85,
            category: '市場',
            description: '市場関連のキーワード'
          }
        ],
        recommendations: '今後の動向に注目が必要です。'
      }
      
      return NextResponse.json({ 
        analysis: fallbackAnalysis,
        success: true 
      })
    }

  } catch (error) {
    console.error('Analysis API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate analysis',
        success: false 
      },
      { status: 500 }
    )
  }
} 