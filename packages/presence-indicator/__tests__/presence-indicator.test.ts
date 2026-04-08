import { describe, it, expect } from 'vitest'
import { createPresence, STATUS_COLORS, STATUS_LABELS } from '../src/presence-indicator.js'
import {
  presenceDotVariants,
  presenceContainerStyles,
  presenceLabelStyles,
} from '../src/presence-indicator.styles.js'

describe('createPresence', () => {
  it('returns correct color for online', () => {
    const api = createPresence({ status: 'online' })
    expect(api.color).toBe('green')
  })

  it('returns correct color for offline', () => {
    const api = createPresence({ status: 'offline' })
    expect(api.color).toBe('gray')
  })

  it('returns correct color for away', () => {
    const api = createPresence({ status: 'away' })
    expect(api.color).toBe('yellow')
  })

  it('returns correct color for busy', () => {
    const api = createPresence({ status: 'busy' })
    expect(api.color).toBe('red')
  })

  it('returns correct color for dnd', () => {
    const api = createPresence({ status: 'dnd' })
    expect(api.color).toBe('red')
  })

  it('returns correct label for online', () => {
    const api = createPresence({ status: 'online' })
    expect(api.label).toBe('Online')
  })

  it('returns correct label for offline', () => {
    const api = createPresence({ status: 'offline' })
    expect(api.label).toBe('Offline')
  })

  it('returns correct label for away', () => {
    const api = createPresence({ status: 'away' })
    expect(api.label).toBe('Away')
  })

  it('returns correct label for busy', () => {
    const api = createPresence({ status: 'busy' })
    expect(api.label).toBe('Busy')
  })

  it('returns correct label for dnd', () => {
    const api = createPresence({ status: 'dnd' })
    expect(api.label).toBe('Do Not Disturb')
  })

  it('allows custom label override', () => {
    const api = createPresence({ status: 'online', label: 'Active' })
    expect(api.label).toBe('Active')
  })

  it('defaults showLabel to false', () => {
    const api = createPresence({ status: 'online' })
    expect(api.showLabel).toBe(false)
  })

  it('respects showLabel=true', () => {
    const api = createPresence({ status: 'online', showLabel: true })
    expect(api.showLabel).toBe(true)
  })

  it('returns the status', () => {
    const api = createPresence({ status: 'away' })
    expect(api.status).toBe('away')
  })
})

describe('ARIA props', () => {
  it('has role=status', () => {
    const api = createPresence({ status: 'online' })
    expect(api.ariaProps.role).toBe('status')
  })

  it('has aria-label matching the label', () => {
    const api = createPresence({ status: 'online' })
    expect(api.ariaProps['aria-label']).toBe('Online')
  })

  it('aria-label uses custom label when provided', () => {
    const api = createPresence({ status: 'online', label: 'Available' })
    expect(api.ariaProps['aria-label']).toBe('Available')
  })
})

describe('STATUS_COLORS', () => {
  it('has all 5 statuses', () => {
    expect(Object.keys(STATUS_COLORS)).toHaveLength(5)
  })

  it('all values are strings', () => {
    for (const color of Object.values(STATUS_COLORS)) {
      expect(typeof color).toBe('string')
    }
  })
})

describe('STATUS_LABELS', () => {
  it('has all 5 statuses', () => {
    expect(Object.keys(STATUS_LABELS)).toHaveLength(5)
  })

  it('all values are strings', () => {
    for (const label of Object.values(STATUS_LABELS)) {
      expect(typeof label).toBe('string')
    }
  })
})

describe('styles', () => {
  it('exports container styles', () => {
    expect(presenceContainerStyles).toContain('inline-flex')
  })

  it('exports label styles', () => {
    expect(presenceLabelStyles).toContain('text-sm')
  })

  it('exports online dot variant', () => {
    const classes = presenceDotVariants({ status: 'online' })
    expect(classes).toContain('bg-green-500')
  })

  it('exports offline dot variant', () => {
    const classes = presenceDotVariants({ status: 'offline' })
    expect(classes).toContain('bg-gray-400')
  })

  it('exports away dot variant', () => {
    const classes = presenceDotVariants({ status: 'away' })
    expect(classes).toContain('bg-yellow-500')
  })
})
