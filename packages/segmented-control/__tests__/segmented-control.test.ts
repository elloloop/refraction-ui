import { describe, it, expect } from 'vitest'
import {
  createSegmentedControl,
  getNextSegmentIndex,
  segmentedControlVariants,
  segmentedControlItemVariants,
} from '../src/index.js'

describe('getNextSegmentIndex', () => {
  it('moves to the next index and wraps past the end', () => {
    expect(getNextSegmentIndex(0, 'ArrowRight', 3)).toBe(1)
    expect(getNextSegmentIndex(2, 'ArrowDown', 3)).toBe(0)
  })

  it('moves to the previous index and wraps before the start', () => {
    expect(getNextSegmentIndex(1, 'ArrowLeft', 3)).toBe(0)
    expect(getNextSegmentIndex(0, 'ArrowUp', 3)).toBe(2)
  })

  it('jumps to first on Home and last on End', () => {
    expect(getNextSegmentIndex(2, 'Home', 3)).toBe(0)
    expect(getNextSegmentIndex(0, 'End', 3)).toBe(2)
  })

  it('returns current for unhandled keys and empty groups', () => {
    expect(getNextSegmentIndex(1, 'Enter', 3)).toBe(1)
    expect(getNextSegmentIndex(0, 'ArrowRight', 0)).toBe(0)
  })
})

describe('createSegmentedControl', () => {
  it('exposes a radiogroup role', () => {
    const api = createSegmentedControl()
    expect(api.ariaProps.role).toBe('radiogroup')
  })

  it('reflects size and value via data attributes', () => {
    const api = createSegmentedControl({ size: 'sm', value: 'week' })
    expect(api.dataAttributes['data-size']).toBe('sm')
    expect(api.dataAttributes['data-value']).toBe('week')
  })

  it('omits data-value when no value is selected', () => {
    const api = createSegmentedControl()
    expect(api.dataAttributes['data-value']).toBeUndefined()
    expect(api.dataAttributes['data-size']).toBe('md')
  })
})

describe('segmented-control variants', () => {
  it('container produces the pill styling', () => {
    const cls = segmentedControlVariants({ size: 'md' })
    expect(cls).toContain('rounded-lg')
    expect(cls).toContain('bg-muted')
  })

  it('item reflects checked vs unchecked and size', () => {
    expect(segmentedControlItemVariants({ state: 'checked', size: 'md' })).toContain(
      'bg-background',
    )
    expect(
      segmentedControlItemVariants({ state: 'unchecked', size: 'sm' }),
    ).toContain('text-muted-foreground')
    expect(segmentedControlItemVariants({ size: 'sm' })).toContain('px-2.5')
  })
})
