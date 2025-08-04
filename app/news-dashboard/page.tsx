'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, Calendar, ExternalLink, MessageSquare, BookOpen, FileText, RefreshCw, Bookmark, Sparkles, Plus } from 'lucide-react'
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
  const { selectedNewsTopics, setSelectedNewsTopics, isKidsMode } = useStore()
  const labels = useLabels(isKidsMode)
  const [news, setNews] = useState<NewsArticle[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [savedNewsIds, setSavedNewsIds] = useState<Set<string>>(new Set())
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null)
  const [showLearningOptions, setShowLearningOptions] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [savingNewsIds, setSavingNewsIds] = useState<Set<string>>(new Set())

  // デバッグ用：コンポーネント初期化時の状態をログ
  useEffect(() => {
    console.log('=== NewsDashboardPage initialized ===')
    console.log('Selected news topics:', selectedNewsTopics)
    console.log('Selected news topics length:', selectedNewsTopics.length)
    console.log('Is kids mode:', isKidsMode)
    console.log('Labels:', labels)
  }, [selectedNewsTopics, isKidsMode, labels])

  // ニュースデータを取得
  const fetchNews = useCallback(async () => {
    try {
      setIsLoading(true)
      console.log('=== fetchNews called ===')
      console.log('Selected news topics:', selectedNewsTopics)
      console.log('Selected news topics length:', selectedNewsTopics.length)
      
      // 選択されたカテゴリーを取得
      const selectedCategory = selectedNewsTopics[0]
      if (!selectedCategory) {
        console.log('No category selected, showing empty state')
        setNews([])
        return
      }
      
      console.log('Fetching news for category:', selectedCategory)
      const apiUrl = `/api/latest-news?category=${encodeURIComponent(selectedCategory)}`
      console.log('API URL:', apiUrl)
      
      const response = await fetch(apiUrl)
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Raw API response:', data)
        console.log('News count from API:', data.news?.length || 0)
        
        if (data.news && Array.isArray(data.news)) {
          // データベースの形式をNewsArticle型に変換
          const formattedNews = data.news.map((item: any) => ({
            id: item.id,
            title: item.title,
            summary: item.summary,
            url: item.url,
            source: item.source,
            category: item.category,
            publishedAt: item.published_at,
            topics: item.topics || [item.category],
            createdAt: new Date(item.created_at)
          }))
          
          console.log('Formatted news count:', formattedNews.length)
          console.log('Formatted news sample:', formattedNews.slice(0, 2))
          
          // 作成日時で降順にソート（最新のものが上に来る）
          const sortedNews = formattedNews.sort((a: NewsArticle, b: NewsArticle) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          
          console.log('Sorted news count:', sortedNews.length)
          console.log('Top 3 news items:', sortedNews.slice(0, 3))
          
          setNews(sortedNews)
        } else {
          console.warn('No news data in response or invalid format')
          setNews([])
        }
      } else {
        console.error('API response not ok:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('Error response body:', errorText)
        setNews([])
      }
    } catch (error) {
      console.error('Error fetching news:', error)
      setNews([])
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
      console.log('=== fetchNews completed ===')
    }
  }, [selectedNewsTopics])

  // 手動でニュースを再取得
  const handleRefreshNews = async () => {
    setIsRefreshing(true)
    await fetchNews()
  }

  // 新しいニュースをPerplexityから取得
  const handleFetchNewNews = async () => {
    try {
      setIsRefreshing(true)
      console.log('=== Fetching new news from Perplexity ===')
      
      // 選択されたカテゴリーを取得
      const selectedCategory = selectedNewsTopics[0]
      if (!selectedCategory) {
        console.log('No category selected for new news fetch')
        return
      }
      
      console.log('Fetching new news for category:', selectedCategory)
      
      // Perplexityから新しいニュースを取得
      const response = await fetch('/api/fetch-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: selectedCategory
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('New news fetch result:', result)
        
        // 新しいニュースを取得したら、既存のニュースを再取得
        setTimeout(() => {
          fetchNews()
        }, 2000) // 2秒待ってから既存ニュースを再取得
        
        alert(`${selectedCategory}カテゴリの新しいニュースを取得しました！`)
      } else {
        const errorText = await response.text()
        console.error('Failed to fetch new news:', errorText)
        alert('新しいニュースの取得に失敗しました。')
      }
    } catch (error) {
      console.error('Error fetching new news:', error)
      alert('新しいニュースの取得中にエラーが発生しました。')
    } finally {
      setIsRefreshing(false)
    }
  }

  // 初回読み込み時にニュースを取得
  useEffect(() => {
    console.log('=== useEffect for news fetching ===')
    console.log('Selected news topics:', selectedNewsTopics)
    console.log('Selected news topics length:', selectedNewsTopics.length)
    
    // 選択されたカテゴリーがある場合のみニュースを取得
    if (selectedNewsTopics.length > 0) {
      console.log('Selected news topics found, fetching news...')
      // 少し待ってから取得（データベースの更新を確実に反映）
      const timer = setTimeout(() => {
        fetchNews()
      }, 1000)
      
      return () => clearTimeout(timer)
    } else {
      console.log('No news topics selected, fetching default news...')
      // デフォルトのニュースを取得（technologyカテゴリー）
      const fetchDefaultNews = async () => {
        try {
          setIsLoading(true)
          const response = await fetch('/api/latest-news?category=technology')
          if (response.ok) {
            const data = await response.json()
            if (data.news && Array.isArray(data.news)) {
              const formattedNews = data.news.map((item: any) => ({
                id: item.id,
                title: item.title,
                summary: item.summary,
                url: item.url,
                source: item.source,
                category: item.category,
                publishedAt: item.published_at,
                topics: item.topics || [item.category],
                createdAt: new Date(item.created_at)
              }))
              setNews(formattedNews)
            } else {
              setNews([])
            }
          } else {
            setNews([])
          }
        } catch (error) {
          console.error('Error fetching default news:', error)
          setNews([])
        } finally {
          setIsLoading(false)
        }
      }
      
      fetchDefaultNews()
    }

    // 5分ごとにニュースを更新（選択されたカテゴリーがある場合のみ）
    const interval = setInterval(() => {
      if (selectedNewsTopics.length > 0) {
        console.log('Auto-refreshing news...')
        fetchNews()
      }
    }, 5 * 60 * 1000)

    return () => {
      clearInterval(interval)
    }
  }, [selectedNewsTopics, fetchNews])

  // 保存済みニュースのIDを取得
  useEffect(() => {
    fetchSavedNewsIds()
  }, [])

  // ニュースデータが更新されたら保存済みIDも再取得
  useEffect(() => {
    if (news.length > 0) {
      fetchSavedNewsIds()
    }
  }, [news.length])

  // デバッグ用：保存済みIDの状態を監視
  useEffect(() => {
    console.log('Current saved news IDs:', Array.from(savedNewsIds))
  }, [savedNewsIds])

  // ニュースをフィルタリング（検索クエリに基づく）
  const filteredNews = useCallback(() => {
    console.log('=== Filtering news ===')
    console.log('Original news count:', news.length)
    console.log('Selected news topics:', selectedNewsTopics)
    console.log('Search query:', searchQuery)
    
    let filtered = news

    // カテゴリフィルター
    if (selectedNewsTopics.length > 0) {
      const selectedCategory = selectedNewsTopics[0]
      console.log('Filtering by category:', selectedCategory)
      filtered = filtered.filter(item => item.category === selectedCategory)
      console.log('After category filter:', filtered.length)
    }

    // 検索フィルター
    if (searchQuery.trim()) {
      console.log('Filtering by search query:', searchQuery)
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query)
      )
      console.log('After search filter:', filtered.length)
    }

    console.log('Final filtered news count:', filtered.length)
    return filtered
  }, [news, selectedNewsTopics, searchQuery])

  // フィルタリングされたニュースを取得
  const currentFilteredNews = filteredNews()

  // デバッグ用：ニュースデータの状態を監視
  useEffect(() => {
    console.log('Current news count:', news.length)
    console.log('Current filtered news count:', currentFilteredNews.length)
  }, [news, currentFilteredNews])

  const handleNewsSelect = (news: NewsArticle) => {
    setSelectedNews(news)
    setShowLearningOptions(true)
  }

  const handleLearningStart = (action: 'deep-dive' | 'chat' | 'output') => {
    if (!selectedNews) return

    if (action === 'deep-dive') {
      // Deep Reviewページに遷移
      router.push(`/deep-review?newsId=${selectedNews.id}`)
    } else if (action === 'chat') {
      // Discussionページに遷移
      router.push(`/chat/discussion?newsId=${selectedNews.id}`)
    } else if (action === 'output') {
      // Actionページに遷移
      router.push(`/chat/action?newsId=${selectedNews.id}`)
    }
  }

  const handleSaveNews = async (news: NewsArticle) => {
    // 既に保存済みの場合は何もしない
    if (savedNewsIds.has(news.url)) {
      return
    }

    // 保存中の状態を設定
    setSavingNewsIds(prev => new Set([...prev, news.url]))

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
          topics: news.topics || [news.category]
        }),
      })

      if (response.ok) {
        // 保存済みニュースのURLを更新
        setSavedNewsIds(prev => new Set([...prev, news.url]))
        console.log('News saved successfully:', news.title)
        
        // 保存成功のフィードバック（3秒後に自動で消える）
        const successMessage = isKidsMode ? 'とっておいたよ！' : '保存しました！'
        // ここでトースト通知を表示するか、一時的なメッセージを表示
        setTimeout(() => {
          // 保存成功の視覚的フィードバックを消す
        }, 3000)
      } else if (response.status === 409) {
        // 409エラー（重複）の場合は、既に保存済みとして扱う
        setSavedNewsIds(prev => new Set([...prev, news.url]))
        console.log('News already exists, treating as saved:', news.title)
        
        // 既に保存済みのメッセージ
        const alreadySavedMessage = isKidsMode ? 'もう とっておいてあるよ！' : '既に保存済みです'
        // ここでトースト通知を表示するか、一時的なメッセージを表示
      } else {
        const errorText = await response.text()
        console.error('Failed to save news:', errorText)
        // エラーメッセージを表示
        const errorMessage = isKidsMode ? 'とっておきに しっぱいしたよ' : '保存に失敗しました'
      }
    } catch (error) {
      console.error('Error saving news:', error)
      // エラーメッセージを表示
      const errorMessage = isKidsMode ? 'とっておきに しっぱいしたよ' : '保存に失敗しました'
    } finally {
      // 保存中の状態を解除
      setSavingNewsIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(news.url)
        return newSet
      })
    }
  }

  const fetchSavedNewsIds = async () => {
    try {
      const response = await fetch('/api/saved-news')
      if (response.ok) {
        const data = await response.json()
        // URLベースで保存済みニュースを判定
        const savedUrls = new Set<string>(data.savedNews?.map((item: any) => item.url as string) || [])
        setSavedNewsIds(savedUrls)
        console.log('Fetched saved news URLs:', Array.from(savedUrls))
      } else {
        console.error('Failed to fetch saved news IDs:', response.status)
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
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
            onClick={() => router.push('/news-topics')}
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
              {isKidsMode 
                ? "えらんだ カテゴリーの さいきんの ニュースを みて、きにいったものは 保存ボタンで とっておこう！" 
                : "Select the latest news from your chosen category and start learning! Save interesting articles with the bookmark button."
              }
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
            
            <div className="flex gap-2">
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
                onClick={handleFetchNewNews}
                disabled={isRefreshing}
                className="border-green-600 text-green-300 hover:border-green-500 hover:text-green-300"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isKidsMode ? "新しいニュース" : "新しいニュース"}
              </Button>
            </div>
          </div>
        </div>

        {/* News Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-h-[75vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800"
        >
          {/* 選択されたカテゴリーの情報 */}
          {selectedNewsTopics.length > 0 && (
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center gap-3 text-blue-300">
                <Sparkles className="h-5 w-5" />
                <div>
                  <h3 className="font-semibold">
                    {isKidsMode 
                      ? `えらんだ カテゴリー「${labels.categories[selectedNewsTopics[0] as keyof typeof labels.categories] || selectedNewsTopics[0]}」の さいきんの ニュース` 
                      : `選択したカテゴリー「${topicNames[selectedNewsTopics[0]] || selectedNewsTopics[0]}」の最新ニュース`
                    }
                  </h3>
                  <p className="text-sm text-blue-200">
                    {isLoading 
                      ? (isKidsMode ? "ニュースを よみこみちゅう..." : "ニュースを読み込み中...")
                      : searchQuery.trim()
                        ? (isKidsMode 
                            ? `「${searchQuery}」で さがした けっか：${currentFilteredNews.length}件の ニュース` 
                            : `「${searchQuery}」で検索した結果：${currentFilteredNews.length}件のニュース`
                          )
                        : (isKidsMode 
                            ? `${currentFilteredNews.length}件の さいきんの ニュースが あるよ（きにいったものは 保存ボタンで とっておこう）` 
                            : `${currentFilteredNews.length}件の最新ニュースがあります（気に入ったものは保存ボタンで保存できます）`
                          )
                    }
                  </p>
                  {!isLoading && currentFilteredNews.length === 0 && (
                    <p className="text-sm text-yellow-200 mt-1">
                      {searchQuery.trim()
                        ? (isKidsMode 
                            ? `「${searchQuery}」に あう ニュースが ないよ。ちがう ことばで さがしてみてね！` 
                            : `「${searchQuery}」に一致するニュースがありません。別のキーワードで検索してみてください。`
                          )
                        : (isKidsMode 
                            ? "この カテゴリーには まだ さいきんの ニュースが ないよ。しばらく まってから もう一度 ためしてみてね！" 
                            : "このカテゴリーにはまだ最新ニュースがありません。しばらく待ってからもう一度お試しください。"
                          )
                      }
                    </p>
                  )}
                </div>
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
            ) : currentFilteredNews.length > 0 ? (
              currentFilteredNews.map((newsItem, index) => (
                <motion.div
                  key={newsItem.id}
                  variants={itemVariants}
                  whileHover="hover"
                  initial="rest"
                  animate="rest"
                >
                  <Card
                    className={`bg-slate-800/50 border-slate-600 hover:border-blue-500 transition-all duration-300 cursor-pointer group h-full flex flex-col hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 ${
                      savedNewsIds.has(newsItem.url) ? 'ring-2 ring-green-500/30 shadow-lg shadow-green-500/20' : ''
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
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">
                              {newsItem.source}
                            </span>
                          </div>
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
                                e.preventDefault()
                                e.stopPropagation()
                                handleSaveNews(newsItem)
                              }}
                              onMouseDown={(e) => e.stopPropagation()}
                              disabled={savingNewsIds.has(newsItem.url)}
                              className={`p-1 h-8 w-8 transition-all duration-200 hover:scale-110 ${
                                savedNewsIds.has(newsItem.url)
                                  ? 'text-green-400 hover:text-green-300'
                                  : savingNewsIds.has(newsItem.url)
                                  ? 'text-blue-400'
                                  : 'text-slate-400 hover:text-yellow-400'
                              }`}
                              title={
                                savedNewsIds.has(newsItem.url)
                                  ? (isKidsMode ? 'とっておき済み' : '保存済み')
                                  : savingNewsIds.has(newsItem.url)
                                  ? (isKidsMode ? 'とっておき中...' : '保存中...')
                                  : (isKidsMode ? 'とっておきする' : '保存する')
                              }
                            >
                              {savingNewsIds.has(newsItem.url) ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                              ) : (
                                <Bookmark className={`h-4 w-4 ${savedNewsIds.has(newsItem.url) ? 'fill-current' : ''}`} />
                              )}
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
                  {selectedNewsTopics.length === 0 
                    ? (isKidsMode 
                        ? "カテゴリーが えらばれていないよ。ニューストピックで カテゴリーを えらんでね！" 
                        : "カテゴリーが選択されていません。ニューストピックでカテゴリーを選択してください"
                      )
                    : searchQuery.trim()
                      ? (isKidsMode 
                          ? `「${searchQuery}」に あう ニュースが ないよ。ちがう ことばで さがしてみてね！` 
                          : `「${searchQuery}」に一致するニュースがありません。別のキーワードで検索してみてください。`
                        )
                      : (isKidsMode 
                          ? "この カテゴリーには まだ さいきんの ニュースが ないよ。しばらく まってから もう一度 ためしてみてね！" 
                          : "このカテゴリーにはまだ最新ニュースがありません。しばらく待ってからもう一度お試しください。"
                        )
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
              className="bg-slate-800 border border-slate-600 rounded-xl shadow-xl p-6 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {isKidsMode ? "べんきょうの しかたを えらぼう" : "学習方法を選択"}
                </h3>
                <p className="text-sm text-slate-400">
                  {isKidsMode ? "ニュースを えらんで べんきょうしよう" : "ニュースを選んで学習を始めましょう"}
                </p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => handleLearningStart('deep-dive')}
                  className="w-full p-4 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 transition-opacity text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-lg mb-1">
                        Deep Review
                      </h4>
                      <p className="text-white/90 text-sm">
                        ニュースの要約と関連情報を収集して多面的に深く理解
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleLearningStart('chat')}
                  className="w-full p-4 rounded-lg bg-gradient-to-r from-blue-500 to-green-500 hover:opacity-90 transition-opacity text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-lg mb-1">
                        Discussion
                      </h4>
                      <p className="text-white/90 text-sm">
                        Deepen learning with AI and cultivate reflection skills to build intelligence through changing world information
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleLearningStart('output')}
                  className="w-full p-4 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 transition-opacity text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-lg mb-1">
                        Action
                      </h4>
                      <p className="text-white/90 text-sm">
                        自分にできるアクションや提案をまとめる
                      </p>
                    </div>
                  </div>
                </button>
              </div>
              
              <Button
                variant="ghost"
                onClick={() => setShowLearningOptions(false)}
                className="w-full mt-4 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
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