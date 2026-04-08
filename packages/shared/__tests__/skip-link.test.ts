import { describe, it, expect } from 'vitest'
import { createSkipLink } from '../src/skip-link.js'

describe('createSkipLink', () => {
  it('returns default props when called with no arguments', () => {
    const result = createSkipLink()
    expect(result.href).toBe('#main-content')
    expect(result.label).toBe('Skip to main content')
  })

  it('uses custom targetId', () => {
    const result = createSkipLink({ targetId: 'content-area' })
    expect(result.href).toBe('#content-area')
  })

  it('uses custom label', () => {
    const result = createSkipLink({ label: 'Jump to content' })
    expect(result.label).toBe('Jump to content')
    expect(result.ariaProps['aria-label']).toBe('Jump to content')
  })

  it('provides aria props with role and aria-label', () => {
    const result = createSkipLink()
    expect(result.ariaProps.role).toBe('link')
    expect(result.ariaProps['aria-label']).toBe('Skip to main content')
  })

  it('provides className with sr-only and focus styles', () => {
    const result = createSkipLink()
    expect(result.className).toContain('sr-only')
    expect(result.className).toContain('focus:not-sr-only')
    expect(result.className).toContain('focus:absolute')
    expect(result.className).toContain('focus:z-50')
  })

  it('uses both custom targetId and label', () => {
    const result = createSkipLink({
      targetId: 'my-main',
      label: 'Skip navigation',
    })
    expect(result.href).toBe('#my-main')
    expect(result.label).toBe('Skip navigation')
    expect(result.ariaProps['aria-label']).toBe('Skip navigation')
  })

  it('returns all expected properties', () => {
    const result = createSkipLink()
    expect(result).toHaveProperty('ariaProps')
    expect(result).toHaveProperty('href')
    expect(result).toHaveProperty('label')
    expect(result).toHaveProperty('className')
  })
})
