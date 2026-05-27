import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { StatusIndicator } from '../src/status-indicator.js'

describe('StatusIndicator (React)', () => {
  it('renders with explicit label', () => {
    const html = renderToString(
      React.createElement(StatusIndicator, { type: 'success', label: 'Ready' }),
    )
    expect(html).toContain('Ready')
    expect(html).toContain('aria-label="Ready"')
  })

  it('accepts children as a fallback label (issue #200)', () => {
    const html = renderToString(
      React.createElement(
        StatusIndicator,
        { type: 'success' },
        'Microphone · ready',
      ),
    )
    expect(html).toContain('Microphone · ready')
    expect(html).toContain('aria-label="Microphone · ready"')
    // The headless default ("Success") must NOT leak through when children present
    expect(html).not.toContain('>Success<')
  })

  it('prefers explicit label over children when both are passed', () => {
    const html = renderToString(
      React.createElement(
        StatusIndicator,
        { type: 'warning', label: 'Wins' },
        'Loses',
      ),
    )
    expect(html).toContain('Wins')
    expect(html).not.toContain('Loses')
  })

  it('falls back to the type-derived label when neither label nor children given', () => {
    const html = renderToString(
      React.createElement(StatusIndicator, { type: 'error' }),
    )
    expect(html).toContain('Error')
    expect(html).toContain('aria-label="Error"')
  })

  it('omits the visible label span when showLabel is false but keeps aria-label', () => {
    const html = renderToString(
      React.createElement(StatusIndicator, {
        type: 'pending',
        label: 'Connecting',
        showLabel: false,
      }),
    )
    expect(html).toContain('aria-label="Connecting"')
    // Only the dot span remains visible — no second span with the label text.
    expect(html).not.toMatch(/>Connecting</)
  })

  it('renders rich children (ReactNode) as the visible label', () => {
    const html = renderToString(
      React.createElement(
        StatusIndicator,
        { type: 'info' },
        React.createElement('strong', null, 'Built-in'),
        ' · ready',
      ),
    )
    expect(html).toContain('<strong>Built-in</strong>')
    expect(html).toContain(' · ready')
  })

  it('uses the pulse class for pending status by default', () => {
    const html = renderToString(
      React.createElement(StatusIndicator, { type: 'pending', label: 'Loading' }),
    )
    // Pulse variant adds an `animate-` token in the headless styles map.
    expect(html).toMatch(/animate-/)
  })

  it('applies a custom className on the outer span', () => {
    const html = renderToString(
      React.createElement(StatusIndicator, {
        type: 'neutral',
        className: 'my-extra-class',
      }),
    )
    expect(html).toContain('my-extra-class')
  })
})
