import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, mode, category, selectedNews, isFirstMessage } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Chat function error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 