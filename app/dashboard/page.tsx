'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, TrendingUp, Clock, BookOpen, ArrowRight, Sparkles, Newspaper, BookOpen as BookIcon, Check, Bookmark } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { mainLearningModes, learningModes } from '@/data/modes'
import { useStore } from '@/store/useStore'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const { recentModes, recentCategories, setSelectedMode, addRecentMode, addRecentCategory } = useStore()
  const [mounted, setMounted] = useState(false)
  const [savedNewsCount, setSavedNewsCount] = useState(0)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [categoryNewsCounts, setCategoryNewsCounts] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    setMounted(true)
  }, [])

  // 保存されたニュースの件数を取得
  useEffect(() => {
    const fetchSavedNewsCount = async () => {
      try {
        setIsLoadingStats(true)
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          setIsLoadingStats(false)
          return
        }

        const response = await fetch('/api/saved-news', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })

        if (response.ok) {
          const { savedNews } = await response.json()
          setSavedNewsCount(savedNews?.length || 0)
          
          // カテゴリ別のニュース件数を計算
          const counts: { [key: string]: number } = {}
          savedNews?.forEach((news: any) => {
            const category = news.category || 'other'
            counts[category] = (counts[category] || 0) + 1
          })
          setCategoryNewsCounts(counts)
        }
      } catch (error) {
        console.error('Error fetching saved news count:', error)
      } finally {
        setIsLoadingStats(false)
      }
    }

    fetchSavedNewsCount()
  }, [])

  const filteredModes = learningModes.filter(mode =>
    mode.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mode.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleModeSelect = (mode: typeof mainLearningModes[0] | typeof learningModes[0]) => {
    setSelectedMode(mode)
    addRecentMode(mode)
    if (mode.id === 'news-learning') {
      router.push('/news-topics')
    } else if (mode.id === 'theme-learning') {
      router.push('/theme-selection')
    } else {
      router.push(`/chat/${mode.id}`)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            学習モードを選択
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            AIと共に学びを深め、自らの言葉で振り返る力を育む
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="mb-8">
          <div className="flex justify-center gap-4 flex-wrap">
            <Button
              variant="outline"
              onClick={() => router.push('/news-dashboard')}
              className="border-gray-600 hover:border-sky-400 hover:bg-sky-500/10 text-gray-300 hover:text-sky-400 rounded-xl px-6 py-3"
            >
              <Newspaper className="h-5 w-5 mr-2" />
              ニュース学習
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/news-stock')}
              className="border-gray-600 hover:border-amber-400 hover:bg-amber-500/10 text-gray-300 hover:text-amber-400 rounded-xl px-6 py-3 relative"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              ニュースストック
              {savedNewsCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                  {savedNewsCount}
                </Badge>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/review-stock')}
              className="border-gray-600 hover:border-indigo-400 hover:bg-indigo-500/10 text-gray-300 hover:text-indigo-400 rounded-xl px-6 py-3"
            >
              <Check className="h-5 w-5 mr-2" />
              学習履歴
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="bg-[#1c1f26] border border-gray-700 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">保存されたニュース</p>
                    <p className="text-2xl font-bold text-white">
                      {isLoadingStats ? '...' : savedNewsCount}
                    </p>
                  </div>
                  <div className="p-3 bg-amber-500/10 rounded-xl">
                    <Bookmark className="h-6 w-6 text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#1c1f26] border border-gray-700 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">学習モード</p>
                    <p className="text-2xl font-bold text-white">{learningModes.length}</p>
                  </div>
                  <div className="p-3 bg-indigo-500/10 rounded-xl">
                    <BookIcon className="h-6 w-6 text-indigo-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#1c1f26] border border-gray-700 rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">最近使用</p>
                    <p className="text-2xl font-bold text-white">{recentModes.length}</p>
                  </div>
                  <div className="p-3 bg-sky-500/10 rounded-xl">
                    <Clock className="h-6 w-6 text-sky-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Learning Modes */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {mainLearningModes.map((mode, index) => (
              <Card
                key={mode.id}
                className="flex flex-col justify-between bg-[#1c1f26] border border-gray-700 rounded-3xl p-8 min-h-[460px] shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => handleModeSelect(mode)}
              >
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-3 rounded-2xl ${
                      index === 0 ? 'bg-sky-500/10 text-sky-400' : 'bg-indigo-500/10 text-indigo-400'
                    }`}>
                      {index === 0 ? <Newspaper className="h-8 w-8" /> : <BookIcon className="h-8 w-8" />}
                    </div>
                    <h2 className="text-xl font-semibold text-white">{mode.name}</h2>
                  </div>
                  <p className="text-gray-400 text-base leading-relaxed mb-6">
                    {mode.description}
                  </p>
                  <ul className="text-sm text-gray-400 leading-relaxed space-y-3 mb-6 list-none">
                    {mode.features?.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className={`mt-[2px] ${
                          index === 0 ? 'text-sky-500' : 'text-indigo-500'
                        }`} size={16} />
                        <span>{feature.replace('✅ ', '')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button 
                  className="mt-auto w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white text-base font-medium rounded-xl hover:opacity-90 transition group-hover:shadow-lg"
                  onClick={() => handleModeSelect(mode)}
                >
                  学習を始める <ArrowRight className="ml-2" size={18} />
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Modes */}
        {recentModes.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-3 text-white">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-indigo-400" />
              </div>
              最近使用したモード
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {recentModes.map((mode) => (
                <Button
                  key={mode.id}
                  variant="outline"
                  onClick={() => handleModeSelect(mode)}
                  className="flex items-center gap-3 min-w-fit border border-gray-600 hover:border-indigo-400 hover:bg-indigo-500/10 transition-all rounded-xl px-6 py-3 text-gray-300 hover:text-white"
                >
                  <span className="text-2xl">{mode.icon}</span>
                  <span className="font-medium">{mode.name}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Theme Learning Modes - 3x3 Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-white">
              テーマ別学習
            </h2>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="キーワードで探す"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 w-80 border-gray-600 bg-[#1c1f26] text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-full shadow-inner"
              />
            </div>
          </div>
          
          {/* 3x3 Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredModes.slice(0, 9).map((mode, index) => {
              const newsCount = categoryNewsCounts[mode.id] || 0
              const isRecent = recentCategories.includes(mode.id)
              
              return (
                <Card
                  key={mode.id}
                  className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] border border-gray-700 bg-[#1c1f26] hover:shadow-lg rounded-2xl h-full relative"
                  onClick={() => {
                    addRecentCategory(mode.id)
                    router.push(`/category/${mode.id}`)
                  }}
                >
                  {/* 最近使用バッジ */}
                  {isRecent && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                        最近使用
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl mb-2">{mode.icon}</div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="secondary" className="text-xs bg-indigo-500/10 text-indigo-400 border-0">
                          学習可能
                        </Badge>
                        {newsCount > 0 && (
                          <Badge variant="outline" className="text-xs border-green-500/30 text-green-400">
                            ニュース{newsCount}件
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
                      {mode.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-400 leading-relaxed">
                      {mode.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <BookOpen className="h-3 w-3" />
                        <span>詳細を見る</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Empty State */}
        {filteredModes.length === 0 && searchQuery && (
          <div className="text-center py-16">
            <div className="p-4 bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-400 text-lg">該当する学習テーマが見つかりませんでした</p>
          </div>
        )}
      </div>
    </div>
  )
}