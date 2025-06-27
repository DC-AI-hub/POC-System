"use client"

import { useState, useEffect, useCallback } from 'react'
import { Language, translations, Translations } from '@/lib/i18n/translations'

const LANGUAGE_STORAGE_KEY = 'poc-system-language'

export function useI18n() {
  const [language, setLanguage] = useState<Language>('zh')
  const [isLoading, setIsLoading] = useState(true)
  const [renderKey, setRenderKey] = useState(0)

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

  // Debug: Log language changes
  useEffect(() => {
    console.log('🔄 Language state changed to:', language)
  }, [language])

  // Change language
  const changeLanguage = useCallback((newLanguage: Language) => {
    console.log('🌐 Changing language to:', newLanguage)
    setLanguage(newLanguage)
    setRenderKey(prev => prev + 1) // Force re-render
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage)
      console.log('✅ Language saved to localStorage:', newLanguage)
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

  return {
    language,
    isLoading,
    t,
    translate,
    changeLanguage,
    toggleLanguage,
    getLanguageDisplayName,
    isRTL,
    isZh: language === 'zh',
    isEn: language === 'en',
    renderKey // Include render key for debugging
  }
}

// Helper hook for specific translation sections
export function useTranslation(section?: keyof Translations) {
  const { t, translate, ...rest } = useI18n()
  
  const sectionT = section ? t[section] : t
  
  return {
    t: sectionT,
    translate,
    ...rest
  }
} 