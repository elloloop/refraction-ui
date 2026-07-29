import { describe, it, expect } from 'vitest'
import { createCallout } from '../src/index.js'

describe('callout core — data-slot/ARIA contract', () => {
  it('exposes the callout data-slot with a default region role', () => {
    expect(createCallout()).toEqual({
      ariaProps: { role: 'region' },
      dataAttributes: { 'data-slot': 'callout' },
    })
  })
})
