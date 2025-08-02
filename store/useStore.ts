import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Mode {
  id: string
  name: string
  description: string
  icon: string
  popularity: number
  features?: string[]
}

export interface ChatSession {
  id: string
  modeId: string
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }>
  createdAt: Date
  updatedAt: Date
}

export interface Review {
  id: string
  sessionId: string
  title: string
  content: string
  summary: string
  createdAt: Date
  source?: string
}

export interface NewsTopic {
  id: string
  name: string
  description: string
  icon: string
}

export interface NewsArticle {
  id: string
  title: string
  summary: string
  url: string
  source: string
  category: string
  publishedAt: string
  topics: string[]
  createdAt: Date
}

export interface NewsSettings {
  autoFetch: boolean
  fetchTime: string // HH:mm format
  fetchDays: number[] // 0-6 (Sunday-Saturday)
  fetchInterval: 'daily' | 'weekly' | 'manual'
  lastFetchAt?: Date
  nextFetchAt?: Date
}

interface AppState {
  // User preferences
  selectedMode: Mode | null
  recentModes: Mode[]
  selectedNewsTopics: string[]
  
  // Chat sessions
  currentSession: ChatSession | null
  sessions: ChatSession[]
  
  // Reviews
  reviews: Review[]
  
  // News
  newsArticles: NewsArticle[]
  newsSettings: NewsSettings
  
  // Actions
  setSelectedMode: (mode: Mode) => void
  addRecentMode: (mode: Mode) => void
  setSelectedNewsTopics: (topics: string[]) => void
  createSession: (modeId: string) => ChatSession
  addMessage: (sessionId: string, message: { role: 'user' | 'assistant'; content: string }) => void
  saveReview: (review: Omit<Review, 'id' | 'createdAt'>) => void
  getReviews: () => Review[]
  
  // News actions
  addNewsArticles: (articles: Omit<NewsArticle, 'id' | 'createdAt'>[]) => void
  updateNewsSettings: (settings: Partial<NewsSettings>) => void
  getNewsArticles: (filters?: { category?: string; topics?: string[]; dateRange?: { start: Date; end: Date } }) => NewsArticle[]
  clearOldNews: (daysToKeep: number) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedMode: null,
      recentModes: [],
      selectedNewsTopics: [],
      currentSession: null,
      sessions: [],
      reviews: [],
      newsArticles: [],
      newsSettings: {
        autoFetch: true,
        fetchTime: '09:00',
        fetchDays: [1, 2, 3, 4, 5], // Monday to Friday
        fetchInterval: 'daily',
        lastFetchAt: undefined,
        nextFetchAt: undefined
      },
      
      // Actions
      setSelectedMode: (mode) => set((state) => {
        const updatedRecentModes = [
          mode,
          ...state.recentModes.filter(m => m.id !== mode.id)
        ].slice(0, 5)
        
        return {
          selectedMode: mode,
          recentModes: updatedRecentModes
        }
      }),
      
      addRecentMode: (mode) => set((state) => ({
        recentModes: [
          mode,
          ...state.recentModes.filter(m => m.id !== mode.id)
        ].slice(0, 5)
      })),
      
      setSelectedNewsTopics: (topics) => set({ selectedNewsTopics: topics }),
      
