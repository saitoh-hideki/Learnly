import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Supabaseクライアントの設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let query = supabase
      .from('saved_news')
      .select('id, title, summary, url, source, category, published_at, created_at')
      .order('created_at', { ascending: false })
      .limit(1)

    // 特定のカテゴリーが指定されている場合
    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// 全カテゴリーの最新ニュースを一括取得
export async function POST(request: NextRequest) {
  try {
    // 各カテゴリーの最新ニュースを取得
    const categories = [
      'business', 'technology', 'economics', 'politics', 
      'society', 'international', 'sports', 'entertainment', 'science'
    ]

    const latestNewsByCategory: { [key: string]: any } = {}

    for (const category of categories) {
      const { data, error } = await supabase
        .from('saved_news')
        .select('id, title, summary, url, source, category, published_at, created_at')
        .eq('category', category)
        .order('created_at', { ascending: false })
        .limit(1)

      if (!error && data && data.length > 0) {
        latestNewsByCategory[category] = data[0]
      }
    }

    return NextResponse.json({ data: latestNewsByCategory })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 