"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, XCircle, ArrowLeft, AlertCircle } from 'lucide-react'
import { useOAuth2Auth } from '@/hooks/use-oauth2-auth'
import { getProviderDisplayInfo } from '@/lib/auth/oauth2-utils'

export default function OAuth2CallbackPage() {
  const router = useRouter()
  const params = useParams()
  const { handleCallback, loading, error } = useOAuth2Auth()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [message, setMessage] = useState('')

  const provider = params.provider as string
  const providerInfo = getProviderDisplayInfo(provider)

  useEffect(() => {
    const processCallback = async () => {
      if (typeof window === 'undefined') return

      const currentUrl = window.location.href
      
      try {
        setStatus('processing')
        setMessage('正在验证您的身份...')
        
        const result = await handleCallback(currentUrl, provider)
        
        if (result.success) {
          setStatus('success')
          setMessage('登录成功！正在跳转...')
          
          // Redirect to main app after successful authentication
          setTimeout(() => {
            router.push('/')
          }, 2000)
        } else {
          setStatus('error')
          setMessage(result.error || '认证失败，请重试')
        }
      } catch (error) {
        setStatus('error')
        setMessage(error instanceof Error ? error.message : '认证过程中出现错误')
      }
    }

    processCallback()
  }, [handleCallback, provider, router])

  const handleRetry = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <span className="text-2xl">{providerInfo.icon}</span>
            {providerInfo.name} 登录
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {status === 'processing' && (
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600" />
              <div>
                <p className="font-medium">{message}</p>
                <p className="text-sm text-gray-600 mt-1">
                  请稍候，这可能需要几秒钟...
                </p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircle className="w-12 h-12 mx-auto text-green-600" />
              <div>
                <p className="font-medium text-green-800">{message}</p>
                <p className="text-sm text-gray-600 mt-1">
                  欢迎回来！
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="text-center">
                <XCircle className="w-12 h-12 mx-auto text-red-600" />
                <p className="font-medium text-red-800 mt-2">认证失败</p>
              </div>
              
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {message}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Button 
                  onClick={handleRetry}
                  className="w-full"
                >
                  返回登录页面
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  重试认证
                </Button>
              </div>
            </div>
          )}

          {/* Debug Info in Development */}
          {process.env.NODE_ENV === 'development' && (
            <details className="text-xs text-gray-500">
              <summary className="cursor-pointer">调试信息</summary>
              <div className="mt-2 p-2 bg-gray-100 rounded">
                <p>Provider: {provider}</p>
                <p>URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
                <p>Status: {status}</p>
                <p>Loading: {loading.toString()}</p>
                <p>Error: {error || 'None'}</p>
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 