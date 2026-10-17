import { describe, it, expect, beforeEach } from 'vitest'
import { resetIdCounter } from '@refraction-ui/shared'
import {
  createAvatarGroup,
  getInitials,
  getAvatarImageStatus,
  AVATAR_SIZES,
} from '../src/avatar-group.js'
import {
  avatarGroupStyles,
  avatarVariants,
  avatarOverflowBadgeVariants,
  avatarOverflowButtonStyles,
  avatarImageStyles,
  avatarInitialsStyles,
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

  it('a badge that does nothing is a labelled image, not a button', () => {
    const api = createAvatarGroup({ users, max: 3 })
    expect(api.overflowBadgeProps).toEqual({ role: 'img', 'aria-label': '2 more users' })
  })

  it('an interactive badge is a plain button: its element carries the role', () => {
    const api = createAvatarGroup({ users, max: 3, overflowInteractive: true })
    expect(api.overflowBadgeProps).toEqual({ type: 'button', 'aria-label': '2 more users' })
  })
})

describe('getAvatarImageStatus', () => {
  it('is loading until the image completes', () => {
    expect(getAvatarImageStatus({ complete: false, naturalWidth: 0 })).toBe('loading')
  })

  it('is loaded once complete with pixels', () => {
    expect(getAvatarImageStatus({ complete: true, naturalWidth: 150 })).toBe('loaded')
  })

  it('is failed once complete without pixels', () => {
    expect(getAvatarImageStatus({ complete: true, naturalWidth: 0 })).toBe('failed')
  })
})

describe('IDs', () => {
  it('generates unique IDs', () => {
    const api1 = createAvatarGroup({ users })
    const api2 = createAvatarGroup({ users })
    expect(api1.ids.group).not.toBe(api2.ids.group)
  })

  it('uses a given prefix, so a server and a client render agree', () => {
    const api = createAvatarGroup({ users, idPrefix: 'team-a' })
    expect(api.ids).toEqual({ group: 'team-a', label: 'team-a-label' })
    expect(api.ariaProps.id).toBe('team-a')
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
    expect(online).toContain('bg-success')
  })

  it('an avatar does not clip, so its dot can sit over the edge', () => {
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
      expect(avatarVariants({ size }).split(' ')).not.toContain('overflow-hidden')
    }
  })

  it('the photo covers the initials and rounds itself', () => {
    expect(avatarImageStyles.split(' ')).toEqual(
      expect.arrayContaining(['absolute', 'inset-0', 'rounded-[inherit]', 'object-cover']),
    )
    expect(avatarInitialsStyles.split(' ')).toEqual(
      expect.arrayContaining(['overflow-hidden', 'rounded-[inherit]']),
    )
  })

  it('the dot sits at the bottom end corner, above the next avatar, inside the group', () => {
    const dot = avatarPresenceDotVariants({ status: 'away' }).split(' ')
    expect(dot).toEqual(expect.arrayContaining(['absolute', 'bottom-0', 'end-0', 'z-10']))
    expect(avatarGroupStyles.split(' ')).toContain('isolate')
  })

  it('sizes text in rem, so it follows the reader\'s text size', () => {
    for (const variants of [avatarVariants, avatarOverflowBadgeVariants]) {
      for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
        expect(variants({ size })).not.toMatch(/text-\[\d+px\]/)
      }
    }
    expect(avatarVariants({ size: 'xs' })).toContain('text-[0.625rem]')
  })

  it('an overflow button shows a keyboard focus ring and drops its transition under reduced motion', () => {
    const classes = avatarOverflowButtonStyles.split(' ')
    expect(classes).toEqual(
      expect.arrayContaining([
        'focus-visible:outline-none',
        'focus-visible:ring-ring',
        'focus-visible:ring-offset-2',
        'motion-reduce:transition-none',
      ]),
    )
    // The badge's own ring is what turns the ring colour on focus.
    expect(avatarOverflowBadgeVariants({ size: 'md' })).toContain('ring-2')
  })
})
