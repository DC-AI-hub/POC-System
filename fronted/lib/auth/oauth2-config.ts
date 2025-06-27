import { OAuth2Config } from '../types/auth'

export const oauth2Config: OAuth2Config = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  redirectPath: '/auth/callback',
  providers: [
    {
      id: 'google',
      name: 'google',
      displayName: 'Google',
      icon: '🌐',
      color: 'bg-red-500 hover:bg-red-600',
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      scope: ['openid', 'email', 'profile'],
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback/google`
    },
    {
      id: 'github',
      name: 'github',
      displayName: 'GitHub',
      icon: '🐙',
      color: 'bg-gray-800 hover:bg-gray-900',
      authUrl: 'https://github.com/login/oauth/authorize',
      clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '',
      scope: ['user:email'],
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback/github`
    },
    {
      id: 'microsoft',
      name: 'microsoft',
      displayName: 'Microsoft',
      icon: '🪟',
      color: 'bg-blue-600 hover:bg-blue-700',
      authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      clientId: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID || '',
      scope: ['openid', 'email', 'profile'],
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback/microsoft`
    },
    {
      id: 'wechat',
      name: 'wechat',
      displayName: '微信',
      icon: '💬',
      color: 'bg-green-500 hover:bg-green-600',
      authUrl: 'https://open.weixin.qq.com/connect/oauth2/authorize',
      clientId: process.env.NEXT_PUBLIC_WECHAT_CLIENT_ID || '',
      scope: ['snsapi_userinfo'],
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback/wechat`
    },
    {
      id: 'dingtalk',
      name: 'dingtalk',
      displayName: '钉钉',
      icon: '📱',
      color: 'bg-blue-500 hover:bg-blue-600',
      authUrl: 'https://oapi.dingtalk.com/connect/oauth2/sns_authorize',
      clientId: process.env.NEXT_PUBLIC_DINGTALK_CLIENT_ID || '',
      scope: ['openid'],
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback/dingtalk`
    }
  ]
}

export const getProviderConfig = (providerId: string) => {
  return oauth2Config.providers.find(p => p.id === providerId)
} 