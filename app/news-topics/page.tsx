'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Sparkles, ArrowRight, Clock, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/ui/header'
import { useStore } from '@/store/useStore'
import { useLabels } from '@/lib/kidsLabels'

// ニューステーマの定義（9カテゴリ）
const newsTopics = [
  {
    id: 'business',
    name: 'ビジネス・経営',
    description: '経営戦略・企業動向',
    icon: '💼',
    examples: ['DX', 'サステナビリティ']
  },
  {
    id: 'technology',
    name: 'テクノロジー・IT',
    description: 'AI・Web技術',
    icon: '💻',
    examples: ['生成AI', 'Web3']
  },
  {
    id: 'economics',
    name: '経済・金融',
    description: '金融市場・投資',
    icon: '📊',
    examples: ['金利政策', 'ESG投資']
  },
  {
    id: 'science',
    name: '科学・研究',
    description: '研究成果・発見',
    icon: '🔬',
    examples: ['医療', '宇宙開発']
  },
  {
    id: 'education',
    name: '教育・学習',
    description: '学び方・教育改革',
    icon: '📚',
    examples: ['EdTech', 'STEAM']
  },
  {
    id: 'health',
    name: '健康・医療',
    description: '健康管理・予防医療',
    icon: '🏥',
    examples: ['メンタルヘルス', '栄養学']
  },
  {
    id: 'environment',
    name: '環境・サステナビリティ',
    description: '気候変動・脱炭素',
    icon: '🌱',
    examples: ['再エネ', 'プラ削減']
  },
  {
    id: 'society',
    name: '社会・政治',
    description: '社会課題・政策',
    icon: '🏛️',
    examples: ['ジェンダー', '国際問題']
  },
  {
    id: 'lifestyle',
    name: '文化・ライフスタイル',
    description: '生活・価値観',
    icon: '🌟',
    examples: ['Z世代文化', 'ワークライフバランス']
  }
]

// 最新ニュースの型定義
interface LatestNews {
  id: string
  title: string
  summary: string
  url: string
  source: string
  category: string
  published_at: string
  created_at: string
}

export default function NewsTopicsPage() {
  const router = useRouter()
  const { selectedNewsTopics, setSelectedNewsTopics, isKidsMode } = useStore()
  const labels = useLabels(isKidsMode)
  const [selectedTopics, setSelectedTopics] = useState<string[]>(selectedNewsTopics)
  const [isLoading, setIsLoading] = useState(false)
  const [lastFetchDates, setLastFetchDates] = useState<Record<string, string | null>>({})
  const [latestNews, setLatestNews] = useState<Record<string, LatestNews>>({})

  // 各カテゴリーの最新取得日と最新ニュースを取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/latest-news')
        if (response.ok) {
          const data = await response.json()
          setLastFetchDates(data.lastFetchDates || {})
          setLatestNews(data.latestNews || {})
        }
      } catch (error) {
        console.error('Error fetching latest news data:', error)
      }
    }

    fetchData()
  }, [])

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics(prev => {
      if (prev.includes(topicId)) {
        return prev.filter(id => id !== topicId)
      } else {
        if (prev.length >= 3) {
          return prev
        }
        return [...prev, topicId]
      }
    })
  }

  const handleContinue = async () => {
    if (selectedTopics.length === 0) return

    setIsLoading(true)
    setSelectedNewsTopics(selectedTopics)

    try {
      // 選択されたトピックのニュースを取得
      const response = await fetch('/api/latest-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topics: selectedTopics }),
      })

      if (response.ok) {
        router.push('/news-dashboard')
      }
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const truncateSummary = (summary: string, maxLength: number = 100) => {
    if (summary.length <= maxLength) return summary
    return summary.substring(0, maxLength) + '...'
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
      <Header title={labels.newsTopics} />
      
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
              {labels.newsTopics}
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {labels.newsTopicsSubtitle}
            </p>
          </div>
        </div>

        {/* Selection Info */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-600 rounded-full px-6 py-3">
            <Check className="h-5 w-5 text-green-400" />
            <span className="text-white">
              {isKidsMode 
                ? `${selectedTopics.length}/3 の テーマを えらんだよ` 
                : `${selectedTopics.length}/3 のテーマを選択中`
              }
            </span>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {newsTopics.map((topic) => {
            const isSelected = selectedTopics.includes(topic.id)
            const latestNewsItem = latestNews[topic.id]
            const lastFetchDate = lastFetchDates[topic.id]
            
            return (
              <Card
                key={topic.id}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                  isSelected 
                    ? 'bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/20' 
                    : 'bg-slate-800/50 border-slate-600 hover:border-slate-500'
                }`}
                onClick={() => handleTopicToggle(topic.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{topic.icon}</span>
                      <div>
                        <CardTitle className="text-white text-lg">
                          {isKidsMode 
                            ? labels.categories[topic.id as keyof typeof labels.categories] || topic.name
                            : topic.name
                          }
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          {topic.description}
                        </CardDescription>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="p-2 bg-blue-500 rounded-full">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {/* Examples */}
                    <div>
                      <p className="text-xs text-slate-500 mb-1">
                        {isKidsMode ? "りれい" : "例"}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {topic.examples.map((example, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-slate-700/50 text-slate-300">
                            {example}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Latest News Preview */}
                    {latestNewsItem && (
                      <div className="border-t border-slate-600/50 pt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-3 w-3 text-slate-500" />
                          <span className="text-xs text-slate-500">
                            {isKidsMode ? "さいきんの ニュース" : "最新ニュース"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 line-clamp-2">
                          {truncateSummary(latestNewsItem.title, 60)}
                        </p>
                        {lastFetchDate && (
                          <p className="text-xs text-slate-500 mt-1">
                            {isKidsMode ? "さいきんの こうしん" : "最終更新"}: {formatDate(lastFetchDate)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={handleContinue}
            disabled={selectedTopics.length === 0 || isLoading}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-3 rounded-xl text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                {isKidsMode ? "ニュースを よみこみちゅう..." : "ニュースを読み込み中..."}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {isKidsMode ? "べんきょうを スタート！" : "学習を始める"}
                <ArrowRight className="h-5 w-5" />
              </div>
            )}
          </Button>
          
          {selectedTopics.length === 0 && (
            <p className="text-slate-400 mt-4">
              {isKidsMode ? "きょうみのある テーマを えらんでね" : "興味のあるテーマを選択してください"}
            </p>
          )}
        </div>
      </div>
    </div>
  )
} 