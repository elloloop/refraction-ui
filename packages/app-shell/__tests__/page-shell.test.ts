import { describe, it, expect } from 'vitest'
import { createPageShell } from '../src/page-shell.js'

// ---------------------------------------------------------------------------
// Default config
// ---------------------------------------------------------------------------

describe('createPageShell — default config', () => {
  it('returns resolved config with all defaults', () => {
    const api = createPageShell()
    expect(api.config.maxWidth).toBe('80rem')
    expect(api.config.navHeight).toBe('4rem')
    expect(api.config.navTransparent).toBe(false)
    expect(api.config.navSticky).toBe(true)
    expect(api.config.footerColumns).toBe(4)
  })

  it('respects partial config overrides', () => {
    const api = createPageShell({ maxWidth: '60rem', footerColumns: 3 })
    expect(api.config.maxWidth).toBe('60rem')
    expect(api.config.footerColumns).toBe(3)
    expect(api.config.navHeight).toBe('4rem') // default
  })
})

// ---------------------------------------------------------------------------
// ARIA props
// ---------------------------------------------------------------------------

describe('createPageShell — ARIA', () => {
  it('navAriaProps has navigation role', () => {
    const api = createPageShell()
    expect(api.navAriaProps.role).toBe('navigation')
    expect(api.navAriaProps['aria-label']).toBe('Main navigation')
  })

  it('footerAriaProps has contentinfo role', () => {
    const api = createPageShell()
    expect(api.footerAriaProps.role).toBe('contentinfo')
  })
})

// ---------------------------------------------------------------------------
// getSectionClasses
// ---------------------------------------------------------------------------

describe('createPageShell — getSectionClasses', () => {
  it('returns contained classes by default', () => {
    const api = createPageShell()
    const classes = api.getSectionClasses()
    expect(classes).toContain('mx-auto')
    expect(classes).toContain('w-full')
    expect(classes).toContain('max-w-[var(--page-max-width)]')
    expect(classes).toContain('px-4')
  })

  it('fullWidth section skips max-width and mx-auto', () => {
    const api = createPageShell()
    const classes = api.getSectionClasses({ fullWidth: true })
    expect(classes).not.toContain('mx-auto')
    expect(classes).not.toContain('max-w-')
    expect(classes).toContain('px-4')
  })

  it('custom maxWidth overrides default', () => {
    const api = createPageShell()
    const classes = api.getSectionClasses({ maxWidth: '5xl' })
    expect(classes).toContain('max-w-5xl')
    expect(classes).not.toContain('max-w-[var(--page-max-width)]')
  })

  it('padding=false removes padding classes', () => {
    const api = createPageShell()
    const classes = api.getSectionClasses({ padding: false })
    expect(classes).not.toContain('px-4')
    expect(classes).not.toContain('sm:px-6')
  })

  it('background=muted adds bg-muted class', () => {
    const api = createPageShell()
    const classes = api.getSectionClasses({ background: 'muted' })
    expect(classes).toContain('bg-muted')
  })

  it('background=primary adds primary classes', () => {
    const api = createPageShell()
    const classes = api.getSectionClasses({ background: 'primary' })
    expect(classes).toContain('bg-primary')
    expect(classes).toContain('text-primary-foreground')
  })

  it('background=none adds no background class', () => {
    const api = createPageShell()
    const classes = api.getSectionClasses({ background: 'none' })
    expect(classes).not.toContain('bg-')
  })

  it('background=default adds no background class', () => {
    const api = createPageShell()
    const classes = api.getSectionClasses({ background: 'default' })
    expect(classes).not.toContain('bg-')
  })

  it('handles empty sectionConfig', () => {
    const api = createPageShell()
    const classes = api.getSectionClasses({})
    expect(classes).toContain('mx-auto')
    expect(classes).toContain('px-4')
  })
})

// ---------------------------------------------------------------------------
// CSS variables
// ---------------------------------------------------------------------------

describe('createPageShell — CSS variables', () => {
  it('returns all CSS variables', () => {
    const api = createPageShell()
    const vars = api.getCSSVariables()
    expect(vars['--page-max-width']).toBe('80rem')
    expect(vars['--page-nav-height']).toBe('4rem')
    expect(vars['--page-footer-columns']).toBe('4')
  })

  it('uses custom config values', () => {
    const api = createPageShell({ maxWidth: '60rem', navHeight: '5rem', footerColumns: 3 })
    const vars = api.getCSSVariables()
    expect(vars['--page-max-width']).toBe('60rem')
    expect(vars['--page-nav-height']).toBe('5rem')
    expect(vars['--page-footer-columns']).toBe('3')
  })
})

// ---------------------------------------------------------------------------
// Nav config
// ---------------------------------------------------------------------------

describe('createPageShell — nav config', () => {
  it('navTransparent defaults to false', () => {
    const api = createPageShell()
    expect(api.config.navTransparent).toBe(false)
  })

  it('navTransparent can be set to true', () => {
    const api = createPageShell({ navTransparent: true })
    expect(api.config.navTransparent).toBe(true)
  })

  it('navSticky defaults to true', () => {
    const api = createPageShell()
    expect(api.config.navSticky).toBe(true)
  })

  it('navSticky can be set to false', () => {
    const api = createPageShell({ navSticky: false })
    expect(api.config.navSticky).toBe(false)
  })
})
