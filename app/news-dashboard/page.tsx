'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, Filter, Calendar, ExternalLink, MessageSquare, BookOpen, FileText, RefreshCw, Settings, Bookmark, Eye, EyeOff, ChevronDown, ChevronUp, Sparkles, Archive, Zap, Target, TrendingUp, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useStore, NewsArticle } from '@/store/useStore'
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

// ダミーのニュースデータ
const dummyNews = [
  {
    id: 1,
    title: 'AI技術の最新動向：生成AIが教育分野に革新をもたらす',
    summary: 'OpenAIが発表した新しい教育向けAIツールが、個別指導の質を大幅に向上させる可能性を示唆。',
    source: 'TechCrunch',
    category: 'technology',
    publishedAt: '2024-01-15',
    url: '#'
  },
  {
    id: 2,
    title: 'サステナブルな都市計画：グリーンインフラの新潮流',
    summary: '世界の主要都市で進む環境配慮型の都市開発プロジェクトとその経済効果について。',
    source: 'Bloomberg',
    category: 'environment',
    publishedAt: '2024-01-15',
    url: '#'
  },
  {
    id: 3,
    title: 'リモートワーク時代の新しいチームマネジメント手法',
    summary: 'ハイブリッドワーク環境での生産性向上とチームエンゲージメント維持のための最新手法。',
    source: 'Harvard Business Review',
    category: 'business',
    publishedAt: '2024-01-15',
    url: '#'
  }
]

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
  const { selectedNewsTopics, newsArticles, addNewsArticles, newsSettings, setSelectedNewsTopics } = useStore()
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null)
  const [isLoadingNews, setIsLoadingNews] = useState(false)
  const [newsByCategory, setNewsByCategory] = useState<{ [key: string]: NewsArticle[] }>({})
  const [savedNewsIds, setSavedNewsIds] = useState<Set<string>>(new Set())
  const [isSaving, setIsSaving] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [particles, setParticles] = useState<Array<{
    id: number;
    left: string;
    top: string;
    animationDelay: string;
    animationDuration: string;
  }>>([])

  useEffect(() => {
    setMounted(true)
    // クライアントサイドでのみパーティクルを生成
    const generatedParticles = [...Array(20)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 2}s`,
      animationDuration: `${2 + Math.random() * 3}s`
    }))
    setParticles(generatedParticles)
  }, [])

  const handleNewsSelect = (news: NewsArticle) => {
    setSelectedNews(news)
  }

  const handleLearningStart = (action: 'deep-dive' | 'chat' | 'output') => {
    if (!selectedNews) return
    
    // 一時的にダッシュボードにリダイレクト（後で専用ページを作成予定）
    router.push('/dashboard')
  }

  // ニュースを保存
  const handleSaveNews = async (news: NewsArticle) => {
    try {
      setIsSaving(true)
      console.log('Saving news:', news)

      const response = await fetch('/api/saved-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: news.title,
          summary: news.summary,
          url: news.url,
          source: news.source,
          category: news.category,
          publishedAt: news.publishedAt,
          topics: news.topics
        })
      })

      console.log('Save response status:', response.status)
      console.log('Save response ok:', response.ok)

      if (response.ok) {
        const result = await response.json()
        console.log('Save success:', result)
        setSavedNewsIds(prev => new Set([...prev, news.id]))
        // 保存成功後、自動的にストックページに遷移
        router.push('/news-stock')
      } else if (response.status === 409) {
        alert('このニュースは既に保存されています')
      } else {
        const errorText = await response.text()
        console.error('Save error response:', errorText)
        alert('ニュースの保存に失敗しました')
      }
    } catch (error) {
      console.error('Error saving news:', error)
      alert('ニュースの保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  // 保存済みニュースIDを取得
  const fetchSavedNewsIds = async () => {
    try {
      // プロトタイプ用にAPI呼び出しをスキップ
      console.log('Skipping saved news IDs fetch for prototype')
      setSavedNewsIds(new Set())
    } catch (error) {
      console.error('Error fetching saved news IDs:', error)
      setSavedNewsIds(new Set())
    }
  }

  const handleRefreshNews = useCallback(async () => {
    console.log('handleRefreshNews called')
    console.log('selectedNewsTopics:', selectedNewsTopics)
    
    setIsLoadingNews(true)
    try {
      // 各選択されたカテゴリーからニュースを取得
      const newsByCategoryTemp: { [key: string]: NewsArticle[] } = {}
      
      for (const topic of selectedNewsTopics) {
        console.log('Fetching news for topic:', topic)

        try {
          const { data, error } = await supabase.functions.invoke('fetch-news', {
            body: {
              topics: [topic]
            }
          })

          console.log('API response for topic', topic, ':', { data, error })

          if (error) {
            console.error('Supabase function error for topic', topic, ':', error)
            // エラーの場合はダミーデータを使用
            const dummyArticles = [
              {
                title: `${topic}に関する最新ニュース`,
                description: `${topic}分野での最新の動向について詳しく解説します。`,
                url: `https://example.com/news/${topic}`,
                source: 'Example News',
                category: topic,
                publishedAt: new Date().toISOString(),
                topics: [topic]
              }
            ]
            
            const processedArticles: NewsArticle[] = dummyArticles.map((article: any, index: number) => {
              return {
                id: `temp-${Date.now()}-${topic}-${index}`,
                title: article.title,
                summary: article.description || article.summary,
                url: article.url,
                source: article.source,
                category: article.category,
                publishedAt: article.publishedAt || new Date().toISOString(),
                topics: article.topics || [topic],
                createdAt: new Date()
              };
            })
            
            newsByCategoryTemp[topic] = processedArticles.slice(0, 1)
            continue
          }

          if (data && data.articles) {
            const processedArticles: NewsArticle[] = data.articles.map((article: any, index: number) => {
              // カテゴリーを決定
              let articleCategory = article.category;
              if (!articleCategory && article.topics && article.topics.length > 0) {
                articleCategory = article.topics[0];
              }
              
              // 有効なカテゴリーかチェック
              const validCategories = categories.map(c => c.id).filter(id => id !== 'all');
              if (!articleCategory || !validCategories.includes(articleCategory)) {
                if (article.topics && article.topics.length > 0) {
                  const validTopic = article.topics.find((t: string) => validCategories.includes(t));
                  if (validTopic) {
                    articleCategory = validTopic;
                  } else {
                    articleCategory = topic; // 選択されたトピックを使用
                  }
                } else {
                  articleCategory = topic; // 選択されたトピックを使用
                }
              }
              
              return {
                id: `temp-${Date.now()}-${topic}-${index}`,
                title: article.title,
                summary: article.description || article.summary,
                url: article.url,
                source: article.source,
                category: articleCategory,
                publishedAt: article.publishedAt || new Date().toISOString(),
                topics: article.topics || [topic],
                createdAt: new Date()
              };
            })
            
            // 各カテゴリーから最大1件のニュースを表示
            newsByCategoryTemp[topic] = processedArticles.slice(0, 1)
          } else {
            // データがない場合はダミーデータを使用
            const dummyArticles = [
              {
                title: `${topic}に関する最新ニュース`,
                description: `${topic}分野での最新の動向について詳しく解説します。`,
                url: `https://example.com/news/${topic}`,
                source: 'Example News',
                category: topic,
                publishedAt: new Date().toISOString(),
                topics: [topic]
              }
            ]
            
            const processedArticles: NewsArticle[] = dummyArticles.map((article: any, index: number) => {
              return {
                id: `temp-${Date.now()}-${topic}-${index}`,
                title: article.title,
                summary: article.description || article.summary,
                url: article.url,
                source: article.source,
                category: article.category,
                publishedAt: article.publishedAt || new Date().toISOString(),
                topics: article.topics || [topic],
                createdAt: new Date()
              };
            })
            
            newsByCategoryTemp[topic] = processedArticles.slice(0, 1)
          }
        } catch (error) {
          console.error('Error fetching news for topic', topic, ':', error)
          // エラーの場合はダミーデータを使用
          const dummyArticles = [
            {
              title: `${topic}に関する最新ニュース`,
              description: `${topic}分野での最新の動向について詳しく解説します。`,
              url: `https://example.com/news/${topic}`,
              source: 'Example News',
              category: topic,
              publishedAt: new Date().toISOString(),
              topics: [topic]
            }
          ]
          
          const processedArticles: NewsArticle[] = dummyArticles.map((article: any, index: number) => {
            return {
              id: `temp-${Date.now()}-${topic}-${index}`,
              title: article.title,
              summary: article.description || article.summary,
              url: article.url,
              source: article.source,
              category: article.category,
              publishedAt: article.publishedAt || new Date().toISOString(),
              topics: article.topics || [topic],
              createdAt: new Date()
            };
          })
          
          newsByCategoryTemp[topic] = processedArticles.slice(0, 1)
        }
      }
      
      setNewsByCategory(newsByCategoryTemp)
      console.log('Set news by category:', newsByCategoryTemp)
      
    } catch (error) {
      console.error('Failed to fetch news:', error)
    } finally {
      setIsLoadingNews(false)
    }
  }, [selectedNewsTopics])

  // テーマが選択されていない場合は、デフォルトのトピックを設定
  useEffect(() => {
    if (selectedNewsTopics.length === 0) {
      // プロトタイプ用にデフォルトのトピックを設定
      console.log('Setting default topics for prototype')
      setSelectedNewsTopics(['business', 'technology', 'science'])
    }
  }, [selectedNewsTopics, setSelectedNewsTopics])

  // 保存済みニュースIDを取得
  useEffect(() => {
    fetchSavedNewsIds()
  }, [])

  // 初回読み込み時のニュース取得
  useEffect(() => {
    console.log('Initial load - selectedNewsTopics:', selectedNewsTopics)
    
    // テーマが選択されていて、ニュースが空の場合のみ実行
    if (selectedNewsTopics.length > 0 && Object.keys(newsByCategory).length === 0) {
      console.log('Initial news fetch triggered')
      handleRefreshNews()
    }
  }, [selectedNewsTopics, handleRefreshNews])

  // カテゴリーに基づいて色を決定する関数
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'business':
        return 'bg-sky-500/20 text-sky-300 border-sky-400/30';
      case 'technology':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30';
      case 'economics':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
      case 'science':
        return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      case 'education':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30';
      case 'health':
        return 'bg-rose-500/20 text-rose-300 border-rose-400/30';
      case 'environment':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'society':
        return 'bg-orange-500/20 text-orange-300 border-orange-400/30';
      case 'lifestyle':
        return 'bg-pink-500/20 text-pink-300 border-pink-400/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-400/30';
    }
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
        
        {/* Floating Particles - クライアントサイドでのみレンダリング */}
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
            className="mb-12"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  onClick={() => router.push('/dashboard')}
                  className="text-slate-400 hover:text-cyan-300 p-2 hover:bg-slate-800/30 rounded-xl backdrop-blur-sm"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <motion.div 
                  className="flex items-center gap-3"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <div className="p-2 bg-gradient-to-br from-sky-500 to-cyan-400 rounded-xl shadow-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-100">
                    ニュースで学ぶ
                  </h1>
                </motion.div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-slate-400 bg-slate-800/30 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm border border-slate-700/30">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  <span>{new Date().toLocaleDateString('ja-JP')}</span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push('/news-settings')}
                  className="border-slate-600/50 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-200 backdrop-blur-sm bg-white/5"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  設定
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/news-stock')}
                  className="border-slate-600/50 hover:border-sky-400/50 text-slate-300 hover:text-sky-200 backdrop-blur-sm bg-white/5"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  ニュースストック
                </Button>
              </div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Card className="bg-gradient-to-r from-sky-500/10 to-cyan-400/10 border border-slate-700/30 shadow-xl rounded-3xl p-8 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">今日の学びの提案</h2>
                  <Badge className="bg-gradient-to-r from-sky-500/20 to-cyan-400/20 text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-cyan-300 border-sky-500/30 px-4 py-1 rounded-full shadow-sm backdrop-blur-sm">
                    AI提案
                  </Badge>
                </div>
                <p className="text-slate-300 leading-relaxed text-lg">
                  選択されたテーマ「{selectedNewsTopics.map(topic => {
                    return topicNames[topic] || topic
                  }).join('、')}」に関する最新ニュースをおすすめします。
                  これらの分野の最新動向について深く掘り下げて学び、実践的な洞察を得ましょう。
                </p>
              </Card>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - News Cards by Category */}
            <div className="lg:col-span-2">
              <motion.div 
                className="mb-8"
                variants={itemVariants}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-semibold text-white">今日のニュース</h3>
                    <Badge 
                      variant="secondary" 
                      className="text-sm px-4 py-2 rounded-full font-semibold border-2 bg-sky-500/20 text-sky-300 border-sky-400/30 backdrop-blur-sm"
                    >
                      {selectedNewsTopics.length}つのカテゴリー
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleRefreshNews()}
                    disabled={isLoadingNews}
                    className="border-slate-600/50 hover:border-cyan-400/50 hover:bg-cyan-500/10 rounded-xl text-slate-300 hover:text-cyan-200 backdrop-blur-sm bg-white/5"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingNews ? 'animate-spin' : ''}`} />
                    {isLoadingNews ? '取得中...' : 'ニュースを再取得'}
                  </Button>
                </div>
              </motion.div>

              <div className="space-y-8 max-h-[80vh] overflow-y-auto pr-2">
                {Object.keys(newsByCategory).length === 0 ? (
                  <motion.div
                    variants={itemVariants}
                  >
                    <Card className="bg-slate-800/30 border border-slate-700/30 shadow-xl rounded-2xl backdrop-blur-sm">
                      <CardContent className="py-12 text-center">
                        <BookOpen className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-300 mb-2">ニュースがありません</h3>
                        <p className="text-slate-400 mb-6">
                          ニュースを取得して学習を始めましょう
                        </p>
                        <Button
                          onClick={() => handleRefreshNews()}
                          disabled={isLoadingNews}
                          className="bg-gradient-to-r from-sky-400 to-cyan-300 text-black hover:from-sky-500 hover:to-cyan-400"
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingNews ? 'animate-spin' : ''}`} />
                          {isLoadingNews ? '取得中...' : 'ニュースを取得'}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  // 各カテゴリーごとにセクションを作成
                  selectedNewsTopics.map((topic, index) => {
                    const categoryNews = newsByCategory[topic] || []
                    const categoryName = topicNames[topic] || topic
                    const categoryIcon = categories.find(c => c.id === topic)?.icon || '📰'
                    
                    return (
                      <motion.div 
                        key={topic} 
                        className="space-y-4"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.1 }}
                      >
                        {/* カテゴリーヘッダー */}
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant="secondary" 
                            className={`text-lg px-4 py-2 rounded-full font-semibold border-2 ${getCategoryColor(topic)} backdrop-blur-sm`}
                          >
                            {categoryIcon} {categoryName}
                          </Badge>
                          <div className="flex-1 h-px bg-slate-700/50"></div>
                        </div>
                        
                        {/* そのカテゴリーのニュース */}
                        {categoryNews.length === 0 ? (
                          <Card className="bg-slate-800/30 border border-slate-700/30 shadow-xl rounded-2xl backdrop-blur-sm">
                            <CardContent className="py-8 text-center">
                              <p className="text-slate-400">
                                {categoryName}のニュースを取得中...
                              </p>
                            </CardContent>
                          </Card>
                        ) : (
                          categoryNews.map((news) => (
                            <motion.div
                              key={news.id}
                              variants={cardHoverVariants}
                              initial="rest"
                              whileHover="hover"
                            >
                              <Card
                                className={`cursor-pointer transition-all duration-300 border-2 ${
                                  selectedNews?.id === news.id 
                                    ? 'border-cyan-400 bg-gradient-to-r from-cyan-500/10 to-sky-500/10 shadow-xl' 
                                    : 'border-slate-700/30 hover:border-cyan-400/50 bg-slate-800/30 hover:shadow-lg'
                                } rounded-2xl backdrop-blur-sm`}
                                onClick={() => handleNewsSelect(news)}
                              >
                                <CardHeader>
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-3">
                                        {/* 日付 */}
                                        <span className="text-xs text-slate-500">
                                          {new Date(news.publishedAt).toLocaleDateString('ja-JP')}
                                        </span>
                                        {/* ソース */}
                                        <span className="text-xs text-slate-400 font-medium">{news.source}</span>
                                      </div>
                                      <CardTitle className="text-xl leading-tight mb-3 font-semibold text-white">
                                        {news.title}
                                      </CardTitle>
                                      <CardDescription className="text-base leading-relaxed text-slate-400">
                                        {news.summary}
                                      </CardDescription>
                                      
                                      {/* Topics - メインカテゴリー以外のトピックのみ表示 */}
                                      {(() => {
                                        const otherTopics = news.topics?.filter(t => 
                                          t !== topic && 
                                          t !== 'all' && 
                                          categories.map(c => c.id).filter(id => id !== 'all').includes(t)
                                        ) || [];
                                        
                                        if (otherTopics.length > 0) {
                                          return (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                              <span className="text-xs text-slate-500 mr-1">関連トピック:</span>
                                              {otherTopics.map((topicName) => (
                                                <Badge
                                                  key={topicName}
                                                  variant="outline"
                                                  className="text-xs bg-sky-500/10 border-sky-500/30 text-sky-400 px-2 py-1 rounded-full"
                                                >
                                                  {topicNames[topicName] || topicName}
                                                </Badge>
                                              ))}
                                            </div>
                                          );
                                        }
                                        return null;
                                      })()}
                                      
                                      {/* Save Button - Bottom Right */}
                                      <div className="flex justify-end mt-4">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleSaveNews(news)
                                          }}
                                          disabled={isSaving || savedNewsIds.has(news.url)}
                                          className={`${
                                            savedNewsIds.has(news.url)
                                              ? 'text-amber-400 border-amber-400 bg-amber-500/10'
                                              : 'text-slate-400 border-slate-600 hover:text-amber-400 hover:border-amber-400 hover:bg-amber-500/10'
                                          } backdrop-blur-sm`}
                                        >
                                          <Bookmark className="h-4 w-4 mr-2" />
                                          {savedNewsIds.has(news.url) ? '保存済み' : '保存する'}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </CardHeader>
                                
                                {selectedNews?.id === news.id && (
                                  <CardContent className="pt-0">
                                    {/* カテゴリー情報の詳細表示 */}
                                    <div className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/30 backdrop-blur-sm">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm text-slate-400">カテゴリー:</span>
                                        <Badge 
                                          variant="secondary" 
                                          className={`text-sm px-3 py-1 rounded-full font-semibold border-2 ${getCategoryColor(topic)} backdrop-blur-sm`}
                                        >
                                          {categoryIcon} {categoryName}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-slate-400">関連トピック:</span>
                                        <div className="flex flex-wrap gap-1">
                                          {(() => {
                                            const otherTopics = news.topics?.filter(t => 
                                              t !== topic && 
                                              t !== 'all' && 
                                              categories.map(c => c.id).filter(id => id !== 'all').includes(t)
                                            ).slice(0, 3) || [];
                                            
                                            return otherTopics.map((topicName) => (
                                              <Badge
                                                key={topicName}
                                                variant="outline"
                                                className="text-xs bg-sky-500/10 border-sky-500/30 text-sky-400 px-2 py-1 rounded-full"
                                              >
                                                {topicNames[topicName] || topicName}
                                              </Badge>
                                            ));
                                          })()}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                      <Button
                                        variant="outline"
                                        className="flex items-center gap-3 hover:bg-sky-500/10 hover:border-sky-400/50 rounded-xl py-3 transition-all duration-200 backdrop-blur-sm bg-white/5"
                                        onClick={() => handleLearningStart('deep-dive')}
                                      >
                                        <Search className="h-4 w-4" />
                                        深掘り
                                      </Button>
                                      <Button
                                        variant="outline"
                                        className="flex items-center gap-3 hover:bg-cyan-500/10 hover:border-cyan-400/50 rounded-xl py-3 transition-all duration-200 backdrop-blur-sm bg-white/5"
                                        onClick={() => handleLearningStart('chat')}
                                      >
                                        <MessageSquare className="h-4 w-4" />
                                        学習
                                      </Button>
                                      <Button
                                        variant="outline"
                                        className="flex items-center gap-3 hover:bg-slate-500/10 hover:border-slate-400/50 rounded-xl py-3 transition-all duration-200 backdrop-blur-sm bg-white/5"
                                        onClick={() => handleLearningStart('output')}
                                      >
                                        <Zap className="h-4 w-4" />
                                        アウトプット
                                      </Button>
                                    </div>
                                  </CardContent>
                                )}
                              </Card>
                            </motion.div>
                          ))
                        )}
                      </motion.div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Learning Progress */}
              <motion.div
                variants={itemVariants}
              >
                <Card className="bg-slate-800/30 border border-slate-700/30 shadow-lg rounded-2xl backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-3 text-white">
                      <div className="p-2 bg-cyan-500/20 rounded-lg">
                        <Target className="h-5 w-5 text-cyan-300" />
                      </div>
                      学習進捗
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">今週の学習日数</span>
                        <span className="font-semibold text-cyan-300 text-lg">5/7日</span>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-3">
                        <div className="bg-gradient-to-r from-cyan-500 to-sky-500 h-3 rounded-full transition-all duration-300" style={{ width: '71%' }}></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">連続学習記録</span>
                        <span className="font-semibold text-cyan-300 text-lg">12日</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                variants={itemVariants}
              >
                <Card className="bg-slate-800/30 border border-slate-700/30 shadow-lg rounded-2xl backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-3 text-white">
                      <div className="p-2 bg-sky-500/20 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-sky-300" />
                      </div>
                      学習統計
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">今月の学習時間</span>
                        <span className="font-semibold text-lg text-white">24時間</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">作成した提案</span>
                        <span className="font-semibold text-lg text-white">8件</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">獲得バッジ</span>
                        <span className="font-semibold text-lg text-white">3個</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Reminder */}
              <motion.div
                variants={itemVariants}
              >
                <Card className="bg-gradient-to-r from-cyan-500/20 to-sky-500/20 text-white border border-cyan-400/30 shadow-lg rounded-2xl backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Clock className="h-5 w-5" />
                      </div>
                      リマインダー
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed mb-4 text-slate-200">
                      今日の学習を完了すると、連続学習記録が13日になります！
                    </p>
                    <Button 
                      className="w-full bg-gradient-to-r from-sky-400 to-cyan-300 text-black hover:from-sky-500 hover:to-cyan-400 rounded-xl py-3"
                      onClick={() => router.push('/dashboard')}
                    >
                      マイページを見る
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 