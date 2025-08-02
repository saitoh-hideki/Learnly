'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, Calendar, Tag, FileText, ExternalLink, Trash2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useStore } from '@/store/useStore'
import { supabase } from '@/lib/supabase'

interface SavedNews {
  id: string
  title: string
  summary: string
  url: string
  source: string
  category: string
  published_at: string
  topics: string[]
  created_at: string
}

export default function NewsStockPage() {
  const router = useRouter()
  const [savedNews, setSavedNews] = useState<SavedNews[]>([])
  const [filteredNews, setFilteredNews] = useState<SavedNews[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    fetchSavedNews()
  }, [])

  // 検索機能
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredNews(savedNews)
    } else {
      const filtered = savedNews.filter(news => 
        news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        news.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        news.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        news.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredNews(filtered)
    }
  }, [searchQuery, savedNews])

  // 保存されたニュースを取得
  const fetchSavedNews = async () => {
    try {
      setIsLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/saved-news', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const { savedNews } = await response.json()
        setSavedNews(savedNews)
        setFilteredNews(savedNews)
      } else {
        console.error('Failed to fetch saved news')
      }
    } catch (error) {
      console.error('Error fetching saved news:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadNewsAsPDF = (news: SavedNews) => {
    const content = `
保存されたニュース記事
====================

タイトル: ${news.title}
日付: ${new Date(news.published_at).toLocaleDateString('ja-JP')}
ソース: ${news.source || '不明'}
URL: ${news.url || '不明'}

要約:
${news.summary}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `news_${news.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleRemoveNews = (newsId: string) => {
    if (confirm('このニュース記事を削除しますか？')) {
      // TODO: Implement remove functionality
      console.log('Remove news:', newsId)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-[#1c1f26]/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-700">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/news-dashboard')}
              className="hover:bg-gray-800 rounded-xl text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">保存済みニュース</h1>
              <p className="text-gray-400">保存したニュース記事の管理</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1 bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-400 border-0">
            <FileText className="h-4 w-4 mr-2" />
            {filteredNews.length} 件
          </Badge>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="タイトル・要約・出典・カテゴリで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 border-gray-600 bg-[#1c1f26] text-gray-300 focus:border-green-500 focus:ring-green-500 rounded-xl shadow-sm"
            />
          </div>
        </div>

        {/* News Grid */}
        {filteredNews.length === 0 ? (
          <Card className="text-center py-12 bg-[#1c1f26]/80 backdrop-blur-sm border border-gray-700 shadow-lg rounded-2xl">
            <CardContent>
              <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <FileText className="h-10 w-10 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">まだニュースが保存されていません</h3>
              <p className="text-gray-400 mb-6">ニュースダッシュボードで記事を保存しましょう</p>
              <Button
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl shadow-md"
                onClick={() => router.push('/news-dashboard')}
              >
                ニュースを見る
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((news: SavedNews) => (
              <Card
                key={news.id}
                className="hover:shadow-lg transition-all duration-300 hover:scale-[1.01] bg-[#1c1f26]/80 backdrop-blur-sm border border-gray-700 rounded-2xl"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2 text-white">
                      {news.title}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          downloadNewsAsPDF(news)
                        }}
                        className="text-gray-400 hover:text-white hover:bg-gray-800"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveNews(news.id)
                        }}
                        className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                                     <CardDescription className="flex items-center gap-2 text-sm text-gray-400">
                     <Calendar className="h-3 w-3" />
                     <span>公開: {new Date(news.published_at).toLocaleDateString('ja-JP')}</span>
                     <span>•</span>
                     <span>保存: {new Date(news.created_at).toLocaleDateString('ja-JP')}</span>
                   </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400 line-clamp-3 mb-3">
                    {news.summary}
                  </p>
                  
                  {news.source && (
                    <Badge variant="outline" className="text-xs border-gray-600 text-gray-400 mb-2">
                      <Tag className="h-3 w-3 mr-1" />
                      {news.source}
                    </Badge>
                  )}

                  {news.url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(news.url, '_blank')}
                      className="text-xs text-blue-400 hover:text-blue-300 p-0 h-auto"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      元記事を読む
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 