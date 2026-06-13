import { describe, it, expect } from 'vitest'
import { createPricingCard } from '../src/index.js'

describe('createPricingCard', () => {
  it('exposes group role', () => {
    const { ariaProps } = createPricingCard()
    expect(ariaProps.role).toBe('group')
  })

  it('sets data-featured to "false" by default', () => {
    const { dataAttributes } = createPricingCard()
    expect(dataAttributes['data-featured']).toBe('false')
  })

  it('sets data-featured to "true" when featured is true', () => {
    const { dataAttributes } = createPricingCard({ featured: true })
    expect(dataAttributes['data-featured']).toBe('true')
  })

  it('sets data-featured to "false" when featured is explicitly false', () => {
    const { dataAttributes } = createPricingCard({ featured: false })
    expect(dataAttributes['data-featured']).toBe('false')
  })
})
