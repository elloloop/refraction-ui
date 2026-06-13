import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { InfiniteCanvas } from '../src/infinite-canvas.js'

const render = (props: Record<string, unknown>, children?: React.ReactNode) =>
  renderToString(React.createElement(InfiniteCanvas, props as never, children))

describe('InfiniteCanvas (SSR)', () => {
  it('renders role=group on the viewport', () => {
    const html = render({ 'aria-label': 'My canvas' })
    expect(html).toContain('role="group"')
  })

  it('sets aria-label to Canvas by default', () => {
    const html = render({})
    expect(html).toContain('aria-label="Canvas"')
  })

  it('renders children inside a transformed content layer', () => {
    const html = render({}, React.createElement('div', { id: 'child' }, 'hello'))
    expect(html).toContain('id="child"')
    expect(html).toContain('translate(')
    expect(html).toContain('scale(')
  })

  it('applies transformOrigin 0 0 on the content layer', () => {
    const html = render({ zoom: 2, x: 10, y: 20 })
    expect(html).toContain('transform-origin:0 0')
  })

  it('renders zoom controls when showControls is true', () => {
    const html = render({ showControls: true })
    expect(html).toContain('aria-label="Zoom in"')
    expect(html).toContain('aria-label="Zoom out"')
    expect(html).toContain('aria-label="Fit to content"')
  })

  it('does not render zoom controls by default', () => {
    const html = render({})
    expect(html).not.toContain('aria-label="Zoom in"')
  })

  it('reflects zoom in data-zoom attribute', () => {
    const html = render({ zoom: 1.5 })
    expect(html).toContain('data-zoom="1.5"')
  })

  it('applies controlled transform to the content layer style', () => {
    const html = render({ zoom: 2, x: 100, y: 50 })
    expect(html).toContain('translate(100px, 50px) scale(2)')
  })
})
