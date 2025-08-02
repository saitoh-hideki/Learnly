import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sparkles, User, Settings, LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store/useStore'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Learnly - AIと学び、思考し、提案する力を',
  description: 'AIを活用した自学自習支援プラットフォーム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className="dark">
      <body className={`${inter.className} bg-[#0d1117] text-gray-300 min-h-screen`}>
        <div className="flex flex-col min-h-screen">
          {/* Global Navigation */}
          <nav className="bg-[#0d1117] border-b border-gray-700 px-4 py-3">
            <div className="container mx-auto flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                  Learnly
                </h1>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-6">
                <a href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  ダッシュボード
                </a>
                <a href="/news-dashboard" className="text-gray-300 hover:text-white transition-colors">
                  ニュースで学ぶ
                </a>
                <a href="/news-stock" className="text-gray-300 hover:text-white transition-colors">
                  ニュース保存
                </a>
                <a href="/review-stock" className="text-gray-300 hover:text-white transition-colors">
                  レビュー
                </a>
                <a href="/theme-selection" className="text-gray-300 hover:text-white transition-colors">
                  テーマ
                </a>
                <a href="/settings" className="text-gray-300 hover:text-white transition-colors">
                  設定
                </a>
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-300 hover:text-white hover:bg-gray-800 rounded-xl"
                >
                  <User className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-300 hover:text-white hover:bg-gray-800 rounded-xl"
                >
                  <Settings className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-300 hover:text-white hover:bg-gray-800 rounded-xl md:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
