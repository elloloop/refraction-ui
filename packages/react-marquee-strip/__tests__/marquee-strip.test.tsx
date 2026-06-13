import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { MarqueeStrip } from '../src/marquee-strip.js'

const render = (props: Partial<React.ComponentProps<typeof MarqueeStrip>> & { items: string[] }) =>
  renderToString(React.createElement(MarqueeStrip, props))

describe('MarqueeStrip (SSR)', () => {
  it('renders with group role', () => {
    const html = render({ items: ['React', 'TypeScript'] })
    expect(html).toContain('role="group"')
  })

  it('renders the label in static mode', () => {
    const html = render({ label: 'Built with', items: ['React', 'TypeScript'] })
    expect(html).toContain('Built with')
  })

  it('renders each item in static mode', () => {
    const html = render({ items: ['React', 'TypeScript', 'Tailwind'] })
    expect(html).toContain('React')
    expect(html).toContain('TypeScript')
    expect(html).toContain('Tailwind')
  })

  it('sets data-scroll="false" by default', () => {
    const html = render({ items: ['React'] })
    expect(html).toContain('data-scroll="false"')
  })

  it('sets data-scroll="true" when scroll prop is true', () => {
    const html = render({ items: ['React', 'TypeScript'], scroll: true })
    expect(html).toContain('data-scroll="true"')
  })

  it('duplicates items in scroll mode for seamless loop', () => {
    const html = render({ items: ['React', 'Vue'], scroll: true })
    // Each item appears twice (original + duplicate)
    expect((html.match(/React/g) ?? []).length).toBe(2)
    expect((html.match(/Vue/g) ?? []).length).toBe(2)
  })
})
