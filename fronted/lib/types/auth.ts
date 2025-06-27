export interface OAuth2Provider {
  id: string
  name: string
  displayName: string
  icon: string
  color: string
  authUrl: string
  clientId: string
  scope: string[]
  redirectUri: string
}

export interface OAuth2Config {
  providers: OAuth2Provider[]
  baseUrl: string
  redirectPath: string
}

export interface AuthToken {
  accessToken: string
  refreshToken?: string
  tokenType: string
  expiresIn: number
  scope: string
  idToken?: string
}

export interface UserProfile {
  id: string
  email: string
  name: string
  avatar?: string
  provider: string
  providerUserId: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: UserProfile | null
  token: AuthToken | null
  loading: boolean
  error: string | null
}

export interface OAuth2AuthRequest {
  provider: string
  state: string
  codeVerifier?: string // for PKCE
  nonce?: string
}

export interface OAuth2AuthResponse {
  code: string
  state: string
  error?: string
  errorDescription?: string
} 