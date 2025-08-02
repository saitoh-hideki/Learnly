'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, BookOpen, ArrowRight, Sparkles, Target, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { learningModes } from '@/data/modes'

// ダミーのテーマデータ
const themePrograms = [
  {
    id: 'ai-revolution',
    title: 'AI革命と未来社会',
    category: 'technology',
    description: '人工知能の急速な発展がもたらす社会変革と、私たちの生活への影響について7日間で深く学ぶ',
    duration: 7,
    progress: 0,
    difficulty: '中級',
    tags: ['AI', '未来予測', '社会変革'],
    icon: '🤖'
  },
  {
    id: 'sustainable-business',
    title: 'サステナブルビジネス戦略',
    category: 'business',
    description: '環境配慮と利益追求を両立する新しいビジネスモデルと戦略について体系的に学習',
    duration: 7,
    progress: 3,
    difficulty: '初級',
    tags: ['サステナビリティ', 'ビジネスモデル', 'ESG'],
    icon: '🌱'
  },
  {
    id: 'mental-wellness',
    title: 'メンタルウェルネス実践',
    category: 'psychology',
    description: '現代社会におけるストレス管理とメンタルヘルス向上のための実践的な手法を習得',
    duration: 7,
    progress: 0,
    difficulty: '初級',
    tags: ['メンタルヘルス', 'ストレス管理', '自己啓発'],
    icon: '🧠'
  },
  {
    id: 'digital-transformation',
    title: 'デジタルトランスフォーメーション',
    category: 'technology',
    description: '企業のデジタル化戦略と組織変革について、成功事例と失敗要因から学ぶ',
    duration: 7,
    progress: 7,
    difficulty: '上級',
    tags: ['DX', '組織変革', 'IT戦略'],
    icon: '💻'
  },
  {
    id: 'global-economics',
    title: 'グローバル経済の潮流',
    category: 'economics',
    description: '世界経済の最新動向と、日本経済への影響について深く分析・理解する',
    duration: 7,
    progress: 0,
    difficulty: '中級',
    tags: ['経済', 'グローバル', '投資'],
    icon: '📊'
  },
  {
    id: 'future-education',
    title: '未来の教育システム',
    category: 'education',
    description: 'テクノロジーを活用した新しい教育手法と、学習者の可能性を最大化する方法を探る',
    duration: 7,
    progress: 0,
    difficulty: '中級',
    tags: ['教育', 'テクノロジー', '学習'],
    icon: '📚'
  }
]

