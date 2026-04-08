import { describe, it, expect } from 'vitest'
import { createContentProtection } from '../src/content-protection.js'
import { contentProtectionVariants, watermarkVariants } from '../src/content-protection.styles.js'

describe('createContentProtection', () => {
  it('generates event handlers when enabled', () => {
    const api = createContentProtection()
    expect(api.eventHandlers.onCopy).toBeDefined()
    expect(api.eventHandlers.onCut).toBeDefined()
    expect(api.eventHandlers.onContextMenu).toBeDefined()
    expect(api.eventHandlers.onSelectStart).toBeDefined()
  })

  it('generates no event handlers when disabled', () => {
    const api = createContentProtection({ enabled: false })
    expect(api.eventHandlers.onCopy).toBeUndefined()
    expect(api.eventHandlers.onCut).toBeUndefined()
    expect(api.eventHandlers.onContextMenu).toBeUndefined()
    expect(api.eventHandlers.onSelectStart).toBeUndefined()
  })

  it('disables only context menu when disableCopy=false', () => {
    const api = createContentProtection({ disableCopy: false })
    expect(api.eventHandlers.onCopy).toBeUndefined()
    expect(api.eventHandlers.onCut).toBeUndefined()
    expect(api.eventHandlers.onSelectStart).toBeUndefined()
    expect(api.eventHandlers.onContextMenu).toBeDefined()
  })

  it('disables only copy when disableContextMenu=false', () => {
    const api = createContentProtection({ disableContextMenu: false })
    expect(api.eventHandlers.onCopy).toBeDefined()
    expect(api.eventHandlers.onCut).toBeDefined()
    expect(api.eventHandlers.onContextMenu).toBeUndefined()
  })

  it('onCopy calls preventDefault', () => {
    const api = createContentProtection()
    let prevented = false
    api.eventHandlers.onCopy!({ preventDefault: () => { prevented = true } })
    expect(prevented).toBe(true)
  })

  it('onContextMenu calls preventDefault', () => {
    const api = createContentProtection()
    let prevented = false
    api.eventHandlers.onContextMenu!({ preventDefault: () => { prevented = true } })
    expect(prevented).toBe(true)
  })

  it('returns null watermarkConfig when no text', () => {
    const api = createContentProtection()
    expect(api.watermarkConfig).toBeNull()
  })

  it('returns watermarkConfig when text provided', () => {
    const api = createContentProtection({ watermarkText: 'Confidential' })
    expect(api.watermarkConfig).not.toBeNull()
    expect(api.watermarkConfig!.text).toBe('Confidential')
    expect(api.watermarkConfig!.opacity).toBe(0.08)
    expect(api.watermarkConfig!.angle).toBe(-45)
  })

  it('sets data-protected attribute when enabled', () => {
    const api = createContentProtection()
    expect(api.dataAttributes['data-protected']).toBe('true')
  })

  it('does not set data-protected when disabled', () => {
    const api = createContentProtection({ enabled: false })
    expect(api.dataAttributes['data-protected']).toBeUndefined()
  })
})

describe('contentProtectionVariants', () => {
  it('returns base styles', () => {
    const classes = contentProtectionVariants()
    expect(classes).toContain('relative')
    expect(classes).toContain('select-none')
  })
})

describe('watermarkVariants', () => {
  it('returns watermark overlay styles', () => {
    const classes = watermarkVariants()
    expect(classes).toContain('pointer-events-none')
    expect(classes).toContain('absolute')
  })
})
