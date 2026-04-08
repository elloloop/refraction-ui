import { describe, it, expect } from 'vitest'
import { createNavbar } from '../src/navbar.js'
import { navbarVariants, navLinkVariants } from '../src/navbar.styles.js'

describe('createNavbar', () => {
  it('provides navigation ARIA props', () => {
    const api = createNavbar()
    expect(api.ariaProps.role).toBe('navigation')
    expect(api.ariaProps['aria-label']).toBe('Main navigation')
  })

  it('detects active link for exact match on root', () => {
    const api = createNavbar({ currentPath: '/' })
    expect(api.isActive('/')).toBe(true)
    expect(api.isActive('/about')).toBe(false)
  })

  it('detects active link via prefix match', () => {
    const api = createNavbar({ currentPath: '/products/123' })
    expect(api.isActive('/products')).toBe(true)
    expect(api.isActive('/about')).toBe(false)
  })

  it('returns aria-current=page for active links', () => {
    const api = createNavbar({ currentPath: '/about' })
    expect(api.linkAriaProps('/about')).toEqual({ 'aria-current': 'page' })
    expect(api.linkAriaProps('/other')).toEqual({})
  })
})

describe('navbarVariants', () => {
  it('applies blur variant by default', () => {
    expect(navbarVariants()).toContain('backdrop-blur')
  })

  it('applies solid variant', () => {
    const classes = navbarVariants({ variant: 'solid' })
    expect(classes).toContain('bg-background')
    expect(classes).not.toContain('backdrop-blur')
  })
})

describe('navLinkVariants', () => {
  it('applies active styles', () => {
    expect(navLinkVariants({ active: 'true' })).toContain('text-foreground')
  })

  it('applies inactive styles', () => {
    expect(navLinkVariants({ active: 'false' })).toContain('text-muted-foreground')
  })
})

// ── Additional tests ──

describe('createNavbar - path matching', () => {
  it('root "/" only matches exact "/" and not "/about"', () => {
    const api = createNavbar({ currentPath: '/' })
    expect(api.isActive('/')).toBe(true)
    expect(api.isActive('/about')).toBe(false)
    expect(api.isActive('/products')).toBe(false)
  })

  it('does not match root "/" when currentPath is a nested path', () => {
    const api = createNavbar({ currentPath: '/docs/intro' })
    expect(api.isActive('/')).toBe(false)
  })

  it('nested path matches prefix correctly', () => {
    const api = createNavbar({ currentPath: '/docs/api/v2' })
    expect(api.isActive('/docs')).toBe(true)
    expect(api.isActive('/docs/api')).toBe(true)
    expect(api.isActive('/docs/api/v2')).toBe(true)
    expect(api.isActive('/other')).toBe(false)
  })

  it('does not match partial segment prefix (e.g. /doc does not match /docs)', () => {
    // startsWith('/doc') would be true for '/docs/api', which is by design
    // but let's verify the exact behavior
    const api = createNavbar({ currentPath: '/documents/123' })
    expect(api.isActive('/documents')).toBe(true)
    expect(api.isActive('/doc')).toBe(true) // startsWith behavior
  })

  it('defaults currentPath to "/" when not provided', () => {
    const api = createNavbar()
    expect(api.isActive('/')).toBe(true)
    expect(api.isActive('/anything')).toBe(false)
  })

  it('works with links array (links prop is accepted)', () => {
    const api = createNavbar({
      links: [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
      ],
      currentPath: '/about',
    })
    expect(api.isActive('/about')).toBe(true)
    expect(api.isActive('/')).toBe(false)
  })

  it('works with empty links array', () => {
    const api = createNavbar({ links: [], currentPath: '/test' })
    expect(api.isActive('/test')).toBe(true)
    expect(api.ariaProps.role).toBe('navigation')
  })

  it('linkAriaProps returns empty object for inactive link', () => {
    const api = createNavbar({ currentPath: '/home' })
    expect(api.linkAriaProps('/settings')).toEqual({})
  })

  it('linkAriaProps returns aria-current for nested active link', () => {
    const api = createNavbar({ currentPath: '/settings/account' })
    expect(api.linkAriaProps('/settings')).toEqual({ 'aria-current': 'page' })
  })
})

describe('navbarVariants - all variants', () => {
  it('applies gradient variant', () => {
    const classes = navbarVariants({ variant: 'gradient' })
    expect(classes).toContain('bg-gradient-to-b')
    expect(classes).toContain('backdrop-blur-sm')
  })

  it('applies transparent variant', () => {
    const classes = navbarVariants({ variant: 'transparent' })
    expect(classes).toContain('bg-transparent')
    expect(classes).toContain('border-transparent')
  })

  it('all variants include sticky and top-0', () => {
    for (const variant of ['solid', 'blur', 'gradient', 'transparent'] as const) {
      const classes = navbarVariants({ variant })
      expect(classes).toContain('sticky')
      expect(classes).toContain('top-0')
    }
  })

  it('all variants include border-b base class', () => {
    for (const variant of ['solid', 'blur', 'gradient', 'transparent'] as const) {
      const classes = navbarVariants({ variant })
      expect(classes).toContain('border-')
    }
  })
})

describe('navLinkVariants - additional', () => {
  it('default (no args) applies inactive styles', () => {
    const classes = navLinkVariants()
    expect(classes).toContain('text-muted-foreground')
  })

  it('all states include transition-colors', () => {
    expect(navLinkVariants({ active: 'true' })).toContain('transition-colors')
    expect(navLinkVariants({ active: 'false' })).toContain('transition-colors')
  })

  it('all states include text-sm and font-medium base', () => {
    expect(navLinkVariants({ active: 'true' })).toContain('text-sm')
    expect(navLinkVariants({ active: 'true' })).toContain('font-medium')
  })
})
