import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Supabaseクライアントの設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request: NextRequest) {
  try {
    console.log('Force clearing all saved news...')
    
    // すべてのレコードを取得して確認
    const { data: allNews, error: fetchError } = await supabase
      .from('saved_news')
      .select('id, title')
    
    if (fetchError) {
      console.error('Error fetching saved news:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch saved news' }, { status: 500 })
    }
    
    console.log(`Found ${allNews?.length || 0} saved news items to delete`)
    
    if (allNews && allNews.length > 0) {
      // すべてのレコードを削除
      const { error } = await supabase
        .from('saved_news')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

      if (error) {
        console.error('Error clearing all saved news:', error)
        return NextResponse.json({ error: 'Failed to clear all saved news' }, { status: 500 })
      }
    }

    console.log('Successfully cleared all saved news')
    return NextResponse.json({ 
      message: 'All saved news cleared successfully',
      deletedCount: allNews?.length || 0
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 