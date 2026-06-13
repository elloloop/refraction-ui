import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { MiniMap } from '../src/mini-map.js'
import type { MiniMapItem, Rect } from '@refraction-ui/mini-map'

const render = (props: Record<string, unknown>) =>
  renderToString(React.createElement(MiniMap as React.FC, props))

const items: MiniMapItem[] = [
  { id: 'node-1', x: 0, y: 0, width: 100, height: 60 },
  { id: 'node-2', x: 300, y: 200, width: 80, height: 50 },
  { id: 'node-3', x: 150, y: 80, width: 60, height: 40 },
]

const viewport: Rect = { x: 50, y: 50, width: 200, height: 150 }

describe('MiniMap (SSR)', () => {
  it('renders role="img" on the container', () => {
    const html = render({ items })
    expect(html).toContain('role="img"')
  })

  it('renders one dot per item', () => {
    const html = render({ items, width: 200, height: 140 })
    // Each dot is a <span> with miniMapDotClass; count aria-hidden="true" spans
    const dotCount = (html.match(/aria-hidden="true"/g) ?? []).length
    // 3 dots, no viewport rect → exactly 3
    expect(dotCount).toBe(items.length)
  })

  it('renders the viewport indicator rect when viewport is provided', () => {
    const html = render({ items, viewport, width: 200, height: 140 })
    // 3 dots + 1 viewport rect = 4 aria-hidden spans
    const hiddenCount = (html.match(/aria-hidden="true"/g) ?? []).length
    expect(hiddenCount).toBe(items.length + 1)
  })

  it('omits viewport rect when viewport prop is not given', () => {
    const html = render({ items, width: 200, height: 140 })
    const hiddenCount = (html.match(/aria-hidden="true"/g) ?? []).length
    expect(hiddenCount).toBe(items.length)
  })

  it('applies data-component attribute', () => {
    const html = render({ items })
    expect(html).toContain('data-component="mini-map"')
  })
})
