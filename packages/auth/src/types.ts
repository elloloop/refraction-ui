/** User object — framework-agnostic, provider-agnostic */
export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  roles: string[]
}

/** Auth state */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export interface AuthState {
  user: User | null
  status: AuthStatus
}

/** OAuth providers */
export type OAuthProvider = 'google' | 'github' | 'apple'

/**
 * AuthAdapter — internal interface implemented by provider adapters.
 * Consumers never see this. It's used internally to abstract Firebase/Supabase/etc.
 */
export interface AuthAdapter {
  signIn(email: string, password: string): Promise<User>
  signInWithOAuth(provider: OAuthProvider): Promise<User>
  signUp(email: string, password: string, displayName: string): Promise<User>
  signOut(): Promise<void>
  resetPassword(email: string): Promise<void>
  getToken(): Promise<string | null>
  onAuthStateChange(callback: (user: User | null) => void): () => void
}

/** Provider configuration — read from env or .refractionrc */
export type AuthProviderType = 'firebase' | 'supabase' | 'mock' | 'none'

export interface AuthConfig {
  /** Explicit provider. If omitted, auto-detected from env vars. */
  provider?: AuthProviderType
  /** Token refresh interval in minutes. Default: 50 */
  tokenRefreshInterval?: number
  /** Enable E2E test mode with mock user */
  testMode?: boolean
  /** Mock user for test mode */
  testUser?: User
}
