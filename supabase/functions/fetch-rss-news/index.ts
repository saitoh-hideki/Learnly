import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// CDATAタグを除去し、HTMLエンティティをデコードする関数
function cleanText(text: string): string {
  if (!text) return ''
  
  // CDATAタグを除去
  let cleaned = text.replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
  
  // HTMLエンティティをデコード
  cleaned = cleaned.replace(/&amp;/g, '&')
  cleaned = cleaned.replace(/&lt;/g, '<')
  cleaned = cleaned.replace(/&gt;/g, '>')
  cleaned = cleaned.replace(/&quot;/g, '"')
  cleaned = cleaned.replace(/&#39;/g, "'")
  cleaned = cleaned.replace(/&nbsp;/g, ' ')
  
  // 余分な空白を除去
  cleaned = cleaned.trim()
  
  return cleaned
}

// XML要素を抽出する関数
function extractElement(text: string, tagName: string): string[] {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'gi')
  const matches = text.match(regex)
  if (!matches) return []
  
  return matches.map(match => {
    const contentMatch = match.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'))
    return contentMatch ? cleanText(contentMatch[1]) : ''
  }).filter(content => content.length > 0)
}

// 属性付きXML要素を抽出する関数（Atom用）
function extractElementWithAttribute(text: string, tagName: string, attribute: string): string[] {
  const regex = new RegExp(`<${tagName}[^>]*${attribute}="([^"]*)"[^>]*>`, 'gi')
  const matches = text.match(regex)
  if (!matches) return []
  
  return matches.map(match => {
    const attrMatch = match.match(new RegExp(`${attribute}="([^"]*)"`, 'i'))
    return attrMatch ? cleanText(attrMatch[1]) : ''
  }).filter(content => content.length > 0)
}

// RSS 2.0フィードをパース
function parseRSS2Feed(text: string): any[] {
  const items: any[] = []
  
  // item要素を抽出
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi
  const itemMatches = text.match(itemRegex)
  
  if (!itemMatches) return items
  
  for (const itemText of itemMatches.slice(0, 5)) { // 最新5件
    const titles = extractElement(itemText, 'title')
    const links = extractElement(itemText, 'link')
    const descriptions = extractElement(itemText, 'description')
    const pubDates = extractElement(itemText, 'pubDate')
    const guids = extractElement(itemText, 'guid')
    
    if (titles.length > 0 && links.length > 0) {
      items.push({
        title: titles[0],
        link: links[0],
        description: descriptions.length > 0 ? descriptions[0] : '',
        pubDate: pubDates.length > 0 ? new Date(pubDates[0]) : new Date(),
        guid: guids.length > 0 ? guids[0] : links[0],
      })
    }
  }
  
  return items
}

// Atomフィードをパース
function parseAtomFeed(text: string): any[] {
  const items: any[] = []
  
  // entry要素を抽出
  const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi
  const entryMatches = text.match(entryRegex)
  
  if (!entryMatches) return items
  
  for (const entryText of entryMatches.slice(0, 5)) { // 最新5件
    const titles = extractElement(entryText, 'title')
    const links = extractElementWithAttribute(entryText, 'link', 'href')
    const summaries = extractElement(entryText, 'summary')
    const contents = extractElement(entryText, 'content')
    const published = extractElement(entryText, 'published')
    const updated = extractElement(entryText, 'updated')
    const ids = extractElement(entryText, 'id')
    
    if (titles.length > 0 && links.length > 0) {
      items.push({
        title: titles[0],
        link: links[0],
        description: summaries.length > 0 ? summaries[0] : (contents.length > 0 ? contents[0] : ''),
        pubDate: published.length > 0 || updated.length > 0 ? 
          new Date(published.length > 0 ? published[0] : updated[0]) : new Date(),
        guid: ids.length > 0 ? ids[0] : links[0],
      })
    }
  }
  
  return items
}

// 堅牢なRSSパーサー
async function parseRSS(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LearnlyRSSBot/1.0)',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const text = await response.text()
    
    // フィードタイプを判定
    const isRSS = /<rss[^>]*>/i.test(text)
    const isAtom = /<feed[^>]*>/i.test(text)
    
    let items: any[] = []
    
    if (isRSS) {
      // RSS 2.0
      items = parseRSS2Feed(text)
    } else if (isAtom) {
      // Atom
      items = parseAtomFeed(text)
    } else {
      // その他の形式を試行
      const rssItems = parseRSS2Feed(text)
      const atomItems = parseAtomFeed(text)
      items = rssItems.length > 0 ? rssItems : atomItems
    }
    
    return items
    
  } catch (error) {
    console.error(`RSS parsing error for ${url}:`, error)
    return []
  }
}

// HTMLタグを除去する関数
function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, '').trim()
}

// 要約を生成する関数（簡易版）
function generateSummary(text: string, maxLength: number = 100): string {
  const cleanText = stripHtmlTags(text)
  if (cleanText.length <= maxLength) {
    return cleanText
  }
  return cleanText.substring(0, maxLength) + '...'
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { category } = await req.json()
    
    if (!category) {
      return new Response(
        JSON.stringify({ error: 'Category parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Supabaseクライアントを作成
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase configuration not found' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 指定カテゴリのRSSソースを取得
    const { data: sources, error: sourcesError } = await supabase
      .from('rss_sources')
      .select('*')
      .eq('category', category)
      .eq('active', true)

    if (sourcesError || !sources || sources.length === 0) {
      return new Response(
        JSON.stringify({ error: `No RSS sources found for category: ${category}` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing ${sources.length} RSS sources for category: ${category}`)

    const allArticles: any[] = []
    const errors: string[] = []

    // 各RSSソースから記事を取得
    for (const source of sources) {
      try {
        console.log(`Fetching RSS from: ${source.source_name} (${source.rss_url})`)
        
        const articles = await parseRSS(source.rss_url)
        
        for (const article of articles) {
          // 重複チェック（URL単位）
          const { data: existing } = await supabase
            .from('latest_news')
            .select('id')
            .eq('url', article.link)
            .limit(1)

          if (existing && existing.length > 0) {
            console.log(`Skipping duplicate article: ${article.title}`)
            continue
          }

          // 記事をデータベースに保存
          const { error: insertError } = await supabase
            .from('latest_news')
            .insert({
              title: article.title,
              summary: generateSummary(article.description || article.title),
              url: article.link,
              source: source.source_name,
              category: category,
              published_at: article.pubDate,
              topics: [category],
            })

          if (insertError) {
            console.error(`Error inserting article: ${insertError.message}`)
            errors.push(`Failed to insert article from ${source.source_name}: ${insertError.message}`)
          } else {
            allArticles.push({
              title: article.title,
              summary: generateSummary(article.description || article.title),
              url: article.link,
              source: source.source_name,
              category: category,
              published_at: article.pubDate,
            })
            console.log(`Successfully inserted article: ${article.title}`)
          }
        }
      } catch (error: any) {
        const errorMessage = `Error processing ${source.source_name}: ${error.message}`
        console.error(errorMessage)
        errors.push(errorMessage)
      }
    }

    console.log(`RSS fetch completed. Articles: ${allArticles.length}, Errors: ${errors.length}`)

    return new Response(
      JSON.stringify({
        success: true,
        articles: allArticles,
        totalArticles: allArticles.length,
        errors: errors.length > 0 ? errors : undefined,
        category: category,
        sourcesProcessed: sources.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('RSS fetch function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch RSS news',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 