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

describe('StatusIndicator (React) – status variants', () => {
  it.each([
    ['success', 'Success', 'bg-green-500'],
    ['error', 'Error', 'bg-red-500'],
    ['warning', 'Warning', 'bg-yellow-500'],
    ['info', 'Info', 'bg-blue-500'],
    ['pending', 'Pending', 'bg-orange-500'],
    ['neutral', 'Neutral', 'bg-gray-400'],
  ] as const)(
    'type "%s" renders label "%s" with dot color "%s"',
    (type, label, colorClass) => {
      const html = renderToString(
        React.createElement(StatusIndicator, { type }),
      )
      expect(html).toContain(`aria-label="${label}"`)
      expect(html).toMatch(new RegExp(`>${label}<`))
      expect(html).toContain(colorClass)
    },
  )
})

describe('StatusIndicator (React) – ARIA', () => {
  it('has role status on the container', () => {
    const html = renderToString(
      React.createElement(StatusIndicator, { type: 'info' }),
    )
    expect(html).toContain('role="status"')
  })

  it('aria-label always matches the visible text label', () => {
    const html = renderToString(
      React.createElement(StatusIndicator, { type: 'warning', label: 'Disk low' }),
    )
    expect(html).toContain('aria-label="Disk low"')
    expect(html).toMatch(/>Disk low</)
  })

  it('numeric children are accepted as the label', () => {
    const html = renderToString(
      React.createElement(StatusIndicator, { type: 'info' }, 3),
    )
    expect(html).toContain('aria-label="3"')
    expect(html).toMatch(/>3</)
  })
})

describe('StatusIndicator (React) – pulse', () => {
  it('pending pulses by default', () => {
    const html = renderToString(
      React.createElement(StatusIndicator, { type: 'pending' }),
    )
    expect(html).toContain('animate-pulse')
  })

  it('non-pending types do not pulse by default', () => {
    const html = renderToString(
      React.createElement(StatusIndicator, { type: 'success' }),
    )
    expect(html).not.toContain('animate-pulse')
  })

  it('pulse can be enabled explicitly on any type', () => {
    const html = renderToString(
      React.createElement(StatusIndicator, { type: 'error', pulse: true }),
    )
    expect(html).toContain('animate-pulse')
    // The type color is kept on the pulsing dot
    expect(html).toContain('bg-red-500')
  })

  it('pulse can be disabled explicitly on pending', () => {
    const html = renderToString(
      React.createElement(StatusIndicator, { type: 'pending', pulse: false }),
    )
    expect(html).not.toContain('animate-pulse')
    expect(html).toContain('bg-orange-500')
  })
})

describe('StatusIndicator (React) – structure and styling', () => {
  it('container applies base layout classes', () => {
    const html = renderToString(
      React.createElement(StatusIndicator, { type: 'success' }),
    )
    expect(html).toContain('inline-flex')
    expect(html).toContain('items-center')
    expect(html).toContain('gap-1.5')
  })

  it('dot has fixed size and rounded-full shape', () => {
    const html = renderToString(
      React.createElement(StatusIndicator, { type: 'success' }),
    )
    expect(html).toContain('h-2')
    expect(html).toContain('w-2')
    expect(html).toContain('rounded-full')
  })

  it('visible label uses muted text styles', () => {
    const html = renderToString(
      React.createElement(StatusIndicator, { type: 'info' }),
    )
    expect(html).toContain('text-sm')
    expect(html).toContain('text-muted-foreground')
  })

  it('shows the visible label by default', () => {
    const html = renderToString(
      React.createElement(StatusIndicator, { type: 'success', label: 'Ready' }),
    )
    expect(html).toMatch(/>Ready</)
  })
})
