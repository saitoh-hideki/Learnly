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
import { motion } from 'framer-motion'

type Message = {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// アニメーション変数
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const
    }
  }
}

const cardHoverVariants = {
  rest: { 
    scale: 1,
    y: 0,
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
  },
  hover: { 
    scale: 1.02,
    y: -4,
    boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
    transition: {
      duration: 0.3,
      ease: "easeOut" as const
    }
  }
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

  // 学習方法の定義
  const learningMethods = {
    'discussion': {
      name: 'Discussion',
      description: 'AIと対話しながら深く学び、振り返る力を育む',
      icon: Sparkles,
      initialPrompt: 'このニュースについて、AIと対話しながら深く学び、振り返る力を育みましょう。'
    },
    'action': {
      name: 'Action',
      description: '自分にできるアクションや提案をまとめる',
      icon: FileText,
      initialPrompt: 'このニュースについて、自分にできるアクションや提案をまとめましょう。'
    }
  }

  const mode = learningModes.find(m => m.id === modeId) || learningMethods[modeId as keyof typeof learningMethods]

  useEffect(() => {
    if (mode && !currentSession) {
      // 学習方法の場合はmodeIdをそのまま使用、そうでなければmode.idを使用
      const sessionId = 'id' in mode ? mode.id : modeId
      createSession(sessionId)
    }
  }, [mode, currentSession, modeId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // クエリパラメータから選択されたニュースを取得
  useEffect(() => {
    const newsIds = searchParams.get('newsIds')
    const newsId = searchParams.get('newsId')
    const category = searchParams.get('category')
    
    if (newsIds && !hasInitialized && currentSession) {
      setHasInitialized(true)
      // 選択されたニュースを取得
      fetchSelectedNews(newsIds.split(','))
    } else if (newsId && !hasInitialized && currentSession) {
      setHasInitialized(true)
      // 単一のニュースを取得
      fetchSelectedNews([newsId])
    }
  }, [searchParams, hasInitialized, currentSession])

  const fetchSelectedNews = async (newsIds: string[]) => {
    try {
      const response = await fetch('/api/saved-news')
      if (response.ok) {
        const { savedNews } = await response.json()
        const selected = savedNews.filter((news: any) => newsIds.includes(news.id))
        setSelectedNews(selected)
        
        // 学習方法の場合、初期メッセージを自動送信
        if (learningMethods[modeId as keyof typeof learningMethods] && selected.length > 0) {
          const method = learningMethods[modeId as keyof typeof learningMethods]
          const initialMessage = `${method.initialPrompt}\n\n選択されたニュース:\n${selected.map((article: any, index: number) => 
            `【${index + 1}】${article.title}\n${article.summary}`
          ).join('\n\n')}`
          
          // 初期メッセージを自動送信
          setTimeout(() => {
            setInput(initialMessage)
            // sendMessageは引数を取らないので、inputを設定してから呼び出す
            setInput(initialMessage)
            // 次のレンダリングサイクルでsendMessageを呼び出す
            setTimeout(() => {
              sendMessage()
            }, 100)
          }, 1000)
        }
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
      let systemPrompt = ''

      if (isFirstMessage && selectedNews.length > 0) {
        const newsContext = selectedNews.map((news, idx) => 
          `${idx + 1}. ${news.title}\n${news.summary}`
        ).join('\n\n')
        systemPrompt += `\n\n以下のニュース記事について学習を進めてください：\n\n${newsContext}`
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          systemPrompt: systemPrompt,
          sessionId: currentSession?.id
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        }

        setMessages(prev => [...prev, assistantMessage])

        if (currentSession) {
          addMessage(currentSession.id, {
            role: assistantMessage.role,
            content: assistantMessage.content
          })
        }
      } else {
        console.error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateReview = async () => {
    if (messages.length === 0 || isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'この学習セッションの内容をまとめて、レビューを生成してください。',
          systemPrompt: '学習セッションの内容を分析し、以下の形式でレビューを生成してください：\n- タイトル\n- 要約\n- 重要ポイント（箇条書き）\n- 洞察\n- 次のステップ',
          sessionId: currentSession?.id
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setReview({
          title: '学習レビュー',
          summary: data.response,
          keyPoints: [],
          insights: '',
          nextSteps: []
        })
        setShowReview(true)

        if (currentSession) {
          saveReview({
            sessionId: currentSession.id,
            title: '学習レビュー',
            content: data.response,
            summary: data.response
          })
        }
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
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-between mb-4 bg-[#1c1f26]/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-gray-700"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard')}
              className="hover:bg-gray-800 rounded-xl text-gray-300 hover:text-white transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 rounded-xl">
                {'icon' in mode && typeof mode.icon === 'string' ? (
                  <span className="text-2xl">{mode.icon}</span>
                ) : 'icon' in mode && typeof mode.icon === 'function' ? (
                  <mode.icon className="h-6 w-6 text-white" />
                ) : (
                  <BookOpen className="h-6 w-6 text-white" />
                )}
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
              className="border-gray-600 hover:border-indigo-400 hover:bg-indigo-500/10 rounded-xl text-gray-300 hover:text-white transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/20"
            >
              <FileText className="h-4 w-4 mr-2" />
              保存済みレビュー
            </Button>
            <Button
              onClick={generateReview}
              disabled={messages.length === 0 || isLoading}
              className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white rounded-xl shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-sky-500/20"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              レビュー生成
            </Button>
          </div>
        </motion.div>

        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Selected News Section */}
            {selectedNews.length > 0 && (
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
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
                        className="text-gray-400 hover:text-white transition-all duration-200 hover:scale-105"
                      >
                        {showSelectedNews ? '折りたたむ' : '展開'}
                      </Button>
                    </div>
                  </CardHeader>
                  {showSelectedNews && (
                    <CardContent className="py-2">
                      <div className="flex gap-2 overflow-x-auto">
                        {selectedNews.map((article, idx) => (
                          <motion.div
                            key={article.id}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                            className="min-w-[250px] p-3 rounded-lg border-2 border-green-500/50 bg-gradient-to-br from-green-500/10 to-emerald-500/10 hover:border-green-400 hover:bg-gradient-to-br hover:from-green-500/20 hover:to-emerald-500/20 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/20"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <Badge variant="outline" className="text-xs border-green-500 text-green-400 bg-green-500/20">
                                {idx + 1}
                              </Badge>
                              <span className="text-xs text-gray-400">{article.source}</span>
                            </div>
                            <p className="text-xs font-medium line-clamp-2 text-white mb-2 group-hover:text-green-300 transition-colors">{article.title}</p>
                            <p className="text-xs text-gray-400 line-clamp-2 group-hover:text-gray-300 transition-colors">{article.summary}</p>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            )}

            {/* Chat Messages */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex-1 flex flex-col"
            >
              <Card className="flex-1 flex flex-col bg-[#1c1f26]/80 backdrop-blur-sm border border-gray-700 shadow-lg rounded-2xl">
                <ScrollArea className="flex-1 p-6">
                  {messages.length === 0 ? (
                    <motion.div
                      variants={itemVariants}
                      className="text-center py-12 text-gray-400"
                    >
                      <div className="p-4 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                        <Sparkles className="h-10 w-10 text-sky-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">「{mode.name}」について学習を始めましょう</h3>
                      <p className="text-gray-400">質問を入力してAIと対話を開始してください</p>
                    </motion.div>
                  ) : (
                    <div className="space-y-6">
                      {messages.map((message, idx) => (
                        <motion.div
                          key={idx}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <motion.div
                            variants={cardHoverVariants}
                            initial="rest"
                            whileHover="hover"
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
                          </motion.div>
                        </motion.div>
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
                      className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white rounded-xl shadow-md px-6 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-sky-500/20"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Review Panel */}
          {showReview && review && (
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
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
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
} 