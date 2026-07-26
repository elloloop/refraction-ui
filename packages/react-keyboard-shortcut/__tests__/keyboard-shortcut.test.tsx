import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import {
  KeyboardShortcut,
  ShortcutBadge,
  ShortcutContext,
  ShortcutHint,
} from '../src/keyboard-shortcut.js'

// SSR note: modern Node exposes a global `navigator` (platform 'MacIntel' on
// macOS), so the core's `isMac()` is host-dependent. Tests that assert
// individual key spans pass `platform: false` for a deterministic,
// cross-platform render; the platform-default path is only asserted on its
// platform-independent structure (kbd + presentation ARIA).
describe('ShortcutBadge (React SSR)', () => {
  it('renders a kbd element with presentation ARIA', () => {
    const html = renderToString(React.createElement(ShortcutBadge, { keys: ['Ctrl', 'K'] }))
    expect(html).toContain('<kbd')
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('role="presentation"')
  })

  it('renders each key as a styled span joined by a + separator', () => {
    const html = renderToString(
      React.createElement(ShortcutBadge, { keys: ['Ctrl', 'K'], platform: false }),
    )
    expect(html).toContain('Ctrl')
    expect(html).toContain('>+</span>')
    expect(html).toContain('>K</span>')
  })

  it('uppercases single-character keys for display', () => {
    const html = renderToString(
      React.createElement(ShortcutBadge, { keys: ['Meta', 's'], platform: false }),
    )
    expect(html).toContain('>Meta</span>')
    expect(html).toContain('>S</span>')
  })

  it('renders known keys with their display aliases', () => {
    const html = renderToString(
      React.createElement(ShortcutBadge, { keys: ['Escape'], platform: false }),
    )
    expect(html).toContain('>Esc</span>')
  })

  it('appends a custom className to the kbd', () => {
    const html = renderToString(
      React.createElement(ShortcutBadge, { keys: ['Ctrl'], className: 'my-badge' }),
    )
    expect(html).toContain('my-badge')
    // Default styles are preserved alongside the custom class.
    expect(html).toContain('font-mono')
  })
})

describe('ShortcutHint (React SSR)', () => {
  it('renders nothing when hints are hidden (default context)', () => {
    const html = renderToString(React.createElement(ShortcutHint, { shortcut: 'Ctrl+K' }))
    expect(html).toBe('')
  })

  it('renders the badge inside a positioned wrapper when hints are shown', () => {
    const html = renderToString(
      React.createElement(
        ShortcutContext.Provider,
        { value: true },
        React.createElement(ShortcutHint, { shortcut: 'Ctrl+K', platform: false }),
      ),
    )
    expect(html).toContain('pointer-events-none')
    expect(html).toContain('<kbd')
    expect(html).toContain('>Ctrl</span>')
    expect(html).toContain('>K</span>')
  })

  it('resolves keys from a SANE_DEFAULTS action name', () => {
    const html = renderToString(
      React.createElement(
        ShortcutContext.Provider,
        { value: true },
        React.createElement(ShortcutHint, { action: 'save', platform: false }),
      ),
    )
    // SANE_DEFAULTS.save is ['Meta', 's'].
    expect(html).toContain('>Meta</span>')
    expect(html).toContain('>S</span>')
  })

  it('renders nothing for an unknown action with no explicit shortcut', () => {
    const html = renderToString(
      React.createElement(
        ShortcutContext.Provider,
        { value: true },
        React.createElement(ShortcutHint, { action: 'not-a-real-action' }),
      ),
    )
    expect(html).toBe('')
  })

  it('prefers an explicit shortcut over an action', () => {
    const html = renderToString(
      React.createElement(
        ShortcutContext.Provider,
        { value: true },
        React.createElement(ShortcutHint, { shortcut: 'Ctrl+P', action: 'save', platform: false }),
      ),
    )
    expect(html).toContain('>Ctrl</span>')
    expect(html).toContain('>P</span>')
    expect(html).not.toContain('>Meta</span>')
  })
})

describe('KeyboardShortcut (React SSR)', () => {
  it('renders nothing — it is an invisible global listener by design', () => {
    // KeyboardShortcut attaches its keydown listener in useEffect and returns
    // null from render. SSR never runs effects, so the honest contract here
    // is "no markup, and no crash without a document".
    const html = renderToString(
      React.createElement(KeyboardShortcut, { keys: ['Meta', 'k'], onTrigger: () => {} }),
    )
    expect(html).toBe('')
  })

  it('renders nothing even when disabled', () => {
    const html = renderToString(
      React.createElement(KeyboardShortcut, {
        keys: ['Meta', 'k'],
        onTrigger: () => {},
        enabled: false,
      }),
    )
    expect(html).toBe('')
  })
})
