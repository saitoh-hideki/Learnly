'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  MessageSquare, 
  Check, 
  Users, 
  Zap, 
  Globe, 
  Target, 
  ChevronRight, 
  Play, 
  Shield, 
  Clock, 
  Award,
  ChevronDown,
  ExternalLink,
  Github,
  Twitter,
  Youtube,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/ui/header'
import { useStore } from '@/store/useStore'
import { useLabels } from '@/lib/kidsLabels'
import { learningModes } from '@/data/modes'

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

export default function LandingPage() {
  const router = useRouter()
  const { isKidsMode } = useStore()
  const labels = useLabels(isKidsMode)
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [particles, setParticles] = useState<Array<{
    id: number;
    left: string;
    top: string;
    animationDelay: string;
    animationDuration: string;
  }>>([])

  useEffect(() => {
    setMounted(true)
    // クライアントサイドでのみパーティクルを生成
    const generatedParticles = [...Array(20)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 2}s`,
      animationDuration: `${2 + Math.random() * 3}s`
    }))
    setParticles(generatedParticles)
  }, [])

  const handleGetStarted = () => {
    router.push('/dashboard')
  }

  const toggleFAQ = (index: number) => {
    setActiveFAQ(activeFAQ === index ? null : index)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0e1a2a] relative overflow-hidden">
      <Header showHomeButton={false} />
      
      {/* Background with particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-sky-500/8 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-t from-blue-600/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-br from-indigo-500/3 to-purple-500/3 rounded-full blur-3xl"></div>
        <div className="absolute top-2/3 right-1/3 w-48 h-48 bg-gradient-to-bl from-emerald-500/2 to-teal-500/2 rounded-full blur-2xl"></div>
        
        {/* Floating particles */}
        {mounted && (
          <div className="absolute inset-0">
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="absolute w-1 h-1 bg-white/8 rounded-full animate-pulse blur-sm"
                style={{
                  left: particle.left,
                  top: particle.top,
                  animationDelay: particle.animationDelay,
                  animationDuration: particle.animationDuration
                }}
              />
            ))}
          </div>
        )}
      </div>

      <motion.div 
        className="relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <motion.div 
            className="text-center mb-16"
            variants={itemVariants}
          >
            <motion.div
              className="flex items-center justify-center gap-3 mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="p-3 bg-gradient-to-br from-sky-500 to-cyan-400 rounded-2xl shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <span className="text-4xl font-bold text-white">Learnly</span>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {labels.hero.title}
            </motion.h1>
            
            <motion.p 
              className="text-xl text-slate-400 mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              {labels.hero.description}
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <Button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-sky-500 hover:to-cyan-400 text-black text-lg px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition-all duration-300"
              >
                {labels.buttons.startFree}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 hover:border-cyan-400 hover:text-cyan-300 text-lg px-8 py-4 rounded-xl backdrop-blur-sm"
              >
                <Play className="mr-2 h-5 w-5" />
                {isKidsMode ? "ためしに みてみよう" : "デモを見る"}
              </Button>
            </motion.div>
          </motion.div>

          {/* Features Section */}
          <motion.div 
            className="mb-16"
            variants={itemVariants}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                {labels.features.title}
              </h2>
              <p className="text-lg text-slate-400">
                {labels.features.subtitle}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                variants={cardHoverVariants}
                initial="rest"
                whileHover="hover"
              >
                <Card className="bg-slate-800/50 border-slate-600 h-full">
                  <CardHeader>
                    <div className="p-3 bg-blue-500/20 rounded-lg w-fit mb-4">
                      <BookOpen className="h-6 w-6 text-blue-400" />
                    </div>
                    <CardTitle className="text-white text-xl">
                      {isKidsMode ? "ニュースから まなぼう" : "ニュースで学ぶ"}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      {isKidsMode ? "まいにちの ニュースを つかって べんきょうしよう" : "毎日のニュースを教材に学習"}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
              
              <motion.div
                variants={cardHoverVariants}
                initial="rest"
                whileHover="hover"
              >
                <Card className="bg-slate-800/50 border-slate-600 h-full">
                  <CardHeader>
                    <div className="p-3 bg-green-500/20 rounded-lg w-fit mb-4">
                      <MessageSquare className="h-6 w-6 text-green-400" />
                    </div>
                    <CardTitle className="text-white text-xl">
                      {isKidsMode ? "AIと おしゃべりして かんがえよう" : "AIと対話する"}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      {isKidsMode ? "AIと おしゃべりしながら かんがえる ちからを やしなおう" : "AIと対話しながら考える力を育む"}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
              
              <motion.div
                variants={cardHoverVariants}
                initial="rest"
                whileHover="hover"
              >
                <Card className="bg-slate-800/50 border-slate-600 h-full">
                  <CardHeader>
                    <div className="p-3 bg-purple-500/20 rounded-lg w-fit mb-4">
                      <FileText className="h-6 w-6 text-purple-400" />
                    </div>
                    <CardTitle className="text-white text-xl">
                      {isKidsMode ? "まとめを つくろう" : "レビューを作成"}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      {isKidsMode ? "まなんだ ことを まとめて じぶんの ことばで かんがえよう" : "学んだ内容をまとめて自分の言葉で考える"}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div 
            className="mb-16"
            variants={itemVariants}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                {labels.faq.title}
              </h2>
              <p className="text-lg text-slate-400">
                {labels.faq.subtitle}
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-4">
              {[
                { key: 'aiChat', question: labels.faq.questions.aiChat, answer: labels.faq.questions.aiChatAnswer },
                { key: 'noKnowledge', question: labels.faq.questions.noKnowledge, answer: labels.faq.questions.noKnowledgeAnswer },
                { key: 'cost', question: labels.faq.questions.cost, answer: labels.faq.questions.costAnswer },
                { key: 'newsTypes', question: labels.faq.questions.newsTypes, answer: labels.faq.questions.newsTypesAnswer }
              ].map((faq, index) => (
                <motion.div
                  key={faq.key}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-slate-800/50 border-slate-600">
                    <CardHeader 
                      className="cursor-pointer"
                      onClick={() => toggleFAQ(index)}
                    >
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-lg">
                          {faq.question}
                        </CardTitle>
                        <ChevronDown 
                          className={`h-5 w-5 text-slate-400 transition-transform ${
                            activeFAQ === index ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </CardHeader>
                    {activeFAQ === index && (
                      <CardContent className="pt-0">
                        <p className="text-slate-400 leading-relaxed">
                          {faq.answer}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div 
            className="text-center"
            variants={itemVariants}
          >
            <Card className="bg-gradient-to-r from-sky-500/10 to-cyan-400/10 border-sky-500/30">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  {labels.cta.title}
                </h2>
                <p className="text-lg text-slate-300 mb-6">
                  {labels.cta.description}
                </p>
                <Button
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-sky-500 hover:to-cyan-400 text-black text-lg px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition-all duration-300"
                >
                  {labels.buttons.startFree}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
} 