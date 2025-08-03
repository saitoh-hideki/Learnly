'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, Trash2, Download, MessageSquare, BookOpen, FileText, Calendar, Tag, ExternalLink, Sparkles, Check, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/ui/header'
import { useStore } from '@/store/useStore'
import { useLabels } from '@/lib/kidsLabels'
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

export default function NewsStockPage() {
  const router = useRouter()
  const { isKidsMode } = useStore()
  const labels = useLabels(isKidsMode)
  const [mounted, setMounted] = useState(false)
  const [savedNews, setSavedNews] = useState<SavedNews[]>([])
  const [filteredNews, setFilteredNews] = useState<SavedNews[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedNews, setSelectedNews] = useState<SavedNews | null>(null)
  const [showLearningOptions, setShowLearningOptions] = useState(false)

  // カテゴリーの定義（ダッシュボードと合わせる）
  const categories = [
    { id: 'all', name: 'すべて', icon: '📋' },
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

  useEffect(() => {
    setMounted(true)
    fetchSavedNews()
  }, [])

  // 検索とフィルタリング
  useEffect(() => {
    let filtered = savedNews

    // カテゴリフィルター
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(news => news.category === selectedCategory)
    }

    // 検索フィルター
    if (searchQuery) {
      filtered = filtered.filter(news =>
        news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        news.summary.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredNews(filtered)
  }, [savedNews, selectedCategory, searchQuery])

  const fetchSavedNews = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/saved-news')
      if (response.ok) {
        const data = await response.json()
        setSavedNews(data.savedNews || [])
      }
    } catch (error) {
      console.error('Error fetching saved news:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadNewsAsPDF = (news: SavedNews) => {
    // PDFダウンロード機能の実装（将来的に実装予定）
    console.log('Downloading news as PDF:', news.title)
  }

  const handleRemoveNews = async (newsId: string) => {
    try {
      const response = await fetch(`/api/saved-news/${newsId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSavedNews(prev => prev.filter(news => news.id !== newsId))
      }
    } catch (error) {
      console.error('Error removing news:', error)
    }
  }

  const handleNewsSelect = (news: SavedNews) => {
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

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0e1a2a] relative overflow-hidden">
      <Header title={labels.newsStock} />
      
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
              {labels.newsStock}
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {labels.newsStockSubtitle}
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
              onClick={() => setShowFilters(!showFilters)}
              className="border-slate-600 text-slate-300 hover:border-blue-500 hover:text-blue-300"
            >
              <Tag className="h-4 w-4 mr-2" />
              {isKidsMode ? "フィルター" : "フィルター"}
            </Button>
            
            {filteredNews.length > 0 && (
              <Button
                variant="outline"
                onClick={async () => {
                  if (confirm(isKidsMode ? 'すべての 保存した ニュースを けしますか？' : 'すべての保存したニュースを削除しますか？')) {
                    try {
                      console.log('Attempting to clear all saved news...')
                      const response = await fetch('/api/saved-news?clearAll=true', {
                        method: 'DELETE'
                      })
                      
                      if (response.ok) {
                        const result = await response.json()
                        console.log('Clear result:', result)
                        
                        // ニュースリストを再取得
                        await fetchSavedNews()
                        
                        // 成功メッセージを表示
                        alert(isKidsMode ? 'すべて けしたよ！' : 'すべて削除しました！')
                      } else {
                        console.error('Failed to clear saved news:', response.status)
                        alert(isKidsMode ? 'けすのに しっぱいしたよ' : '削除に失敗しました')
                      }
                    } catch (error) {
                      console.error('Error clearing saved news:', error)
                      alert(isKidsMode ? 'けすのに しっぱいしたよ' : '削除に失敗しました')
                    }
                  }
                }}
                className="border-red-500/30 text-red-300 hover:border-red-500 hover:text-red-200"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isKidsMode ? "すべて けす" : "すべて削除"}
              </Button>
            )}
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
            filteredNews.map((news, index) => (
              <motion.div
                key={news.id}
                variants={itemVariants}
                whileHover="hover"
                initial="rest"
                animate="rest"
                className="relative"
              >
                <Card
                  className="bg-slate-800/50 border-slate-600 hover:border-blue-500 transition-all duration-300 cursor-pointer group h-full flex flex-col hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
                  onClick={() => handleNewsSelect(news)}
                >
                  <CardHeader className="pb-3 flex-1">
                    <div className="flex items-start justify-between h-full">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg line-clamp-2 group-hover:text-blue-300 transition-colors mb-2 group-hover:scale-105">
                          {news.title}
                        </CardTitle>
                        <CardDescription className="text-slate-400 line-clamp-3 flex-1">
                          {news.summary}
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
                            className={`${getCategoryColor(news.category)}`}
                          >
                            {isKidsMode 
                              ? labels.categories[news.category as keyof typeof labels.categories] || news.category
                              : topicNames[news.category] || news.category
                            }
                          </Badge>
                          
                          {/* Topicsタグ（メインカテゴリーと異なる場合のみ表示） */}
                          {news.topics && news.topics.length > 0 && 
                           news.topics.filter(topic => topic !== news.category).map((topic, index) => (
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
                          {news.source}
                        </span>
                      </div>

                      {/* Date and Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Calendar className="h-3 w-3" />
                          {formatDate(news.published_at)}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setSelectedNews(news)
                              setShowLearningOptions(true)
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="p-1 h-8 w-8 text-slate-400 hover:text-blue-400 transition-all duration-200 hover:scale-110"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              window.open(news.url, '_blank')
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="p-1 h-8 w-8 text-slate-400 hover:text-blue-400 transition-all duration-200 hover:scale-110"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleRemoveNews(news.id)
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="p-1 h-8 w-8 text-slate-400 hover:text-red-400 transition-all duration-200 hover:scale-110"
                          >
                            <Trash2 className="h-4 w-4" />
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
                <Sparkles className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-400 text-lg mb-4">
                {isKidsMode ? "まだ ニュースが とっておかれていないよ" : "まだニュースが保存されていません"}
              </p>
              <p className="text-slate-500 text-sm mb-6">
                {isKidsMode ? "ニュースダッシュボードで きじを とっておこう" : "ニュースダッシュボードで記事を保存しましょう"}
              </p>
              <Button
                onClick={() => router.push('/news-dashboard')}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isKidsMode ? "ニュースダッシュボードへ" : "ニュースダッシュボードへ"}
              </Button>
            </div>
          )}
          </div>
        </motion.div>

        {/* Learning Options Modal */}
        {showLearningOptions && selectedNews && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-800/95 border border-slate-600/50 rounded-xl shadow-2xl p-6 max-w-md w-full backdrop-blur-sm"
            >
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {isKidsMode ? "べんきょうの しかたを えらぼう" : "学習方法を選択"}
                </h3>
                <p className="text-sm text-slate-400 mt-2">
                  {isKidsMode ? "あなたに ぴったりの 学習方法を えらんでね" : "Choose the learning method that suits you best"}
                </p>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => handleLearningStart('deep-dive')}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium px-4 py-3 rounded-lg hover:scale-[1.02] transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 border border-blue-400/20"
                >
                  <BookOpen className="h-5 w-5 mr-3" />
                  {isKidsMode ? "Deep Review" : "Deep Review"}
                </Button>
                
                <Button
                  onClick={() => handleLearningStart('chat')}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium px-4 py-3 rounded-lg hover:scale-[1.02] transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25 border border-purple-400/20"
                >
                  <MessageSquare className="h-5 w-5 mr-3" />
                  {isKidsMode ? "Discussion" : "Discussion"}
                </Button>
                
                <Button
                  onClick={() => handleLearningStart('output')}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium px-4 py-3 rounded-lg hover:scale-[1.02] transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25 border border-emerald-400/20"
                >
                  <FileText className="h-5 w-5 mr-3" />
                  {isKidsMode ? "Action" : "Action"}
                </Button>
              </div>
              
              <Button
                variant="ghost"
                onClick={() => setShowLearningOptions(false)}
                className="w-full mt-6 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
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