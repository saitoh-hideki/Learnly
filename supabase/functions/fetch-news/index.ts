import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// トピック名の日本語変換マップ
const topicNames: { [key: string]: string } = {
  'business': 'ビジネス・経営・企業',
  'technology': 'テクノロジー・IT・AI',
  'science': '科学・研究・技術',
  'health': '健康・医療・医学',
  'entertainment': 'エンターテイメント・芸能',
  'sports': 'スポーツ・運動',
  'politics': '政治・政策',
  'world': '国際・世界',
  'education': '教育・学習・学校',
  'environment': '環境・気候変動・サステナビリティ',
  'finance': '金融・投資・経済',
  'ai': 'AI・人工知能・機械学習',
  'startup': 'スタートアップ・ベンチャー',
  'innovation': 'イノベーション・革新',
  'cybersecurity': 'サイバーセキュリティ・セキュリティ',
  'climate': '気候変動・地球温暖化',
  'space': '宇宙・天文学',
  'medicine': '医学・医療技術',
  'energy': 'エネルギー・電力',
  'transportation': '交通・運輸・移動',
  'society': '社会・社会問題',
  'economics': '経済・金融・市場',
  'lifestyle': 'ライフスタイル・生活・文化'
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

// ニュースをデータベースに保存する関数
async function saveNewsToDatabase(articles: any[], topic: string) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log(`Saving ${articles.length} articles to database for topic ${topic}`)

    // 既存のニュースを削除（同じカテゴリーの古いニュースをクリア）
    const { error: deleteError } = await supabase
      .from('latest_news')
      .delete()
      .eq('category', topic)

    if (deleteError) {
      console.error(`Error deleting old news for topic ${topic}:`, deleteError)
    } else {
      console.log(`Deleted old news for topic ${topic}`)
    }

    // 新しいニュースを挿入
    const newsToInsert = articles.map(article => ({
      title: article.title,
      summary: article.description || article.summary,
      url: article.url,
      source: article.source,
      category: topic,
      published_at: article.publishedAt,
      topics: article.topics || [topic]
    }))

    const { data: insertedNews, error: insertError } = await supabase
      .from('latest_news')
      .insert(newsToInsert)
      .select()

    if (insertError) {
      console.error(`Error inserting news for topic ${topic}:`, insertError)
      throw insertError
    }

    console.log(`Successfully saved ${insertedNews?.length || 0} articles to database for topic ${topic}`)
    return insertedNews
  } catch (error) {
    console.error(`Failed to save news to database for topic ${topic}:`, error)
    throw error
  }
}

