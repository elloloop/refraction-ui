import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { PresenceIndicator } from '../src/presence-indicator.js'
import { STATUS_COLORS, STATUS_LABELS } from '../src/index.js'

describe('PresenceIndicator (React)', () => {
  it('renders a span container with role status', () => {
    const html = renderToString(
      React.createElement(PresenceIndicator, { status: 'online' }),
    )
    expect(html).toContain('<span')
    expect(html).toContain('role="status"')
  })

  it('container applies base layout classes', () => {
    const html = renderToString(
      React.createElement(PresenceIndicator, { status: 'online' }),
    )
    expect(html).toContain('inline-flex')
    expect(html).toContain('items-center')
    expect(html).toContain('gap-1.5')
  })

  it('dot is a rounded-full span', () => {
    const html = renderToString(
      React.createElement(PresenceIndicator, { status: 'online' }),
    )
    expect(html).toContain('rounded-full')
  })

  it('aria-label reflects the status label', () => {
    const html = renderToString(
      React.createElement(PresenceIndicator, { status: 'online' }),
    )
    expect(html).toContain('aria-label="Online"')
  })

  it('does not render visible label text by default', () => {
    const html = renderToString(
      React.createElement(PresenceIndicator, { status: 'online' }),
    )
    // aria-label is present but no visible label span with the text content
    expect(html).not.toMatch(/>Online</)
  })

  it('renders visible label when showLabel is true', () => {
    const html = renderToString(
      React.createElement(PresenceIndicator, { status: 'away', showLabel: true }),
    )
    expect(html).toMatch(/>Away</)
    expect(html).toContain('text-sm')
    expect(html).toContain('text-muted-foreground')
  })

  it('custom label overrides the default in aria-label and visible label', () => {
    const html = renderToString(
      React.createElement(PresenceIndicator, {
        status: 'busy',
        label: 'In a meeting',
        showLabel: true,
      }),
    )
    expect(html).toContain('aria-label="In a meeting"')
    expect(html).toMatch(/>In a meeting</)
    expect(html).not.toMatch(/>Busy</)
  })

  it('custom label is used in aria-label even when label is hidden', () => {
    const html = renderToString(
      React.createElement(PresenceIndicator, {
        status: 'dnd',
        label: 'Focus time',
      }),
    )
    expect(html).toContain('aria-label="Focus time"')
    expect(html).not.toMatch(/>Focus time</)
  })

  it('applies custom className to the container', () => {
    const html = renderToString(
      React.createElement(PresenceIndicator, {
        status: 'online',
        className: 'my-presence',
      }),
    )
    expect(html).toContain('my-presence')
    expect(html).toContain('inline-flex')
  })
})

describe('PresenceIndicator (React) – status variants', () => {
  it.each([
    ['online', 'Online', 'bg-green-500'],
    ['offline', 'Offline', 'bg-gray-400'],
    ['away', 'Away', 'bg-yellow-500'],
    ['busy', 'Busy', 'bg-red-500'],
    ['dnd', 'Do Not Disturb', 'bg-red-500'],
  ] as const)('status "%s" has label "%s" and dot class "%s"', (status, label, dotClass) => {
    const html = renderToString(
      React.createElement(PresenceIndicator, { status }),
    )
    expect(html).toContain(`aria-label="${label}"`)
    expect(html).toContain(dotClass)
  })

  it('busy and dnd share the red dot color', () => {
    const busy = renderToString(
      React.createElement(PresenceIndicator, { status: 'busy' }),
    )
    const dnd = renderToString(
      React.createElement(PresenceIndicator, { status: 'dnd' }),
    )
    expect(busy).toContain('bg-red-500')
    expect(dnd).toContain('bg-red-500')
  })
})

describe('PresenceIndicator (React) – sizes', () => {
  it('applies md size classes by default', () => {
    const html = renderToString(
      React.createElement(PresenceIndicator, { status: 'online' }),
    )
    expect(html).toContain('h-2.5')
    expect(html).toContain('w-2.5')
  })

  it('applies sm size classes', () => {
    const html = renderToString(
      React.createElement(PresenceIndicator, { status: 'online', size: 'sm' }),
    )
    expect(html).toContain('h-2 ')
    expect(html).toContain('w-2')
    expect(html).not.toContain('h-2.5')
  })

  it('applies lg size classes', () => {
    const html = renderToString(
      React.createElement(PresenceIndicator, { status: 'online', size: 'lg' }),
    )
    expect(html).toContain('h-3')
    expect(html).toContain('w-3')
    expect(html).not.toContain('h-2.5')
  })
})

describe('PresenceIndicator (React) – package re-exports', () => {
  it('re-exports headless STATUS_COLORS and STATUS_LABELS maps', () => {
    expect(STATUS_COLORS.online).toBe('green')
    expect(STATUS_COLORS.offline).toBe('gray')
    expect(STATUS_COLORS.away).toBe('yellow')
    expect(STATUS_COLORS.busy).toBe('red')
    expect(STATUS_COLORS.dnd).toBe('red')
    expect(STATUS_LABELS.online).toBe('Online')
    expect(STATUS_LABELS.dnd).toBe('Do Not Disturb')
  })
})
