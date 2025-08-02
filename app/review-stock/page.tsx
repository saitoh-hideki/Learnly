'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, Calendar, Tag, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/store/useStore'

export default function ReviewStockPage() {
  const router = useRouter()
  const { reviews } = useStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const downloadReviewAsPDF = (review: any) => {
    // In a real implementation, you would generate a PDF here
    // For now, we'll create a simple text file
    const content = `
学習レビュー
============

タイトル: ${review.title}
日付: ${new Date(review.createdAt).toLocaleDateString('ja-JP')}
分野: ${review.source || '一般'}

要約:
${review.summary}

${review.content ? `詳細内容:\n${JSON.stringify(JSON.parse(review.content), null, 2)}` : ''}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `review_${review.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
              onClick={() => router.push('/dashboard')}
              className="hover:bg-gray-800 rounded-xl text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">保存済みレビュー</h1>
              <p className="text-gray-400">学習の振り返りと記録</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1 bg-gradient-to-r from-indigo-500/10 to-sky-500/10 text-indigo-400 border-0">
            <FileText className="h-4 w-4 mr-2" />
            {reviews.length} 件
          </Badge>
        </div>

        {/* Reviews Grid */}
        {reviews.length === 0 ? (
          <Card className="text-center py-12 bg-[#1c1f26]/80 backdrop-blur-sm border border-gray-700 shadow-lg rounded-2xl">
            <CardContent>
              <div className="p-4 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <FileText className="h-10 w-10 text-sky-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">まだレビューが保存されていません</h3>
              <p className="text-gray-400 mb-6">学習セッションの後にレビューを生成して保存しましょう</p>
              <Button
                className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white rounded-xl shadow-md"
                onClick={() => router.push('/dashboard')}
              >
                学習を始める
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => {
              let parsedContent: any = {}
              try {
                parsedContent = review.content ? JSON.parse(review.content) : {}
              } catch (e) {
                console.error('Failed to parse review content:', e)
              }

              return (
                <Card
                  key={review.id}
                  className="hover:shadow-lg transition-all duration-300 hover:scale-[1.01] cursor-pointer bg-[#1c1f26]/80 backdrop-blur-sm border border-gray-700 rounded-2xl"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2 text-white">
                        {review.title}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          downloadReviewAsPDF(review)
                        }}
                        className="text-gray-400 hover:text-white hover:bg-gray-800"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="h-3 w-3" />
                      {new Date(review.createdAt).toLocaleDateString('ja-JP')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-400 line-clamp-3 mb-3">
                      {review.summary}
                    </p>
                    
                    {review.source && (
                      <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                        <Tag className="h-3 w-3 mr-1" />
                        {review.source}
                      </Badge>
                    )}

                    {parsedContent.keyPoints && parsedContent.keyPoints.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium mb-1">重要ポイント:</p>
                        <div className="flex flex-wrap gap-1">
                          {parsedContent.keyPoints.slice(0, 2).map((point: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {point.length > 20 ? point.substring(0, 20) + '...' : point}
                            </Badge>
                          ))}
                          {parsedContent.keyPoints.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{parsedContent.keyPoints.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}