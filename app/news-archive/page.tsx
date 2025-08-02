'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, Filter, Calendar, ExternalLink, BookOpen, Trash2, Download } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useStore, NewsArticle } from '@/store/useStore'

const categories = [
  { id: 'all', name: 'すべて', icon: '📰' },
  { id: 'technology', name: 'テクノロジー', icon: '💻' },
  { id: 'business', name: 'ビジネス', icon: '💼' },
  { id: 'environment', name: '環境', icon: '🌱' },
  { id: 'health', name: '健康', icon: '🏥' },
  { id: 'education', name: '教育', icon: '📚' },
  { id: 'economics', name: '経済', icon: '💰' },
  { id: 'science', name: '科学', icon: '🔬' },
  { id: 'society', name: '社会', icon: '🏛️' }
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
  const { newsArticles, getNewsArticles, clearOldNews } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  })
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([])

  useEffect(() => {
    applyFilters()
  }, [searchQuery, selectedCategory, selectedTopics, dateRange, newsArticles])

  const applyFilters = () => {
    let filtered = [...newsArticles]

    // Search query filter
    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.source.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory)
    }

    // Topics filter
    if (selectedTopics.length > 0) {
      filtered = filtered.filter(article =>
        article.topics.some(topic => selectedTopics.includes(topic))
      )
    }

    // Date range filter
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(article => {
        const articleDate = new Date(article.publishedAt)
        const startDate = dateRange.start ? new Date(dateRange.start) : null
        const endDate = dateRange.end ? new Date(dateRange.end) : null

        if (startDate && endDate) {
          return articleDate >= startDate && articleDate <= endDate
        } else if (startDate) {
          return articleDate >= startDate
        } else if (endDate) {
          return articleDate <= endDate
        }
        return true
      })
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

    setFilteredArticles(filtered)
  }

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    )
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedTopics([])
    setDateRange({ start: '', end: '' })
  }

  const handleClearOldNews = () => {
    if (confirm('30日以上前のニュースを削除しますか？')) {
      clearOldNews(30)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }

  const exportNews = () => {
    const csvContent = [
      ['タイトル', '要約', '出典', 'カテゴリ', 'トピック', '公開日', 'URL'],
      ...filteredArticles.map(article => [
        article.title,
        article.summary,
        article.source,
        article.category,
        article.topics.join(', '),
        formatDate(article.publishedAt),
        article.url
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `news-archive-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/news-dashboard')}
                className="text-gray-600 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded-xl"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl shadow-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">ニュースアーカイブ</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleClearOldNews}
                className="border-gray-600 hover:border-red-400 hover:bg-red-500/10 text-gray-300 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                古いニュースを削除
              </Button>
              <Button
                variant="outline"
                onClick={exportNews}
                className="border-gray-600 hover:border-sky-400 hover:bg-sky-500/10 text-gray-300 hover:text-sky-400"
              >
                <Download className="h-4 w-4 mr-2" />
                エクスポート
              </Button>
            </div>
          </div>
          
          <Card className="bg-gradient-to-r from-sky-500/10 to-indigo-500/10 border border-gray-700 shadow-xl rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">ニュース管理</h2>
                <p className="text-gray-300">
                  保存されたニュース: <span className="text-sky-400 font-semibold">{newsArticles.length}</span>件
                  {filteredArticles.length !== newsArticles.length && (
                    <span className="ml-2">
                      (フィルター結果: <span className="text-indigo-400 font-semibold">{filteredArticles.length}</span>件)
                    </span>
                  )}
                </p>
              </div>
              <Badge className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white px-4 py-1 rounded-full shadow-sm">
                アーカイブ
              </Badge>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-[#1c1f26] border border-gray-700 shadow-xl rounded-2xl mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Filter className="h-5 w-5 text-sky-500" />
              フィルター
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ニュースを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#2d3748] border-gray-600 text-white focus:border-sky-500 focus:ring-sky-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-3 block">カテゴリ</label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`h-auto p-3 flex flex-col items-center gap-1 ${
                      selectedCategory === category.id
                        ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white"
                        : "border-gray-600 text-gray-300 hover:border-sky-400"
                    }`}
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-xs">{category.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Topics Filter */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-3 block">トピック</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(topicNames).map(([key, name]) => (
                  <Button
                    key={key}
                    variant={selectedTopics.includes(key) ? "default" : "outline"}
                    onClick={() => handleTopicToggle(key)}
                    className={`h-auto p-2 ${
                      selectedTopics.includes(key)
                        ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white"
                        : "border-gray-600 text-gray-300 hover:border-sky-400"
                    }`}
                  >
                    {name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">開始日</label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="bg-[#2d3748] border-gray-600 text-white focus:border-sky-500 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">終了日</label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="bg-[#2d3748] border-gray-600 text-white focus:border-sky-500 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="border-gray-600 hover:border-gray-400 text-gray-300 hover:text-gray-100"
            >
              フィルターをクリア
            </Button>
          </CardContent>
        </Card>

        {/* News List */}
        <div className="space-y-6">
          {filteredArticles.length === 0 ? (
            <Card className="bg-[#1c1f26] border border-gray-700 shadow-xl rounded-2xl">
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">ニュースが見つかりません</h3>
                <p className="text-gray-400">
                  {newsArticles.length === 0 
                    ? 'まだニュースが保存されていません。ニュースダッシュボードでニュースを取得してください。'
                    : 'フィルター条件を変更して再度お試しください。'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredArticles.map((article) => (
              <Card
                key={article.id}
                className="bg-[#1c1f26] border border-gray-700 hover:border-indigo-400 transition-all duration-300 shadow-xl rounded-2xl"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300 px-3 py-1 rounded-full">
                          {categories.find(c => c.id === article.category)?.name || article.category}
                        </Badge>
                        <span className="text-xs text-gray-400 font-medium">{article.source}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(article.publishedAt)}
                        </span>
                      </div>
                      <CardTitle className="text-xl leading-tight mb-3 font-semibold text-white">
                        {article.title}
                      </CardTitle>
                      <CardDescription className="text-base leading-relaxed text-gray-400 mb-4">
                        {article.summary}
                      </CardDescription>
                      
                      {/* Topics */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {article.topics.map((topic) => (
                          <Badge
                            key={topic}
                            variant="outline"
                            className="text-xs bg-sky-500/10 border-sky-500/30 text-sky-400 px-2 py-1 rounded-full"
                          >
                            {topicNames[topic] || topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>保存日: {formatDate(article.createdAt.toString())}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(article.url, '_blank')}
                        className="border-gray-600 hover:border-sky-400 text-gray-300 hover:text-sky-400"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        記事を読む
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/chat/business?news=${article.id}`)}
                        className="border-gray-600 hover:border-indigo-400 text-gray-300 hover:text-indigo-400"
                      >
                        <BookOpen className="h-4 w-4 mr-1" />
                        学習する
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 