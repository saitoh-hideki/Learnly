'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, Trash2, Download, MessageSquare, BookOpen, FileText, Calendar, Tag, ExternalLink, Sparkles, Check, Zap } from 'lucide-react'
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
  const [mounted, setMounted] = useState(false)
  const [savedNews, setSavedNews] = useState<SavedNews[]>([])
  const [filteredNews, setFilteredNews] = useState<SavedNews[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [particles, setParticles] = useState<Array<{
    id: number;
    left: string;
    top: string;
    animationDelay: string;
    animationDuration: string;
  }>>([])

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

  useEffect(() => {
    setMounted(true)
    fetchSavedNews()
    
    // パーティクルを生成
    const generatedParticles = [...Array(15)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 2}s`,
      animationDuration: `${2 + Math.random() * 3}s`
    }))
    setParticles(generatedParticles)
  }, [])

  // 検索機能（カテゴリーフィルター + キーワード検索）
  useEffect(() => {
    let filtered = savedNews

    // カテゴリーフィルター
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(news => news.category === selectedCategory)
    }

    // キーワード検索
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(news => 
        news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        news.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        news.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (news.topics && news.topics.some(topic => 
          topic.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      )
    }

    setFilteredNews(filtered)
  }, [searchQuery, selectedCategory, savedNews])

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

  const downloadNewsAsPDF = (news: SavedNews) => {
    const content = `
保存されたニュース記事
====================

タイトル: ${news.title}
日付: ${new Date(news.published_at).toLocaleDateString('ja-JP')}
ソース: ${news.source || '不明'}
URL: ${news.url || '不明'}

要約:
${news.summary}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `news_${news.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleRemoveNews = (newsId: string) => {
    if (confirm('このニュース記事を削除しますか？')) {
      // TODO: Implement remove functionality
      console.log('Remove news:', newsId)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0e1a2a] relative overflow-hidden">
      {/* Enhanced Background with Aurora Effect */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 背景グラデーション */}
        <div className="absolute inset-0 bg-gradient-radial from-[#0e1a2a] via-[#1a1f27] to-[#0e1a2a]"></div>
        
        {/* 微細な光の演出 */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/3 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-t from-cyan-500/2 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-br from-slate-300/1 to-cyan-300/1 rounded-full blur-3xl"></div>
        <div className="absolute top-2/3 right-1/3 w-48 h-48 bg-gradient-to-bl from-white/1 to-slate-300/1 rounded-full blur-2xl"></div>
        
        {/* Floating Particles */}
        {mounted && (
          <div className="absolute inset-0">
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute w-1 h-1 bg-white/8 rounded-full animate-pulse blur-sm"
                style={{
                  left: particle.left,
                  top: particle.top,
                  animationDelay: particle.animationDelay,
                  animationDuration: particle.animationDuration
                }}
              />
            ))}
          </div>
        )}
      </div>

      <motion.div 
        className="relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div 
            className="flex items-center justify-between mb-8 bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-700/30"
            variants={itemVariants}
          >
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/news-dashboard')}
                className="hover:bg-slate-700/50 rounded-xl text-slate-300 hover:text-white transition-all"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-100">
                  保存済みニュース
                </h1>
                <p className="text-slate-400">保存したニュース記事の管理</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="text-lg px-3 py-1 bg-gradient-to-r from-sky-500/20 to-cyan-400/20 text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-cyan-300 border-sky-500/30">
                <FileText className="h-4 w-4 mr-2" />
                {filteredNews.length} 件
              </Badge>
              {selectedCategory !== 'all' && (
                <Badge className="text-sm px-2 py-1 border-sky-600 text-sky-400 bg-sky-500/10">
                  {categories.find(c => c.id === selectedCategory)?.icon} {categories.find(c => c.id === selectedCategory)?.name}
                </Badge>
              )}
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div className="mb-8" variants={itemVariants}>
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                placeholder="タイトル・要約・出典・トピックで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 border-slate-600 bg-slate-800/30 text-slate-300 focus:border-sky-500 focus:ring-sky-500 rounded-xl shadow-sm backdrop-blur-sm"
              />
            </div>
          </motion.div>

          {/* Category Filter */}
          <motion.div className="mb-8" variants={itemVariants}>
            <h3 className="text-lg font-semibold text-white mb-4">カテゴリーで絞り込み</h3>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`${
                    selectedCategory === category.id
                      ? "bg-gradient-to-r from-sky-400 to-cyan-300 text-black shadow-lg"
                      : "border-slate-600 text-slate-300 hover:border-sky-400 hover:text-sky-400 hover:bg-sky-500/10"
                  } rounded-xl px-4 py-2 transition-all duration-200`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* News Grid */}
          {filteredNews.length === 0 ? (
            <motion.div variants={itemVariants}>
              <Card className="text-center py-12 bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 shadow-lg rounded-2xl">
                <CardContent>
                  <div className="p-4 bg-gradient-to-br from-sky-500/10 to-cyan-500/10 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <FileText className="h-10 w-10 text-sky-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">まだニュースが保存されていません</h3>
                  <p className="text-slate-400 mb-6">ニュースダッシュボードで記事を保存しましょう</p>
                  <Button
                    className="bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-sky-500 hover:to-cyan-400 text-black rounded-xl shadow-md hover:scale-[1.03] transition-all"
                    onClick={() => router.push('/news-dashboard')}
                  >
                    ニュースを見る
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
            >
              {filteredNews.map((news: SavedNews) => (
                <motion.div
                  key={news.id}
                  variants={cardHoverVariants}
                  initial="rest"
                  whileHover="hover"
                  className="group"
                >
                  <Card className="h-full bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-2xl shadow-lg transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg line-clamp-2 text-white group-hover:text-sky-100 transition-colors">
                          {news.title}
                        </CardTitle>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              downloadNewsAsPDF(news)
                            }}
                            className="text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveNews(news.id)
                            }}
                            className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="flex items-center gap-2 text-sm text-slate-400">
                        <Calendar className="h-3 w-3" />
                        <span>公開: {new Date(news.published_at).toLocaleDateString('ja-JP')}</span>
                        <span>•</span>
                        <span>保存: {new Date(news.created_at).toLocaleDateString('ja-JP')}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-400 line-clamp-3 mb-3">
                        {news.summary}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-2">
                        {news.category && (
                          <Badge className="text-xs border-sky-600 text-sky-400 bg-sky-500/10">
                            <span className="mr-1">
                              {categories.find(c => c.id === news.category)?.icon || '📋'}
                            </span>
                            {categories.find(c => c.id === news.category)?.name || news.category}
                          </Badge>
                        )}
                        
                        {news.topics && news.topics.length > 0 && news.topics.map((topic, index) => (
                          <Badge key={index} className="text-xs border-cyan-600 text-cyan-400 bg-cyan-500/10">
                            <Tag className="h-3 w-3 mr-1" />
                            {topic}
                          </Badge>
                        ))}
                        
                        {news.source && (
                          <Badge className="text-xs border-slate-600 text-slate-400 bg-slate-500/10">
                            <Tag className="h-3 w-3 mr-1" />
                            {news.source}
                          </Badge>
                        )}
                      </div>

                      {news.url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(news.url, '_blank')}
                          className="text-xs text-sky-400 hover:text-sky-300 p-0 h-auto transition-colors"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          元記事を読む
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
} 