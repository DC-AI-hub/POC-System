"use client"

import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Globe, Check } from 'lucide-react'
import { useI18nContext } from '@/lib/i18n/context'
import { Language } from '@/lib/i18n/translations'

interface LanguageSwitcherProps {
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'sm' | 'default' | 'lg'
  showText?: boolean
  className?: string
}

export function LanguageSwitcher({ 
  variant = 'outline', 
  size = 'sm', 
  showText = true,
  className = ''
}: LanguageSwitcherProps) {
  const { language, changeLanguage, getLanguageDisplayName, isLoading } = useI18nContext()

  const languages: { code: Language; name: string; nativeName: string }[] = [
    { code: 'zh', name: 'Chinese', nativeName: '简体中文' },
    { code: 'en', name: 'English', nativeName: 'English' }
  ]

  if (isLoading) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        disabled
        className={className}
      >
        <Globe className="w-4 h-4 mr-2" />
        {showText && <span className="hidden sm:inline">...</span>}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={className}
        >
          <Globe className="w-4 h-4 mr-2" />
          {showText && (
            <>
              <span className="hidden sm:inline">{getLanguageDisplayName(language)}</span>
              <span className="sm:hidden">{language === 'zh' ? '中文' : 'EN'}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="font-medium">{lang.nativeName}</span>
              <span className="text-xs text-gray-500">{lang.name}</span>
            </div>
            {language === lang.code && (
              <Check className="w-4 h-4 text-blue-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Simple toggle button variant
export function LanguageToggle({ 
  variant = 'outline', 
  size = 'sm',
  className = ''
}: Omit<LanguageSwitcherProps, 'showText'>) {
  const { language, toggleLanguage, isLoading } = useI18nContext()

  if (isLoading) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        disabled
        className={className}
      >
        <Globe className="w-4 h-4 mr-2" />
        <span>...</span>
      </Button>
    )
  }

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={toggleLanguage}
      className={className}
    >
      <Globe className="w-4 h-4 mr-2" />
      <span className="hidden sm:inline">
        {language === 'zh' ? '简体中文' : 'English'}
      </span>
      <span className="sm:hidden">
        {language === 'zh' ? '中文' : 'EN'}
      </span>
    </Button>
  )
} 