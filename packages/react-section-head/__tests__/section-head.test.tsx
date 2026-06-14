import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { SectionHead } from '../src/section-head.js'

const render = (props: Record<string, unknown>) =>
  renderToString(React.createElement(SectionHead, props as never))

describe('SectionHead (SSR)', () => {
  it('renders the title inside an h2', () => {
    const html = render({ title: 'Our Mission' })
    expect(html).toContain('<h2')
    expect(html).toContain('Our Mission')
  })

  it('renders kicker when provided', () => {
    const html = render({ title: 'Features', kicker: 'Why us' })
    expect(html).toContain('Why us')
  })

  it('renders lede when provided', () => {
    const html = render({ title: 'Features', lede: 'We make great software.' })
    expect(html).toContain('We make great software.')
  })

  it('omits kicker element when kicker is not provided', () => {
    const html = render({ title: 'No kicker here' })
    // kicker class only appears when kicker is rendered
    expect(html).not.toContain('tracking-widest')
  })

  it('omits lede element when lede is not provided', () => {
    const html = render({ title: 'No lede here' })
    expect(html).not.toContain('leading-relaxed')
  })

  it('applies data-align=center by default', () => {
    const html = render({ title: 'Centered' })
    expect(html).toContain('data-align="center"')
  })

  it('applies data-align=left when align is left', () => {
    const html = render({ title: 'Left', align: 'left' })
    expect(html).toContain('data-align="left"')
  })

  it('renders a custom heading tag via the as prop', () => {
    const html = render({ title: 'Top', as: 'h1' })
    expect(html).toContain('<h1')
    expect(html).not.toContain('<h2')
  })
})
