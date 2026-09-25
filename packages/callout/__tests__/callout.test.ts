import { describe, it, expect } from 'vitest'
import { createCallout } from '../src/index.js'

describe('callout core — data-slot/ARIA contract', () => {
  it('exposes the callout data-slot and no landmark role by default', () => {
    expect(createCallout()).toEqual({
      ariaProps: {},
      dataAttributes: { 'data-slot': 'callout' },
    })
  })

  it('is a region only when labelled, an alert when destructive, and honours an explicit role', () => {
    expect(createCallout({ labelled: true }).ariaProps.role).toBe('region')
    expect(createCallout({ destructive: true }).ariaProps.role).toBe('alert')
    expect(createCallout({ role: 'note', destructive: true }).ariaProps.role).toBe('note')
  })
})
