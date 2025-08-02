import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// トピック名の日本語変換マップ
const topicNames: { [key: string]: string } = {
  'business': 'ビジネス',
  'technology': 'テクノロジー',
  'science': '科学',
  'health': '健康',
  'entertainment': 'エンターテイメント',
  'sports': 'スポーツ',
  'politics': '政治',
  'world': '国際',
  'education': '教育',
  'environment': '環境',
  'finance': '金融',
  'ai': 'AI・人工知能',
  'startup': 'スタートアップ',
  'innovation': 'イノベーション',
  'cybersecurity': 'サイバーセキュリティ',
  'climate': '気候変動',
  'space': '宇宙',
  'medicine': '医学',
  'energy': 'エネルギー',
  'transportation': '交通・運輸'
}

// エラーレスポンスを生成するヘルパー関数
function createErrorResponse(message: string, status: number = 500, details?: string) {
  return new Response(
    JSON.stringify({ 
      error: message,
      ...(details && { details })
    }),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

// 成功レスポンスを生成するヘルパー関数
function createSuccessResponse(data: any, status: number = 200) {
  return new Response(
    JSON.stringify(data),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { topic, topics } = await req.json()
    
    // トピックの処理
    let searchTopics: string[] = []
    if (topics && Array.isArray(topics)) {
      searchTopics = topics
    } else if (topic && typeof topic === 'string') {
      searchTopics = [topic]
    } else {
      return createErrorResponse('Topic or topics parameter is required', 400)
    }

    if (searchTopics.length === 0) {
      return createErrorResponse('At least one topic is required', 400)
    }

    // Perplexity APIキーを環境変数から取得
    const apiKey = Deno.env.get('PERPLEXITY_API_KEY')
    if (!apiKey) {
      return createErrorResponse(
        'Perplexity API key not configured',
        500,
        'PERPLEXITY_API_KEY environment variable is not set'
      )
    }

    // 検索クエリの作成
    const searchQuery = searchTopics.map((t) => {
      if (typeof t === 'string') {
        return topicNames[t] || t
      }
      return String(t)
    }).join('、')

    // Perplexity APIへのリクエスト
    const model = Deno.env.get('PERPLEXITY_MODEL') || 'sonar'
    const maxTokens = parseInt(Deno.env.get('PERPLEXITY_MAX_TOKENS') || '1000')
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: `あなたは最新ニュースを検索するAIアシスタントです。指定されたトピックに関する最新ニュース3件をJSON形式で返してください。

各ニュースには以下の情報を含めてください：
- title: ニュースのタイトル（必須）
- description: ニュースの概要（必須）
- url: ニュースのURL（必須）
- publishedAt: 公開日時（ISO形式、必須）
- source: ニュースソース名（必須）

必ず以下のJSON形式で返してください：
[
  {
    "title": "ニュースタイトル",
    "description": "ニュースの概要",
    "url": "https://example.com/news",
    "publishedAt": "2024-01-01T00:00:00Z",
    "source": "ニュースソース名"
  }
]

コードブロックやマークダウン記法は使用せず、純粋なJSON配列のみを返してください。`
          },
          {
            role: 'user',
            content: `${searchQuery}に関する最新ニュース3件を教えてください。`
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.1,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || ''

    // より堅牢なJSON抽出
    let articles: any[] = []
    let jsonMatch = content.match(/```(?:json)?\n?([\s\S]*?)```/) || content.match(/\[[\s\S]*\]/)
    
    if (jsonMatch) {
      try {
        const jsonContent = jsonMatch[1] || jsonMatch[0]
        articles = JSON.parse(jsonContent)
        
        // 配列でない場合は配列に変換
        if (!Array.isArray(articles)) {
          articles = [articles]
        }
        
        // 各記事の必須フィールドを検証
        articles = articles.filter(article => 
          article && 
          typeof article.title === 'string' && 
          typeof article.description === 'string' &&
          typeof article.url === 'string' &&
          typeof article.source === 'string'
        )
        
        // カテゴリとトピックを追加
        articles = articles.map((article) => ({
          ...article,
          category: searchTopics.length === 1 ? searchTopics[0] : null,
          topics: searchTopics
        }))
      } catch (parseError) {
        console.error('Failed to parse news articles:', parseError)
        // パース失敗時の代替データ
        articles = [
          {
            title: 'ニュースの取得に失敗しました',
            description: '最新ニュースの取得中にエラーが発生しました。しばらく時間をおいて再度お試しください。',
            url: '',
            publishedAt: new Date().toISOString(),
            source: 'システム',
            category: searchTopics.length === 1 ? searchTopics[0] : null,
            topics: searchTopics
          }
        ]
        return createSuccessResponse({ articles }, 206) // Partial Content
      }
    } else {
      // JSONが見つからない場合の代替データ
      articles = [
        {
          title: 'ニュースが見つかりませんでした',
          description: `${searchQuery}に関する最新ニュースが見つかりませんでした。`,
          url: '',
          publishedAt: new Date().toISOString(),
          source: 'システム',
          category: searchTopics.length === 1 ? searchTopics[0] : null,
          topics: searchTopics
        }
      ]
      return createSuccessResponse({ articles }, 206) // Partial Content
    }

    return createSuccessResponse({ articles })

  } catch (error) {
    console.error('Fetch news function error:', error)
    return createErrorResponse(
      'Failed to fetch news',
      500,
      error instanceof Error ? error.message : String(error)
    )
  }
}) 