import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resetIdCounter } from '@elloloop/shared'
import { createMobileNav } from '../src/mobile-nav.js'
import { mobileNavContentVariants, mobileNavTriggerVariants } from '../src/mobile-nav.styles.js'

beforeEach(() => {
  resetIdCounter()
})

describe('createMobileNav', () => {
  it('defaults to closed state', () => {
    const api = createMobileNav()
    expect(api.state.open).toBe(false)
  })

  it('accepts open=true', () => {
    const api = createMobileNav({ open: true })
    expect(api.state.open).toBe(true)
  })

  it('triggerProps has correct aria attributes', () => {
    const api = createMobileNav()
    expect(api.triggerProps['aria-expanded']).toBe(false)
    expect(api.triggerProps['aria-controls']).toMatch(/content$/)
    expect(api.triggerProps['aria-label']).toBe('Toggle menu')
  })

  it('triggerProps aria-expanded reflects open state', () => {
    const api = createMobileNav({ open: true })
    expect(api.triggerProps['aria-expanded']).toBe(true)
  })

  it('contentProps has role=menu and data-state', () => {
    const api = createMobileNav()
    expect(api.contentProps.role).toBe('menu')
    expect(api.contentProps['data-state']).toBe('closed')
  })

  it('contentProps data-state is open when open', () => {
    const api = createMobileNav({ open: true })
    expect(api.contentProps['data-state']).toBe('open')
  })

  it('contentProps id matches triggerProps aria-controls', () => {
    const api = createMobileNav()
    expect(api.contentProps.id).toBe(api.triggerProps['aria-controls'])
  })

  it('toggle calls onOpenChange', () => {
    const handler = vi.fn()
    const api = createMobileNav({ open: false, onOpenChange: handler })
    api.toggle()
    expect(handler).toHaveBeenCalledWith(true)
  })

  it('open calls onOpenChange(true)', () => {
    const handler = vi.fn()
    const api = createMobileNav({ onOpenChange: handler })
    api.open()
    expect(handler).toHaveBeenCalledWith(true)
  })

  it('close calls onOpenChange(false)', () => {
    const handler = vi.fn()
    const api = createMobileNav({ open: true, onOpenChange: handler })
    api.close()
    expect(handler).toHaveBeenCalledWith(false)
  })

  it('Escape key handler calls close', () => {
    const handler = vi.fn()
    const api = createMobileNav({ open: true, onOpenChange: handler })
    const escapeHandler = api.keyboardHandlers['Escape']
    expect(escapeHandler).toBeDefined()
    escapeHandler!({ key: 'Escape' } as unknown as KeyboardEvent)
    expect(handler).toHaveBeenCalledWith(false)
  })
})

describe('mobileNavContentVariants', () => {
  it('returns open state classes', () => {
    const classes = mobileNavContentVariants({ state: 'open' })
    expect(classes).toContain('opacity-100')
  })

  it('returns closed state classes', () => {
    const classes = mobileNavContentVariants({ state: 'closed' })
    expect(classes).toContain('opacity-0')
    expect(classes).toContain('pointer-events-none')
  })
})

describe('mobileNavTriggerVariants', () => {
  it('returns trigger classes', () => {
    const classes = mobileNavTriggerVariants()
    expect(classes).toContain('inline-flex')
  })
})
