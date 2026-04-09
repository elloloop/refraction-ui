import { describe, it, expect, beforeEach } from 'vitest'
import { resetIdCounter } from '@refraction-ui/shared'
import { createInputGroup } from '../src/input-group.js'
import { inputGroupVariants, inputGroupAddonVariants, inputGroupButtonVariants } from '../src/input-group.styles.js'

beforeEach(() => {
  resetIdCounter()
})

describe('createInputGroup', () => {
  it('returns role=group in ariaProps', () => {
    const api = createInputGroup()
    expect(api.ariaProps.role).toBe('group')
  })

  it('defaults to horizontal orientation', () => {
    const api = createInputGroup()
    expect(api.dataAttributes['data-orientation']).toBe('horizontal')
  })

  it('accepts vertical orientation', () => {
    const api = createInputGroup({ orientation: 'vertical' })
    expect(api.dataAttributes['data-orientation']).toBe('vertical')
  })

  it('generates an id', () => {
    const api = createInputGroup()
    expect(api.dataAttributes.id).toMatch(/^rfr-input-group-/)
  })

  it('uses provided id', () => {
    const api = createInputGroup({ id: 'my-group' })
    expect(api.dataAttributes.id).toBe('my-group')
  })

  it('passes through aria-label', () => {
    const api = createInputGroup({ 'aria-label': 'Search' })
    expect(api.ariaProps['aria-label']).toBe('Search')
  })

  it('passes through aria-labelledby', () => {
    const api = createInputGroup({ 'aria-labelledby': 'label-id' })
    expect(api.ariaProps['aria-labelledby']).toBe('label-id')
  })
})

describe('inputGroupVariants', () => {
  it('returns horizontal classes by default', () => {
    const classes = inputGroupVariants()
    expect(classes).toContain('flex')
    expect(classes).toContain('flex-row')
  })

  it('returns vertical classes', () => {
    const classes = inputGroupVariants({ orientation: 'vertical' })
    expect(classes).toContain('flex-col')
  })

  it('appends custom className', () => {
    const classes = inputGroupVariants({ className: 'my-custom' })
    expect(classes).toContain('my-custom')
  })
})

describe('inputGroupAddonVariants', () => {
  it('returns base addon classes', () => {
    const classes = inputGroupAddonVariants()
    expect(classes).toContain('flex')
    expect(classes).toContain('items-center')
  })
})

describe('inputGroupButtonVariants', () => {
  it('returns base button classes', () => {
    const classes = inputGroupButtonVariants()
    expect(classes).toContain('inline-flex')
  })
})
