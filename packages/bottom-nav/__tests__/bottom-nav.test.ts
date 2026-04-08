import { describe, it, expect } from 'vitest'
import { createBottomNav } from '../src/bottom-nav.js'
import { bottomNavVariants, bottomNavTabVariants } from '../src/bottom-nav.styles.js'

describe('createBottomNav', () => {
  it('provides navigation ARIA', () => {
    const api = createBottomNav()
    expect(api.ariaProps.role).toBe('navigation')
  })

  it('detects active tab', () => {
    const api = createBottomNav({ currentPath: '/search' })
    expect(api.isActive('/search')).toBe(true)
    expect(api.isActive('/home')).toBe(false)
  })

  it('returns aria-current for active tab', () => {
    const api = createBottomNav({ currentPath: '/search' })
    expect(api.tabAriaProps('/search')).toEqual({ 'aria-current': 'page' })
    expect(api.tabAriaProps('/other')).toEqual({})
  })
})

describe('bottomNavVariants', () => {
  it('is hidden on desktop', () => {
    expect(bottomNavVariants()).toContain('md:hidden')
  })

  it('is fixed at bottom', () => {
    expect(bottomNavVariants()).toContain('fixed')
    expect(bottomNavVariants()).toContain('bottom-0')
  })
})

// ── Additional tests ──

describe('createBottomNav - path matching', () => {
  it('multiple tabs: only the matching one is active', () => {
    const api = createBottomNav({ currentPath: '/search' })
    expect(api.isActive('/search')).toBe(true)
    expect(api.isActive('/home')).toBe(false)
    expect(api.isActive('/profile')).toBe(false)
    expect(api.isActive('/settings')).toBe(false)
  })

  it('root "/" only matches exact "/"', () => {
    const api = createBottomNav({ currentPath: '/' })
    expect(api.isActive('/')).toBe(true)
    expect(api.isActive('/home')).toBe(false)
    expect(api.isActive('/search')).toBe(false)
  })

  it('"/" is not active when currentPath is a nested path', () => {
    const api = createBottomNav({ currentPath: '/home' })
    expect(api.isActive('/')).toBe(false)
  })

  it('prefix matching works for nested paths', () => {
    const api = createBottomNav({ currentPath: '/search/results' })
    expect(api.isActive('/search')).toBe(true)
  })

  it('defaults currentPath to "/"', () => {
    const api = createBottomNav()
    expect(api.isActive('/')).toBe(true)
  })

  it('tabAriaProps returns empty for all non-active tabs', () => {
    const api = createBottomNav({ currentPath: '/search' })
    expect(api.tabAriaProps('/home')).toEqual({})
    expect(api.tabAriaProps('/profile')).toEqual({})
    expect(api.tabAriaProps('/')).toEqual({})
  })

  it('provides aria-label in ariaProps', () => {
    const api = createBottomNav()
    expect(api.ariaProps['aria-label']).toBe('Main navigation')
  })

  it('tabs prop is accepted without affecting isActive', () => {
    const api = createBottomNav({
      tabs: [
        { label: 'Home', href: '/' },
        { label: 'Search', href: '/search' },
      ],
      currentPath: '/search',
    })
    expect(api.isActive('/search')).toBe(true)
    expect(api.isActive('/')).toBe(false)
  })
})

describe('bottomNavVariants - additional', () => {
  it('includes left-0 and right-0 for full width', () => {
    const classes = bottomNavVariants()
    expect(classes).toContain('left-0')
    expect(classes).toContain('right-0')
  })

  it('includes border-t', () => {
    expect(bottomNavVariants()).toContain('border-t')
  })

  it('includes bg-background', () => {
    expect(bottomNavVariants()).toContain('bg-background')
  })

  it('includes z-40 for stacking', () => {
    expect(bottomNavVariants()).toContain('z-40')
  })
})

describe('bottomNavTabVariants', () => {
  it('active tab has text-foreground', () => {
    expect(bottomNavTabVariants({ active: 'true' })).toContain('text-foreground')
  })

  it('inactive tab has text-muted-foreground', () => {
    expect(bottomNavTabVariants({ active: 'false' })).toContain('text-muted-foreground')
  })

  it('default is inactive', () => {
    expect(bottomNavTabVariants()).toContain('text-muted-foreground')
  })

  it('base includes flex and items-center', () => {
    const classes = bottomNavTabVariants()
    expect(classes).toContain('flex')
    expect(classes).toContain('items-center')
  })

  it('base includes flex-col for vertical layout', () => {
    expect(bottomNavTabVariants()).toContain('flex-col')
  })

  it('includes transition-colors', () => {
    expect(bottomNavTabVariants()).toContain('transition-colors')
  })

  it('includes text-xs for small text', () => {
    expect(bottomNavTabVariants()).toContain('text-xs')
  })
})