export default function ThemeSelectionPage() {
  const router = useRouter()
  const [selectedTheme, setSelectedTheme] = useState<typeof themePrograms[0] | null>(null)

  const handleThemeSelect = (theme: typeof themePrograms[0]) => {
    setSelectedTheme(theme)
  }

  const handleStartLearning = () => {
    if (!selectedTheme) return
    // 一時的にダッシュボードにリダイレクト（後で専用ページを作成予定）
    router.push('/dashboard')
  }

  const handleContinueLearning = () => {
    if (!selectedTheme) return
    // 一時的にダッシュボードにリダイレクト（後で専用ページを作成予定）
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-indigo-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-indigo-400" />
                <h1 className="text-2xl font-bold text-white">テーマで学ぶ</h1>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>7日間プログラム</span>
            </div>
          </div>
          
          <div className="bg-[#1c1f26] rounded-2xl p-6 shadow-xl border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">テーマ学習について</h2>
              <Badge className="bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-sm">
                7日間プログラム
              </Badge>
            </div>
            <p className="text-gray-300 leading-relaxed">
              7日間の体系的な学習プログラムで、分野別の専門知識を深めます。毎日1つのテーマについて深く学び、
              最終日には総合的なアウトプットを作成します。
            </p>
          </div>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themePrograms.map((theme) => (
            <Card
              key={theme.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
                selectedTheme?.id === theme.id 
                  ? 'border-indigo-400 bg-gradient-to-r from-indigo-500/10 to-sky-500/10' 
                  : 'border-gray-700 hover:border-indigo-400 bg-[#1c1f26]'
              }`}
              onClick={() => handleThemeSelect(theme)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{theme.icon}</div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge 
                      variant={theme.progress === 7 ? "default" : "secondary"}
                      className={theme.progress === 7 ? "bg-green-500" : ""}
                    >
                      {theme.progress === 7 ? "完了" : `${theme.progress}/${theme.duration}日`}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {theme.difficulty}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight mb-2 text-white">
                  {theme.title}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed text-gray-400">
                  {theme.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>進捗</span>
                    <span>{Math.round((theme.progress / theme.duration) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-sky-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(theme.progress / theme.duration) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {theme.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Action Button */}
                {selectedTheme?.id === theme.id && (
                  <Button 
                    className="w-full bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white rounded-xl shadow-md transition-all duration-200"
                    onClick={theme.progress === 0 ? handleStartLearning : handleContinueLearning}
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    {theme.progress === 0 ? "学習を始める" : "続きを進める"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Theme Details */}
        {selectedTheme && (
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              {selectedTheme.title} - 学習プログラム詳細
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-600">所要時間</p>
                    <p className="font-semibold">{selectedTheme.duration}日間</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-600">難易度</p>
                    <p className="font-semibold">{selectedTheme.difficulty}</p>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h4 className="font-semibold mb-2 text-gray-800">学習内容</h4>
                <div className="space-y-2">
                  {Array.from({ length: selectedTheme.duration }, (_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                        i < selectedTheme.progress 
                          ? 'bg-green-500 text-white' 
                          : i === selectedTheme.progress 
                            ? 'bg-indigo-500 text-white' 
                            : 'bg-gray-200 text-gray-600'
                      }`}>
                        {i < selectedTheme.progress ? '✓' : i + 1}
                      </div>
                      <span className={`text-sm ${
                        i < selectedTheme.progress 
                          ? 'text-green-600 font-medium' 
                          : i === selectedTheme.progress 
                            ? 'text-indigo-600 font-medium' 
                            : 'text-gray-600'
                      }`}>
                        Day {i + 1}: {getDayContent(selectedTheme.id, i + 1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ダミーの日別学習内容
function getDayContent(themeId: string, day: number): string {
  const contents: { [key: string]: string[] } = {
    'ai-revolution': [
      'AI技術の基礎と歴史',
      '機械学習とディープラーニング',
      'AIの社会実装事例',
      'AI倫理と責任',
      'AIと雇用の未来',
      'AI政策と規制',
      '未来社会のビジョン'
    ],
    'sustainable-business': [
      'サステナビリティの基礎',
      'ESG投資と企業価値',
      '循環型経済モデル',
      'グリーンテクノロジー',
      'サプライチェーン改革',
      'ステークホルダーエンゲージメント',
      '持続可能な成長戦略'
    ],
    'mental-wellness': [
      'メンタルヘルスの基礎',
      'ストレスメカニズム',
      'マインドフルネス実践',
      '認知行動療法',
      'ワークライフバランス',
      'レジリエンス構築',
      '継続的なウェルネス'
    ],
    'digital-transformation': [
      'DXの基礎概念',
      'デジタル戦略立案',
      '組織変革マネジメント',
      'テクノロジー選定',
      'データ活用戦略',
      'セキュリティとコンプライアンス',
      'DX成功事例分析'
    ],
    'global-economics': [
      '世界経済の構造',
      '主要経済圏の動向',
      '通貨政策と金利',
      '貿易とグローバリゼーション',
      '新興国経済',
      '経済危機と回復',
      '日本経済の未来'
    ],
    'future-education': [
      '教育の現状と課題',
      'EdTechの可能性',
      '個別最適化学習',
      'STEAM教育',
      '生涯学習システム',
      '教育評価の革新',
      '未来の教育ビジョン'
    ]
  }
  
  return contents[themeId]?.[day - 1] || `Day ${day} の学習`
} 