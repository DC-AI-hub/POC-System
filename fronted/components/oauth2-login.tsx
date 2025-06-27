"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, Loader2, Shield, Check } from 'lucide-react'
import { useOAuth2Auth } from '@/hooks/use-oauth2-auth'
import { getProviderDisplayInfo } from '@/lib/auth/oauth2-utils'

interface OAuth2LoginProps {
  onSuccess?: () => void
  showTitle?: boolean
  compact?: boolean
}

export function OAuth2Login({ onSuccess, showTitle = true, compact = false }: OAuth2LoginProps) {
  const { providers, startAuth, loading, error } = useOAuth2Auth()
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)

  const handleProviderLogin = async (providerId: string) => {
    setSelectedProvider(providerId)
    try {
      await startAuth(providerId)
      onSuccess?.()
    } catch (error) {
      console.error('OAuth2 login failed:', error)
      setSelectedProvider(null)
    }
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-2 gap-2">
          {providers.slice(0, 4).map((provider) => {
            const displayInfo = getProviderDisplayInfo(provider.id)
            const isLoading = loading && selectedProvider === provider.id
            
            return (
              <Button
                key={provider.id}
                variant="outline"
                size="sm"
                onClick={() => handleProviderLogin(provider.id)}
                disabled={loading}
                className="h-9 text-xs"
              >
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <span className="mr-1">{displayInfo.icon}</span>
                    {displayInfo.name}
                  </>
                )}
              </Button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      {showTitle && (
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-blue-600" />
            OAuth2 身份认证
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            选择您偏好的登录方式
          </p>
        </CardHeader>
      )}
      
      <CardContent className="space-y-4">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {/* Popular Providers */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">常用登录</span>
            <Separator className="flex-1" />
          </div>
          
          <div className="grid gap-2">
            {providers.filter(p => ['google', 'microsoft', 'github'].includes(p.id)).map((provider) => {
              const displayInfo = getProviderDisplayInfo(provider.id)
              const isLoading = loading && selectedProvider === provider.id
              
              return (
                <Button
                  key={provider.id}
                  variant="outline"
                  onClick={() => handleProviderLogin(provider.id)}
                  disabled={loading}
                  className="w-full h-11 justify-start gap-3 text-left"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <span className="text-lg">{displayInfo.icon}</span>
                  )}
                  <span className="flex-1">使用 {displayInfo.name} 登录</span>
                  {provider.id === 'google' && (
                    <Badge variant="secondary" className="text-xs">推荐</Badge>
                  )}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Chinese Providers */}
        {providers.filter(p => ['wechat', 'dingtalk'].includes(p.id)).length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">国内登录</span>
              <Separator className="flex-1" />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {providers.filter(p => ['wechat', 'dingtalk'].includes(p.id)).map((provider) => {
                const displayInfo = getProviderDisplayInfo(provider.id)
                const isLoading = loading && selectedProvider === provider.id
                
                return (
                  <Button
                    key={provider.id}
                    variant="outline"
                    onClick={() => handleProviderLogin(provider.id)}
                    disabled={loading}
                    className="h-10 gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>{displayInfo.icon}</span>
                        {displayInfo.name}
                      </>
                    )}
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800">
              <p className="font-medium mb-1">安全保障</p>
              <p>我们使用 OAuth2 标准协议保护您的账户安全，不会存储您的密码信息。</p>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="text-center text-xs text-gray-500">
          继续登录即表示您同意我们的{' '}
          <button className="text-blue-600 hover:underline">服务条款</button>{' '}
          和{' '}
          <button className="text-blue-600 hover:underline">隐私政策</button>
        </div>
      </CardContent>
    </Card>
  )
}

// Provider Status Component
export function OAuth2ProviderStatus() {
  const { providers } = useOAuth2Auth()
  
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">支持的登录方式</h3>
      <div className="grid grid-cols-2 gap-2">
        {providers.map((provider) => {
          const displayInfo = getProviderDisplayInfo(provider.id)
          const isConfigured = Boolean(provider.clientId)
          
          return (
            <div
              key={provider.id}
              className={`flex items-center gap-2 p-2 rounded-lg border ${
                isConfigured 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <span>{displayInfo.icon}</span>
              <span className="text-sm flex-1">{displayInfo.name}</span>
              {isConfigured ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-gray-400" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
} 