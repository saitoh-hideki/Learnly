import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Supabaseクライアントの設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/fetch-news called')
    const body = await request.json()
    const { topic, topics } = body

    console.log('Request body:', { topic, topics })

    // トピックの検証
    if (!topic && (!topics || !Array.isArray(topics) || topics.length === 0)) {
      return NextResponse.json({ 
        error: 'Topic or topics parameter is required' 
      }, { status: 400 })
    }

    // エッジファンクションのURLを構築
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/fetch-news`
    
    console.log('Calling edge function:', edgeFunctionUrl)

    // エッジファンクションを呼び出し
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        topic: topic || topics[0],
        topics: topics || [topic]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Edge function error:', response.status, errorText)
      return NextResponse.json({ 
        error: 'Failed to fetch news from edge function',
        details: errorText
      }, { status: response.status })
    }

    const result = await response.json()
    console.log('Edge function response:', result)

    return NextResponse.json(result)

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
} 