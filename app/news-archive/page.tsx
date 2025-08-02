'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, Trash2, Download, MessageSquare, BookOpen, FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'

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

const categories = [
  { id: 'all', name: 'すべて', icon: '📰' },
  { id: 'technology', name: 'テクノロジー', icon: '💻' },
  { id: 'business', name: 'ビジネス', icon: '💼' },
  { id: 'environment', name: '環境', icon: '🌱' },
  { id: 'health', name: '健康', icon: '🏥' },
  { id: 'education', name: '教育', icon: '📚' }
]

const topicNames: { [key: string]: string } = {
  'business': 'ビジネス・経営',
  'technology': 'テクノロジー・IT',
  'economics': '経済・金融',
  'science': '科学・研究',
  'education': '教育・学習',
  'health': '健康・医療',
  'environment': '環境・サステナビリティ',
  'society': '社会・政治'
}

export default function NewsArchivePage() {
  const router = useRouter()
  const [savedNews, setSavedNews] = useState<SavedNews[]>([])
  const [filteredNews, setFilteredNews] = useState<SavedNews[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedNews, setSelectedNews] = useState<SavedNews | null>(null)

  // 保存されたニュースを取得
  const fetchSavedNews = async () => {
    try {
      setIsLoading(true)

      const response = await fetch('/api/saved-news')

      if (response.ok) {
        const { savedNews } = await response.json()
        setSavedNews(savedNews)
        setFilteredNews(savedNews)
      } else {
        console.error('Failed to fetch saved news')
      }
    } catch (error) {
      console.error('Error fetching saved news:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // ニュースを削除
  const deleteNews = async (id: string) => {
    try {
      const response = await fetch(`/api/saved-news?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSavedNews(prev => prev.filter(news => news.id !== id))
        setFilteredNews(prev => prev.filter(news => news.id !== id))
        if (selectedNews?.id === id) {
          setSelectedNews(null)
        }
      }
    } catch (error) {
      console.error('Error deleting news:', error)
    }
  }

  // フィルタリング
  useEffect(() => {
    let filtered = savedNews

    // カテゴリーフィルター
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(news => news.category === selectedCategory)
    }

    // 検索フィルター（タイトル、要約、出典、カテゴリ、トピック）
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(news => 
        news.title.toLowerCase().includes(query) ||
        news.summary.toLowerCase().includes(query) ||
        news.source.toLowerCase().includes(query) ||
        news.category.toLowerCase().includes(query) ||
        news.topics.some(topic => topic.toLowerCase().includes(query))
      )
    }

    // 保存日順でソート（新しい順）
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // 最大50件まで表示
    filtered = filtered.slice(0, 50)

    setFilteredNews(filtered)
  }, [savedNews, selectedCategory, searchQuery])

  // 初期データ取得
  useEffect(() => {
    fetchSavedNews()
  }, [])

  const handleLearningStart = (action: 'deep-dive' | 'chat' | 'output') => {
    if (!selectedNews) return
    
    // 一時的にダッシュボードにリダイレクト（後で専用ページを作成予定）
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded-xl"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">保存されたニュース</h1>
              </div>
            </div>
            <div className="text-sm text-gray-400 bg-[#1c1f26] px-4 py-2 rounded-xl shadow-sm border border-gray-700">
              <FileText className="h-4 w-4 inline mr-2" />
              <span>{new Date().toLocaleDateString('ja-JP')}</span>
            </div>
          </div>
          
          <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-gray-700 shadow-xl rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">ニュースアーカイブ</h2>
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 rounded-full shadow-sm">
                {savedNews.length}件保存済み
              </Badge>
            </div>
            <p className="text-gray-300 leading-relaxed text-lg">
              保存したニュースを整理して、いつでも学習に活用できます。
              カテゴリー別のフィルタリングや検索機能で、必要な情報を素早く見つけましょう。
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Saved News Cards */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-white">保存されたニュース</h3>
                <Button
                  variant="outline"
                  onClick={fetchSavedNews}
                  disabled={isLoading}
                  className="border-gray-600 hover:border-amber-400 hover:bg-amber-500/10 rounded-xl text-gray-300 hover:text-amber-400"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {isLoading ? '更新中...' : '更新'}
                </Button>
              </div>
              
              {/* Search and Filter */}
              <div className="mb-8 space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="タイトル、要約、出典、カテゴリ、トピックで検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-gray-600 bg-[#1c1f26] text-gray-300 placeholder-gray-500 focus:border-amber-500"
                    />
                  </div>
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm bg-[#1c1f26] text-gray-300"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
              {isLoading ? (
                <Card className="bg-[#1c1f26] border border-gray-700 shadow-xl rounded-2xl">
                  <CardContent className="py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">読み込み中...</p>
                  </CardContent>
                </Card>
              ) : filteredNews.length === 0 ? (
                <Card className="bg-[#1c1f26] border border-gray-700 shadow-xl rounded-2xl">
                  <CardContent className="py-12 text-center">
                    <BookOpen className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">保存されたニュースがありません</h3>
                    <p className="text-gray-400 mb-6">
                      ニュースダッシュボードでニュースを保存して、ここで管理しましょう
                    </p>
                    <Button
                      onClick={() => router.push('/news-dashboard')}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                    >
                      ニュースダッシュボードへ
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredNews.map((news) => (
                  <Card
                    key={news.id}
                    className={`cursor-pointer transition-all duration-300 hover:scale-[1.01] border-2 ${
                      selectedNews?.id === news.id 
                        ? 'border-amber-400 bg-gradient-to-r from-amber-500/10 to-orange-500/10 shadow-xl' 
                        : 'border-gray-700 hover:border-amber-400 bg-[#1c1f26] hover:shadow-lg'
                    } rounded-2xl`}
                    onClick={() => setSelectedNews(news)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300 px-3 py-1 rounded-full">
                              {categories.find(c => c.id === news.category)?.name}
                            </Badge>
                            <span className="text-xs text-gray-400 font-medium">{news.source}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(news.published_at).toLocaleDateString('ja-JP')}
                            </span>
                            <span className="text-xs text-amber-500">
                              保存日: {new Date(news.created_at).toLocaleDateString('ja-JP')}
                            </span>
                          </div>
                          <CardTitle className="text-xl leading-tight mb-3 font-semibold text-white">
                            {news.title}
                          </CardTitle>
                          <CardDescription className="text-base leading-relaxed text-gray-400">
                            {news.summary}
                          </CardDescription>
                          
                          {/* Topics */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {news.topics.map((topic) => (
                              <Badge
                                key={topic}
                                variant="outline"
                                className="text-xs bg-amber-500/10 border-amber-500/30 text-amber-400 px-2 py-1 rounded-full"
                              >
                                {topicNames[topic] || topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(news.url, '_blank')
                            }}
                            className="text-gray-400 hover:text-amber-400 hover:bg-amber-500/10"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNews(news.id)
                            }}
                            className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {selectedNews?.id === news.id && (
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <Button
                            variant="outline"
                            className="flex items-center gap-3 hover:bg-sky-50 hover:border-sky-300 rounded-xl py-3 transition-all duration-200"
                            onClick={() => handleLearningStart('deep-dive')}
                          >
                            <BookOpen className="h-4 w-4" />
                            深掘り
                          </Button>
                          <Button
                            variant="outline"
                            className="flex items-center gap-3 hover:bg-indigo-50 hover:border-indigo-300 rounded-xl py-3 transition-all duration-200"
                            onClick={() => handleLearningStart('chat')}
                          >
                            <MessageSquare className="h-4 w-4" />
                            学習
                          </Button>
                          <Button
                            variant="outline"
                            className="flex items-center gap-3 hover:bg-purple-50 hover:border-purple-300 rounded-xl py-3 transition-all duration-200"
                            onClick={() => handleLearningStart('output')}
                          >
                            <FileText className="h-4 w-4" />
                            アウトプット
                          </Button>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-amber-600" />
                  </div>
                  保存統計
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">総保存数</span>
                    <span className="font-semibold text-lg">{savedNews.length}件</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">今月の保存</span>
                    <span className="font-semibold text-lg">
                      {savedNews.filter(news => {
                        const newsDate = new Date(news.created_at)
                        const now = new Date()
                        return newsDate.getMonth() === now.getMonth() && newsDate.getFullYear() === now.getFullYear()
                      }).length}件
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">最多カテゴリー</span>
                    <span className="font-semibold text-lg">
                      {(() => {
                        const categoryCounts = savedNews.reduce((acc, news) => {
                          acc[news.category] = (acc[news.category] || 0) + 1
                          return acc
                        }, {} as Record<string, number>)
                        const maxCategory = Object.entries(categoryCounts).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0])
                        return categories.find(c => c.id === maxCategory[0])?.name || 'なし'
                      })()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-orange-600" />
                  </div>
                  カテゴリー別
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.filter(c => c.id !== 'all').map((category) => {
                    const count = savedNews.filter(news => news.category === category.id).length
                    return (
                      <div key={category.id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <span>{category.icon}</span>
                          {category.name}
                        </span>
                        <span className="font-semibold text-lg">{count}件</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 