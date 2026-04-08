import { describe, it, expect } from 'vitest'
import { createAvatar, getInitials } from '../src/avatar.js'
import { avatarVariants, avatarImageVariants, avatarFallbackVariants } from '../src/avatar.styles.js'

describe('getInitials', () => {
  it('returns single initial for one-word name', () => {
    expect(getInitials('Alice')).toBe('A')
  })

  it('returns two initials for two-word name', () => {
    expect(getInitials('John Doe')).toBe('JD')
  })

  it('returns first and last initial for multi-word name', () => {
    expect(getInitials('John Michael Doe')).toBe('JD')
  })

  it('uppercases initials', () => {
    expect(getInitials('john doe')).toBe('JD')
  })

  it('returns empty string for empty input', () => {
    expect(getInitials('')).toBe('')
  })

  it('handles extra whitespace', () => {
    expect(getInitials('  John   Doe  ')).toBe('JD')
  })

  it('handles single character', () => {
    expect(getInitials('A')).toBe('A')
  })
})

describe('createAvatar', () => {
  it('returns role img', () => {
    const api = createAvatar()
    expect(api.ariaProps.role).toBe('img')
  })

  it('sets aria-label from alt', () => {
    const api = createAvatar({ alt: 'User avatar' })
    expect(api.ariaProps['aria-label']).toBe('User avatar')
  })

  it('does not set aria-label when alt is empty', () => {
    const api = createAvatar()
    expect(api.ariaProps['aria-label']).toBeUndefined()
  })

  it('defaults to md size', () => {
    const api = createAvatar()
    expect(api.state.size).toBe('md')
  })

  it('reflects provided size', () => {
    const api = createAvatar({ size: 'xl' })
    expect(api.state.size).toBe('xl')
  })

  it('hasSrc is true when src provided', () => {
    const api = createAvatar({ src: 'https://example.com/avatar.jpg' })
    expect(api.state.hasSrc).toBe(true)
  })

  it('hasSrc is false when no src', () => {
    const api = createAvatar()
    expect(api.state.hasSrc).toBe(false)
  })

  it('generates fallback text from fallback prop', () => {
    const api = createAvatar({ fallback: 'John Doe' })
    expect(api.fallbackText).toBe('JD')
  })

  it('generates fallback text from alt when no fallback', () => {
    const api = createAvatar({ alt: 'Alice Smith' })
    expect(api.fallbackText).toBe('AS')
  })

  it('prefers fallback over alt for initials', () => {
    const api = createAvatar({ alt: 'User Photo', fallback: 'Jane Doe' })
    expect(api.fallbackText).toBe('JD')
  })

  it('returns empty fallback text when no alt or fallback', () => {
    const api = createAvatar()
    expect(api.fallbackText).toBe('')
  })

  it('sets data-slot to avatar', () => {
    const api = createAvatar()
    expect(api.dataAttributes['data-slot']).toBe('avatar')
  })

  it('imageProps has correct alt and role', () => {
    const api = createAvatar({ alt: 'Test' })
    expect(api.imageProps.alt).toBe('Test')
    expect(api.imageProps.role).toBe('img')
  })
})

describe('avatarVariants', () => {
  it('returns base classes', () => {
    const classes = avatarVariants()
    expect(classes).toContain('rounded-full')
    expect(classes).toContain('overflow-hidden')
  })

  it('xs size returns h-6 w-6', () => {
    expect(avatarVariants({ size: 'xs' })).toContain('h-6')
    expect(avatarVariants({ size: 'xs' })).toContain('w-6')
  })

  it('sm size returns h-8 w-8', () => {
    expect(avatarVariants({ size: 'sm' })).toContain('h-8')
    expect(avatarVariants({ size: 'sm' })).toContain('w-8')
  })

  it('md size returns h-10 w-10', () => {
    expect(avatarVariants({ size: 'md' })).toContain('h-10')
    expect(avatarVariants({ size: 'md' })).toContain('w-10')
  })

  it('lg size returns h-12 w-12', () => {
    expect(avatarVariants({ size: 'lg' })).toContain('h-12')
    expect(avatarVariants({ size: 'lg' })).toContain('w-12')
  })

  it('xl size returns h-16 w-16', () => {
    expect(avatarVariants({ size: 'xl' })).toContain('h-16')
    expect(avatarVariants({ size: 'xl' })).toContain('w-16')
  })

  it('all 5 sizes produce different class strings', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    const classSet = new Set(sizes.map((s) => avatarVariants({ size: s })))
    expect(classSet.size).toBe(5)
  })
})

describe('avatarImageVariants', () => {
  it('returns image classes', () => {
    const classes = avatarImageVariants()
    expect(classes).toContain('object-cover')
    expect(classes).toContain('aspect-square')
  })
})

describe('avatarFallbackVariants', () => {
  it('returns fallback base classes', () => {
    const classes = avatarFallbackVariants()
    expect(classes).toContain('flex')
    expect(classes).toContain('items-center')
    expect(classes).toContain('justify-center')
    expect(classes).toContain('bg-muted')
  })

  it('md size returns text-sm', () => {
    expect(avatarFallbackVariants({ size: 'md' })).toContain('text-sm')
  })

  it('xl size returns text-lg', () => {
    expect(avatarFallbackVariants({ size: 'xl' })).toContain('text-lg')
  })
})
