"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, AlertCircle, Globe, RefreshCw, Loader2, Phone } from "lucide-react"
import { cn } from "@/lib/utils"

import { OAuth2Login } from "./oauth2-login"
import { LanguageSwitcher } from "./language-switcher"
import { useI18nContext } from "@/lib/i18n/context"

interface FormData {
  email: string
  password: string
  rememberMe: boolean
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

interface LoginPageProps {
  onLogin: () => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const { t, language } = useI18nContext()
  

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    rememberMe: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [loginType, setLoginType] = useState<"account" | "mobile" | "qrcode">("account")

  // Correct image path - using the actual file that was uploaded
  const backgroundImagePath = "/images/cityscape-bg.jpg"

  // Image loading handler
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setImageLoaded(true)
      console.log("✅ Background image loaded successfully:", backgroundImagePath)
    }
    img.onerror = () => {
      setImageError(true)
      console.error("❌ Failed to load background image:", backgroundImagePath)
    }
    img.src = backgroundImagePath
  }, [backgroundImagePath])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = t.login.emailRequired
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t.login.emailInvalid
    }

    if (!formData.password) {
      newErrors.password = t.login.passwordRequired
    } else if (formData.password.length < 6) {
      newErrors.password = t.login.passwordMinLength
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      // 调用后端JWT认证API
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '登录失败')
      }

      const result = await response.json()
      
      if (result.code === 200 && result.data) {
        // 保存JWT Token到localStorage
        localStorage.setItem('jwt_token', result.data.token)
        localStorage.setItem('refresh_token', result.data.refreshToken)
        localStorage.setItem('user_info', JSON.stringify(result.data.userInfo))
        
        console.log("✅ Login successful", result.data)
        onLogin()
      } else {
        setErrors({ general: result.message || '登录失败' })
      }
    } catch (error) {
      console.error("❌ Login error:", error)
      setErrors({ general: error instanceof Error ? error.message : t.login.loginError })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <>
      <div className="min-h-screen w-full relative">
        {/* Background Image with Error Handling */}
        <div className="fixed inset-0 w-full h-full">
          {!imageError ? (
            <>
              <img
                src={backgroundImagePath || "/placeholder.svg"}
                alt="Hong Kong Skyline"
                className={cn(
                  "w-full h-full object-cover object-center transition-opacity duration-500",
                  imageLoaded ? "opacity-100" : "opacity-0",
                )}
                style={{
                  minWidth: "100%",
                  minHeight: "100%",
                }}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
              {/* Loading placeholder */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 animate-pulse" />
              )}
            </>
          ) : (
            // Fallback gradient background
            <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800" />
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Image Error Alert */}
        {imageError && (
          <div className="absolute top-4 left-4 right-4 z-20">
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Background image failed to load from: {backgroundImagePath}. Using fallback gradient background.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Language Selector */}
        <div className="absolute top-4 right-4 z-20 sm:top-6 sm:right-6">
          <LanguageSwitcher 
            variant="outline"
            size="sm"
            className="bg-white/15 border-white/25 text-white hover:bg-white/25 backdrop-blur-sm transition-all duration-200"
          />
        </div>

        {/* Main Content Container */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-3 sm:p-4 lg:p-6">
          <div className="w-full max-w-sm">
            {/* Login Card */}
            <Card key={`login-card-${language}`} className="bg-white/95 backdrop-blur-lg border-0 shadow-2xl compact-card">
              <CardHeader className="text-center pb-3 pt-4 px-4 sm:px-6">
                {/* Logo Section */}
                <div className="flex items-center justify-center mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-sm transform rotate-45"></div>
                    </div>
                                         <span className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                       {t.login.title}
                     </span>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex justify-center mb-3">
                  <div className="flex bg-gray-100 rounded-lg p-0.5 w-full">
                    <button 
                      onClick={() => setLoginType("account")}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium transition-all duration-200 rounded-md ${
                        loginType === "account" 
                          ? "text-blue-600 bg-white shadow-sm" 
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      {t.login.accountLogin}
                    </button>
                    <button 
                      onClick={() => setLoginType("mobile")}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium transition-all duration-200 rounded-md ${
                        loginType === "mobile" 
                          ? "text-blue-600 bg-white shadow-sm" 
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      {t.login.mobileLogin}
                    </button>
                    <button 
                      onClick={() => setLoginType("qrcode")}
                      className={`flex-1 px-2 py-1.5 text-xs font-medium transition-all duration-200 rounded-md ${
                        loginType === "qrcode" 
                          ? "text-blue-600 bg-white shadow-sm" 
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      {t.login.qrcodeLogin}
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-4 sm:px-6 pb-4 compact-card-content">
                {loginType === "account" && (
                  <form onSubmit={handleSubmit} className="space-y-3 compact-form">
                    {/* General Error */}
                    {errors.general && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-3 w-3 text-red-600" />
                        <AlertDescription className="text-red-700 text-sm">{errors.general}</AlertDescription>
                      </Alert>
                    )}

                    {/* Email Field */}
                    <div className="space-y-1">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                        <Input
                          id="email"
                          type="email"
                          placeholder={t.login.email}
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className={cn(
                            "h-9 bg-gray-50/80 border-gray-200 focus:bg-white transition-colors text-sm",
                            errors.email && "border-red-300 focus:border-red-500"
                          )}
                          style={{ paddingLeft: '2.5rem' }}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.email && <p className="text-xs text-red-600 ml-1">{errors.email}</p>}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1">
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder={t.login.password}
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          className={cn(
                            "h-9 bg-gray-50/80 border-gray-200 focus:bg-white transition-colors text-sm",
                            errors.password && "border-red-300 focus:border-red-500"
                          )}
                          style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                          disabled={isLoading}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-xs text-red-600 ml-1">{errors.password}</p>}
                    </div>

                    {/* Remember Me and Forgot Password */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1.5">
                        <Checkbox
                          id="remember"
                          checked={formData.rememberMe}
                          onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
                          disabled={isLoading}
                          className="border-gray-300 focus-visible:ring-blue-500 data-[state=checked]:bg-blue-600 h-3 w-3"
                        />
                        <Label htmlFor="remember" className="text-gray-600 cursor-pointer font-medium text-xs">
                          {t.login.rememberMe}
                        </Label>
                      </div>
                      <button
                        type="button"
                        className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                        disabled={isLoading}
                      >
                        {t.login.forgotPassword}
                      </button>
                    </div>

                    {/* Login Button */}
                    <Button
                      type="submit"
                      className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors compact-button"
                      disabled={isLoading}
                      size="sm"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          <span className="text-sm">{t.login.loggingIn}</span>
                        </>
                      ) : (
                        <span className="text-sm">{t.login.loginButton}</span>
                      )}
                    </Button>

                    {/* Terms and Conditions */}
                    <div className="text-center text-xs text-gray-500 mt-3">
                      {t.login.agreeTerms}{" "}
                      <button className="text-blue-600 hover:underline">
                        {t.login.privacyPolicy}
                      </button>
                      {" "}{t.login.and}{" "}
                      <button className="text-blue-600 hover:underline">
                        {t.login.userAgreement}
                      </button>
                    </div>
                  </form>
                )}

                {loginType === "mobile" && (
                  <div className="space-y-3 compact-form">
                    {/* Mobile Number Field */}
                    <div className="space-y-1">
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                        <Input
                          id="mobile"
                          type="tel"
                          placeholder={t.login.mobile}
                          className="h-9 bg-gray-50/80 border-gray-200 focus:bg-white transition-colors text-sm"
                          style={{ paddingLeft: '2.5rem' }}
                        />
                      </div>
                    </div>

                    {/* Verification Code Field */}
                    <div className="space-y-1">
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                        <Input
                          id="verification-code"
                          type="text"
                          placeholder={t.login.verificationCode}
                          className="h-9 bg-gray-50/80 border-gray-200 focus:bg-white transition-colors text-sm"
                          style={{ paddingLeft: '2.5rem', paddingRight: '5rem' }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 h-6 px-2 text-xs compact-button z-10"
                        >
                          {t.login.getCode}
                        </Button>
                      </div>
                    </div>

                    {/* Login Button */}
                    <Button
                      className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors compact-button"
                      size="sm"
                    >
                      <span className="text-sm">{t.login.loginButton}</span>
                    </Button>

                    {/* Terms */}
                    <div className="text-center text-xs text-gray-500 mt-3">
                      {t.login.agreeTerms}{" "}
                      <button className="text-blue-600 hover:underline">
                        {t.login.privacyPolicy}
                      </button>
                      {" "}{t.login.and}{" "}
                      <button className="text-blue-600 hover:underline">
                        {t.login.userAgreement}
                      </button>
                    </div>
                  </div>
                )}

                {loginType === "qrcode" && (
                  <div className="space-y-4 compact-form">
                    {/* QR Code Container */}
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <div className="text-center">
                          <div className="w-28 h-28 bg-white rounded-lg shadow-sm flex items-center justify-center mb-2">
                            <div className="grid grid-cols-3 gap-1">
                              {Array.from({ length: 9 }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-2 ${
                                    [0, 2, 6, 8].includes(i) ? 'bg-black' : 
                                    [1, 3, 5, 7].includes(i) ? 'bg-gray-400' : 'bg-black'
                                  } rounded-sm`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 font-medium">{t.login.scanLogin}</p>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">{t.login.scanWithApp}</p>
                        <p className="text-xs text-gray-600">{t.login.scanLogin}</p>
                      </div>
                    </div>

                    {/* Refresh Button */}
                    <div className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-9 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors compact-button"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        <span className="text-sm">{t.login.refreshQR}</span>
                      </Button>
                    </div>

                    {/* Download App Links */}
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">{t.login.noApp}</p>
                      <Button variant="link" className="text-blue-600 hover:text-blue-700 p-0 h-auto text-xs">
                        {t.login.downloadApp}
                      </Button>
                    </div>
                  </div>
                )}

                {/* OAuth2 Login Options */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-center text-sm text-gray-600 mb-3 font-medium">{t.login.oauth2Login}</p>
                  <OAuth2Login compact onSuccess={onLogin} />
                </div>

                {/* Demo Credentials */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-blue-700 font-semibold mb-1">{t.login.demoAccount}:</p>
                  <div className="space-y-1">
                    <p className="text-xs text-blue-600 font-mono">{t.login.demoEmail}</p>
                    <p className="text-xs text-blue-600 font-mono">{t.login.demoPassword}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Copyright */}
            <div className="text-center text-xs text-gray-500 mt-4">
              {t.login.copyright}
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 