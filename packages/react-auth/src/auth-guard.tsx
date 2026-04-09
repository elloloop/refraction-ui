import * as React from 'react'
import { useAuth } from './auth-provider.js'
import { hasAnyRole } from '@elloloop/auth'

export interface AuthGuardProps {
  children: React.ReactNode
  /** Custom loading UI */
  fallback?: React.ReactNode
  /** URL to redirect to when unauthenticated (if using a router) */
  redirectTo?: string
  /** Roles required (if any) */
  roles?: string[]
  /** UI to show when user lacks required roles */
  unauthorized?: React.ReactNode
}

/**
 * AuthGuard — wraps content that requires authentication.
 * Shows loading fallback while auth state resolves.
 * Optionally restricts by role.
 */
export function AuthGuard({
  children,
  fallback,
  roles,
  unauthorized,
}: AuthGuardProps) {
  const { isLoading, isAuthenticated, user } = useAuth()

  if (isLoading) {
    return React.createElement(React.Fragment, null, fallback ?? null)
  }

  if (!isAuthenticated) {
    return React.createElement(React.Fragment, null, fallback ?? null)
  }

  if (roles && roles.length > 0 && !hasAnyRole(user, roles)) {
    return React.createElement(React.Fragment, null, unauthorized ?? null)
  }

  return React.createElement(React.Fragment, null, children)
}
