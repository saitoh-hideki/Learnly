'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, BookOpen, MessageSquare, FileText, Clock, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { learningModes } from '@/data/modes'

interface SavedNews {
  id: string
  title: string
  summary: string
  url: string
  source: string
  category: string
  published_at: string
  topics: string[]
  created_at: string
}

const topicNames: { [key: string]: string } = {
  'business': 'ビジネス・経営',
  'technology': 'テクノロジー・IT',
  'economics': '経済・金融',
  'science': '科学・研究',
  'education': '教育・学習',
  'health': '健康・医療',
  'environment': '環境・サステナビリティ',
  'society': '社会・政治',
  'lifestyle': '文化・ライフスタイル'
}

export default function CategoryPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params.categoryId as string
  
  const [savedNews, setSavedNews] = useState<SavedNews[]>([])
  const [selectedArticle, setSelectedArticle] = useState<SavedNews | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  const category = learningModes.find(mode => mode.id === categoryId)

  useEffect(() => {
    setMounted(true)
    fetchCategoryNews()
  }, [categoryId])

  const fetchCategoryNews = async () => {
    try {
      setIsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/saved-news', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const { savedNews } = await response.json()
        // 該当カテゴリのニュースのみフィルタリング
        const categoryNews = savedNews.filter((news: SavedNews) => 
          news.category === categoryId || news.topics.includes(categoryId)
        )
        setSavedNews(categoryNews)
      } else {
        console.error('Failed to fetch saved news')
      }
    } catch (error) {
      console.error('Error fetching saved news:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleArticleClick = (article: SavedNews) => {
    setSelectedArticle(article)
    // チャットページに遷移し、初期メッセージを設定
    const initialMessage = `この記事「${article.title}」に関する最新動向について教えてください。記事の内容：${article.summary}`
    
    // チャットページに遷移（クエリパラメータで初期メッセージを渡す）
    router.push(`/chat/${categoryId}?initialMessage=${encodeURIComponent(initialMessage)}&articleId=${article.id}`)
  }

  if (!mounted) {
    return null
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">カテゴリが見つかりません</h1>
          <Button onClick={() => router.push('/dashboard')}>
            ダッシュボードに戻る
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard')}
              className="hover:bg-gray-800 rounded-xl text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="text-4xl">{category.icon}</div>
              <div>
                <h1 className="text-2xl font-bold text-white">{category.name}</h1>
                <p className="text-gray-400">AIと対話して学習</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="mb-8">
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/review-stock')}
              className="border-gray-600 hover:border-indigo-400 text-gray-300 hover:text-indigo-400"
            >
              <FileText className="h-4 w-4 mr-2" />
              保存済みレビュー
            </Button>
            <Button
              variant="outline"
              disabled
              className="border-gray-600 text-gray-500 cursor-not-allowed"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              レビュー生成
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-sky-500/10 to-indigo-500/10 border border-gray-700 shadow-xl rounded-3xl p-8 text-center">
            <div className="text-6xl mb-6">{category.icon}</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              {category.name}について学習を始めましょう
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
              {category.description}
            </p>
            <div className="mt-6">
              <Button
                onClick={() => router.push(`/chat/${categoryId}`)}
                className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white rounded-xl shadow-md px-8 py-3 text-lg font-medium"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                学習を始める
              </Button>
            </div>
          </Card>
        </div>

        {/* News History Slider */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              ニュース履歴
            </h3>
            <Badge variant="secondary" className="text-sm">
              {savedNews.length} 件
            </Badge>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto"></div>
              <p className="text-gray-400 mt-2">読み込み中...</p>
            </div>
          ) : savedNews.length === 0 ? (
            <Card className="bg-[#1c1f26] border border-gray-700 shadow-xl rounded-2xl">
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">ニュース履歴がありません</h3>
                <p className="text-gray-400 mb-6">
                  このカテゴリのニュースを保存すると、ここに表示されます
                </p>
                <Button
                  onClick={() => router.push('/news-dashboard')}
                  className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white hover:from-sky-600 hover:to-indigo-600"
                >
                  ニュースを見る
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex gap-4 pb-4 min-w-max">
                {savedNews.slice(0, 10).map((news) => (
                  <Card
                    key={news.id}
                    className="cursor-pointer transition-all duration-300 hover:scale-[1.02] border-2 border-gray-700 hover:border-sky-400 bg-[#1c1f26] hover:shadow-lg rounded-2xl min-w-[320px] max-w-[320px]"
                    onClick={() => handleArticleClick(news)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                          {topicNames[news.category] || news.category}
                        </Badge>
                        <span className="text-xs text-gray-400">{news.source}</span>
                      </div>
                      <CardTitle className="text-sm font-semibold text-white line-clamp-2 leading-tight">
                        {news.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-xs text-gray-400 line-clamp-3 mb-3">
                        {news.summary}
                      </CardDescription>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>保存: {new Date(news.created_at).toLocaleDateString('ja-JP')}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(news.url, '_blank')
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300 p-0 h-auto"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 