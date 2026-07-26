import { describe, it, expect } from 'vitest'
import { createSkipToContent } from '../src/index.js'

describe('skip-to-content core — data-slot contract', () => {
  it('exposes the skip-to-content data-slot', () => {
    expect(createSkipToContent()).toEqual({
      dataAttributes: { 'data-slot': 'skip-to-content' },
    })
  })
})
