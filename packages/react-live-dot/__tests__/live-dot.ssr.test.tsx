import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { LiveDot, type LiveDotProps } from '../src/index.js'

const render = (props: LiveDotProps = {}) =>
  renderToString(<LiveDot {...props} />)

const count = (html: string, needle: string) => html.split(needle).length - 1

describe('LiveDot (SSR)', () => {
  it('renders a decorative live dot by default', () => {
    const html = render()
    expect(html).toContain('aria-hidden="true"')
    expect(html).not.toContain('role="img"')
    expect(html).toContain('data-live="true"')
    expect(html).toContain('data-live-dot-halo')
    expect(html).toContain('data-live-dot-core')
  })

  it('draws the halo with the ping animation and a reduced-motion hold', () => {
    const html = render({ live: true })
    expect(html).toContain('animate-ping')
    expect(html).toContain('motion-reduce:animate-none')
  })

  it('draws a plain dot without a halo when live is false', () => {
    const html = render({ live: false })
    expect(html).toContain('data-live="false"')
    expect(html).not.toContain('data-live-dot-halo')
    expect(html).not.toContain('animate-ping')
    expect(count(html, 'data-live-dot-core')).toBe(1)
  })

  it('applies the colour token to both the dot and the halo', () => {
    const html = render({ color: 'destructive' })
    expect(html).toContain('data-color="destructive"')
    expect(count(html, 'bg-destructive')).toBe(2)
  })

  it('maps named sizes to size classes', () => {
    expect(render({ size: 'lg' })).toContain('size-3')
    expect(render({ size: 'xs' })).toContain('size-1.5')
  })

  it('applies a rem size inline', () => {
    const html = render({ size: 1 })
    expect(html).toContain('data-size="custom"')
    expect(html).toContain('width:1rem')
    expect(html).toContain('height:1rem')
  })

  it('becomes a labelled image when given a label', () => {
    const html = render({ label: 'Recording' })
    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="Recording"')
    expect(html).not.toContain('aria-hidden')
  })

  it('treats aria-label as the label', () => {
    const html = render({ 'aria-label': 'On air' })
    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="On air"')
  })

  it('is not focusable (it is not a control)', () => {
    expect(render()).not.toContain('tabindex')
  })

  it('merges className and passes through HTML attributes', () => {
    const html = render({ className: 'ml-2', id: 'rec-dot', title: 'Live' })
    expect(html).toContain('ml-2')
    expect(html).toContain('id="rec-dot"')
    expect(html).toContain('title="Live"')
  })
})
