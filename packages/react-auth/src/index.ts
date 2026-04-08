export {
  AuthProvider,
  useAuth,
  type AuthProviderProps,
  type AuthContextValue,
} from './auth-provider.js'

export { AuthGuard, type AuthGuardProps } from './auth-guard.js'

export type {
  User,
  AuthState,
  AuthStatus,
  OAuthProvider,
  AuthConfig,
  AuthProviderType,
} from '@refraction-ui/auth'

export {
  hasRole,
  hasAnyRole,
  hasAllRoles,
  canAccessAdmin,
  canAccessReviewer,
  getDefaultPortal,
  getAssignableRoles,
} from '@refraction-ui/auth'
