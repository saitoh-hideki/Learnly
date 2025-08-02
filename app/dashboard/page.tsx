'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, TrendingUp, Clock, BookOpen, ArrowRight, Sparkles, Newspaper, BookOpen as BookIcon, Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { mainLearningModes, learningModes } from '@/data/modes'
import { useStore } from '@/store/useStore'

export default function DashboardPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const { recentModes, setSelectedMode, addRecentMode } = useStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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

        {/* Theme Learning Modes */}
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredModes.map((mode, index) => (
              <Card
                key={mode.id}
                className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] border border-gray-700 bg-[#1c1f26] hover:shadow-lg rounded-2xl h-full"
                onClick={() => handleModeSelect(mode)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl mb-2">{mode.icon}</div>
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
                      <span>学習可能</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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