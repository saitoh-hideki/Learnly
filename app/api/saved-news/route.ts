import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Supabaseクライアントの設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('saved_news')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data: savedNews, error } = await query

    if (error) {
      console.error('Error fetching saved news:', error)
      return NextResponse.json({ error: 'Failed to fetch saved news' }, { status: 500 })
    }

    return NextResponse.json({ savedNews: savedNews || [] })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/saved-news called')
    
    const body = await request.json()
    console.log('Request body:', body)
    const { title, summary, url, source, category, publishedAt, topics } = body

    // Validate required fields
    if (!title || !summary || !url || !source || !category) {
      console.error('Missing required fields:', { title, summary, url, source, category })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('Checking for existing news with URL:', url)
    // Check if news is already saved
    const { data: existingNews, error: checkError } = await supabase
      .from('saved_news')
      .select('id')
      .eq('url', url)
      .single()

    console.log('Check result:', { existingNews, checkError })

    if (existingNews) {
      console.log('News already exists:', existingNews)
      return NextResponse.json({ 
        message: 'News already exists', 
        status: 'duplicate' 
      }, { status: 409 })
    }

    console.log('Inserting new news with data:', {
      title,
      summary,
      url,
      source,
      category,
      publishedAt: publishedAt,
      topics: topics || []
    })

    // Insert new saved news (without user_id since RLS is disabled)
    const { data: savedNews, error } = await supabase
      .from('saved_news')
      .insert({
        title,
        summary,
        url,
        source,
        category,
        published_at: publishedAt,
        topics: topics || []
      })
      .select()
      .single()

    console.log('Insert result:', { savedNews, error })

    if (error) {
      console.error('Error saving news:', error)
      return NextResponse.json({ error: 'Failed to save news', details: error.message }, { status: 500 })
    }

    console.log('News saved successfully:', savedNews)
    return NextResponse.json({ savedNews })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const clearAll = searchParams.get('clearAll')

    // すべてのニュースを削除する場合
    if (clearAll === 'true') {
      console.log('Clearing all saved news')
      
      // すべてのレコードを削除
      const { error } = await supabase
        .from('saved_news')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // すべてのレコードを削除

      if (error) {
        console.error('Error clearing all saved news:', error)
        return NextResponse.json({ error: 'Failed to clear all saved news' }, { status: 500 })
      }

      console.log('Successfully cleared all saved news')
      return NextResponse.json({ 
        message: 'All saved news cleared successfully'
      })
    }

    // 特定のニュースを削除する場合
    if (!id) {
      return NextResponse.json({ error: 'News ID is required' }, { status: 400 })
    }

    // Delete saved news
    const { error } = await supabase
      .from('saved_news')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting saved news:', error)
      return NextResponse.json({ error: 'Failed to delete saved news' }, { status: 500 })
    }

    return NextResponse.json({ message: 'News deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 