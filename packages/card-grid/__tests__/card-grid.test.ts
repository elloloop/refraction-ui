import { describe, it, expect } from 'vitest'
import { createCardGrid } from '../src/index.js'

describe('card-grid core — data-slot contract', () => {
  it('exposes the card-grid data-slot', () => {
    expect(createCardGrid()).toEqual({
      dataAttributes: { 'data-slot': 'card-grid' },
    })
  })
})
