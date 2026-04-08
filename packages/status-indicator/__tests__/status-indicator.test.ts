import { describe, it, expect } from 'vitest'
import { createStatusIndicator, STATUS_COLORS, STATUS_LABELS } from '../src/status-indicator.js'
import {
  statusContainerStyles,
  statusDotVariants,
  statusPulseVariants,
  statusLabelStyles,
} from '../src/status-indicator.styles.js'

describe('createStatusIndicator', () => {
  it('returns correct type', () => {
    const api = createStatusIndicator({ type: 'success' })
    expect(api.type).toBe('success')
  })

  it('returns correct color for success', () => {
    const api = createStatusIndicator({ type: 'success' })
    expect(api.color).toBe('green')
  })

  it('returns correct color for error', () => {
    const api = createStatusIndicator({ type: 'error' })
    expect(api.color).toBe('red')
  })

  it('returns correct color for warning', () => {
    const api = createStatusIndicator({ type: 'warning' })
    expect(api.color).toBe('yellow')
  })

  it('returns correct color for info', () => {
    const api = createStatusIndicator({ type: 'info' })
    expect(api.color).toBe('blue')
  })

  it('returns correct color for pending', () => {
    const api = createStatusIndicator({ type: 'pending' })
    expect(api.color).toBe('orange')
  })

  it('returns correct color for neutral', () => {
    const api = createStatusIndicator({ type: 'neutral' })
    expect(api.color).toBe('gray')
  })

  it('returns default label from type', () => {
    const api = createStatusIndicator({ type: 'success' })
    expect(api.label).toBe('Success')
  })

  it('allows custom label', () => {
    const api = createStatusIndicator({ type: 'success', label: 'Completed' })
    expect(api.label).toBe('Completed')
  })

  it('auto-enables pulse for pending', () => {
    const api = createStatusIndicator({ type: 'pending' })
    expect(api.pulse).toBe(true)
  })

  it('does not auto-enable pulse for other types', () => {
    const api = createStatusIndicator({ type: 'success' })
    expect(api.pulse).toBe(false)
  })

  it('allows pulse override for pending', () => {
    const api = createStatusIndicator({ type: 'pending', pulse: false })
    expect(api.pulse).toBe(false)
  })

  it('allows pulse override for non-pending', () => {
    const api = createStatusIndicator({ type: 'info', pulse: true })
    expect(api.pulse).toBe(true)
  })
})

describe('ARIA props', () => {
  it('has role=status', () => {
    const api = createStatusIndicator({ type: 'success' })
    expect(api.ariaProps.role).toBe('status')
  })

  it('has aria-label matching label', () => {
    const api = createStatusIndicator({ type: 'error' })
    expect(api.ariaProps['aria-label']).toBe('Error')
  })

  it('aria-label uses custom label', () => {
    const api = createStatusIndicator({ type: 'error', label: 'Failed' })
    expect(api.ariaProps['aria-label']).toBe('Failed')
  })
})

describe('STATUS_COLORS', () => {
  it('has all 6 types', () => {
    expect(Object.keys(STATUS_COLORS)).toHaveLength(6)
  })

  it('all values are strings', () => {
    for (const color of Object.values(STATUS_COLORS)) {
      expect(typeof color).toBe('string')
    }
  })
})

describe('STATUS_LABELS', () => {
  it('has all 6 types', () => {
    expect(Object.keys(STATUS_LABELS)).toHaveLength(6)
  })

  it('all values are strings', () => {
    for (const label of Object.values(STATUS_LABELS)) {
      expect(typeof label).toBe('string')
    }
  })
})

describe('styles', () => {
  it('exports container styles', () => {
    expect(statusContainerStyles).toContain('inline-flex')
  })

  it('exports label styles', () => {
    expect(statusLabelStyles).toContain('text-sm')
  })

  it('exports success dot variant', () => {
    const classes = statusDotVariants({ type: 'success' })
    expect(classes).toContain('bg-green-500')
  })

  it('exports error dot variant', () => {
    const classes = statusDotVariants({ type: 'error' })
    expect(classes).toContain('bg-red-500')
  })

  it('exports pending pulse variant', () => {
    const classes = statusPulseVariants({ type: 'pending' })
    expect(classes).toContain('animate-pulse')
    expect(classes).toContain('bg-orange-500')
  })

  it('exports warning dot variant', () => {
    const classes = statusDotVariants({ type: 'warning' })
    expect(classes).toContain('bg-yellow-500')
  })

  it('exports info dot variant', () => {
    const classes = statusDotVariants({ type: 'info' })
    expect(classes).toContain('bg-blue-500')
  })
})
