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
export type OAuthProvider = string

/**
 * AuthAdapter — interface implemented by provider adapters (e.g. Firebase, Supabase, Auth0).
 * Consumers must provide an implementation of this adapter to the AuthProvider.
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

export interface AuthConfig {
  /** The adapter implementation for your specific auth provider (Supabase, Firebase, Auth0, Custom, etc.) */
  adapter: AuthAdapter
  /** Token refresh interval in minutes. Default: 50 */
  tokenRefreshInterval?: number
  /** Enable E2E test mode with mock user */
  testMode?: boolean
  /** Mock user for test mode */
  testUser?: User
}
