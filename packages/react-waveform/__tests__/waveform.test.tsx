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
