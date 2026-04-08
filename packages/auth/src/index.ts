export type {
  User,
  AuthState,
  AuthStatus,
  OAuthProvider,
  AuthConfig,
  AuthProviderType,
  AuthAdapter,
} from './types.js'

export { createAuth, type AuthAPI } from './auth-machine.js'

export {
  hasRole,
  hasAnyRole,
  hasAllRoles,
  canAccessAdmin,
  canAccessReviewer,
  getDefaultPortal,
  getAssignableRoles,
} from './rbac.js'

export { resolveAdapter } from './adapters/resolve.js'
export { createMockAdapter } from './adapters/mock.js'
