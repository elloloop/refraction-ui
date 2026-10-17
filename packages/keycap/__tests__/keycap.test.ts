import { describe, it, expect, afterEach, vi } from 'vitest'
import {
  createKeycap,
  createKeyLegend,
  detectKeycapPlatform,
  resolveKeycapPlatform,
  resolveKeycapMinWidth,
  normalizeKeyLegendKey,
  getKeyLegendGlyph,
  getKeyLegendName,
  formatKeyLegendLabel,
  DEFAULT_KEYCAP_PLATFORM,
  KEY_LEGEND_SIDE_NAMES,
  keycapVariants,
  keyLegendSideClass,
} from '../src/index.js'
import { formatShortcut } from '@refraction-ui/keyboard-shortcut'

describe('normalizeKeyLegendKey', () => {
  it.each([
    ['Cmd', 'Meta'],
    ['command', 'Meta'],
    ['Control', 'Ctrl'],
    ['Option', 'Alt'],
    ['opt', 'Alt'],
    ['Return', 'Enter'],
    ['esc', 'Escape'],
    ['Space', ' '],
    [' ', ' '],
    ['arrowup', 'ArrowUp'],
  ])('folds alias %j to %j', (word, key) => {
    expect(normalizeKeyLegendKey(word, 'mac')).toBe(key)
  })

  it('maps Mod to the platform primary modifier', () => {
    expect(normalizeKeyLegendKey('Mod', 'mac')).toBe('Meta')
    expect(normalizeKeyLegendKey('mod', 'windows')).toBe('Ctrl')
  })

  it('upper-cases single characters and keeps other words as written', () => {
    expect(normalizeKeyLegendKey('k', 'mac')).toBe('K')
    expect(normalizeKeyLegendKey('Fn', 'mac')).toBe('Fn')
    expect(normalizeKeyLegendKey('  Caps Lock ', 'windows')).toBe('Caps Lock')
  })
})

describe('glyphs reuse the ShortcutBadge mapping', () => {
  it.each(['Alt', 'Meta', 'Ctrl', 'Shift', 'Enter', 'Escape', 'Tab', 'ArrowUp'])(
    '%s matches formatShortcut on both platforms',
    (key) => {
      expect(getKeyLegendGlyph(key, 'mac')).toBe(formatShortcut([key], true))
      expect(getKeyLegendGlyph(key, 'windows')).toBe(formatShortcut([key], false))
    },
  )

  it('prints ⌥ on macOS and Alt elsewhere', () => {
    expect(getKeyLegendGlyph('Option', 'mac')).toBe('⌥')
    expect(getKeyLegendGlyph('Option', 'windows')).toBe('Alt')
  })

  it('prints ⌘ on macOS and Ctrl elsewhere for Mod', () => {
    expect(getKeyLegendGlyph('Mod', 'mac')).toBe('⌘')
    expect(getKeyLegendGlyph('Mod', 'windows')).toBe('Ctrl')
  })

  it('falls back to the word for keys with no glyph', () => {
    expect(getKeyLegendGlyph('Fn', 'mac')).toBe('Fn')
    expect(getKeyLegendGlyph('k', 'windows')).toBe('K')
  })
})

describe('names', () => {
  it('names keys by platform', () => {
    expect(getKeyLegendName('Alt', 'mac')).toBe('Option')
    expect(getKeyLegendName('Alt', 'windows')).toBe('Alt')
    expect(getKeyLegendName('Mod', 'mac')).toBe('Command')
    expect(getKeyLegendName('Mod', 'windows')).toBe('Ctrl')
    expect(getKeyLegendName('Enter', 'mac')).toBe('Return')
    expect(getKeyLegendName('ArrowLeft', 'windows')).toBe('Left Arrow')
    expect(getKeyLegendName(' ', 'mac')).toBe('Space')
  })

  it('labels never contain the glyph and put the side first', () => {
    expect(formatKeyLegendLabel('Alt', 'mac', 'right')).toBe('Right Option')
    expect(formatKeyLegendLabel('Shift', 'windows', 'left')).toBe('Left Shift')
    expect(formatKeyLegendLabel('Meta', 'mac')).toBe('Command')
    expect(formatKeyLegendLabel('Alt', 'mac', 'right')).not.toContain('⌥')
  })

  it('exposes the side words', () => {
    expect(KEY_LEGEND_SIDE_NAMES).toEqual({ left: 'Left', right: 'Right' })
  })
})

