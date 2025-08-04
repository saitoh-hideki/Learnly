import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { parseRSS, generateSummary } from '../rss-parser.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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

    // healthカテゴリのRSSソースを取得
    const { data: sources, error: sourcesError } = await supabase
      .from('rss_sources')
      .select('*')
      .eq('category', 'health')
      .eq('active', true)

    if (sourcesError || !sources || sources.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No RSS sources found for health category' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing ${sources.length} RSS sources for health category`)

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
              category: 'health',
              published_at: article.pubDate,
              topics: ['health'],
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
              category: 'health',
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

    console.log(`Health RSS fetch completed. Articles: ${allArticles.length}, Errors: ${errors.length}`)

    return new Response(
      JSON.stringify({
        success: true,
        articles: allArticles,
        totalArticles: allArticles.length,
        errors: errors.length > 0 ? errors : undefined,
        category: 'health',
        sourcesProcessed: sources.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Health RSS fetch function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch health RSS news',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})