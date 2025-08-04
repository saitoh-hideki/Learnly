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

    // RSSソースの初期データ
    const rssSources = [
      // technologyカテゴリ
      { source_name: 'ITmedia', rss_url: 'https://rss.itmedia.co.jp/rss/2.0/topstory.xml', category: 'technology' },
      { source_name: 'CNET Japan', rss_url: 'https://japan.cnet.com/rss/index.rdf', category: 'technology' },
      { source_name: 'GIGAZINE', rss_url: 'https://gigazine.net/news/rss_2.0/', category: 'technology' },
      { source_name: 'ZDNet Japan', rss_url: 'https://japan.zdnet.com/rss/index.rdf', category: 'technology' },
      { source_name: 'Engadget Japan', rss_url: 'https://japanese.engadget.com/rss.xml', category: 'technology' },

      // scienceカテゴリ
      { source_name: 'Nature Japan', rss_url: 'https://www.natureasia.com/ja-jp/nature/current-issue/rss', category: 'science' },
      { source_name: 'Science Japan', rss_url: 'https://www.science.org/rss/news_current.xml', category: 'science' },
      { source_name: 'Scientific American Japan', rss_url: 'https://www.scientificamerican.com/japanese/rss.xml', category: 'science' },

      // businessカテゴリ
      { source_name: '日経ビジネス', rss_url: 'https://business.nikkei.com/rss/index.rdf', category: 'business' },
      { source_name: '東洋経済オンライン', rss_url: 'https://toyokeizai.net/list/feed/rss', category: 'business' },
      { source_name: 'ダイヤモンドオンライン', rss_url: 'https://diamond.jp/rss/diamond.xml', category: 'business' },

      // healthカテゴリ
      { source_name: '日経メディカル', rss_url: 'https://medical.nikkeibp.co.jp/rss/index.rdf', category: 'health' },
      { source_name: 'm3.com', rss_url: 'https://www.m3.com/rss/news.xml', category: 'health' },
      { source_name: 'ケアネット', rss_url: 'https://www.carenet.com/rss/news.xml', category: 'health' },

      // societyカテゴリ
      { source_name: 'NHKニュース', rss_url: 'https://www3.nhk.or.jp/rss/news/cat0.xml', category: 'society' },
      { source_name: '朝日新聞', rss_url: 'https://rss.asahi.com/rss/asahi/newsheadlines.rdf', category: 'society' },
      { source_name: '読売新聞', rss_url: 'https://www.yomiuri.co.jp/rss/index.xml', category: 'society' },

      // politicsカテゴリ
      { source_name: '時事ドットコム', rss_url: 'https://www.jiji.com/rss/index.rdf', category: 'politics' },
      { source_name: '産経ニュース', rss_url: 'https://www.sankei.com/rss/index.rdf', category: 'politics' },

      // economicsカテゴリ
      { source_name: '日経電子版', rss_url: 'https://www.nikkei.com/rss/index.rdf', category: 'economics' },
      { source_name: 'ロイター', rss_url: 'https://jp.reuters.com/rss/index.rdf', category: 'economics' },
      { source_name: 'ブルームバーグ', rss_url: 'https://www.bloomberg.co.jp/rss/index.rdf', category: 'economics' },

      // environmentカテゴリ
      { source_name: '環境ビジネスオンライン', rss_url: 'https://www.kankyo-business.jp/rss/index.rdf', category: 'environment' },
      { source_name: 'EICネット', rss_url: 'https://www.eic.or.jp/rss/index.rdf', category: 'environment' },

      // educationカテゴリ
      { source_name: 'リセマム', rss_url: 'https://resemom.jp/rss/index.rdf', category: 'education' },
      { source_name: '教育新聞', rss_url: 'https://www.kyobun.co.jp/rss/index.rdf', category: 'education' },
      { source_name: 'ベネッセ教育情報サイト', rss_url: 'https://benesse.jp/rss/index.rdf', category: 'education' },

      // lifestyleカテゴリ
      { source_name: 'FASHION PRESS', rss_url: 'https://www.fashion-press.net/rss/index.rdf', category: 'lifestyle' },
      { source_name: 'VOGUE JAPAN', rss_url: 'https://www.vogue.co.jp/rss/index.rdf', category: 'lifestyle' },
      { source_name: 'ELLE JAPAN', rss_url: 'https://www.elle.com/jp/rss/index.rdf', category: 'lifestyle' }
    ]

    console.log(`Inserting ${rssSources.length} RSS sources...`)

    // 既存のRSSソースを削除（重複を避けるため）
    const { error: deleteError } = await supabase
      .from('rss_sources')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // 全件削除

    if (deleteError) {
      console.error('Error deleting existing RSS sources:', deleteError)
    } else {
      console.log('Deleted existing RSS sources')
    }

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
    console.error('Insert RSS sources function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to insert RSS sources',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 