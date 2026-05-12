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
