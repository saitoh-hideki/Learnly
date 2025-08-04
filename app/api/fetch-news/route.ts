import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Supabaseクライアントの設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// カテゴリとエッジファンクションのマッピング
const categoryToFunctionMap: { [key: string]: string } = {
  'business': 'fetch-business-news',
  'technology': 'fetch-technology-news',
  'economics': 'fetch-economics-news',
  'science': 'fetch-science-news',
  'education': 'fetch-education-news',
  'health': 'fetch-health-news',
  'environment': 'fetch-environment-news',
  'society': 'fetch-society-news',
  'lifestyle': 'fetch-lifestyle-news'
}

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

    // 使用するトピックを決定
    const targetTopic = topic || topics[0]
    
    // カテゴリに対応するエッジファンクションを取得
    const edgeFunctionName = categoryToFunctionMap[targetTopic]
    
    if (!edgeFunctionName) {
      return NextResponse.json({ 
        error: `Unsupported category: ${targetTopic}`,
        supportedCategories: Object.keys(categoryToFunctionMap)
      }, { status: 400 })
    }

    // エッジファンクションのURLを構築
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/${edgeFunctionName}`
    
    console.log(`Calling specialized edge function: ${edgeFunctionName}`)
    console.log('Edge function URL:', edgeFunctionUrl)

    // 専用エッジファンクションを呼び出し
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({}) // 専用エッジファンクションはパラメータ不要
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Edge function error:', response.status, errorText)
      return NextResponse.json({ 
        error: `Failed to fetch ${targetTopic} news from edge function`,
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