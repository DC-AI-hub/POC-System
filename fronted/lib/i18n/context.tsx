"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { Language, translations, Translations } from './translations'

const LANGUAGE_STORAGE_KEY = 'poc-system-language'

interface I18nContextType {
  language: Language
  isLoading: boolean
  t: Translations
  translate: (key: string, fallback?: string) => string
  changeLanguage: (newLanguage: Language) => void
  toggleLanguage: () => void
  getLanguageDisplayName: (lang: Language) => string
  isRTL: () => boolean
  isZh: boolean
  isEn: boolean
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguage] = useState<Language>('zh')
  const [isLoading, setIsLoading] = useState(true)

  // Initialize language from localStorage or browser preference
  useEffect(() => {
    const initializeLanguage = () => {
      try {
        // Try to get from localStorage first
        const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language
        if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
          setLanguage(savedLanguage)
          return
        }

        // Fallback to browser language detection
        const browserLanguage = navigator.language.toLowerCase()
        if (browserLanguage.startsWith('zh')) {
          setLanguage('zh')
        } else {
          setLanguage('en')
        }
      } catch (error) {
        console.warn('Failed to initialize language:', error)
        setLanguage('zh') // Default fallback
      } finally {
        setIsLoading(false)
      }
    }

    initializeLanguage()
  }, [])

  // Change language
  const changeLanguage = useCallback((newLanguage: Language) => {
    setLanguage(newLanguage)
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage)
    } catch (error) {
      console.warn('Failed to save language preference:', error)
    }
  }, [])

  // Toggle between languages
  const toggleLanguage = useCallback(() => {
    const newLanguage = language === 'zh' ? 'en' : 'zh'
    changeLanguage(newLanguage)
  }, [language, changeLanguage])

  // Get current translations
  const t = translations[language]

  // Translation function with nested key support
  const translate = useCallback((key: string, fallback?: string): string => {
    try {
      const keys = key.split('.')
      let value: any = translations[language]
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k]
        } else {
          return fallback || key
        }
      }
      
      return typeof value === 'string' ? value : fallback || key
    } catch (error) {
      console.warn('Translation error:', error)
      return fallback || key
    }
  }, [language])

  // Get language display name
  const getLanguageDisplayName = useCallback((lang: Language): string => {
    return lang === 'zh' ? '简体中文' : 'English'
  }, [])

  // Check if current language is RTL (for future support)
  const isRTL = useCallback(() => {
    return false // Neither Chinese nor English are RTL
  }, [])

  const contextValue: I18nContextType = {
    language,
    isLoading,
    t,
    translate,
    changeLanguage,
    toggleLanguage,
    getLanguageDisplayName,
    isRTL,
    isZh: language === 'zh',
    isEn: language === 'en'
  }

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18nContext() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18nContext must be used within an I18nProvider')
  }
  return context
}

// Helper hook for specific translation sections
export function useTranslation(section?: keyof Translations) {
  const { t, translate, ...rest } = useI18nContext()
  
  const sectionT = section ? t[section] : t
  
  return {
    t: sectionT,
    translate,
    ...rest
  }
} 