describe('createKeyLegend', () => {
  it('defaults to the glyph', () => {
    const legend = createKeyLegend({ word: 'Option', side: 'right', platform: 'mac' })
    expect(legend).toEqual({
      key: 'Alt',
      glyph: '⌥',
      name: 'Option',
      text: '⌥',
      sideText: 'Right',
      label: 'Right Option',
    })
  })

  it('prints the word or both', () => {
    expect(createKeyLegend({ word: 'Alt', platform: 'mac', show: 'word' }).text).toBe('Option')
    expect(createKeyLegend({ word: 'Alt', platform: 'mac', show: 'both' }).text).toBe(
      '⌥ Option',
    )
  })

  it('collapses both to one word when glyph and name match', () => {
    expect(createKeyLegend({ word: 'Alt', platform: 'windows', show: 'both' }).text).toBe('Alt')
  })

  it('omits sideText without a side', () => {
    expect(createKeyLegend({ word: 'K', platform: 'windows' }).sideText).toBeUndefined()
  })
})

describe('platform', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('injected platform wins over detection', () => {
    vi.stubGlobal('navigator', { platform: 'MacIntel', userAgent: 'Macintosh' })
    expect(resolveKeycapPlatform('windows')).toBe('windows')
  })

  it('detects macOS from navigator', () => {
    vi.stubGlobal('navigator', { platform: 'MacIntel', userAgent: '' })
    expect(detectKeycapPlatform()).toBe('mac')
    expect(resolveKeycapPlatform()).toBe('mac')
  })

  it('detects non-Apple platforms as windows', () => {
    vi.stubGlobal('navigator', { platform: 'Linux x86_64', userAgent: 'X11; Linux' })
    expect(detectKeycapPlatform()).toBe('windows')
  })

  it('falls back to the default without a navigator (SSR)', () => {
    vi.stubGlobal('navigator', undefined)
    expect(detectKeycapPlatform()).toBe(DEFAULT_KEYCAP_PLATFORM)
  })
})

describe('resolveKeycapMinWidth', () => {
  it('turns numbers into pixels and passes strings through', () => {
    expect(resolveKeycapMinWidth(48)).toBe('48px')
    expect(resolveKeycapMinWidth(0)).toBe('0px')
    expect(resolveKeycapMinWidth('4rem')).toBe('4rem')
  })

  it('ignores unusable values', () => {
    expect(resolveKeycapMinWidth()).toBeUndefined()
    expect(resolveKeycapMinWidth(-1)).toBeUndefined()
    expect(resolveKeycapMinWidth(Number.NaN)).toBeUndefined()
    expect(resolveKeycapMinWidth(Number.POSITIVE_INFINITY)).toBeUndefined()
    expect(resolveKeycapMinWidth('  ')).toBeUndefined()
  })
})

describe('createKeycap', () => {
  it('has defaults', () => {
    expect(createKeycap()).toEqual({
      size: 'md',
      pressed: false,
      highlighted: false,
      minWidth: undefined,
      dataAttributes: {
        'data-size': 'md',
        'data-pressed': 'false',
        'data-highlighted': 'false',
      },
    })
  })

  it('reflects state', () => {
    const api = createKeycap({ size: 'lg', pressed: true, highlighted: true, minWidth: 64 })
    expect(api.minWidth).toBe('64px')
    expect(api.dataAttributes).toEqual({
      'data-size': 'lg',
      'data-pressed': 'true',
      'data-highlighted': 'true',
    })
  })
})

describe('styles', () => {
  it('sizes use rem text classes', () => {
    expect(keycapVariants({ size: 'sm' })).toContain('text-xs')
    expect(keycapVariants({ size: 'md' })).toContain('text-sm')
    expect(keycapVariants({ size: 'lg' })).toContain('text-base')
  })

  it('pressed changes shape, not only colour', () => {
    const pressed = keycapVariants({ pressed: 'true' })
    expect(pressed).toContain('translate-y-px')
    expect(pressed).not.toContain('border-b-2')
    expect(keycapVariants({ pressed: 'false' })).toContain('border-b-2')
  })

  it('highlighted adds a ring', () => {
    expect(keycapVariants({ highlighted: 'true' })).toContain('ring-2')
    expect(keycapVariants({ highlighted: 'false' })).not.toContain('ring-2')
  })

  it('stops transitions under reduced motion', () => {
    expect(keycapVariants()).toContain('motion-reduce:transition-none')
  })

  it('uses tokens only', () => {
    const all = [keycapVariants({ pressed: 'true', highlighted: 'true' }), keyLegendSideClass].join(' ')
    expect(all).not.toMatch(/#[0-9a-f]{3,6}|rgb\(|\bpx-\[|text-\[\d+px\]/i)
  })
})
