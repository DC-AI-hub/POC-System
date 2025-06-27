import { OAuth2Provider, OAuth2AuthRequest } from '../types/auth'

// Generate random string for state parameter
export function generateRandomString(length: number = 32): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return result
}

// Generate code verifier for PKCE
export function generateCodeVerifier(): string {
  return generateRandomString(128)
}

// Generate code challenge from verifier
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

// Store auth request data in session storage
export function storeAuthRequest(request: OAuth2AuthRequest): void {
  sessionStorage.setItem('oauth2_request', JSON.stringify(request))
}

// Retrieve auth request data from session storage
export function getStoredAuthRequest(): OAuth2AuthRequest | null {
  const stored = sessionStorage.getItem('oauth2_request')
  if (!stored) return null
  
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

// Clear stored auth request
export function clearStoredAuthRequest(): void {
  sessionStorage.removeItem('oauth2_request')
}

// Build OAuth2 authorization URL
export async function buildAuthUrl(provider: OAuth2Provider, usePKCE: boolean = true): Promise<string> {
  const state = generateRandomString()
  const nonce = generateRandomString()
  
  const authRequest: OAuth2AuthRequest = {
    provider: provider.id,
    state,
    nonce
  }

  const params = new URLSearchParams({
    client_id: provider.clientId,
    redirect_uri: provider.redirectUri,
    response_type: 'code',
    scope: provider.scope.join(' '),
    state,
    nonce
  })

  // Add PKCE parameters for supported providers
  if (usePKCE && ['google', 'microsoft'].includes(provider.id)) {
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = await generateCodeChallenge(codeVerifier)
    
    params.append('code_challenge', codeChallenge)
    params.append('code_challenge_method', 'S256')
    
    authRequest.codeVerifier = codeVerifier
  }

  // Provider-specific parameters
  switch (provider.id) {
    case 'microsoft':
      params.append('response_mode', 'query')
      break
    case 'wechat':
      params.set('response_type', 'code')
      params.append('appid', provider.clientId)
      params.delete('client_id')
      break
    case 'dingtalk':
      params.set('response_type', 'code')
      params.append('appid', provider.clientId)
      params.delete('client_id')
      break
  }

  storeAuthRequest(authRequest)
  
  return `${provider.authUrl}?${params.toString()}`
}

// Parse OAuth2 callback URL
export function parseCallbackUrl(url: string): { code?: string; state?: string; error?: string; errorDescription?: string } {
  const urlObj = new URL(url)
  const params = urlObj.searchParams
  
  return {
    code: params.get('code') || undefined,
    state: params.get('state') || undefined,
    error: params.get('error') || undefined,
    errorDescription: params.get('error_description') || undefined
  }
}

// Validate state parameter
export function validateState(receivedState: string): boolean {
  const storedRequest = getStoredAuthRequest()
  return storedRequest?.state === receivedState
}

// Get provider display info
export function getProviderDisplayInfo(providerId: string) {
  const providerInfo = {
    google: { name: 'Google', icon: '🌐', color: 'bg-red-500' },
    github: { name: 'GitHub', icon: '🐙', color: 'bg-gray-800' },
    microsoft: { name: 'Microsoft', icon: '🪟', color: 'bg-blue-600' },
    wechat: { name: '微信', icon: '💬', color: 'bg-green-500' },
    dingtalk: { name: '钉钉', icon: '📱', color: 'bg-blue-500' }
  }
  
  return providerInfo[providerId as keyof typeof providerInfo] || { name: providerId, icon: '🔐', color: 'bg-gray-500' }
} 