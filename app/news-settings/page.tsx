'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock, Calendar, Settings, Save, RefreshCw, Bell, BellOff } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useStore, NewsSettings } from '@/store/useStore'

const dayNames = ['日', '月', '火', '水', '木', '金', '土']

export default function NewsSettingsPage() {
  const router = useRouter()
  const { newsSettings, updateNewsSettings, selectedNewsTopics } = useStore()
  const [settings, setSettings] = useState<NewsSettings>(newsSettings)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setSettings(newsSettings)
  }, [newsSettings])

  const handleSave = async () => {
    setIsSaving(true)
    updateNewsSettings(settings)
    
    // 少し待ってから保存完了を表示
    setTimeout(() => {
      setIsSaving(false)
      router.push('/news-dashboard')
    }, 1000)
  }

  const handleDayToggle = (dayIndex: number) => {
    const newDays = settings.fetchDays.includes(dayIndex)
      ? settings.fetchDays.filter(d => d !== dayIndex)
      : [...settings.fetchDays, dayIndex].sort()
    
    setSettings(prev => ({
      ...prev,
      fetchDays: newDays
    }))
  }

  const formatNextFetchTime = () => {
    if (!settings.nextFetchAt) return '設定されていません'
    
    const date = new Date(settings.nextFetchAt)
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  const formatLastFetchTime = () => {
    if (!settings.lastFetchAt) return 'まだ取得していません'
    
    const date = new Date(settings.lastFetchAt)
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/news-dashboard')}
              className="text-gray-600 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl shadow-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">ニュース設定</h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Auto Fetch Settings */}
          <Card className="bg-[#1c1f26] border border-gray-700 shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-lg">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                自動取得設定
              </CardTitle>
              <CardDescription className="text-gray-400">
                ニュースの自動取得に関する設定を行います
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auto Fetch Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white">自動取得</h3>
                  <p className="text-sm text-gray-400">設定した時間に自動でニュースを取得します</p>
                </div>
                <Button
                  variant={settings.autoFetch ? "default" : "outline"}
                  onClick={() => setSettings(prev => ({ ...prev, autoFetch: !prev.autoFetch }))}
                  className={settings.autoFetch 
                    ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white" 
                    : "border-gray-600 text-gray-300 hover:border-sky-400"
                  }
                >
                  {settings.autoFetch ? <Bell className="h-4 w-4 mr-2" /> : <BellOff className="h-4 w-4 mr-2" />}
                  {settings.autoFetch ? '有効' : '無効'}
                </Button>
              </div>

              {/* Fetch Time */}
              <div className="space-y-3">
                <label className="text-lg font-medium text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-sky-500" />
                  取得時間
                </label>
                <Input
                  type="time"
                  value={settings.fetchTime}
                  onChange={(e) => setSettings(prev => ({ ...prev, fetchTime: e.target.value }))}
                  className="bg-[#2d3748] border-gray-600 text-white focus:border-sky-500 focus:ring-sky-500"
                />
              </div>

              {/* Fetch Interval */}
              <div className="space-y-3">
                <label className="text-lg font-medium text-white">取得頻度</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'daily', label: '毎日', description: '毎日取得' },
                    { value: 'weekly', label: '週間', description: '指定曜日' },
                    { value: 'manual', label: '手動', description: '手動のみ' }
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={settings.fetchInterval === option.value ? "default" : "outline"}
                      onClick={() => setSettings(prev => ({ ...prev, fetchInterval: option.value as any }))}
                      className={`h-auto p-4 flex flex-col items-center gap-2 ${
                        settings.fetchInterval === option.value 
                          ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white" 
                          : "border-gray-600 text-gray-300 hover:border-sky-400"
                      }`}
                    >
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs opacity-80">{option.description}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Weekly Days Selection */}
              {settings.fetchInterval === 'weekly' && (
                <div className="space-y-3">
                  <label className="text-lg font-medium text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-sky-500" />
                    取得曜日
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {dayNames.map((day, index) => (
                      <Button
                        key={index}
                        variant={settings.fetchDays.includes(index) ? "default" : "outline"}
                        onClick={() => handleDayToggle(index)}
                        className={`h-12 w-12 p-0 ${
                          settings.fetchDays.includes(index)
                            ? "bg-gradient-to-r from-sky-500 to-indigo-500 text-white"
                            : "border-gray-600 text-gray-300 hover:border-sky-400"
                        }`}
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Status & Actions */}
          <div className="space-y-6">
            {/* Current Status */}
            <Card className="bg-[#1c1f26] border border-gray-700 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <RefreshCw className="h-5 w-5 text-white" />
                  </div>
                  現在の状況
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">自動取得</span>
                  <Badge className={settings.autoFetch ? "bg-green-500 text-white" : "bg-gray-600 text-gray-300"}>
                    {settings.autoFetch ? '有効' : '無効'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">取得頻度</span>
                  <span className="text-white font-medium">
                    {settings.fetchInterval === 'daily' ? '毎日' : 
                     settings.fetchInterval === 'weekly' ? '週間' : '手動'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">取得時間</span>
                  <span className="text-white font-medium">{settings.fetchTime}</span>
                </div>
                
                {settings.fetchInterval === 'weekly' && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">取得曜日</span>
                    <span className="text-white font-medium">
                      {settings.fetchDays.map(d => dayNames[d]).join('、')}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">最終取得</span>
                  <span className="text-white font-medium">{formatLastFetchTime()}</span>
                </div>
                
                {settings.autoFetch && settings.fetchInterval !== 'manual' && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">次回取得</span>
                    <span className="text-white font-medium">{formatNextFetchTime()}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Manual Fetch */}
            <Card className="bg-[#1c1f26] border border-gray-700 shadow-xl rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">手動取得</CardTitle>
                <CardDescription className="text-gray-400">
                  今すぐニュースを取得します
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => router.push('/news-dashboard')}
                  className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white hover:from-sky-600 hover:to-indigo-600 rounded-xl py-3"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  今すぐニュースを取得
                </Button>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Card className="bg-[#1c1f26] border border-gray-700 shadow-xl rounded-2xl">
              <CardContent className="pt-6">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 rounded-xl py-3"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? '保存中...' : '設定を保存'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 