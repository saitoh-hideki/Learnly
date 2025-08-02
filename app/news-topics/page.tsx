'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Sparkles, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/store/useStore'

// ニューステーマの定義
const newsTopics = [
  {
    id: 'business',
    name: 'ビジネス・経営',
    description: '最新のビジネストレンド、経営戦略、企業動向',
    icon: '💼',
    examples: ['DX推進', 'サステナビリティ', 'リモートワーク']
  },
  {
    id: 'technology',
    name: 'テクノロジー・IT',
    description: 'AI、プログラミング、最新技術トレンド',
    icon: '💻',
    examples: ['生成AI', 'Web3', '量子コンピュータ']
  },
  {
    id: 'economics',
    name: '経済・金融',
    description: '経済動向、投資、金融市場の最新情報',
    icon: '📊',
    examples: ['金利政策', '暗号資産', 'ESG投資']
  },
  {
    id: 'science',
    name: '科学・研究',
    description: '最新の科学的発見や研究成果',
    icon: '🔬',
    examples: ['医学研究', '気候変動', '宇宙開発']
  },
  {
    id: 'education',
    name: '教育・学習',
    description: '教育改革、学習手法、スキル開発',
    icon: '📚',
    examples: ['EdTech', '生涯学習', 'STEAM教育']
  },
  {
    id: 'health',
    name: '健康・医療',
    description: '健康管理、最新医療情報、ウェルネス',
    icon: '🏥',
    examples: ['予防医療', 'メンタルヘルス', '栄養学']
  },
  {
    id: 'environment',
    name: '環境・サステナビリティ',
    description: '気候変動、環境保護、持続可能な開発',
    icon: '🌱',
    examples: ['再生可能エネルギー', '循環経済', '生物多様性']
  },
  {
    id: 'society',
    name: '社会・政治',
    description: '社会問題、政治動向、グローバルイシュー',
    icon: '🏛️',
    examples: ['少子化対策', '移民政策', '国際関係']
  }
]

export default function NewsTopicsPage() {
  const router = useRouter()
  const { selectedNewsTopics, setSelectedNewsTopics } = useStore()
  const [selectedTopics, setSelectedTopics] = useState<string[]>(selectedNewsTopics)
  const [isLoading, setIsLoading] = useState(false)

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

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard')}
              className="hover:bg-gray-800 rounded-xl text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">ニューステーマを選択</h1>
                <p className="text-gray-400">学習したい分野を最大3つ選んでください</p>
              </div>
            </div>
          </div>
        </div>

        {/* Selection Info */}
        <div className="mb-8">
          <Card className="bg-[#1c1f26] border border-gray-700 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">選択状況</h3>
                  <p className="text-gray-400 text-sm">
                    {selectedTopics.length}/3 のテーマを選択中
                  </p>
                </div>
                <Badge 
                  variant="secondary" 
                  className={`text-sm px-3 py-1 ${
                    selectedTopics.length === 3 
                      ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                      : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                  }`}
                >
                  {selectedTopics.length === 3 ? '最大数選択済み' : '選択可能'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {newsTopics.map((topic) => {
            const isSelected = selectedTopics.includes(topic.id)
            const isDisabled = !isSelected && selectedTopics.length >= 3

            return (
              <Card
                key={topic.id}
                className={`cursor-pointer transition-all duration-300 border-2 ${
                  isSelected
                    ? 'border-sky-400 bg-gradient-to-r from-sky-500/10 to-indigo-500/10 shadow-lg'
                    : isDisabled
                    ? 'border-gray-700 bg-[#1c1f26] opacity-50'
                    : 'border-gray-700 bg-[#1c1f26] hover:border-gray-600 hover:shadow-md'
                } rounded-2xl`}
                onClick={() => !isDisabled && handleTopicToggle(topic.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{topic.icon}</div>
                    {isSelected && (
                      <div className="p-2 bg-sky-500 rounded-full">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg font-semibold text-white mb-2">
                    {topic.name}
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-sm leading-relaxed">
                    {topic.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 font-medium">例：</p>
                    <div className="flex flex-wrap gap-1">
                      {topic.examples.map((example, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs border-gray-600 text-gray-400"
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
            className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white rounded-xl shadow-md px-8 py-3 text-lg font-medium"
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
          <p className="text-gray-500 text-sm">
            選択したテーマに基づいて、毎日最新のニュースを取得します。
            <br />
            後から設定画面から変更することも可能です。
          </p>
        </div>
      </div>
    </div>
  )
} 