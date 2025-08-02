import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify JWT token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('saved_news')
      .select('*')
      .eq('user_id', user.id)
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

    return NextResponse.json({ savedNews })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify JWT token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, summary, url, source, category, publishedAt, topics } = body

    // Validate required fields
    if (!title || !summary || !url || !source || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if news is already saved
    const { data: existingNews } = await supabase
      .from('saved_news')
      .select('id')
      .eq('user_id', user.id)
      .eq('url', url)
      .single()

    if (existingNews) {
      return NextResponse.json({ error: 'News already saved' }, { status: 409 })
    }

    // Insert new saved news
    const { data: savedNews, error } = await supabase
      .from('saved_news')
      .insert({
        user_id: user.id,
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

    if (error) {
      console.error('Error saving news:', error)
      return NextResponse.json({ error: 'Failed to save news' }, { status: 500 })
    }

    return NextResponse.json({ savedNews })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify JWT token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'News ID is required' }, { status: 400 })
    }

    // Delete saved news
    const { error } = await supabase
      .from('saved_news')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

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