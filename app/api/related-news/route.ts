import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { keyword, category, title, summary } = await req.json()

    if (!keyword) {
      return NextResponse.json(
        { error: 'Keyword is required' },
        { status: 400 }
      )
    }

    // キーワードベースのPerplexity AI検索クエリを生成
    const searchQueries = [
      `${keyword} 最新ニュース 2024`,
      `${keyword} 市場分析 トレンド`,
      `${keyword} 技術動向 最新技術`,
      `${keyword} 業界動向 今後の展望`,
      `${keyword} 関連情報 背景 詳細`
    ]

    // Perplexity AIの検索URLを生成
    const relatedNews = searchQueries.map((query, index) => {
      const encodedQuery = encodeURIComponent(query)
      const perplexityUrl = `https://www.perplexity.ai/search?q=${encodedQuery}`
      
      return {
        title: getTitleByIndex(index, keyword, category),
        summary: getSummaryByIndex(index, keyword),
        url: perplexityUrl,
        source: 'Perplexity AI',
        relevance: 95 - (index * 3), // 関連度を段階的に下げる
        query: query,
        keyword: keyword
      }
    })

    return NextResponse.json({ 
      relatedNews,
      success: true 
    })

  } catch (error) {
    console.error('Related news API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate related news',
        success: false 
      },
      { status: 500 }
    )
  }
}

function getTitleByIndex(index: number, keyword: string, category: string): string {
  const titles = [
    `${keyword}の最新動向`,
    `${keyword}の市場分析`,
    `${keyword}の技術動向`,
    `${keyword}の業界展望`,
    `${keyword}の関連情報`
  ]
  return titles[index] || titles[0]
}

function getSummaryByIndex(index: number, keyword: string): string {
  const summaries = [
    `${keyword}に関する最新の動向と今後の展望について詳しく解説します。`,
    `${keyword}市場の現状分析と今後の予測について包括的に検討します。`,
    `${keyword}分野における最新の技術動向とその影響について詳しく説明します。`,
    `${keyword}業界の最新トレンドと今後の発展方向性について展望します。`,
    `${keyword}に関する関連情報と詳細な分析を提供し、より深い理解を促進します。`
  ]
  return summaries[index] || summaries[0]
} 