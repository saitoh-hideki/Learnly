'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Search, TrendingUp, Clock, BookOpen, ArrowRight, Sparkles, Target, MessageSquare, Zap, ArrowLeft, RefreshCw, Settings, Archive, Bookmark } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useStore, NewsArticle } from '@/store/useStore'
import { supabase } from '@/lib/supabase'

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
  const { selectedNewsTopics, newsArticles, addNewsArticles, newsSettings } = useStore()
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null)
  const [isLoadingNews, setIsLoadingNews] = useState(false)
  const [newsByCategory, setNewsByCategory] = useState<{ [key: string]: NewsArticle[] }>({})
  const [savedNewsIds, setSavedNewsIds] = useState<Set<string>>(new Set())
  const [isSaving, setIsSaving] = useState(false)

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
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/saved-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
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

      if (response.ok) {
        setSavedNewsIds(prev => new Set([...prev, news.id]))
        // 保存成功後、自動的にストックページに遷移
        router.push('/news-stock')
      } else if (response.status === 409) {
        alert('このニュースは既に保存されています')
      } else {
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
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) return

      const response = await fetch('/api/saved-news', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const { savedNews } = await response.json()
        const savedIds = new Set<string>(savedNews.map((news: any) => news.url as string))
        setSavedNewsIds(savedIds)
      }
    } catch (error) {
      console.error('Error fetching saved news IDs:', error)
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

        const { data, error } = await supabase.functions.invoke('fetch-news', {
          body: {
            topics: [topic]
          }
        })

        console.log('API response for topic', topic, ':', { data, error })

        if (error) {
          console.error('Supabase function error for topic', topic, ':', error)
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

  // テーマが選択されていない場合は、テーマ選択画面にリダイレクト
  useEffect(() => {
    if (selectedNewsTopics.length === 0) {
      router.push('/news-topics')
    }
  }, [selectedNewsTopics, router])

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
        return 'bg-blue-500/30 text-blue-200 border-blue-400';
      case 'technology':
        return 'bg-purple-500/30 text-purple-200 border-purple-400';
      case 'economics':
        return 'bg-green-500/30 text-green-200 border-green-400';
      case 'science':
        return 'bg-teal-500/30 text-teal-200 border-teal-400';
      case 'education':
        return 'bg-indigo-500/30 text-indigo-200 border-indigo-400';
      case 'health':
        return 'bg-red-500/30 text-red-200 border-red-400';
      case 'environment':
        return 'bg-emerald-500/30 text-emerald-200 border-emerald-400';
      case 'society':
        return 'bg-orange-500/30 text-orange-200 border-orange-400';
      case 'lifestyle':
        return 'bg-pink-500/30 text-pink-200 border-pink-400';
      default:
        return 'bg-gray-500/30 text-gray-200 border-gray-400';
    }
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
                <div className="p-2 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">ニュースで学ぶ</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-400 bg-[#1c1f26] px-4 py-2 rounded-xl shadow-sm border border-gray-700">
                <Calendar className="h-4 w-4 inline mr-2" />
                <span>{new Date().toLocaleDateString('ja-JP')}</span>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/news-settings')}
                className="border-gray-600 hover:border-sky-400 text-gray-300 hover:text-sky-400"
              >
                <Settings className="h-4 w-4 mr-2" />
                設定
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/news-stock')}
                className="border-gray-600 hover:border-indigo-400 text-gray-300 hover:text-indigo-400"
              >
                <Archive className="h-4 w-4 mr-2" />
                ニュースストック
              </Button>
            </div>
          </div>
          
          <Card className="bg-gradient-to-r from-sky-500/10 to-indigo-500/10 border border-gray-700 shadow-xl rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">今日の学びの提案</h2>
              <Badge className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white px-4 py-1 rounded-full shadow-sm">
                AI提案
              </Badge>
            </div>
            <p className="text-gray-300 leading-relaxed text-lg">
              選択されたテーマ「{selectedNewsTopics.map(topic => {
                return topicNames[topic] || topic
              }).join('、')}」に関する最新ニュースをおすすめします。
              これらの分野の最新動向について深く掘り下げて学び、実践的な洞察を得ましょう。
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - News Cards by Category */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-semibold text-white">今日のニュース</h3>
                  <Badge 
                    variant="secondary" 
                    className="text-sm px-4 py-2 rounded-full font-semibold border-2 bg-sky-500/30 text-sky-200 border-sky-400"
                  >
                    {selectedNewsTopics.length}つのカテゴリー
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleRefreshNews()}
                  disabled={isLoadingNews}
                  className="border-gray-600 hover:border-sky-400 hover:bg-sky-500/10 rounded-xl text-gray-300 hover:text-sky-400"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingNews ? 'animate-spin' : ''}`} />
                  {isLoadingNews ? '取得中...' : 'ニュースを再取得'}
                </Button>
              </div>
            </div>

            <div className="space-y-8 max-h-[80vh] overflow-y-auto pr-2">
              {Object.keys(newsByCategory).length === 0 ? (
                <Card className="bg-[#1c1f26] border border-gray-700 shadow-xl rounded-2xl">
                  <CardContent className="py-12 text-center">
                    <BookOpen className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">ニュースがありません</h3>
                    <p className="text-gray-400 mb-6">
                      ニュースを取得して学習を始めましょう
                    </p>
                    <Button
                      onClick={() => handleRefreshNews()}
                      disabled={isLoadingNews}
                      className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white hover:from-sky-600 hover:to-indigo-600"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingNews ? 'animate-spin' : ''}`} />
                      {isLoadingNews ? '取得中...' : 'ニュースを取得'}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                // 各カテゴリーごとにセクションを作成
                selectedNewsTopics.map((topic) => {
                  const categoryNews = newsByCategory[topic] || []
                  const categoryName = topicNames[topic] || topic
                  const categoryIcon = categories.find(c => c.id === topic)?.icon || '📰'
                  
                  return (
                    <div key={topic} className="space-y-4">
                      {/* カテゴリーヘッダー */}
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant="secondary" 
                          className={`text-lg px-4 py-2 rounded-full font-semibold border-2 ${getCategoryColor(topic)}`}
                        >
                          {categoryIcon} {categoryName}
                        </Badge>
                        <div className="flex-1 h-px bg-gray-700"></div>
                      </div>
                      
                      {/* そのカテゴリーのニュース */}
                      {categoryNews.length === 0 ? (
                        <Card className="bg-[#1c1f26] border border-gray-700 shadow-xl rounded-2xl">
                          <CardContent className="py-8 text-center">
                            <p className="text-gray-400">
                              {categoryName}のニュースを取得中...
                            </p>
                          </CardContent>
                        </Card>
                      ) : (
                        categoryNews.map((news) => (
                          <Card
                            key={news.id}
                            className={`cursor-pointer transition-all duration-300 hover:scale-[1.01] border-2 ${
                              selectedNews?.id === news.id 
                                ? 'border-indigo-400 bg-gradient-to-r from-indigo-500/10 to-sky-500/10 shadow-xl' 
                                : 'border-gray-700 hover:border-indigo-400 bg-[#1c1f26] hover:shadow-lg'
                            } rounded-2xl`}
                            onClick={() => handleNewsSelect(news)}
                          >
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    {/* 日付 */}
                                    <span className="text-xs text-gray-500">
                                      {new Date(news.publishedAt).toLocaleDateString('ja-JP')}
                                    </span>
                                    {/* ソース */}
                                    <span className="text-xs text-gray-400 font-medium">{news.source}</span>
                                  </div>
                                  <CardTitle className="text-xl leading-tight mb-3 font-semibold text-white">
                                    {news.title}
                                  </CardTitle>
                                  <CardDescription className="text-base leading-relaxed text-gray-400">
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
                                          <span className="text-xs text-gray-500 mr-1">関連トピック:</span>
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
                                          : 'text-gray-400 border-gray-600 hover:text-amber-400 hover:border-amber-400 hover:bg-amber-500/10'
                                      }`}
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
                                <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm text-gray-400">カテゴリー:</span>
                                    <Badge 
                                      variant="secondary" 
                                      className={`text-sm px-3 py-1 rounded-full font-semibold border-2 ${getCategoryColor(topic)}`}
                                    >
                                      {categoryIcon} {categoryName}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-400">関連トピック:</span>
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
                                    className="flex items-center gap-3 hover:bg-sky-50 hover:border-sky-300 rounded-xl py-3 transition-all duration-200"
                                    onClick={() => handleLearningStart('deep-dive')}
                                  >
                                    <Search className="h-4 w-4" />
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
                                    <Zap className="h-4 w-4" />
                                    アウトプット
                                  </Button>
                                </div>
                              </CardContent>
                            )}
                          </Card>
                        ))
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Learning Progress */}
            <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Target className="h-5 w-5 text-indigo-600" />
                  </div>
                  学習進捗
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">今週の学習日数</span>
                    <span className="font-semibold text-indigo-600 text-lg">5/7日</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-indigo-500 to-sky-500 h-3 rounded-full transition-all duration-300" style={{ width: '71%' }}></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">連続学習記録</span>
                    <span className="font-semibold text-green-600 text-lg">12日</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white border border-gray-200 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-3">
                  <div className="p-2 bg-sky-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-sky-600" />
                  </div>
                  学習統計
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">今月の学習時間</span>
                    <span className="font-semibold text-lg">24時間</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">作成した提案</span>
                    <span className="font-semibold text-lg">8件</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">獲得バッジ</span>
                    <span className="font-semibold text-lg">3個</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reminder */}
            <Card className="bg-gradient-to-r from-indigo-500 to-sky-500 text-white border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Clock className="h-5 w-5" />
                  </div>
                  リマインダー
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed mb-4">
                  今日の学習を完了すると、連続学習記録が13日になります！
                </p>
                <Button 
                  className="w-full bg-white text-indigo-600 hover:bg-gray-100 rounded-xl py-3"
                  onClick={() => router.push('/dashboard')}
                >
                  マイページを見る
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 