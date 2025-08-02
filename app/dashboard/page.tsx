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

        const response = await fetch('/api/saved-news')

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
    console.log('handleModeSelect called with mode:', mode)
    setSelectedMode(mode)
    addRecentMode(mode)
    if (mode.id === 'news-learning') {
      console.log('Navigating to /news-topics')
      router.push('/news-topics')
    } else if (mode.id === 'theme-learning') {
      console.log('Navigating to /theme-selection')
      router.push('/theme-selection')
    } else {
      console.log('Navigating to /chat/${mode.id}')
      router.push(`/chat/${mode.id}`)
    }
  }

  if (!mounted) {
    return null
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
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            学習モードを選択
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            AIと共に学びを深め、自らの言葉で振り返る力を育む
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="mb-8">
          <div className="flex justify-center gap-4 flex-wrap">
            <Button
              variant="outline"
              onClick={() => router.push('/news-dashboard')}
              className="border-slate-600/50 hover:border-cyan-400/50 hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-200 rounded-xl px-6 py-3 transition-all"
            >
              <Newspaper className="h-5 w-5 mr-2" />
              ニュース学習
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/news-stock')}
              className="border-slate-600/50 hover:border-cyan-400/50 hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-200 rounded-xl px-6 py-3 relative transition-all"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              ニュースストック
              {savedNewsCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-sky-400 to-cyan-300 text-black text-xs px-2 py-1 rounded-full shadow-lg">
                  {savedNewsCount}
                </Badge>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/review-stock')}
              className="border-slate-600/50 hover:border-cyan-400/50 hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-200 rounded-xl px-6 py-3 transition-all"
            >
              <Check className="h-5 w-5 mr-2" />
              学習履歴
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="bg-[#1c1f26] border border-slate-700/50 rounded-2xl shadow-[inset_0_0_30px_rgba(255,255,255,0.03)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">保存されたニュース</p>
                    <p className="text-2xl font-bold text-white">
                      {isLoadingStats ? '...' : savedNewsCount}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-slate-200 to-cyan-200 rounded-xl">
                    <Bookmark className="h-6 w-6 text-slate-800" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#1c1f26] border border-slate-700/50 rounded-2xl shadow-[inset_0_0_30px_rgba(255,255,255,0.03)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">学習モード</p>
                    <p className="text-2xl font-bold text-white">{learningModes.length}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-slate-300 to-cyan-200 rounded-xl">
                    <BookIcon className="h-6 w-6 text-slate-800" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#1c1f26] border border-slate-700/50 rounded-2xl shadow-[inset_0_0_30px_rgba(255,255,255,0.03)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">最近使用</p>
                    <p className="text-2xl font-bold text-white">{recentModes.length}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-cyan-200 to-sky-300 rounded-xl">
                    <Clock className="h-6 w-6 text-slate-800" />
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
                className="flex flex-col justify-between bg-[#1c1f26] border border-slate-700/50 rounded-3xl p-8 min-h-[460px] shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)] transition-all duration-300 cursor-pointer group hover:ring-1 hover:ring-cyan-500/30 shadow-[inset_0_0_30px_rgba(255,255,255,0.03)]"
                onClick={(e) => {
                  console.log('Card clicked for mode:', mode)
                  handleModeSelect(mode)
                }}
              >
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-3 rounded-2xl ${
                      index === 0 ? 'bg-gradient-to-r from-slate-200 to-cyan-200' : 'bg-gradient-to-r from-slate-300 to-cyan-200'
                    }`}>
                      <div className={index === 0 ? 'text-slate-800' : 'text-slate-800'}>
                        {index === 0 ? <Newspaper className="h-8 w-8" /> : <BookIcon className="h-8 w-8" />}
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold text-white">{mode.name}</h2>
                  </div>
                  <p className="text-slate-400 text-base leading-relaxed mb-6">
                    {mode.description}
                  </p>
                  <ul className="text-sm text-slate-400 leading-relaxed space-y-3 mb-6 list-none">
                    {mode.features?.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className={`mt-[2px] text-cyan-300`} size={16} />
                        <span>{feature.replace('✅ ', '')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button 
                  className="mt-auto w-full bg-gradient-to-r from-sky-400 to-cyan-300 text-black text-base font-medium rounded-xl hover:scale-[1.02] transition-all shadow-[0_10px_30px_rgba(56,189,248,0.2)] hover:shadow-[0_15px_40px_rgba(56,189,248,0.3)]"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('Button clicked for mode:', mode)
                    handleModeSelect(mode)
                  }}
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
              <div className="p-2 bg-gradient-to-r from-slate-200 to-cyan-200 rounded-lg">
                <Clock className="h-5 w-5 text-slate-800" />
              </div>
              最近使用したモード
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {recentModes.map((mode) => (
                <Button
                  key={mode.id}
                  variant="outline"
                  onClick={() => handleModeSelect(mode)}
                  className="flex items-center gap-3 min-w-fit border border-slate-600/50 hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-all rounded-xl px-6 py-3 text-slate-300 hover:text-cyan-200"
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
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="キーワードで探す"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 w-80 border-slate-600/50 bg-[#1c1f26] text-slate-300 focus:border-cyan-500 focus:ring-cyan-500 rounded-full shadow-inner"
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
                  className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] border border-slate-700/50 bg-[#1c1f26] hover:shadow-lg rounded-2xl h-full relative hover:ring-1 hover:ring-cyan-500/30 shadow-[inset_0_0_30px_rgba(255,255,255,0.03)]"
                  onClick={() => {
                    addRecentCategory(mode.id)
                    router.push(`/category/${mode.id}`)
                  }}
                >
                  {/* 最近使用バッジ */}
                  {isRecent && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <Badge className="bg-gradient-to-r from-sky-400 to-cyan-300 text-black text-xs px-2 py-1 rounded-full shadow-lg">
                        最近使用
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl mb-2">{mode.icon}</div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="secondary" className="text-xs bg-gradient-to-r from-slate-200 to-cyan-200 text-slate-800 border-0">
                          学習可能
                        </Badge>
                        {newsCount > 0 && (
                          <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">
                            ニュース{newsCount}件
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg font-semibold text-white group-hover:text-cyan-200 transition-colors">
                      {mode.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-slate-400 leading-relaxed">
                      {mode.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <BookOpen className="h-3 w-3" />
                        <span>詳細を見る</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-cyan-200 transition-colors" />
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
            <div className="p-4 bg-slate-800/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-400 text-lg">該当する学習テーマが見つかりませんでした</p>
          </div>
        )}
      </div>
    </div>
  )
}