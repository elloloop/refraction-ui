import { describe, it, expect, beforeEach } from 'vitest'
import { resetIdCounter } from '@refraction-ui/shared'
import { createAvatarGroup, getInitials, AVATAR_SIZES } from '../src/avatar-group.js'
import {
  avatarGroupStyles,
  avatarVariants,
  avatarOverflowBadgeVariants,
  avatarPresenceDotVariants,
} from '../src/avatar-group.styles.js'

const users = [
  { id: '1', name: 'Alice Smith', src: '/alice.jpg', status: 'online' as const },
  { id: '2', name: 'Bob Jones', status: 'away' as const },
  { id: '3', name: 'Carol Davis', src: '/carol.jpg' },
  { id: '4', name: 'Dan Wilson', status: 'busy' as const },
  { id: '5', name: 'Eve Brown' },
]

beforeEach(() => {
  resetIdCounter()
})

describe('createAvatarGroup - basic', () => {
  it('returns all users when no max set', () => {
    const api = createAvatarGroup({ users })
    expect(api.visibleUsers).toHaveLength(5)
    expect(api.overflowCount).toBe(0)
  })

  it('limits visible users to max', () => {
    const api = createAvatarGroup({ users, max: 3 })
    expect(api.visibleUsers).toHaveLength(3)
    expect(api.overflowCount).toBe(2)
  })

  it('returns correct overflow users', () => {
    const api = createAvatarGroup({ users, max: 3 })
    expect(api.overflowUsers).toHaveLength(2)
    expect(api.overflowUsers[0].name).toBe('Dan Wilson')
    expect(api.overflowUsers[1].name).toBe('Eve Brown')
  })

  it('max larger than users shows all', () => {
    const api = createAvatarGroup({ users, max: 10 })
    expect(api.visibleUsers).toHaveLength(5)
    expect(api.overflowCount).toBe(0)
  })

  it('max=0 shows all users', () => {
    const api = createAvatarGroup({ users, max: 0 })
    expect(api.visibleUsers).toHaveLength(5)
  })

  it('handles empty users array', () => {
    const api = createAvatarGroup({ users: [] })
    expect(api.visibleUsers).toHaveLength(0)
    expect(api.overflowCount).toBe(0)
  })
})

describe('getInitials', () => {
  it('returns first and last initials for two-word name', () => {
    expect(getInitials('Alice Smith')).toBe('AS')
  })

  it('returns single initial for single-word name', () => {
    expect(getInitials('Alice')).toBe('A')
  })

  it('handles three-word names (first + last)', () => {
    expect(getInitials('Mary Jane Watson')).toBe('MW')
  })

  it('handles empty string', () => {
    expect(getInitials('')).toBe('')
  })

  it('uppercases initials', () => {
    expect(getInitials('alice smith')).toBe('AS')
  })

  it('trims whitespace', () => {
    expect(getInitials('  Alice  Smith  ')).toBe('AS')
  })
})

describe('AVATAR_SIZES', () => {
  it('has all 5 sizes', () => {
    expect(Object.keys(AVATAR_SIZES)).toHaveLength(5)
  })

  it('each size has width and fontSize', () => {
    for (const size of Object.values(AVATAR_SIZES)) {
      expect(size.width).toBeGreaterThan(0)
      expect(size.fontSize).toBeGreaterThan(0)
    }
  })
})

describe('ARIA props', () => {
  it('group has role=group', () => {
    const api = createAvatarGroup({ users })
    expect(api.ariaProps.role).toBe('group')
  })

  it('group aria-label includes user count', () => {
    const api = createAvatarGroup({ users })
    expect(api.ariaProps['aria-label']).toContain('5')
  })

  it('avatar has role=img', () => {
    const api = createAvatarGroup({ users })
    const props = api.getAvatarAriaProps(users[0])
    expect(props.role).toBe('img')
  })

  it('avatar aria-label includes name', () => {
    const api = createAvatarGroup({ users })
    const props = api.getAvatarAriaProps(users[0])
    expect(props['aria-label']).toContain('Alice Smith')
  })

  it('avatar aria-label includes status when present', () => {
    const api = createAvatarGroup({ users })
    const props = api.getAvatarAriaProps(users[0])
    expect(props['aria-label']).toContain('online')
  })

  it('avatar aria-label excludes status when absent', () => {
    const api = createAvatarGroup({ users })
    const props = api.getAvatarAriaProps(users[4])
    expect(props['aria-label']).toBe('Eve Brown')
  })

  it('overflow badge has correct aria-label', () => {
    const api = createAvatarGroup({ users, max: 3 })
    expect(api.overflowBadgeProps['aria-label']).toContain('2')
  })
})

describe('IDs', () => {
  it('generates unique IDs', () => {
    const api1 = createAvatarGroup({ users })
    const api2 = createAvatarGroup({ users })
    expect(api1.ids.group).not.toBe(api2.ids.group)
  })
})

describe('styles', () => {
  it('exports group styles', () => {
    expect(avatarGroupStyles).toContain('flex')
  })

  it('exports avatar variants', () => {
    const md = avatarVariants({ size: 'md' })
    expect(md).toContain('rounded-full')
  })

  it('exports overflow badge variants', () => {
    const sm = avatarOverflowBadgeVariants({ size: 'sm' })
    expect(sm).toContain('rounded-full')
  })

  it('exports presence dot variants', () => {
    const online = avatarPresenceDotVariants({ status: 'online' })
    expect(online).toContain('bg-green-500')
  })
})
