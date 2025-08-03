'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, Filter, Calendar, ExternalLink, MessageSquare, BookOpen, FileText, RefreshCw, Settings, Bookmark, Eye, EyeOff, ChevronDown, ChevronUp, Sparkles, Archive, Zap, Target, TrendingUp, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/ui/header'
import { useStore, NewsArticle } from '@/store/useStore'
import { useLabels } from '@/lib/kidsLabels'
import { supabase } from '@/lib/supabase'

// アニメーション変数
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const
    }
  }
}

const cardHoverVariants = {
  rest: { 
    scale: 1,
    y: 0,
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
  },
  hover: { 
    scale: 1.02,
    y: -4,
    boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
    transition: {
      duration: 0.3,
      ease: "easeOut" as const
    }
  }
}

// 空のニュースデータ（ダミーデータを削除）
const dummyNews: NewsArticle[] = []

const categories = [
  { id: 'all', name: 'すべて', icon: '📰' },
  { id: 'business', name: 'ビジネス・経営', icon: '💼' },
  { id: 'technology', name: 'テクノロジー・IT', icon: '💻' },
  { id: 'economics', name: '経済・金融', icon: '📊' },
  { id: 'science', name: '科学・研究', icon: '🔬' },
  { id: 'education', name: '教育・学習', icon: '📚' },
  { id: 'health', name: '健康・医療', icon: '🏥' },
  { id: 'environment', name: '環境・サステナビリティ', icon: '🌱' },
  { id: 'society', name: '社会・政治', icon: '🏛️' },
  { id: 'lifestyle', name: '文化・ライフスタイル', icon: '🌟' }
]

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

