import { describe, it, expect } from 'vitest'
import {
  hasRole,
  hasAnyRole,
  hasAllRoles,
  canAccessAdmin,
  canAccessReviewer,
  getDefaultPortal,
  getAssignableRoles,
} from '../src/rbac.js'
import type { User } from '../src/types.js'

const admin: User = { uid: '1', email: 'a@b.com', displayName: 'Admin', photoURL: null, roles: ['admin'] }
const student: User = { uid: '2', email: 's@b.com', displayName: 'Student', photoURL: null, roles: ['student'] }
const reviewer: User = { uid: '3', email: 'r@b.com', displayName: 'Reviewer', photoURL: null, roles: ['reviewer', 'student'] }

describe('hasRole', () => {
  it('returns true when user has role', () => {
    expect(hasRole(admin, 'admin')).toBe(true)
  })
  it('returns false when user lacks role', () => {
    expect(hasRole(student, 'admin')).toBe(false)
  })
  it('returns false for null user', () => {
    expect(hasRole(null, 'admin')).toBe(false)
  })
})

describe('hasAnyRole', () => {
  it('returns true when user has any of the roles', () => {
    expect(hasAnyRole(reviewer, ['admin', 'reviewer'])).toBe(true)
  })
  it('returns false when user has none', () => {
    expect(hasAnyRole(student, ['admin', 'reviewer'])).toBe(false)
  })
})

describe('hasAllRoles', () => {
  it('returns true when user has all roles', () => {
    expect(hasAllRoles(reviewer, ['reviewer', 'student'])).toBe(true)
  })
  it('returns false when user missing one', () => {
    expect(hasAllRoles(reviewer, ['admin', 'reviewer'])).toBe(false)
  })
})

describe('canAccessAdmin', () => {
  it('returns true for admin', () => {
    expect(canAccessAdmin(admin)).toBe(true)
  })
  it('returns false for student', () => {
    expect(canAccessAdmin(student)).toBe(false)
  })
})

describe('canAccessReviewer', () => {
  it('returns true for admin', () => {
    expect(canAccessReviewer(admin)).toBe(true)
  })
  it('returns true for reviewer', () => {
    expect(canAccessReviewer(reviewer)).toBe(true)
  })
  it('returns false for student', () => {
    expect(canAccessReviewer(student)).toBe(false)
  })
})

describe('getDefaultPortal', () => {
  it('returns /admin for admin', () => {
    expect(getDefaultPortal(['admin'])).toBe('/admin')
  })
  it('returns /student for student', () => {
    expect(getDefaultPortal(['student'])).toBe('/student')
  })
  it('returns / for no roles', () => {
    expect(getDefaultPortal([])).toBe('/')
  })
  it('returns highest privilege', () => {
    expect(getDefaultPortal(['student', 'admin'])).toBe('/admin')
  })
})

describe('getAssignableRoles', () => {
  it('admin can assign all roles', () => {
    expect(getAssignableRoles(admin)).toContain('admin')
    expect(getAssignableRoles(admin)).toContain('student')
  })
  it('student cannot assign roles', () => {
    expect(getAssignableRoles(student)).toEqual([])
  })
  it('null user cannot assign', () => {
    expect(getAssignableRoles(null)).toEqual([])
  })
})

describe('hasRole - edge cases', () => {
  const userNoRoles: User = { uid: '4', email: 'e@b.com', displayName: 'Empty', photoURL: null, roles: [] }

  it('returns false with empty roles array', () => {
    expect(hasRole(userNoRoles, 'admin')).toBe(false)
  })
})

describe('hasAnyRole - edge cases', () => {
  it('returns false with empty check roles array', () => {
    expect(hasAnyRole(admin, [])).toBe(false)
  })

  it('returns false when user roles are empty', () => {
    const userNoRoles: User = { uid: '4', email: 'e@b.com', displayName: 'Empty', photoURL: null, roles: [] }
    expect(hasAnyRole(userNoRoles, ['admin'])).toBe(false)
  })
})

describe('hasAllRoles - edge cases', () => {
  it('returns true with empty check roles array (vacuous truth)', () => {
    expect(hasAllRoles(admin, [])).toBe(true)
  })

  it('returns false when user roles are empty but check roles non-empty', () => {
    const userNoRoles: User = { uid: '4', email: 'e@b.com', displayName: 'Empty', photoURL: null, roles: [] }
    expect(hasAllRoles(userNoRoles, ['admin'])).toBe(false)
  })
})

describe('canAccessReviewer - various role combos', () => {
  it('returns false for null user', () => {
    expect(canAccessReviewer(null)).toBe(false)
  })

  it('returns true for user with both admin and reviewer', () => {
    const dual: User = { uid: '5', email: 'd@b.com', displayName: 'Dual', photoURL: null, roles: ['admin', 'reviewer'] }
    expect(canAccessReviewer(dual)).toBe(true)
  })

  it('returns false for parent role', () => {
    const parent: User = { uid: '6', email: 'p@b.com', displayName: 'Parent', photoURL: null, roles: ['parent'] }
    expect(canAccessReviewer(parent)).toBe(false)
  })
})

describe('getDefaultPortal - priority order', () => {
  it('returns /admin for admin > reviewer > parent > student', () => {
    expect(getDefaultPortal(['student', 'parent', 'reviewer', 'admin'])).toBe('/admin')
  })

  it('returns /reviewer for reviewer > parent > student', () => {
    expect(getDefaultPortal(['student', 'parent', 'reviewer'])).toBe('/reviewer')
  })

  it('returns /parent for parent > student', () => {
    expect(getDefaultPortal(['student', 'parent'])).toBe('/parent')
  })

  it('returns /student for student only', () => {
    expect(getDefaultPortal(['student'])).toBe('/student')
  })
})

describe('getAssignableRoles - reviewer', () => {
  it('reviewer can assign student only', () => {
    expect(getAssignableRoles(reviewer)).toEqual(['student'])
  })

  it('reviewer cannot assign admin', () => {
    expect(getAssignableRoles(reviewer)).not.toContain('admin')
  })

  it('reviewer cannot assign reviewer', () => {
    expect(getAssignableRoles(reviewer)).not.toContain('reviewer')
  })
})