      createSession: (modeId) => {
        const newSession: ChatSession = {
          id: `session-${Date.now()}`,
          modeId,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        set((state) => ({
          currentSession: newSession,
          sessions: [...state.sessions, newSession]
        }))
        
        return newSession
      },
      
      addMessage: (sessionId, message) => set((state) => ({
        sessions: state.sessions.map(session =>
          session.id === sessionId
            ? {
                ...session,
                messages: [...session.messages, { ...message, timestamp: new Date() }],
                updatedAt: new Date()
              }
            : session
        ),
        currentSession: state.currentSession?.id === sessionId
          ? {
              ...state.currentSession,
              messages: [...state.currentSession.messages, { ...message, timestamp: new Date() }],
              updatedAt: new Date()
            }
          : state.currentSession
      })),
      
      saveReview: (review) => set((state) => {
        const newReview: Review = {
          ...review,
          id: `review-${Date.now()}`,
          createdAt: new Date()
        }
        
        return {
          reviews: [newReview, ...state.reviews]
        }
      }),
      
      getReviews: () => get().reviews,
      
      // News actions
      addNewsArticles: (articles) => set((state) => {
        const newArticles: NewsArticle[] = articles.map(article => ({
          ...article,
          id: `news-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date()
        }))
        
        // Calculate next fetch time
        const settings = state.newsSettings
        let nextFetch: Date | undefined = undefined
        
        if (settings.autoFetch && settings.fetchInterval !== 'manual') {
          const now = new Date()
          const [hours, minutes] = settings.fetchTime.split(':').map(Number)
          
          let nextFetchTime = new Date()
          nextFetchTime.setHours(hours, minutes, 0, 0)
          
          // If today's time has passed, move to next valid day
          if (nextFetchTime <= now) {
            nextFetchTime.setDate(nextFetchTime.getDate() + 1)
          }
          
          // If fetchInterval is weekly, find next valid day
          if (settings.fetchInterval === 'weekly') {
            while (!settings.fetchDays.includes(nextFetchTime.getDay())) {
              nextFetchTime.setDate(nextFetchTime.getDate() + 1)
            }
          }
          
          nextFetch = nextFetchTime
        }
        
        return {
          newsArticles: [...newArticles, ...state.newsArticles],
          newsSettings: {
            ...state.newsSettings,
            lastFetchAt: new Date(),
            nextFetchAt: nextFetch
          }
        }
      }),
      
      updateNewsSettings: (settings) => set((state) => {
        const updatedSettings = { ...state.newsSettings, ...settings }
        
        // Calculate next fetch time
        let nextFetch: Date | undefined = undefined
        
        if (updatedSettings.autoFetch && updatedSettings.fetchInterval !== 'manual') {
          const now = new Date()
          const [hours, minutes] = updatedSettings.fetchTime.split(':').map(Number)
          
          let nextFetchTime = new Date()
          nextFetchTime.setHours(hours, minutes, 0, 0)
          
          // If today's time has passed, move to next valid day
          if (nextFetchTime <= now) {
            nextFetchTime.setDate(nextFetchTime.getDate() + 1)
          }
          
          // If fetchInterval is weekly, find next valid day
          if (updatedSettings.fetchInterval === 'weekly') {
            while (!updatedSettings.fetchDays.includes(nextFetchTime.getDay())) {
              nextFetchTime.setDate(nextFetchTime.getDate() + 1)
            }
          }
          
          nextFetch = nextFetchTime
        }
        
        return {
          newsSettings: {
            ...updatedSettings,
            nextFetchAt: nextFetch
          }
        }
      }),
      
      getNewsArticles: (filters = {}) => {
        const state = get()
        let articles = [...state.newsArticles]
        
        if (filters.category) {
          articles = articles.filter(article => article.category === filters.category)
        }
        
        if (filters.topics && filters.topics.length > 0) {
          articles = articles.filter(article => 
            article.topics.some(topic => filters.topics!.includes(topic))
          )
        }
        
        if (filters.dateRange) {
          articles = articles.filter(article => {
            const articleDate = new Date(article.publishedAt)
            return articleDate >= filters.dateRange!.start && articleDate <= filters.dateRange!.end
          })
        }
        
        return articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      },
      
      clearOldNews: (daysToKeep) => set((state) => {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
        
        return {
          newsArticles: state.newsArticles.filter(article => 
            new Date(article.createdAt) > cutoffDate
          )
        }
      })
    }),
    {
      name: 'learnly-storage',
      partialize: (state) => ({
        recentModes: state.recentModes,
        selectedNewsTopics: state.selectedNewsTopics,
        sessions: state.sessions,
        reviews: state.reviews,
        newsArticles: state.newsArticles,
        newsSettings: state.newsSettings
      })
    }
  )
)