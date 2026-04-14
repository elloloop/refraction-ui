import * as React from 'react'
import {
  createAuth,
  type AuthState,
  type AuthConfig,
  type AuthAPI,
  type User,
  type OAuthProvider,
} from '@refraction-ui/auth'

export interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<User>
  signInWithOAuth: (provider: OAuthProvider) => Promise<User>
  signUp: (email: string, password: string, displayName: string) => Promise<User>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  getToken: () => Promise<string | null>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export interface AuthProviderProps extends AuthConfig {
  children: React.ReactNode
}

/**
 * AuthProvider — wraps your app with auth context.
 * You must provide an AuthAdapter implementation.
 *
 * ```tsx
 * import { AuthProvider } from '@refraction-ui/react-auth'
 * import { myCustomAdapter } from './auth'
 * 
 * <AuthProvider adapter={myCustomAdapter}>
 *   <App />
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children, ...config }: AuthProviderProps) {
  const authRef = React.useRef<AuthAPI | null>(null)

  if (!authRef.current) {
    if (!config.adapter && !config.testMode) {
      throw new Error('[refraction-ui/react-auth] You must provide an `adapter` to AuthProvider.')
    }
    authRef.current = createAuth(config.adapter, config)
  }

  const [state, setState] = React.useState<AuthState>(() => authRef.current!.getState())

  React.useEffect(() => {
    const unsub = authRef.current!.subscribe(setState)
    return () => {
      unsub()
      authRef.current!.destroy()
    }
  }, [])

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      isLoading: state.status === 'loading',
      isAuthenticated: state.status === 'authenticated',
      signIn: (e, p) => authRef.current!.signIn(e, p),
      signInWithOAuth: (p) => authRef.current!.signInWithOAuth(p),
      signUp: (e, p, d) => authRef.current!.signUp(e, p, d),
      signOut: () => authRef.current!.signOut(),
      resetPassword: (e) => authRef.current!.resetPassword(e),
      getToken: () => authRef.current!.getToken(),
    }),
    [state.user, state.status],
  )

  return React.createElement(AuthContext.Provider, { value }, children)
}

/**
 * useAuth — access auth state and methods.
 * Must be used within <AuthProvider>.
 */
export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>')
  }
  return ctx
}
