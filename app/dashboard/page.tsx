'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, TrendingUp, Clock, BookOpen, ArrowRight, Sparkles, Newspaper, BookOpen as BookIcon, Check, Bookmark } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/ui/header'
import { mainLearningModes, learningModes } from '@/data/modes'
import { useStore } from '@/store/useStore'
import { useLabels } from '@/lib/kidsLabels'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const { recentModes, recentCategories, setSelectedMode, addRecentMode, addRecentCategory, isKidsMode } = useStore()
  const labels = useLabels(isKidsMode)
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

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      business: 'text-blue-300',
      technology: 'text-purple-300',
      economics: 'text-green-300',
      science: 'text-cyan-300',
      education: 'text-orange-300',
      health: 'text-red-300',
      environment: 'text-emerald-300',
      society: 'text-indigo-300',
      lifestyle: 'text-pink-300'
    }
    return colors[category] || 'text-slate-300'
  }

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
      // 9つのカテゴリーの場合は、カテゴリー別ニュースページに遷移
      console.log('Navigating to /category/${mode.id}')
      router.push(`/category/${mode.id}`)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0e1a2a] relative overflow-hidden">
      <Header title={labels.dashboardTitle} />
      
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
            {labels.dashboardTitle}
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {labels.dashboardSubtitle}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              type="text"
              placeholder={isKidsMode ? "べんきょうしたい ことを さがそう" : "学習したい内容を検索"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800/50 border-slate-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">
                    {isKidsMode ? "とっておいた ニュース" : "保存済みニュース"}
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {isLoadingStats ? '...' : savedNewsCount}
                  </p>
                </div>
                <Bookmark className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">
                    {isKidsMode ? "さいきんの べんきょう" : "最近の学習"}
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {recentModes.length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">
                    {isKidsMode ? "きょうみのある カテゴリ" : "興味のあるカテゴリ"}
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {recentCategories.length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Learning Modes */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-400" />
            {isKidsMode ? "メインの べんきょうモード" : "メインの学習モード"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mainLearningModes.map((mode) => {
              // ニュース学習モードの場合は総保存件数を表示
              const savedCount = mode.id === 'news-learning' ? savedNewsCount : 0
              return (
                <Card
                  key={mode.id}
                  className="bg-slate-800/50 border-slate-600 hover:border-blue-500 transition-all duration-300 cursor-pointer group"
                  onClick={() => handleModeSelect(mode)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <BookOpen className="h-6 w-6 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg">
                          {mode.name}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          {mode.description}
                        </CardDescription>
                      </div>
                      {/* 保存件数バッジ（ニュース学習モードのみ） */}
                      {savedCount > 0 && (
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 flex items-center gap-1">
                            <Bookmark className="h-3 w-3" />
                            {isKidsMode ? `保存${savedCount}` : `保存${savedCount}`}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                        {isKidsMode ? "おすすめ" : "おすすめ"}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* All Learning Modes */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <BookIcon className="h-5 w-5 text-green-400" />
            {isKidsMode ? "すべての べんきょうモード" : "すべての学習モード"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModes.map((mode) => {
              const savedCount = categoryNewsCounts[mode.id] || 0
              return (
                <Card
                  key={mode.id}
                  className="bg-slate-800/50 border-slate-600 hover:border-green-500 transition-all duration-300 cursor-pointer group"
                  onClick={() => handleModeSelect(mode)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <BookOpen className="h-5 w-5 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className={`text-base ${getCategoryColor(mode.id)}`}>
                          {mode.name}
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-sm">
                          {mode.description}
                        </CardDescription>
                      </div>
                      {/* 保存件数バッジ */}
                      {savedCount > 0 && (
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 flex items-center gap-1">
                            <Bookmark className="h-3 w-3" />
                            {isKidsMode ? `保存${savedCount}` : `保存${savedCount}`}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                        {isKidsMode ? "べんきょう" : "学習"}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-green-400 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Recent Learning */}
        {recentModes.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-400" />
              {isKidsMode ? "さいきんの べんきょう" : "最近の学習"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentModes.slice(0, 6).map((mode) => {
                const savedCount = categoryNewsCounts[mode.id] || 0
                return (
                  <Card
                    key={mode.id}
                    className="bg-slate-800/50 border-slate-600 hover:border-yellow-500 transition-all duration-300 cursor-pointer group"
                    onClick={() => handleModeSelect(mode)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                          <Check className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-white text-base">
                            {mode.name}
                          </CardTitle>
                          <CardDescription className="text-slate-400 text-sm">
                            {mode.description}
                          </CardDescription>
                        </div>
                        {/* 保存件数バッジ */}
                        {savedCount > 0 && (
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 flex items-center gap-1">
                              <Bookmark className="h-3 w-3" />
                              {isKidsMode ? `保存${savedCount}` : `保存${savedCount}`}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300">
                          {isKidsMode ? "さいきん" : "最近"}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-yellow-400 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Category News Counts */}
        {Object.keys(categoryNewsCounts).length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-purple-400" />
              {isKidsMode ? "カテゴリべつ ニュース" : "カテゴリ別ニュース"}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(categoryNewsCounts).map(([category, count]) => (
                <Card key={category} className="bg-slate-800/50 border-slate-600">
                  <CardContent className="p-4 text-center">
                    <p className="text-slate-400 text-sm mb-1">
                      {labels.categories[category as keyof typeof labels.categories] || category}
                    </p>
                    <p className="text-xl font-bold text-white">{count}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}