export default function NewsDashboardPage() {
  const router = useRouter()
  const { selectedNewsTopics, isKidsMode } = useStore()
  const labels = useLabels(isKidsMode)
  const [news, setNews] = useState<NewsArticle[]>([])
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [savedNewsIds, setSavedNewsIds] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null)
  const [showLearningOptions, setShowLearningOptions] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // ニュースデータを取得
  const fetchNews = async () => {
    try {
      setIsLoading(true)
      console.log('Fetching news from /api/latest-news...')
      const response = await fetch('/api/latest-news')
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Raw API response:', data)
        console.log('News count from API:', data.news?.length || 0)
        
        // データベースの形式をNewsArticle型に変換
        const formattedNews = (data.news || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          summary: item.summary,
          url: item.url,
          source: item.source,
          category: item.category,
          publishedAt: item.published_at,
          topics: item.topics || [item.category], // topicsフィールドを使用
          createdAt: new Date(item.created_at)
        }))
        
        console.log('Formatted news count:', formattedNews.length)
        console.log('Formatted news:', formattedNews)
        
        // 作成日時で降順にソート（最新のものが上に来る）
        const sortedNews = formattedNews.sort((a: NewsArticle, b: NewsArticle) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        
        console.log('Sorted news count:', sortedNews.length)
        console.log('Top 3 news items:', sortedNews.slice(0, 3))
        
        setNews(sortedNews)
      } else {
        console.error('API response not ok:', response.status, response.statusText)
        // エラー時は空の配列を使用
        setNews([])
      }
    } catch (error) {
      console.error('Error fetching news:', error)
      setNews([])
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // 手動でニュースを再取得
  const handleRefreshNews = async () => {
    setIsRefreshing(true)
    await fetchNews()
  }

  // 初回読み込み時に少し待ってから再取得（データベースの更新を確実に反映）
  useEffect(() => {
    fetchNews()

    // 5分ごとにニュースを更新
    const interval = setInterval(fetchNews, 5 * 60 * 1000)

    return () => {
      clearInterval(interval)
    }
  }, []) // fetchNewsは関数なので依存関係に含めない

  // 保存済みニュースのIDを取得
  useEffect(() => {
    fetchSavedNewsIds()
  }, [])

  // ニュースをフィルタリング
  useEffect(() => {
    let filtered = news

    // カテゴリフィルター
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    // 検索フィルター
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredNews(filtered)
  }, [news, selectedCategory, searchQuery])

  const handleNewsSelect = (news: NewsArticle) => {
    setSelectedNews(news)
    setShowLearningOptions(true)
  }

  const handleLearningStart = (action: 'deep-dive' | 'chat' | 'output') => {
    if (!selectedNews) return

    // 選択されたニュースをセッションストレージに保存
    sessionStorage.setItem('selectedNews', JSON.stringify(selectedNews))
    sessionStorage.setItem('learningAction', action)

    // チャットページに遷移
    router.push('/chat/news-learning')
  }

  const handleSaveNews = async (news: NewsArticle) => {
    try {
      const response = await fetch('/api/saved-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: news.title,
          summary: news.summary,
          url: news.url,
          source: news.source,
          category: news.category,
          publishedAt: news.publishedAt,
          topics: news.topics || [news.category] // topicsフィールドを正しく送信
        }),
      })

      if (response.ok) {
        // 保存済みニュースのIDを更新
        setSavedNewsIds(prev => new Set([...prev, news.id]))
      }
    } catch (error) {
      console.error('Error saving news:', error)
    }
  }

  const fetchSavedNewsIds = async () => {
    try {
      const response = await fetch('/api/saved-news')
      if (response.ok) {
        const data = await response.json()
        const savedIds = new Set<string>(data.savedNews?.map((item: any) => item.id as string) || [])
        setSavedNewsIds(savedIds)
      }
    } catch (error) {
      console.error('Error fetching saved news IDs:', error)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      business: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      technology: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      economics: 'bg-green-500/20 text-green-300 border-green-500/30',
      science: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      education: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      health: 'bg-red-500/20 text-red-300 border-red-500/30',
      environment: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      society: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      lifestyle: 'bg-pink-500/20 text-pink-300 border-pink-500/30'
    }
    return colors[category] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-[#0e1a2a] relative overflow-hidden">
      <Header title={labels.newsLearning} />
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-sky-500/8 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-t from-blue-600/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-br from-indigo-500/3 to-purple-500/3 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-slate-300 hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isKidsMode ? "もどる" : "戻る"}
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Sparkles className="h-8 w-8 text-blue-400" />
              {labels.newsLearning}
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {labels.newsLearningSubtitle}
            </p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="text"
                placeholder={isKidsMode ? "ニュースを さがそう" : "ニュースを検索"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={handleRefreshNews}
              disabled={isRefreshing}
              className="border-slate-600 text-slate-300 hover:border-blue-500 hover:text-blue-300"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isKidsMode ? "更新" : "更新"}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-slate-600 text-slate-300 hover:border-blue-500 hover:text-blue-300"
            >
              <Filter className="h-4 w-4 mr-2" />
              {isKidsMode ? "フィルター" : "フィルター"}
              {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
            </Button>
          </div>

          {/* Category Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-slate-800/50 border border-slate-600 rounded-lg"
            >
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`${
                      selectedCategory === category.id
                        ? 'bg-blue-500 text-white'
                        : 'border-slate-600 text-slate-300 hover:border-blue-500 hover:text-blue-300'
                    }`}
                  >
                    <span className="mr-1">{category.icon}</span>
                    {isKidsMode 
                      ? (category.id === 'all' ? 'すべて' : labels.categories[category.id as keyof typeof labels.categories] || category.name)
                      : category.name
                    }
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* News Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800"
        >
          {/* 上段3つのニュースの説明 */}
          {filteredNews.length > 0 && (
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-blue-300 text-sm">
                <Sparkles className="h-4 w-4" />
                <span>
                  {isKidsMode 
                    ? "うえの 3つの ニュースが さいきん えらばれた テーマの ニュースだよ！" 
                    : "上段3つのニュースが最新の選択テーマのニュースです"
                  }
                </span>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="bg-slate-800/50 border-slate-600 animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-slate-700 rounded mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-slate-700 rounded w-1/4"></div>
                      <div className="h-3 bg-slate-700 rounded w-1/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredNews.length > 0 ? (
              filteredNews.map((newsItem, index) => (
                <motion.div
                  key={newsItem.id}
                  variants={itemVariants}
                  whileHover="hover"
                  initial="rest"
                  animate="rest"
                  className={index < 3 ? "relative" : ""}
                >
                  {/* 上段3つのニュースには特別なスタイルを適用 */}
                  {index < 3 && (
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center z-10">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                  )}
                  
                  <Card
                    className={`bg-slate-800/50 border-slate-600 hover:border-blue-500 transition-all duration-300 cursor-pointer group h-full flex flex-col hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 ${
                      index < 3 ? "ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/20" : ""
                    }`}
                    onClick={() => handleNewsSelect(newsItem)}
                  >
                    <CardHeader className="pb-3 flex-1">
                      <div className="flex items-start justify-between h-full">
                        <div className="flex-1">
                          <CardTitle className="text-white text-lg line-clamp-2 group-hover:text-blue-300 transition-colors mb-2 group-hover:scale-105">
                            {newsItem.title}
                          </CardTitle>
                          <CardDescription className="text-slate-400 line-clamp-3 flex-1">
                            {newsItem.summary}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        {/* Category and Source */}
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {/* メインカテゴリータグ */}
                            <Badge 
                              variant="outline" 
                              className={`${getCategoryColor(newsItem.category)}`}
                            >
                              {isKidsMode 
                                ? labels.categories[newsItem.category as keyof typeof labels.categories] || newsItem.category
                                : topicNames[newsItem.category] || newsItem.category
                              }
                            </Badge>
                            
                            {/* Topicsタグ（メインカテゴリーと異なる場合のみ表示） */}
                            {newsItem.topics && newsItem.topics.length > 0 && 
                             newsItem.topics.filter(topic => topic !== newsItem.category).map((topic, index) => (
                              <Badge 
                                key={index}
                                variant="outline" 
                                className="bg-slate-600/20 text-slate-300 border-slate-500/30"
                              >
                                {isKidsMode 
                                  ? labels.categories[topic as keyof typeof labels.categories] || topic
                                  : topicNames[topic] || topic
                                }
                              </Badge>
                            ))}
                          </div>
                          <span className="text-xs text-slate-500">
                            {newsItem.source}
                          </span>
                        </div>

                        {/* Date and Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="h-3 w-3" />
                            {formatDate(newsItem.publishedAt)}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSaveNews(newsItem)
                              }}
                              className={`p-1 h-8 w-8 transition-all duration-200 hover:scale-110 ${
                                savedNewsIds.has(newsItem.id)
                                  ? 'text-yellow-400 hover:text-yellow-300'
                                  : 'text-slate-400 hover:text-yellow-400'
                              }`}
                            >
                              <Bookmark className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(newsItem.url, '_blank')
                              }}
                              className="p-1 h-8 w-8 text-slate-400 hover:text-blue-400 transition-all duration-200 hover:scale-110"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              // Empty state
              <div className="col-span-full text-center py-16">
                <div className="p-4 bg-slate-800/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-400 text-lg mb-4">
                  {isKidsMode 
                    ? "ニュースが まだ ないよ。ニューストピックで えらんでね！" 
                    : "ニュースがまだありません。ニューストピックで選択してください"
                  }
                </p>
                <Button
                  onClick={() => router.push('/news-topics')}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isKidsMode ? "ニューストピックへ" : "ニューストピックへ"}
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Learning Options Modal */}
        {showLearningOptions && selectedNews && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-800 border border-slate-600 rounded-lg p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                {isKidsMode ? "べんきょうの しかたを えらぼう" : "学習方法を選択"}
              </h3>
              
              <div className="space-y-3">
                <Button
                  onClick={() => handleLearningStart('deep-dive')}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  {isKidsMode ? "ふかく まなぶ" : "深く学ぶ"}
                </Button>
                
                <Button
                  onClick={() => handleLearningStart('chat')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {isKidsMode ? "AIと おしゃべり" : "AIと対話"}
                </Button>
                
                <Button
                  onClick={() => handleLearningStart('output')}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {isKidsMode ? "まとめを つくる" : "まとめを作成"}
                </Button>
              </div>
              
              <Button
                variant="ghost"
                onClick={() => setShowLearningOptions(false)}
                className="w-full mt-4 text-slate-400 hover:text-white"
              >
                {isKidsMode ? "キャンセル" : "キャンセル"}
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
} 