'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { ArrowLeft, Send, BookOpen, Sparkles, FileText, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { learningModes } from '@/data/modes'
import { useStore } from '@/store/useStore'
import { supabase } from '@/lib/supabase'

type Message = {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const modeId = params.modeId as string
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedNews, setSelectedNews] = useState<any[]>([])
  const [showReview, setShowReview] = useState(false)
  const [review, setReview] = useState<any>(null)
  const [hasInitialized, setHasInitialized] = useState(false)
  const [showSelectedNews, setShowSelectedNews] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { currentSession, createSession, addMessage, saveReview } = useStore()

  const mode = learningModes.find(m => m.id === modeId)

  useEffect(() => {
    if (mode && !currentSession) {
      createSession(mode.id)
    }
  }, [mode, currentSession])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // クエリパラメータから選択されたニュースを取得（自動チャット開始はしない）
  useEffect(() => {
    const newsIds = searchParams.get('newsIds')
    const category = searchParams.get('category')
    
    if (newsIds && !hasInitialized && currentSession) {
      setHasInitialized(true)
      // 選択されたニュースを取得
      fetchSelectedNews(newsIds.split(','))
    }
  }, [searchParams, hasInitialized, currentSession])

  const fetchSelectedNews = async (newsIds: string[]) => {
    try {
      const response = await fetch('/api/saved-news')
      if (response.ok) {
        const { savedNews } = await response.json()
        const selected = savedNews.filter((news: any) => newsIds.includes(news.id))
        setSelectedNews(selected)
      }
    } catch (error) {
      console.error('Error fetching selected news:', error)
    }
  }





  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    if (currentSession) {
      addMessage(currentSession.id, {
        role: userMessage.role,
        content: userMessage.content
      })
    }

    try {
      // 最初のメッセージの場合、選択されたニュースの情報を含める
      const isFirstMessage = messages.length === 0
      const requestBody = {
        messages: [...messages, userMessage],
        mode,
        selectedNews,
        isFirstMessage
      }

      // エッジファンクションを呼び出してレスポンスを取得
      const { data, error } = await supabase.functions.invoke('chat', {
        body: requestBody
      })

      if (error) {
        throw new Error(`Supabase function error: ${error.message}`)
      }

      // レスポンスからメッセージを取得
      let assistantMessage = ''
      if (data && data.choices && data.choices[0]?.message?.content) {
        assistantMessage = data.choices[0].message.content
      }

      // ストリーミング効果を実装
      if (assistantMessage) {
        // 最初に空のメッセージを追加
        setMessages(prev => {
          const newMessages = [...prev]
          newMessages.push({
            role: 'assistant',
            content: '',
            timestamp: new Date()
          })
          return newMessages
        })

        // 文字単位でストリーミング効果を作る
        const chars = assistantMessage.split('')
        let currentMessage = ''
        
        for (let i = 0; i < chars.length; i++) {
          currentMessage += chars[i]
          
          setMessages(prev => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            
            if (lastMessage?.role === 'assistant') {
              lastMessage.content = currentMessage
            }
            
            return newMessages
          })
          
          // 文字ごとに少し遅延を入れてストリーミング効果を作る
          await new Promise(resolve => setTimeout(resolve, 20))
        }
      }

      if (currentSession && assistantMessage) {
        addMessage(currentSession.id, {
          role: 'assistant',
          content: assistantMessage
        })
      }


    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateReview = async () => {
    if (messages.length === 0) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, mode })
      })

      if (response.ok) {
        const data = await response.json()
        setReview(data.review)
        setShowReview(true)
        
        // Save review to store
        saveReview({
          sessionId: currentSession?.id || '',
          title: data.review.title,
          content: JSON.stringify(data.review),
          summary: data.review.summary,
          source: mode?.name
        })
      }
    } catch (error) {
      console.error('Failed to generate review:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!mode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>モードが見つかりません</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="container mx-auto px-4 py-4 h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 bg-[#1c1f26]/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-gray-700">
          <div className="flex items-center gap-4">
                          <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/dashboard')}
                className="hover:bg-gray-800 rounded-xl text-gray-300 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 rounded-xl">
                  <span className="text-2xl">{mode.icon}</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white">{mode.name}</h1>
                  <p className="text-sm text-gray-400">AIと対話して学習</p>
                </div>
              </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/review-stock')}
              className="border-gray-600 hover:border-indigo-400 hover:bg-indigo-500/10 rounded-xl text-gray-300 hover:text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              保存済みレビュー
            </Button>
            <Button
              onClick={generateReview}
              disabled={messages.length === 0 || isLoading}
              className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white rounded-xl shadow-md"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              レビュー生成
            </Button>
          </div>
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Selected News Section */}
            {selectedNews.length > 0 && (
              <Card className="mb-4 bg-[#1c1f26] border border-gray-700">
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2 text-white">
                      <BookOpen className="h-4 w-4 text-green-400" />
                      選択されたニュース ({selectedNews.length}件)
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSelectedNews(!showSelectedNews)}
                      className="text-gray-400 hover:text-white"
                    >
                      {showSelectedNews ? '折りたたむ' : '展開'}
                    </Button>
                  </div>
                </CardHeader>
                {showSelectedNews && (
                  <CardContent className="py-2">
                    <div className="flex gap-2 overflow-x-auto">
                      {selectedNews.map((article, idx) => (
                        <div
                          key={article.id}
                          className="min-w-[250px] p-3 rounded-lg border border-green-600 bg-green-500/10"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="outline" className="text-xs border-green-600 text-green-400">
                              {idx + 1}
                            </Badge>
                            <span className="text-xs text-gray-400">{article.source}</span>
                          </div>
                          <p className="text-xs font-medium line-clamp-2 text-white mb-2">{article.title}</p>
                          <p className="text-xs text-gray-400 line-clamp-2">{article.summary}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            )}



            {/* Chat Messages */}
            <Card className="flex-1 flex flex-col bg-[#1c1f26]/80 backdrop-blur-sm border border-gray-700 shadow-lg rounded-2xl">
              <ScrollArea className="flex-1 p-6">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="p-4 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                      <Sparkles className="h-10 w-10 text-sky-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">「{mode.name}」について学習を始めましょう</h3>
                    <p className="text-gray-400">質問を入力してAIと対話を開始してください</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((message, idx) => (
                      <div
                        key={idx}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-6 py-4 shadow-sm ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white ml-auto shadow-lg'
                              : 'bg-[#1c1f26] border border-gray-600 text-gray-300 mr-auto shadow-md'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {message.role === 'assistant' && (
                              <div className="w-8 h-8 bg-gradient-to-br from-sky-500/20 to-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <Bot className="h-4 w-4 text-sky-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                              <div className={`text-xs text-gray-500 mt-2 ${
                                message.role === 'user' ? 'text-right' : 'text-left'
                              }`}>
                                {message.timestamp.toLocaleTimeString('ja-JP', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </div>
                            {message.role === 'user' && (
                              <div className="w-8 h-8 bg-gradient-to-br from-sky-500/20 to-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <User className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              <div className="p-6 border-t border-gray-700">
                <div className="flex gap-3">
                  <Input
                    placeholder="質問を入力..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={isLoading}
                    className="flex-1 border-gray-600 bg-[#1c1f26] text-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm"
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={isLoading}
                    className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white rounded-xl shadow-md px-6"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Review Panel */}
          {showReview && review && (
            <Card className="w-96">
              <CardHeader>
                <CardTitle className="text-lg">学習レビュー</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">{review.title}</h3>
                  <p className="text-sm text-gray-600">{review.summary}</p>
                </div>

                {review.keyPoints && (
                  <div>
                    <h4 className="font-medium mb-2">重要ポイント</h4>
                    <ul className="space-y-1">
                      {review.keyPoints.map((point: string, idx: number) => (
                        <li key={idx} className="text-sm flex items-start">
                          <span className="mr-2">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {review.insights && (
                  <div>
                    <h4 className="font-medium mb-2">洞察</h4>
                    <p className="text-sm text-gray-600">{review.insights}</p>
                  </div>
                )}

                {review.nextSteps && (
                  <div>
                    <h4 className="font-medium mb-2">次のステップ</h4>
                    <div className="space-y-1">
                      {review.nextSteps.map((step: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="mr-2">
                          {step}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}