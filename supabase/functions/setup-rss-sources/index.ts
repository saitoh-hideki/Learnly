import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    // まず、rss_sourcesテーブルが存在するか確認
    const { data: tableExists, error: tableError } = await supabase
      .from('rss_sources')
      .select('count')
      .limit(1)

    if (tableError) {
      console.error('Table check error:', tableError)
      return new Response(
        JSON.stringify({ 
          error: 'RSS sources table not found',
          details: tableError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // RSSソースの初期データ（技術系のみ）
    const rssSources = [
      // technologyカテゴリ
      { source_name: 'ITmedia', rss_url: 'https://rss.itmedia.co.jp/rss/2.0/topstory.xml', category: 'technology' },
      { source_name: 'CNET Japan', rss_url: 'https://japan.cnet.com/rss/index.rdf', category: 'technology' },
      { source_name: 'GIGAZINE', rss_url: 'https://gigazine.net/news/rss_2.0/', category: 'technology' },
    ]

    console.log(`Inserting ${rssSources.length} RSS sources...`)

    // 新しいRSSソースを挿入
    const { data: insertedSources, error: insertError } = await supabase
      .from('rss_sources')
      .insert(rssSources)
      .select()

    if (insertError) {
      console.error('Error inserting RSS sources:', insertError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to insert RSS sources',
          details: insertError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Successfully inserted ${insertedSources?.length || 0} RSS sources`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully inserted ${insertedSources?.length || 0} RSS sources`,
        sources: insertedSources
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Setup RSS sources function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to setup RSS sources',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 