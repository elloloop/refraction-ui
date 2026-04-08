import { describe, it, expect } from 'vitest'
import { createFooter } from '../src/footer.js'
import { footerVariants } from '../src/footer.styles.js'

describe('createFooter', () => {
  it('provides contentinfo role', () => {
    const api = createFooter()
    expect(api.ariaProps.role).toBe('contentinfo')
  })

  it('generates default copyright with current year', () => {
    const api = createFooter()
    const year = new Date().getFullYear()
    expect(api.copyrightText).toContain(String(year))
    expect(api.copyrightText).toContain('All rights reserved')
  })

  it('uses custom copyright text', () => {
    const api = createFooter({ copyright: '© 2026 Acme Inc.' })
    expect(api.copyrightText).toBe('© 2026 Acme Inc.')
  })
})

// ── Additional tests ──

describe('createFooter - year and copyright', () => {
  it('year in copyright is current year', () => {
    const api = createFooter()
    const year = new Date().getFullYear()
    expect(api.copyrightText).toContain(String(year))
  })

  it('default copyright contains copyright symbol', () => {
    const api = createFooter()
    expect(api.copyrightText).toContain('©')
  })

  it('custom copyright completely overrides default', () => {
    const custom = 'Custom footer text without year'
    const api = createFooter({ copyright: custom })
    expect(api.copyrightText).toBe(custom)
    expect(api.copyrightText).not.toContain('All rights reserved')
  })

  it('custom copyright can be empty string', () => {
    const api = createFooter({ copyright: '' })
    expect(api.copyrightText).toBe('')
  })

  it('default copyright ends with period', () => {
    const api = createFooter()
    expect(api.copyrightText).toMatch(/\.$/)
  })
})

describe('createFooter - props acceptance', () => {
  it('accepts socialLinks prop', () => {
    const socialLinks = [
      { label: 'Twitter', href: 'https://twitter.com', icon: 'twitter' },
      { label: 'GitHub', href: 'https://github.com', icon: 'github' },
    ]
    const api = createFooter({ socialLinks })
    // createFooter does not expose socialLinks on the API but should not throw
    expect(api.ariaProps.role).toBe('contentinfo')
  })

  it('accepts columns prop', () => {
    const columns = [
      {
        title: 'Product',
        links: [
          { label: 'Features', href: '/features' },
          { label: 'Pricing', href: '/pricing' },
        ],
      },
      {
        title: 'Company',
        links: [
          { label: 'About', href: '/about' },
        ],
      },
    ]
    const api = createFooter({ columns })
    expect(api.ariaProps.role).toBe('contentinfo')
  })

  it('accepts all props together', () => {
    const api = createFooter({
      copyright: '© 2026 Test',
      socialLinks: [{ label: 'X', href: 'https://x.com' }],
      columns: [{ title: 'Links', links: [{ label: 'Home', href: '/' }] }],
    })
    expect(api.copyrightText).toBe('© 2026 Test')
  })
})

describe('createFooter - ARIA', () => {
  it('always provides contentinfo role', () => {
    expect(createFooter().ariaProps.role).toBe('contentinfo')
    expect(createFooter({ copyright: 'test' }).ariaProps.role).toBe('contentinfo')
  })

  it('ariaProps does not include extra unexpected keys', () => {
    const keys = Object.keys(createFooter().ariaProps)
    expect(keys).toEqual(['role'])
  })
})

describe('footerVariants', () => {
  it('includes border-t', () => {
    expect(footerVariants()).toContain('border-t')
  })

  it('includes bg-background', () => {
    expect(footerVariants()).toContain('bg-background')
  })

  it('includes vertical padding', () => {
    expect(footerVariants()).toContain('py-8')
  })
})
