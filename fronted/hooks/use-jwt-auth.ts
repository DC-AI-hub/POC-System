"use client"

import { useState, useEffect, useCallback } from 'react'

interface UserInfo {
  id: string
  name: string
  email: string
  avatar?: string
  department?: string
  position?: string
  userType?: string
}

interface AuthState {
  isAuthenticated: boolean
  user: UserInfo | null
  loading: boolean
  error: string | null
}

export function useJWTAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null
  })

  // 初始化认证状态
  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('jwt_token')
      const userInfo = localStorage.getItem('user_info')
      
      if (token && userInfo) {
        try {
          const user = JSON.parse(userInfo)
          setAuthState({
            isAuthenticated: true,
            user: {
              id: user.id?.toString() || '',
              name: user.userName || user.name || '',
              email: user.email || '',
              avatar: user.avatar,
              department: user.department,
              position: user.position,
              userType: user.userType
            },
            loading: false,
            error: null
          })
        } catch (error) {
          console.error('解析用户信息失败:', error)
          localStorage.removeItem('jwt_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user_info')
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: null
          })
        }
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null
        })
      }
    }

    initAuth()
  }, [])

  // 登录成功后更新状态
  const updateAuthState = useCallback((userInfo: any) => {
    setAuthState({
      isAuthenticated: true,
      user: {
        id: userInfo.id?.toString() || '',
        name: userInfo.userName || userInfo.name || '',
        email: userInfo.email || '',
        avatar: userInfo.avatar,
        department: userInfo.department,
        position: userInfo.position,
        userType: userInfo.userType
      },
      loading: false,
      error: null
    })
  }, [])

  // 登出
  const logout = useCallback(() => {
    localStorage.removeItem('jwt_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_info')
    
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null
    })
  }, [])

  return {
    ...authState,
    updateAuthState,
    logout
  }
} 