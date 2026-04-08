import { describe, it, expect, vi } from 'vitest'
import { createKeyboardShortcut, formatShortcut } from '../src/keyboard-shortcut.js'
import {
  shortcutBadgeStyles,
  shortcutKeyStyles,
  shortcutSeparatorStyles,
} from '../src/keyboard-shortcut.styles.js'

function createKeyEvent(overrides: Partial<KeyboardEvent> = {}): KeyboardEvent {
  return {
    key: 'k',
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    preventDefault: vi.fn(),
    ...overrides,
  } as unknown as KeyboardEvent
}

describe('createKeyboardShortcut - basic', () => {
  it('returns enabled status', () => {
    const api = createKeyboardShortcut({ keys: ['Ctrl', 'K'], onTrigger: vi.fn() })
    expect(api.enabled).toBe(true)
  })

  it('returns keys', () => {
    const api = createKeyboardShortcut({ keys: ['Ctrl', 'K'], onTrigger: vi.fn() })
    expect(api.keys).toEqual(['Ctrl', 'K'])
  })

  it('respects enabled=false', () => {
    const api = createKeyboardShortcut({ keys: ['Ctrl', 'K'], onTrigger: vi.fn(), enabled: false })
    expect(api.enabled).toBe(false)
  })
})

describe('handler', () => {
  it('triggers on matching key combo', () => {
    const onTrigger = vi.fn()
    const api = createKeyboardShortcut({ keys: ['Ctrl', 'K'], onTrigger })
    const event = createKeyEvent({ key: 'k', ctrlKey: true })
    const result = api.handler(event)
    expect(result).toBe(true)
    expect(onTrigger).toHaveBeenCalled()
  })

  it('does not trigger on non-matching key', () => {
    const onTrigger = vi.fn()
    const api = createKeyboardShortcut({ keys: ['Ctrl', 'K'], onTrigger })
    const event = createKeyEvent({ key: 'j', ctrlKey: true })
    const result = api.handler(event)
    expect(result).toBe(false)
    expect(onTrigger).not.toHaveBeenCalled()
  })

  it('does not trigger without modifier', () => {
    const onTrigger = vi.fn()
    const api = createKeyboardShortcut({ keys: ['Ctrl', 'K'], onTrigger })
    const event = createKeyEvent({ key: 'k', ctrlKey: false })
    const result = api.handler(event)
    expect(result).toBe(false)
    expect(onTrigger).not.toHaveBeenCalled()
  })

  it('does not trigger when disabled', () => {
    const onTrigger = vi.fn()
    const api = createKeyboardShortcut({ keys: ['Ctrl', 'K'], onTrigger, enabled: false })
    const event = createKeyEvent({ key: 'k', ctrlKey: true })
    const result = api.handler(event)
    expect(result).toBe(false)
    expect(onTrigger).not.toHaveBeenCalled()
  })

  it('calls preventDefault by default', () => {
    const onTrigger = vi.fn()
    const api = createKeyboardShortcut({ keys: ['Ctrl', 'K'], onTrigger })
    const event = createKeyEvent({ key: 'k', ctrlKey: true })
    api.handler(event)
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('does not preventDefault when disabled', () => {
    const onTrigger = vi.fn()
    const api = createKeyboardShortcut({ keys: ['Ctrl', 'K'], onTrigger, preventDefault: false })
    const event = createKeyEvent({ key: 'k', ctrlKey: true })
    api.handler(event)
    expect(event.preventDefault).not.toHaveBeenCalled()
  })

  it('handles Shift modifier', () => {
    const onTrigger = vi.fn()
    const api = createKeyboardShortcut({ keys: ['Shift', 'K'], onTrigger })
    const event = createKeyEvent({ key: 'K', shiftKey: true })
    const result = api.handler(event)
    expect(result).toBe(true)
  })

  it('handles Alt modifier', () => {
    const onTrigger = vi.fn()
    const api = createKeyboardShortcut({ keys: ['Alt', 'K'], onTrigger })
    const event = createKeyEvent({ key: 'k', altKey: true })
    const result = api.handler(event)
    expect(result).toBe(true)
  })

  it('handles Meta modifier', () => {
    const onTrigger = vi.fn()
    const api = createKeyboardShortcut({ keys: ['Meta', 'K'], onTrigger })
    const event = createKeyEvent({ key: 'k', metaKey: true })
    const result = api.handler(event)
    expect(result).toBe(true)
  })

  it('rejects extra modifiers', () => {
    const onTrigger = vi.fn()
    const api = createKeyboardShortcut({ keys: ['Ctrl', 'K'], onTrigger })
    const event = createKeyEvent({ key: 'k', ctrlKey: true, shiftKey: true })
    const result = api.handler(event)
    expect(result).toBe(false)
  })

  it('handles key-only shortcut (no modifier)', () => {
    const onTrigger = vi.fn()
    const api = createKeyboardShortcut({ keys: ['Escape'], onTrigger })
    const event = createKeyEvent({ key: 'Escape' })
    const result = api.handler(event)
    expect(result).toBe(true)
  })
})

describe('normalizeKey', () => {
  it('normalizes Cmd to Meta', () => {
    const onTrigger = vi.fn()
    const api = createKeyboardShortcut({ keys: ['Cmd', 'K'], onTrigger })
    const event = createKeyEvent({ key: 'k', metaKey: true })
    expect(api.handler(event)).toBe(true)
  })

  it('normalizes Command to Meta', () => {
    const onTrigger = vi.fn()
    const api = createKeyboardShortcut({ keys: ['Command', 'K'], onTrigger })
    const event = createKeyEvent({ key: 'k', metaKey: true })
    expect(api.handler(event)).toBe(true)
  })

  it('normalizes Control to Ctrl', () => {
    const onTrigger = vi.fn()
    const api = createKeyboardShortcut({ keys: ['Control', 'K'], onTrigger })
    const event = createKeyEvent({ key: 'k', ctrlKey: true })
    expect(api.handler(event)).toBe(true)
  })
})

describe('formatShortcut', () => {
  it('formats Ctrl+K', () => {
    expect(formatShortcut(['Ctrl', 'K'], false)).toBe('Ctrl+K')
  })

  it('formats Meta+Shift+P', () => {
    expect(formatShortcut(['Meta', 'Shift', 'P'], false)).toBe('Meta+Shift+P')
  })

  it('formats single key', () => {
    expect(formatShortcut(['Escape'], false)).toBe('Esc')
  })

  it('formats Mac style', () => {
    const result = formatShortcut(['Ctrl', 'K'], true)
    expect(result).toContain('\u2303')
  })

  it('formats Mac Meta as command symbol', () => {
    const result = formatShortcut(['Meta', 'K'], true)
    expect(result).toContain('\u2318')
  })

  it('formats Mac Shift as up arrow', () => {
    const result = formatShortcut(['Shift', 'K'], true)
    expect(result).toContain('\u21E7')
  })

  it('formats Mac Alt as option', () => {
    const result = formatShortcut(['Alt', 'K'], true)
    expect(result).toContain('\u2325')
  })
})

describe('display', () => {
  it('provides display string', () => {
    const api = createKeyboardShortcut({ keys: ['Ctrl', 'K'], onTrigger: vi.fn() })
    expect(api.display).toBe('Ctrl+K')
  })

  it('provides platformDisplay string', () => {
    const api = createKeyboardShortcut({ keys: ['Ctrl', 'K'], onTrigger: vi.fn() })
    expect(typeof api.platformDisplay).toBe('string')
    expect(api.platformDisplay.length).toBeGreaterThan(0)
  })
})

describe('badgeAriaProps', () => {
  it('has aria-hidden', () => {
    const api = createKeyboardShortcut({ keys: ['Ctrl', 'K'], onTrigger: vi.fn() })
    expect(api.badgeAriaProps['aria-hidden']).toBe(true)
  })

  it('has role=presentation', () => {
    const api = createKeyboardShortcut({ keys: ['Ctrl', 'K'], onTrigger: vi.fn() })
    expect(api.badgeAriaProps.role).toBe('presentation')
  })
})

describe('styles', () => {
  it('exports badge styles', () => {
    expect(shortcutBadgeStyles).toContain('inline-flex')
  })

  it('exports key styles', () => {
    expect(shortcutKeyStyles).toContain('inline-flex')
  })

  it('exports separator styles', () => {
    expect(shortcutSeparatorStyles).toContain('text-muted-foreground')
  })
})
