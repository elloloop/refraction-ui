import { describe, it, expect } from 'vitest'
import { createLinkCard } from '../src/index.js'

describe('link-card core — data-slot contract', () => {
  it('exposes the link-card data-slot', () => {
    expect(createLinkCard()).toEqual({
      dataAttributes: { 'data-slot': 'link-card' },
    })
  })
})
