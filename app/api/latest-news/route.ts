import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Supabaseクライアントの設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/latest-news called')
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    console.log('Category filter:', category)

    if (!category) {
      console.log('No category provided, returning error')
      return NextResponse.json({ error: 'Category parameter is required' }, { status: 400 })
    }

    // シンプルなSupabaseクライアントを作成
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    console.log('Querying latest_news table for category:', category)
    
    // 最新ニュース用のクエリ（latest_newsテーブルを使用）
    let query = supabase
      .from('latest_news')
      .select('id, title, summary, url, source, category, topics, published_at, created_at')
      .eq('category', category)
      .order('created_at', { ascending: false })
      .limit(20) // 最新20件に制限

    console.log('Executing database query...')
    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 })
    }

    console.log('Database query successful')
    console.log('Retrieved news count:', data?.length || 0)
    console.log('Latest news items:', data?.slice(0, 3) || [])

    return NextResponse.json({ 
      news: data || [],
      category: category,
      count: data?.length || 0,
      user: null
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
} 