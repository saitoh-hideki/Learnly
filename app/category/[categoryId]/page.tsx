'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, BookOpen, MessageSquare, FileText, X, Clock, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/ui/header'
import { useStore } from '@/store/useStore'
import { useLabels } from '@/lib/kidsLabels'

// 学習方法の定義
const learningMethods = [
  {
    id: 'deep-review',
    name: 'Deep Review',
    description: 'ニュースの要約と関連情報を収集して多面的に深く理解',
    icon: BookOpen,
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'discussion',
    name: 'Discussion',
    description: 'Deepen learning with AI and cultivate reflection skills to build intelligence through changing world information',
    icon: MessageSquare,
    gradient: 'from-blue-500 to-green-500'
  },
  {
    id: 'action',
    name: 'Action',
    description: '自分にできるアクションや提案をまとめる',
    icon: FileText,
    gradient: 'from-pink-500 to-purple-500'
  }
]

// カテゴリー名の日本語変換マップ
const categoryNames: { [key: string]: string } = {
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

// ニュースの型定義
interface NewsItem {
  id: string
  title: string
  summary: string
  url: string
  source: string
  category: string
  published_at: string
  created_at: string
}

export default function CategoryNewsPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params.categoryId as string
  const { isKidsMode } = useStore()
  const labels = useLabels(isKidsMode)
  
  const [savedNews, setSavedNews] = useState<NewsItem[]>([])
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)
  const [showLearningModal, setShowLearningModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSavedNewsByCategory()
  }, [categoryId])

  const fetchSavedNewsByCategory = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/saved-news')
      
      if (response.ok) {
        const { savedNews } = await response.json()
        // カテゴリーでフィルタリング
        const filteredNews = savedNews.filter((news: NewsItem) => 
          news.category === categoryId
        )
        setSavedNews(filteredNews)
      }
    } catch (error) {
      console.error('Error fetching saved news:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewsSelect = (news: NewsItem) => {
    setSelectedNews(news)
    setShowLearningModal(true)
  }

  const handleLearningMethodSelect = (methodId: string) => {
    if (selectedNews) {
      // Deep Reviewの場合はDeep Reviewページに遷移、その他はチャットページに遷移
      if (methodId === 'deep-review') {
        router.push(`/deep-review?newsId=${selectedNews.id}`)
      } else if (methodId === 'discussion') {
        router.push(`/chat/discussion?newsId=${selectedNews.id}`)
      } else if (methodId === 'action') {
        router.push(`/chat/action?newsId=${selectedNews.id}`)
      }
    }
  }

  const handleBack = () => {
    router.push('/dashboard')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const truncateSummary = (summary: string, maxLength: number = 100) => {
    if (summary.length <= maxLength) return summary
    return summary.substring(0, maxLength) + '...'
  }

  const categoryName = categoryNames[categoryId] || categoryId

  return (
    <div className="min-h-screen bg-[#0e1a2a] relative overflow-hidden">
      <Header title={labels.dashboardTitle} />
      
      {/* Enhanced Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-sky-500/8 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-t from-blue-600/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-br from-indigo-500/3 to-purple-500/3 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <span className="cursor-pointer hover:text-white" onClick={handleBack}>
              ホーム
            </span>
            <span>/</span>
            <span>ニュースで学ぶ</span>
          </div>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            ← 戻る
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Q ニュースを検索"
              className="w-full pl-4 pr-10 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Category News Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            選択したカテゴリー「{categoryName}」の最新ニュース
          </h2>
          <p className="text-slate-400 mb-6">
            {savedNews.length}件の最新ニュースがあります（気に入ったものは保存ポ）
          </p>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-slate-400">読み込み中...</div>
            </div>
          ) : savedNews.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-slate-400 mb-2">
                {isKidsMode ? "まだ ニュースが ほぞんされていないよ" : "まだニュースが保存されていません"}
              </div>
              <div className="text-slate-500 text-sm">
                {isKidsMode ? "ニュースダッシュボードで きじを ほぞんしよう" : "ニュースダッシュボードで記事を保存しましょう"}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedNews.map((news) => (
                <Card
                  key={news.id}
                  className="bg-slate-800/50 border-slate-600 hover:border-blue-500 transition-all duration-300 cursor-pointer group"
                  onClick={() => handleNewsSelect(news)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg mb-2 line-clamp-2">
                          {news.title}
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-sm mb-3 line-clamp-3">
                          {truncateSummary(news.summary, 120)}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                        {categoryNames[news.category] || news.category}
                      </Badge>
                      {news.source && (
                        <Badge variant="secondary" className="bg-slate-600/50 text-slate-300">
                          {news.source}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Clock className="h-4 w-4" />
                        {formatDate(news.published_at)}
                      </div>
                      <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">通常モード</span>
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
              <span className="text-slate-300 text-sm">👤</span>
            </div>
          </div>
          <Button
            onClick={fetchSavedNewsByCategory}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            更新
          </Button>
        </div>
      </div>

      {/* Learning Method Selection Modal */}
      {showLearningModal && selectedNews && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">学習方法を選択</h3>
              <button
                onClick={() => setShowLearningModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <p className="text-slate-400 mb-6">
              ニュースを選んで学習を始めましょう
            </p>

            <div className="space-y-4">
              {learningMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleLearningMethodSelect(method.id)}
                  className={`w-full p-4 rounded-lg bg-gradient-to-r ${method.gradient} hover:opacity-90 transition-opacity text-left`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <method.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-lg mb-1">
                        {method.name}
                      </h4>
                      <p className="text-white/90 text-sm">
                        {method.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setShowLearningModal(false)}
                variant="outline"
                className="border-slate-600 text-slate-400 hover:bg-slate-700"
              >
                キャンセル
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 