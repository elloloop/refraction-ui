import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { PricingCard } from '../src/pricing-card.js'

const defaultProps = {
  name: 'Pro',
  price: '$29',
  features: ['Unlimited projects', 'Priority support'],
  cta: 'Get started',
}

const render = (props: Partial<React.ComponentProps<typeof PricingCard>> = {}) =>
  renderToString(React.createElement(PricingCard, { ...defaultProps, ...props }))

describe('PricingCard (SSR)', () => {
  it('renders the plan name and price', () => {
    const html = render()
    expect(html).toContain('Pro')
    expect(html).toContain('$29')
  })

  it('renders each feature in the list', () => {
    const html = render()
    expect(html).toContain('Unlimited projects')
    expect(html).toContain('Priority support')
  })

  it('renders the badge when provided', () => {
    const html = render({ badge: 'Most popular' })
    expect(html).toContain('Most popular')
  })

  it('renders the CTA label', () => {
    const html = render()
    expect(html).toContain('Get started')
  })

  it('adds ring class when featured', () => {
    const html = render({ featured: true })
    expect(html).toContain('ring-1')
    expect(html).toContain('ring-primary')
    expect(html).toContain('data-featured="true"')
  })

  it('does not add ring class when not featured', () => {
    const html = render({ featured: false })
    expect(html).toContain('data-featured="false"')
    expect(html).not.toContain('ring-1 ring-primary')
  })

  it('renders an anchor element when ctaHref is given', () => {
    const html = render({ ctaHref: 'https://example.com/pro' })
    expect(html).toContain('<a')
    expect(html).toContain('href="https://example.com/pro"')
  })

  it('renders a button element when ctaHref is not given', () => {
    const html = render()
    expect(html).toContain('<button')
  })

  it('renders the period when provided', () => {
    const html = render({ period: '/ month' })
    expect(html).toContain('/ month')
  })

  it('renders role="group" from the headless core', () => {
    const html = render()
    expect(html).toContain('role="group"')
  })
})