// 単一トピックのニュースを取得する関数
async function fetchNewsForTopic(topic: string, apiKey: string, model: string, maxTokens: number) {
  const searchQuery = topicNames[topic] || topic
  console.log(`Fetching news for topic: ${topic} (${searchQuery})`)

  // カテゴリーごとの検索クエリを最適化
  let optimizedQuery = searchQuery
  if (topic === 'business') {
    optimizedQuery = 'ビジネス 経営 企業 会社 起業 投資 マーケティング 戦略 最新ニュース 今日のニュース 今週のニュース'
  } else if (topic === 'technology') {
    optimizedQuery = 'テクノロジー IT AI 人工知能 機械学習 プログラミング ソフトウェア ハードウェア 最新ニュース 今日のニュース 今週のニュース'
  } else if (topic === 'economics') {
    optimizedQuery = '経済 金融 市場 株価 為替 投資 金利 インフレ 景気 最新ニュース 今日のニュース 今週のニュース'
  } else if (topic === 'science') {
    optimizedQuery = '科学 研究 技術 発見 実験 論文 宇宙 物理 化学 生物 最新ニュース 今日のニュース 今週のニュース'
  } else if (topic === 'education') {
    optimizedQuery = '教育 学習 学校 大学 学生 教師 授業 カリキュラム 資格 最新ニュース 今日のニュース 今週のニュース'
  } else if (topic === 'health') {
    optimizedQuery = '健康 医療 医学 病院 医師 薬 治療 予防 栄養 運動 最新ニュース 今日のニュース 今週のニュース'
  } else if (topic === 'environment') {
    optimizedQuery = '環境 気候変動 サステナビリティ 地球温暖化 再生可能エネルギー エコ 自然 最新ニュース 今日のニュース 今週のニュース'
  } else if (topic === 'society') {
    optimizedQuery = '社会 社会問題 政治 政策 法律 制度 人権 福祉 最新ニュース 今日のニュース 今週のニュース'
  } else if (topic === 'lifestyle') {
    optimizedQuery = 'ライフスタイル 生活 文化 趣味 旅行 食 ファッション エンターテイメント 最新ニュース 今日のニュース 今週のニュース'
  } else {
    optimizedQuery = `${searchQuery} 最新ニュース 今日のニュース 今週のニュース`
  }

  console.log(`Optimized query: ${optimizedQuery}`)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 60000) // 60秒タイムアウト

  try {
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
            content: `あなたは最新ニュースを検索するAIアシスタントです。指定されたトピックに関する最新ニュースを「3-6件」JSON形式で返してください。

信頼できるニュースソースのみを使用してください：
- 主要メディア: 朝日新聞、読売新聞、毎日新聞、日経新聞、産経新聞
- テレビ局: NHK、TBS、フジテレビ、テレビ朝日、日本テレビ
- 通信社: 共同通信、時事通信、ロイター、ブルームバーグ
- 専門メディア: 日経ビジネス、東洋経済、週刊ダイヤモンド
- 国際メディア: BBC、CNN、Reuters、AP通信

各ニュースには以下の情報を含めてください：
- title: ニュースのタイトル
- description: ニュースの概要（100文字以内）
- url: ニュースのURL
- publishedAt: 公開日時（ISO形式）
- source: ニュースソース名

重要：
1. 3-6件のニュースを返してください。
2. 上記の信頼できるニュースソースからのみ取得してください。
3. 簡潔で分かりやすいJSON配列のみを返してください。
4. 各ニュースは実際の最新ニュースである必要があります。
5. コードブロックは使用しないでください。
6. 信頼性の低いソースやブログ、個人サイトは避けてください。`
          },
          {
            role: 'user',
            content: `${optimizedQuery}に関する最新ニュースを「3-6件」、信頼できる主要メディアや通信社からのみ取得して教えてください。`
          }
        ],
        max_tokens: 800, // レスポンスサイズを制限
        temperature: 0.0, // より一貫した結果を得るため
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Perplexity API error for topic ${topic}:`, response.status, errorText)
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || ''
    
    console.log(`Perplexity response for topic ${topic}, content length:`, content.length)
    console.log(`Perplexity response content preview:`, content.substring(0, 200) + '...')

    // より堅牢なJSON抽出
    let articles: any[] = []
    let jsonMatch = content.match(/```(?:json)?\n?([\s\S]*?)```/) || content.match(/\[[\s\S]*?\]/)
    
    if (jsonMatch) {
      try {
        const jsonContent = jsonMatch[1] || jsonMatch[0]
        console.log(`Extracted JSON content for topic ${topic}:`, jsonContent.substring(0, 300) + '...')
        articles = JSON.parse(jsonContent)
        
        console.log(`Parsed articles for topic ${topic}, count:`, articles.length)
        
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

        // 信頼できるニュースソースのリスト
        const trustedSources = [
          // 主要メディア
          '朝日新聞', '読売新聞', '毎日新聞', '日経新聞', '産経新聞',
          'asahi.com', 'yomiuri.co.jp', 'mainichi.jp', 'nikkei.com', 'sankei.com',
          // テレビ局
          'NHK', 'TBS', 'フジテレビ', 'テレビ朝日', '日本テレビ',
          'nhk.or.jp', 'tbs.co.jp', 'fujitv.co.jp', 'tv-asahi.co.jp', 'ntv.co.jp',
          // 通信社
          '共同通信', '時事通信', 'ロイター', 'ブルームバーグ',
          'kyodo.co.jp', 'jiji.com', 'reuters.com', 'bloomberg.com',
          // 専門メディア
          '日経ビジネス', '東洋経済', '週刊ダイヤモンド',
          'business.nikkei.com', 'toyokeizai.net', 'diamond.jp',
          // 国際メディア
          'BBC', 'CNN', 'AP通信', 'Reuters', 'Bloomberg',
          'bbc.com', 'cnn.com', 'ap.org'
        ]

        // 信頼できるソースからのニュースのみをフィルタリング
        const trustedArticles = articles.filter(article => {
          const source = article.source.toLowerCase()
          return trustedSources.some(trustedSource => 
            source.includes(trustedSource.toLowerCase())
          )
        })

        console.log(`Trusted articles for topic ${topic}:`, trustedArticles.length)
        
        // 信頼できる記事がある場合はそれを使用、ない場合は元の記事を使用
        articles = trustedArticles.length > 0 ? trustedArticles : articles
        
        console.log(`Valid articles for topic ${topic}, count:`, articles.length)
        
        // 6件以上の場合は、6件に制限
        if (articles.length > 6) {
          console.log(`Limiting articles from ${articles.length} to 6 for topic ${topic}`)
          articles = articles.slice(0, 6)
        } else if (articles.length < 3) {
          console.log(`Warning: Only ${articles.length} articles found for topic ${topic}`)
          // 3件未満の場合は、最低3件を保証
          while (articles.length < 3) {
            articles.push({
              title: `${searchQuery}のニュース${articles.length + 1}`,
              description: `${searchQuery}に関するニュースです。`,
              url: '',
              publishedAt: new Date().toISOString(),
              source: 'システム',
              category: topic,
              topics: [topic]
            })
          }
        } else {
          console.log(`Found ${articles.length} articles for topic ${topic}`)
        }
        
        console.log(`Final articles for topic ${topic}, count:`, articles.length)
        
        // カテゴリとトピックを追加
        articles = articles.map((article) => ({
          ...article,
          category: topic,
          topics: [topic]
        }))

        // データベースに保存
        await saveNewsToDatabase(articles, topic)

        return articles
      } catch (parseError) {
        console.error(`Failed to parse news articles for topic ${topic}:`, parseError)
        // パース失敗時は空の配列を返す
        return []
      }
    } else {
      console.warn(`No JSON found in response for topic ${topic}`)
      // JSONが見つからない場合は空の配列を返す
      return []
    }

  } catch (fetchError) {
    clearTimeout(timeoutId)
    console.error(`Fetch error for topic ${topic}:`, fetchError)
    
    if (fetchError instanceof Error && fetchError.name === 'AbortError') {
      throw new Error(`Request timeout for topic ${topic}`)
    }
    
    throw fetchError
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { topic, topics } = await req.json()
    
    console.log('Received request with:', { topic, topics })
    
    // トピックの処理 - 複数のトピックをサポート
    let searchTopics: string[] = []
    if (topic && typeof topic === 'string') {
      searchTopics = [topic]
    } else if (topics && Array.isArray(topics) && topics.length > 0) {
      searchTopics = topics
    } else {
      return createErrorResponse('Topic or topics parameter is required', 400)
    }

    if (searchTopics.length === 0) {
      return createErrorResponse('Valid topic(s) are required', 400)
    }

    console.log('Processing topics:', searchTopics)

    // Perplexity APIキーを環境変数から取得
    const apiKey = Deno.env.get('PERPLEXITY_API_KEY')
    console.log('Environment variables check:')
    console.log('- PERPLEXITY_API_KEY exists:', !!apiKey)
    console.log('- PERPLEXITY_API_KEY length:', apiKey ? apiKey.length : 0)
    console.log('- PERPLEXITY_MODEL:', Deno.env.get('PERPLEXITY_MODEL'))
    console.log('- PERPLEXITY_MAX_TOKENS:', Deno.env.get('PERPLEXITY_MAX_TOKENS'))
    
    if (!apiKey) {
      return createErrorResponse(
        'Perplexity API key not configured',
        500,
        'PERPLEXITY_API_KEY environment variable is not set'
      )
    }

    const model = Deno.env.get('PERPLEXITY_MODEL') || 'sonar'
    const maxTokens = parseInt(Deno.env.get('PERPLEXITY_MAX_TOKENS') || '1000')
    
    console.log('Making API requests to Perplexity for topics:', searchTopics)
    
    // 各トピックに対して並行してニュースを取得
    const allArticles: any[] = []
    const errors: string[] = []

    // 並行処理で各トピックのニュースを取得
    const promises = searchTopics.map(async (searchTopic) => {
      try {
        const articles = await fetchNewsForTopic(searchTopic, apiKey, model, maxTokens)
        console.log(`Successfully fetched ${articles.length} articles for topic ${searchTopic}`)
        return { topic: searchTopic, articles, success: true }
      } catch (error) {
        console.error(`Failed to fetch news for topic ${searchTopic}:`, error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        return { topic: searchTopic, articles: [], success: false, error: errorMessage }
      }
    })

    const results = await Promise.all(promises)

    // 結果を統合
    for (const result of results) {
      if (result.success) {
        allArticles.push(...result.articles)
      } else {
        errors.push(`${result.topic}: ${result.error}`)
      }
    }

    console.log(`Total articles fetched: ${allArticles.length}`)
    console.log(`Errors encountered: ${errors.length}`)

    if (allArticles.length === 0) {
      return createErrorResponse(
        'Failed to fetch news for all topics',
        500,
        `No articles were successfully fetched. Errors: ${errors.join('; ')}`
      )
    }

    // 一部のトピックでエラーが発生した場合は部分的な成功として扱う
    const status = errors.length > 0 ? 206 : 200 // Partial Content if some failed

    return createSuccessResponse({ 
      articles: allArticles,
      processedTopics: searchTopics.length,
      successfulTopics: results.filter(r => r.success).length,
      errors: errors.length > 0 ? errors : undefined
    }, status)

  } catch (error) {
    console.error('Fetch news function error:', error)
    return createErrorResponse(
      'Failed to fetch news',
      500,
      error instanceof Error ? error.message : String(error)
    )
  }
})