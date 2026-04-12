import type { User, AuthState, AuthStatus, AuthConfig, AuthAdapter, OAuthProvider } from './types.js'

export interface AuthAPI {
  getState(): AuthState
  signIn(email: string, password: string): Promise<User>
  signInWithOAuth(provider: OAuthProvider): Promise<User>
  signUp(email: string, password: string, displayName: string): Promise<User>
  signOut(): Promise<void>
  resetPassword(email: string): Promise<void>
  getToken(): Promise<string | null>
  subscribe(fn: (state: AuthState) => void): () => void
  destroy(): void
}

export function createAuth(
  adapter: AuthAdapter,
  config: Omit<AuthConfig, 'adapter'> = {},
): AuthAPI {
  const listeners = new Set<(state: AuthState) => void>()
  let state: AuthState = { user: null, status: 'loading' }
  let unsubAuth: (() => void) | null = null
  let tokenRefreshTimer: ReturnType<typeof setInterval> | null = null

  const { tokenRefreshInterval = 50, testMode = false, testUser } = config

  function setState(newState: AuthState) {
    state = newState
    for (const fn of listeners) {
      fn(state)
    }
  }

  function setUser(user: User | null) {
    setState({
      user,
      status: user ? 'authenticated' : 'unauthenticated',
    })
  }

  // Start token refresh timer
  function startTokenRefresh() {
    if (tokenRefreshTimer) clearInterval(tokenRefreshTimer)
    tokenRefreshTimer = setInterval(
      () => { adapter.getToken().catch(() => {}) },
      tokenRefreshInterval * 60 * 1000,
    )
  }

  // Initialize
  if (testMode && testUser) {
    setUser(testUser)
  } else {
    unsubAuth = adapter.onAuthStateChange((user) => {
      setUser(user)
      if (user) {
        startTokenRefresh()
      } else if (tokenRefreshTimer) {
        clearInterval(tokenRefreshTimer)
        tokenRefreshTimer = null
      }
    })
  }

  return {
    getState() {
      return state
    },

    async signIn(email, password) {
      const user = await adapter.signIn(email, password)
      setUser(user)
      startTokenRefresh()
      return user
    },

    async signInWithOAuth(provider) {
      const user = await adapter.signInWithOAuth(provider)
      setUser(user)
      startTokenRefresh()
      return user
    },

    async signUp(email, password, displayName) {
      const user = await adapter.signUp(email, password, displayName)
      setUser(user)
      startTokenRefresh()
      return user
    },

    async signOut() {
      await adapter.signOut()
      if (tokenRefreshTimer) {
        clearInterval(tokenRefreshTimer)
        tokenRefreshTimer = null
      }
      setUser(null)
    },

    async resetPassword(email) {
      await adapter.resetPassword(email)
    },

    async getToken() {
      return adapter.getToken()
    },

    subscribe(fn) {
      listeners.add(fn)
      return () => { listeners.delete(fn) }
    },

    destroy() {
      listeners.clear()
      unsubAuth?.()
      if (tokenRefreshTimer) {
        clearInterval(tokenRefreshTimer)
      }
    },
  }
}
