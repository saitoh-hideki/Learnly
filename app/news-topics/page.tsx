'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Sparkles, ArrowRight, Clock, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/store/useStore'

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
  const { selectedNewsTopics, setSelectedNewsTopics } = useStore()
  const [selectedTopics, setSelectedTopics] = useState<string[]>(selectedNewsTopics)
  const [isLoading, setIsLoading] = useState(false)
  const [lastFetchDates, setLastFetchDates] = useState<Record<string, string | null>>({})
  const [latestNews, setLatestNews] = useState<Record<string, LatestNews>>({})

  // 各カテゴリーの最新取得日と最新ニュースを取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dates: Record<string, string | null> = {}
        const news: Record<string, LatestNews> = {}
        
        // デバッグ用のテストデータ
        const testNews: Record<string, LatestNews> = {
          business: {
            id: '1',
            title: 'AI会議で企業戦略を自動生成',
            summary: '経営層の意思決定を効率化する新潮流。AIが会議内容を分析し、戦略提案を自動生成するシステムが注目を集めている。',
            url: 'https://example.com',
            source: 'Forbes Japan',
            category: 'business',
            published_at: '2025-08-02T10:00:00Z',
            created_at: '2025-08-02T10:00:00Z'
          },
          technology: {
            id: '2',
            title: '生成AIによるWeb3開発の革新',
            summary: 'ブロックチェーン技術とAIを組み合わせた新しい開発手法が登場。開発効率が大幅に向上し、Web3エコシステムの拡大が加速している。',
            url: 'https://example.com',
            source: 'TechCrunch',
            category: 'technology',
            published_at: '2025-08-02T09:00:00Z',
            created_at: '2025-08-02T09:00:00Z'
          },
          economics: {
            id: '3',
            title: 'ESG投資の新潮流と金利政策',
            summary: '持続可能な投資が主流となり、中央銀行の金利政策も環境配慮を重視する方向に変化。投資家の意思決定に大きな影響を与えている。',
            url: 'https://example.com',
            source: 'Bloomberg',
            category: 'economics',
            published_at: '2025-08-02T08:00:00Z',
            created_at: '2025-08-02T08:00:00Z'
          }
        }
        
        // プロトタイプ用にAPI呼び出しをスキップし、テストデータのみを使用
        for (const topic of newsTopics) {
          dates[topic.id] = null
          // テストデータを使用
          if (testNews[topic.id]) {
            news[topic.id] = testNews[topic.id]
          }
        }
        
        setLastFetchDates(dates)
        setLatestNews(news)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  // 最大3つまで選択可能
  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics(prev => {
      if (prev.includes(topicId)) {
        return prev.filter(id => id !== topicId)
      } else if (prev.length < 3) {
        return [...prev, topicId]
      }
      return prev
    })
  }

  const handleContinue = async () => {
    if (selectedTopics.length === 0) return

    setIsLoading(true)
    
    // 選択されたテーマをZustand storeに保存
    setSelectedNewsTopics(selectedTopics)
    
    // ニュースダッシュボードに遷移
    router.push('/news-dashboard')
  }

  // ニュース要約を短縮する関数
  const truncateSummary = (summary: string, maxLength: number = 100) => {
    if (summary.length <= maxLength) return summary
    return summary.substring(0, maxLength).trim() + '...'
  }

  return (
    <div className="min-h-screen bg-[#0e1a2a] relative overflow-hidden">
      {/* Enhanced Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-sky-500/8 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-t from-blue-600/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-br from-indigo-500/3 to-purple-500/3 rounded-full blur-3xl"></div>
        <div className="absolute top-2/3 right-1/3 w-48 h-48 bg-gradient-to-bl from-emerald-500/2 to-teal-500/2 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard')}
              className="hover:bg-slate-800/50 rounded-xl text-slate-300 hover:text-cyan-200 transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">ニューステーマを選択</h1>
                <p className="text-slate-400">学習したい分野を最大3つ選んでください</p>
              </div>
            </div>
          </div>
        </div>

        {/* Selection Info */}
        <div className="mb-8">
          <Card className="bg-[#1c1f26] border border-slate-700/50 rounded-2xl shadow-[inset_0_0_30px_rgba(255,255,255,0.03)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">選択状況</h3>
                  <p className="text-slate-400 text-sm">
                    {selectedTopics.length}/3 のテーマを選択中
                  </p>
                </div>
                <Badge 
                  variant="secondary" 
                  className={`text-sm px-3 py-1 ${
                    selectedTopics.length === 3 
                      ? 'bg-gradient-to-r from-slate-200 to-cyan-200 text-slate-800 border-0' 
                      : 'bg-gradient-to-r from-sky-400 to-cyan-300 text-black border-0'
                  }`}
                >
                  {selectedTopics.length === 3 ? '最大数選択済み' : '選択可能'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Topics Grid - 3x3 Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 max-w-6xl mx-auto">
          {newsTopics.map((topic) => {
            const isSelected = selectedTopics.includes(topic.id)
            const isDisabled = !isSelected && selectedTopics.length >= 3
            const lastFetchDate = lastFetchDates[topic.id]
            const latestNewsItem = latestNews[topic.id]

            return (
              <Card
                key={topic.id}
                className={`cursor-pointer transition-all duration-300 border-2 ${
                  isSelected
                    ? 'border-cyan-400 bg-gradient-to-r from-sky-400/10 to-cyan-300/10 shadow-[0_10px_30px_rgba(56,189,248,0.2)] hover:ring-1 hover:ring-cyan-500/30'
                    : isDisabled
                    ? 'border-slate-700/50 bg-[#1c1f26] opacity-50'
                    : 'border-slate-700/50 bg-[#1c1f26] hover:border-cyan-400/50 hover:shadow-md hover:ring-1 hover:ring-cyan-500/30'
                } rounded-2xl shadow-[inset_0_0_30px_rgba(255,255,255,0.03)]`}
                onClick={() => !isDisabled && handleTopicToggle(topic.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{topic.icon}</div>
                    {isSelected && (
                      <div className="p-2 bg-gradient-to-r from-sky-400 to-cyan-300 rounded-full shadow-lg">
                        <Check className="h-4 w-4 text-black" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg font-semibold text-white mb-2">
                    {topic.name}
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-sm leading-relaxed mb-3">
                    {topic.description}
                  </CardDescription>
                  {/* 最終取得日表示 */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                    <Clock className="h-3 w-3" />
                    <span>
                      {lastFetchDate 
                        ? `最終取得: ${new Date(lastFetchDate).toLocaleDateString('ja-JP')}`
                        : '未取得'
                      }
                    </span>
                  </div>
                  
                  {/* 最新ニュース表示 */}
                  {latestNewsItem && (
                    <div className="mt-3">
                      <div className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                        {truncateSummary(latestNewsItem.summary, 120)}
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-cyan-300 underline">
                          出典: {latestNewsItem.source}
                        </span>
                        <ExternalLink className="h-3 w-3 text-slate-500" />
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 font-medium">例：</p>
                    <div className="flex flex-wrap gap-1">
                      {topic.examples.map((example, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs border-slate-600/50 text-slate-400"
                        >
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleContinue}
            disabled={selectedTopics.length === 0 || isLoading}
            className="bg-gradient-to-r from-sky-400 to-cyan-300 hover:scale-[1.02] text-black rounded-xl shadow-[0_10px_30px_rgba(56,189,248,0.2)] hover:shadow-[0_15px_40px_rgba(56,189,248,0.3)] px-8 py-3 text-lg font-medium transition-all"
          >
            {isLoading ? (
              '設定中...'
            ) : (
              <>
                ニュース学習を始める
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            選択したテーマに基づいて、毎日最新のニュースを取得します。
            <br />
            後から設定画面から変更することも可能です。
          </p>
        </div>
      </div>
    </div>
  )
} 