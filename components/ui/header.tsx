'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store/useStore'
import { useLabels } from '@/lib/kidsLabels'
import { 
  Home, 
  Settings, 
  Sun, 
  Moon, 
  Baby, 
  User,
  Sparkles
} from 'lucide-react'

interface HeaderProps {
  showHomeButton?: boolean
  showSettingsButton?: boolean
  title?: string
}

export function Header({ 
  showHomeButton = true, 
  showSettingsButton = true, 
  title 
}: HeaderProps) {
  const router = useRouter()
  const { isKidsMode, toggleKidsMode } = useStore()
  const labels = useLabels(isKidsMode)

  const handleHomeClick = () => {
    router.push('/')
  }

  const handleSettingsClick = () => {
    router.push('/settings')
  }

  return (
    <header className="bg-[#0e1a2a]/80 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {showHomeButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleHomeClick}
                className="text-slate-300 hover:text-white hover:bg-slate-700/50"
              >
                <Home className="h-4 w-4 mr-2" />
                {isKidsMode ? 'ホーム' : 'ホーム'}
              </Button>
            )}
            
            {title && (
              <h1 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-400" />
                {title}
              </h1>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* キッズモード切り替えボタン */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleKidsMode}
              className={`text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 ${
                isKidsMode ? 'bg-blue-500/20 text-blue-300' : ''
              }`}
            >
              {isKidsMode ? (
                <>
                  <Baby className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">キッズモード</span>
                </>
              ) : (
                <>
                  <User className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">通常モード</span>
                </>
              )}
            </Button>

            {showSettingsButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSettingsClick}
                className="text-slate-300 hover:text-white hover:bg-slate-700/50"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 