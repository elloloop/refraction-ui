import { describe, expect, it } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Waveform } from '../src/waveform.js'

describe('Waveform (React)', () => {
  it('renders a root div and canvas', () => {
    const html = renderToString(React.createElement(Waveform))

    expect(html).toContain('<div')
    expect(html).toContain('<canvas')
    expect(html).toContain('data-waveform-canvas=""')
  })

  it('renders accessible waveform metadata', () => {
    const html = renderToString(React.createElement(Waveform))

    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="Audio waveform"')
    expect(html).toContain('aria-hidden="true"')
  })

  it('renders default data attributes', () => {
    const html = renderToString(React.createElement(Waveform))

    expect(html).toContain('data-variant="bars"')
    expect(html).toContain('data-paused="false"')
  })

  it('renders variant and paused state', () => {
    const html = renderToString(
      React.createElement(Waveform, { variant: 'rings', paused: true }),
    )

    expect(html).toContain('data-variant="rings"')
    expect(html).toContain('data-paused="true"')
  })

  it('applies dimensions to the root style', () => {
    const html = renderToString(
      React.createElement(Waveform, { width: 320, height: '6rem' }),
    )

    expect(html).toContain('width:320px')
    expect(html).toContain('height:6rem')
  })

  it('applies the default accent color variable', () => {
    const html = renderToString(React.createElement(Waveform))

    expect(html).toContain('--waveform-color:var(--accent-2)')
  })

  it('applies custom color and className', () => {
    const html = renderToString(
      React.createElement(Waveform, { color: 'red', className: 'custom-waveform' }),
    )

    expect(html).toContain('--waveform-color:red')
    expect(html).toContain('custom-waveform')
  })

  it('renders waveform variant classes', () => {
    const html = renderToString(React.createElement(Waveform))

    expect(html).toContain('relative')
    expect(html).toContain('overflow-hidden')
    expect(html).toContain('h-full')
    expect(html).toContain('w-full')
  })
})

// ---------------------------------------------------------------
// Additional SSR coverage (defaults, variants, passthrough)
// ---------------------------------------------------------------

describe('Waveform – defaults (React)', () => {
  it('applies the default 80px height and full width', () => {
    const html = renderToString(React.createElement(Waveform))

    expect(html).toContain('height:80px')
    expect(html).toContain('width:100%')
  })

  it('hides the canvas from assistive tech', () => {
    const html = renderToString(React.createElement(Waveform))

    const canvasMatch = html.match(/<canvas[^>]*>/)
    expect(canvasMatch).toBeTruthy()
    expect(canvasMatch![0]).toContain('aria-hidden="true"')
  })

  it('renders safely from explicit samples', () => {
    const html = renderToString(
      React.createElement(Waveform, { samples: [0.1, 0.5, 1, 0.5, 0.1] }),
    )

    expect(html).toContain('data-variant="bars"')
    expect(html).toContain('data-paused="false"')
  })

  it('supports Float32Array samples via the source prop', () => {
    const html = renderToString(
      React.createElement(Waveform, { source: new Float32Array([0.25, 0.75]) }),
    )

    expect(html).toContain('data-waveform-canvas')
  })
})

describe('Waveform – variants and passthrough (React)', () => {
  it('exposes the line variant via data attribute', () => {
    const html = renderToString(
      React.createElement(Waveform, { variant: 'line' }),
    )

    expect(html).toContain('data-variant="line"')
  })

  it('forwards extra props to the root element', () => {
    const html = renderToString(
      React.createElement(Waveform, { id: 'live-wave', 'data-testid': 'wave' }),
    )

    expect(html).toContain('id="live-wave"')
    expect(html).toContain('data-testid="wave"')
  })
})
