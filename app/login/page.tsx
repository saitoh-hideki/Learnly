'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // プロトタイプ用にダッシュボードにリダイレクト
    router.push('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">プロトタイプモード</h1>
        <p className="text-gray-600">ダッシュボードにリダイレクトしています...</p>
      </div>
    </div>
  )
} 