import { describe, it, expect } from 'vitest'
import { createAudienceFeatureCard } from '../src/index.js'

describe('createAudienceFeatureCard', () => {
  it('exposes group role', () => {
    const { ariaProps } = createAudienceFeatureCard()
    expect(ariaProps.role).toBe('group')
  })

  it('includes data-component attribute', () => {
    const { dataAttributes } = createAudienceFeatureCard({ title: 'Test' })
    expect(dataAttributes['data-component']).toBe('audience-feature-card')
  })
})
