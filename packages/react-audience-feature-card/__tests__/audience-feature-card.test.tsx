import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { AudienceFeatureCard } from '../src/audience-feature-card.js'

const render = (props: Record<string, unknown>) =>
  renderToString(React.createElement(AudienceFeatureCard, props as never))

describe('AudienceFeatureCard (SSR)', () => {
  it('renders a group with the title', () => {
    const html = render({ title: 'For developers', body: 'Build faster.' })
    expect(html).toContain('role="group"')
    expect(html).toContain('For developers')
  })

  it('renders kicker and body when provided', () => {
    const html = render({
      kicker: 'For teams',
      title: 'Collaborate',
      body: 'Work together in real time.',
    })
    expect(html).toContain('For teams')
    expect(html).toContain('Work together in real time.')
  })

  it('renders footer node when provided', () => {
    const html = render({
      title: 'Enterprise',
      body: 'Scale with confidence.',
      footer: 'Contact sales →',
    })
    expect(html).toContain('Contact sales →')
  })

  it('omits kicker when absent', () => {
    const html = render({ title: 'Solo', body: 'Just you.' })
    expect(html).not.toContain('tracking-widest')
  })

  it('omits footer when absent', () => {
    const html = render({ title: 'Solo', body: 'Just you.' })
    expect(html).not.toContain('mt-auto')
  })
})
