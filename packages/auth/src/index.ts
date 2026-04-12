export type {
  User,
  AuthState,
  AuthStatus,
  OAuthProvider,
  AuthConfig,
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

export { createMockAdapter } from './adapters/mock.js'
