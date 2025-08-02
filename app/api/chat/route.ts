import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { messages, mode, category, selectedNews, isFirstMessage } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    let systemPrompt = `あなたはLearnlyの学習支援AIアシスタントです。
ユーザーが選択した「${mode?.name || '学習'}」分野について、以下の方針で対話してください：

1. 深い理解を促す質問を投げかける
2. 具体例や実世界での応用を交えて説明する
3. ユーザーの理解度に応じて説明のレベルを調整する
4. 学習の振り返りを促す問いかけを行う
5. 日本語で丁寧に、かつ親しみやすく対話する

ユーザーが疑問を持った場合は、分かりやすく段階的に説明してください。`

    // 最初のメッセージで選択されたニュースがある場合、挨拶から始める
    if (isFirstMessage && selectedNews && selectedNews.length > 0) {
      const newsTitles = selectedNews.map((news: any) => news.title).join('、')
      const newsContext = selectedNews.map((news: any, index: number) => 
        `【ニュース${index + 1}】${news.title}\n${news.summary}`
      ).join('\n\n')
      
      systemPrompt += `\n\nユーザーが選択したニュース記事の情報：\n${newsContext}\n\nこれは最初のメッセージです。選択されたニュース記事（${newsTitles}）の内容を読み取り、「こんにちは！今日は${newsTitles}についての勉強ですね。」のような挨拶から始めて、これらのニュース記事を基にした学習を提案してください。`
    } else if (selectedNews && selectedNews.length > 0) {
      // 通常のメッセージで選択されたニュースがある場合
      const newsContext = selectedNews.map((news: any, index: number) => 
        `【ニュース${index + 1}】${news.title}\n${news.summary}`
      ).join('\n\n')
      
      systemPrompt += `\n\nユーザーが選択したニュース記事の情報：\n${newsContext}\n\nこれらのニュース記事を参考にしながら、より具体的で深い学習をサポートしてください。`
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1000,
      stream: true,
    })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const text = chunk.choices[0]?.delta?.content || ''
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}