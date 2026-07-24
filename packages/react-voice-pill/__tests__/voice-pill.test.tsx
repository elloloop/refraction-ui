import { describe, expect, it } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { VoicePill } from '../src/voice-pill.js'

describe('VoicePill (React)', () => {
  it('renders status metadata and speaker content', () => {
    const html = renderToString(
      React.createElement(VoicePill, {
        speaker: 'ai',
        label: 'Alex',
        sub: 'Listening',
        intensity: 0.7,
      }),
    )

    expect(html).toContain('role="status"')
    expect(html).toContain('aria-live="polite"')
    expect(html).toContain('data-speaker="ai"')
    expect(html).toContain('Alex')
    expect(html).toContain('Listening')
  })

  it('renders fixed position classes and intensity variables', () => {
    const html = renderToString(
      React.createElement(VoicePill, {
        label: 'Taylor',
        position: 'top-end',
        intensity: 0.5,
      }),
    )

    expect(html).toContain('fixed')
    expect(html).toContain('top-')
    expect(html).toContain('--rfr-voice-pill-intensity:0.5')
    expect(html).toContain('--rfr-voice-pill-ring-scale:1.175')
  })

  it('renders mute toggle only when a handler is provided', () => {
    const withoutToggle = renderToString(
      React.createElement(VoicePill, { label: 'Alex' }),
    )
    const withToggle = renderToString(
      React.createElement(VoicePill, {
        label: 'Alex',
        muted: true,
        onToggleMute: () => {},
      }),
    )

    expect(withoutToggle).not.toContain('button')
    expect(withToggle).toContain('button')
    expect(withToggle).toContain('aria-label="Unmute voice"')
    expect(withToggle).toContain('aria-pressed="true"')
    expect(withToggle).toContain('aria-hidden="true"')
  })

  it('renders a custom avatar node', () => {
    const html = renderToString(
      React.createElement(VoicePill, {
        label: 'Alex',
        avatar: React.createElement('span', { className: 'custom-avatar' }, 'A'),
      }),
    )

    expect(html).toContain('custom-avatar')
    expect(html).toContain('A')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(VoicePill, {
        label: 'Alex',
        className: 'custom-pill',
      }),
    )

    expect(html).toContain('custom-pill')
  })
})

// ---------------------------------------------------------------
// Additional SSR coverage (ARIA, data attributes, visuals)
// ---------------------------------------------------------------

describe('VoicePill – ARIA composition (React)', () => {
  it('composes the accessible label from speaker, label, and sub', () => {
    const html = renderToString(
      React.createElement(VoicePill, {
        speaker: 'ai',
        label: 'Alex',
        sub: 'Listening',
      }),
    )

    expect(html).toContain('aria-label="AI: Alex, Listening"')
    expect(html).toContain('aria-atomic="true"')
  })

  it('appends the muted state to the accessible label', () => {
    const html = renderToString(
      React.createElement(VoicePill, { label: 'Alex', muted: true }),
    )

    expect(html).toContain('aria-label="AI: Alex, muted"')
  })

  it('omits the sub from the accessible label when absent', () => {
    const html = renderToString(
      React.createElement(VoicePill, { label: 'Alex' }),
    )

    expect(html).toContain('aria-label="AI: Alex"')
  })
})

describe('VoicePill – data attributes (React)', () => {
  it('exposes speaker, muted, position, intensity, and active state', () => {
    const html = renderToString(
      React.createElement(VoicePill, {
        speaker: 'user',
        label: 'Sam',
        muted: true,
        position: 'top-start',
        intensity: 0.4,
      }),
    )

    expect(html).toContain('data-speaker="user"')
    expect(html).toContain('data-muted="true"')
    expect(html).toContain('data-position="top-start"')
    expect(html).toContain('data-intensity="0.4"')
    // Muted drives the visual intensity to zero.
    expect(html).toContain('data-active="false"')
  })

  it('marks the pill active when intensity is above zero', () => {
    const html = renderToString(
      React.createElement(VoicePill, { label: 'Sam', intensity: 0.4 }),
    )

    expect(html).toContain('data-active="true"')
  })
})

describe('VoicePill – avatar initials (React)', () => {
  it('defaults to AI initials', () => {
    const html = renderToString(React.createElement(VoicePill, { label: 'Alex' }))

    expect(html).toContain('AI')
  })

  it('uses U for the user speaker', () => {
    const html = renderToString(
      React.createElement(VoicePill, { speaker: 'user', label: 'Sam' }),
    )

    expect(html).toContain('U')
  })

  it('derives initials from a custom speaker name', () => {
    const html = renderToString(
      React.createElement(VoicePill, { speaker: 'Jane Doe', label: 'Sam' }),
    )

    expect(html).toContain('JD')
  })
})

describe('VoicePill – pulse rings (React)', () => {
  it('renders two pulse rings while intensity is above zero', () => {
    const html = renderToString(
      React.createElement(VoicePill, { label: 'Alex', intensity: 0.7 }),
    )

    const rings = html.match(/motion-safe:animate-ping/g) ?? []
    expect(rings).toHaveLength(2)
  })

  it('renders no pulse rings at zero intensity', () => {
    const html = renderToString(
      React.createElement(VoicePill, { label: 'Alex', intensity: 0 }),
    )

    expect(html).not.toContain('motion-safe:animate-ping')
  })

  it('renders no pulse rings while muted', () => {
    const html = renderToString(
      React.createElement(VoicePill, { label: 'Alex', intensity: 0.7, muted: true }),
    )

    expect(html).not.toContain('motion-safe:animate-ping')
    expect(html).toContain('--rfr-voice-pill-visual-intensity:0')
  })
})

describe('VoicePill – mute toggle (React)', () => {
  it('labels the toggle "Mute voice" with aria-pressed false when unmuted', () => {
    const html = renderToString(
      React.createElement(VoicePill, { label: 'Alex', onToggleMute: () => {} }),
    )

    expect(html).toContain('aria-label="Mute voice"')
    expect(html).toContain('aria-pressed="false"')
    // Sound-waves icon paths
    expect(html).toContain('M16 8.5a4 4 0 0 1 0 7')
  })

  it('shows the crossed-out icon when muted', () => {
    const html = renderToString(
      React.createElement(VoicePill, {
        label: 'Alex',
        muted: true,
        onToggleMute: () => {},
      }),
    )

    expect(html).toContain('m19 9-4 4')
    expect(html).toContain('m15 9 4 4')
    expect(html).not.toContain('M16 8.5a4 4 0 0 1 0 7')
  })
})

describe('VoicePill – intensity clamping and position (React)', () => {
  it('clamps intensity above 1', () => {
    const html = renderToString(
      React.createElement(VoicePill, { label: 'Alex', intensity: 2 }),
    )

    expect(html).toContain('--rfr-voice-pill-intensity:1')
    expect(html).toContain('data-intensity="1"')
  })

  it('defaults to the bottom-center position', () => {
    const html = renderToString(React.createElement(VoicePill, { label: 'Alex' }))

    expect(html).toContain('data-position="bottom-center"')
    expect(html).toContain('fixed')
  })

  it('supports the inline position for embedded layouts', () => {
    const html = renderToString(
      React.createElement(VoicePill, { label: 'Alex', position: 'inline' }),
    )

    expect(html).toContain('data-position="inline"')
  })
})
