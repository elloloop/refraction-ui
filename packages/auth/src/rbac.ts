import type { User } from './types.js'

/** Check if user has a specific role */
export function hasRole(user: User | null, role: string): boolean {
  return user?.roles?.includes(role) ?? false
}

/** Check if user has any of the specified roles */
export function hasAnyRole(user: User | null, roles: string[]): boolean {
  if (!user?.roles) return false
  return roles.some((role) => user.roles.includes(role))
}

/** Check if user has all of the specified roles */
export function hasAllRoles(user: User | null, roles: string[]): boolean {
  if (!user?.roles) return false
  return roles.every((role) => user.roles.includes(role))
}

/** Convenience role checks */
export function canAccessAdmin(user: User | null): boolean {
  return hasRole(user, 'admin')
}

export function canAccessReviewer(user: User | null): boolean {
  return hasAnyRole(user, ['admin', 'reviewer'])
}

/** Get the default portal URL based on highest-privilege role */
export function getDefaultPortal(roles: string[]): string {
  if (roles.includes('admin')) return '/admin'
  if (roles.includes('reviewer')) return '/reviewer'
  if (roles.includes('parent')) return '/parent'
  if (roles.includes('student')) return '/student'
  return '/'
}

/** Get roles that the given user can assign to others */
export function getAssignableRoles(user: User | null): string[] {
  if (!user) return []
  if (hasRole(user, 'admin')) return ['admin', 'reviewer', 'parent', 'student']
  if (hasRole(user, 'reviewer')) return ['student']
  return []
}
