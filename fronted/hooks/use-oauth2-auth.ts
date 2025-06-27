"use client"

import { useState, useCallback, useEffect } from 'react'
import { AuthState, OAuth2Provider, UserProfile, AuthToken } from '@/lib/types/auth'
import { oauth2Config, getProviderConfig } from '@/lib/auth/oauth2-config'
import { buildAuthUrl, parseCallbackUrl, validateState, clearStoredAuthRequest } from '@/lib/auth/oauth2-utils'

export function useOAuth2Auth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null
  })

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')
    
    if (storedToken && storedUser) {
      try {
        const token = JSON.parse(storedToken)
        const user = JSON.parse(storedUser)
        
        // Check if token is still valid
        if (token.expiresIn && Date.now() < token.expiresIn * 1000) {
          setAuthState({
            isAuthenticated: true,
            user,
            token,
            loading: false,
            error: null
          })
        } else {
          // Token expired, clear storage
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
        }
      } catch (error) {
        console.error('Error parsing stored auth data:', error)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    }
  }, [])

  // Start OAuth2 authentication flow
  const startAuth = useCallback(async (providerId: string) => {
    const provider = getProviderConfig(providerId)
    if (!provider) {
      setAuthState(prev => ({
        ...prev,
        error: `Provider ${providerId} not found`
      }))
      return
    }

    setAuthState(prev => ({
      ...prev,
      loading: true,
      error: null
    }))

    try {
      const authUrl = await buildAuthUrl(provider)
      window.location.href = authUrl
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to start authentication'
      }))
    }
  }, [])

  // Handle OAuth2 callback
  const handleCallback = useCallback(async (url: string, providerId: string) => {
    setAuthState(prev => ({
      ...prev,
      loading: true,
      error: null
    }))

    try {
      const { code, state, error, errorDescription } = parseCallbackUrl(url)
      
      if (error) {
        throw new Error(errorDescription || error)
      }

      if (!code || !state) {
        throw new Error('Missing authorization code or state')
      }

      if (!validateState(state)) {
        throw new Error('Invalid state parameter')
      }

      // Exchange code for token (this would typically be done on the server)
      const tokenResponse = await exchangeCodeForToken(providerId, code)
      
      if (tokenResponse.error || !tokenResponse.token) {
        throw new Error(tokenResponse.error || 'Failed to get token')
      }

      // Get user profile
      const userProfile = await getUserProfile(providerId, tokenResponse.token)

      // Store auth data
      localStorage.setItem('auth_token', JSON.stringify(tokenResponse.token))
      localStorage.setItem('auth_user', JSON.stringify(userProfile))

      setAuthState({
        isAuthenticated: true,
        user: userProfile,
        token: tokenResponse.token,
        loading: false,
        error: null
      })

      clearStoredAuthRequest()
      
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      
      clearStoredAuthRequest()
      return { success: false, error: errorMessage }
    }
  }, [])

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    clearStoredAuthRequest()
    
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null
    })
  }, [])

  // Refresh token
  const refreshToken = useCallback(async () => {
    const currentToken = authState.token
    if (!currentToken?.refreshToken) {
      logout()
      return false
    }

    try {
      setAuthState(prev => ({ ...prev, loading: true }))
      
      // This would typically call your backend API
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: currentToken.refreshToken
        })
      })

      if (!response.ok) {
        throw new Error('Failed to refresh token')
      }

      const newToken = await response.json()
      
      localStorage.setItem('auth_token', JSON.stringify(newToken))
      
      setAuthState(prev => ({
        ...prev,
        token: newToken,
        loading: false
      }))
      
      return true
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
      return false
    }
  }, [authState.token, logout])

  return {
    ...authState,
    providers: oauth2Config.providers,
    startAuth,
    handleCallback,
    logout,
    refreshToken
  }
}

// Mock functions - these would typically call your backend API
async function exchangeCodeForToken(providerId: string, code: string): Promise<{ token?: AuthToken; error?: string }> {
  // This is a mock implementation
  // In a real app, this would call your backend API
  try {
    const response = await fetch('/api/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: providerId,
        code,
        redirectUri: getProviderConfig(providerId)?.redirectUri
      })
    })

    if (!response.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const token = await response.json()
    return { token }
  } catch (error) {
    // For demo purposes, return a mock token
    console.warn('Using mock token for demo purposes')
    return {
      token: {
        accessToken: 'mock_access_token',
        tokenType: 'Bearer',
        expiresIn: 3600,
        scope: 'openid email profile',
        refreshToken: 'mock_refresh_token'
      }
    }
  }
}

async function getUserProfile(providerId: string, token: AuthToken): Promise<UserProfile> {
  // This is a mock implementation
  // In a real app, this would call the provider's API or your backend
  try {
    const response = await fetch('/api/auth/profile', {
      headers: {
        'Authorization': `${token.tokenType} ${token.accessToken}`,
        'X-Provider': providerId
      }
    })

    if (!response.ok) {
      throw new Error('Failed to get user profile')
    }

    return await response.json()
  } catch (error) {
    // For demo purposes, return a mock profile
    console.warn('Using mock profile for demo purposes')
    return {
      id: 'mock_user_id',
      email: 'demo@example.com',
      name: 'Demo User',
      avatar: 'https://via.placeholder.com/100',
      provider: providerId,
      providerUserId: 'mock_provider_user_id'
    }
  }
} 