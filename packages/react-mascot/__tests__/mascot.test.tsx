import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Mascot } from '../src/mascot.js'

const render = (props: Record<string, any> = {}) =>
  renderToString(React.createElement(Mascot, props))

describe('Mascot (SSR)', () => {
  it('renders an SVG with the mascot class and correct role', () => {
    const html = render()
    expect(html).toContain('<svg')
    expect(html).toContain('class="mascot')
    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="Tobi the Tortoise feeling happy"')
  })

  it('renders thinking eyes and mouth when mood is think', () => {
    const html = render({ mood: 'think' })
    expect(html).toContain('class="mascot-face-think"')
    expect(html).toContain('aria-label="Tobi the Tortoise feeling think"')
  })

  it('renders waving arm when mood is wave', () => {
    const html = render({ mood: 'wave' })
    expect(html).toContain('class="m-wave"')
    expect(html).toContain('aria-label="Tobi the Tortoise feeling wave"')
  })

  it('injects core CSS variables in style attribute', () => {
    const html = render({ mood: 'think' })
    expect(html).toContain('style="')
    expect(html).toContain('--rfr-mascot-shell:250 65% 55%')
  })

  it('passes forward data attributes and HTML props', () => {
    const html = render({ 'data-testid': 'mascot-element', id: 'custom-tobi' })
    expect(html).toContain('data-testid="mascot-element"')
    expect(html).toContain('id="custom-tobi"')
  })
})
