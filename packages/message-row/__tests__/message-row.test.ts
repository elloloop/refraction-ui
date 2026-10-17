import { describe, it, expect } from 'vitest'
import {
  MESSAGE_ROW_DEFAULT_MAX_INLINE_ACTIONS,
  MESSAGE_ROW_DEFAULT_AVATAR_SIZE_PX,
  MESSAGE_ROW_HIGHLIGHT_FADE_MS,
  MESSAGE_ROW_HIGHLIGHT_HOLD_MS,
  MESSAGE_ROW_LONG_PRESS_DELAY_MS,
  MESSAGE_ROW_LONG_PRESS_MOVE_TOLERANCE_PX,
  MESSAGE_ROW_INTERACTIVE_SELECTOR,
  MESSAGE_ROW_TOOLBAR_ITEM_SELECTOR,
  clampMessageRowToolbarIndex,
  createMessageRow,
  doMessageRowRectsOverlap,
  doesMessageRowSelectionOverlapToolbar,
  getMessageRowAvatarGutter,
  getMessageRowHighlightSchedule,
  getMessageRowLabelledBy,
  getNextMessageRowToolbarIndex,
  hasMessageRowPointerMoved,
  isMessageRowToolbarVisible,
  partitionMessageRowActions,
  resolveMessageRowLongPressDelay,
  resolveMessageRowMaxInlineActions,
  shouldMessageRowHandleTap,
  messageRowVariants,
  messageRowHighlightVariants,
  messageRowToolbarVariants,
  messageRowGutterTimeVariants,
  messageRowMenuItemVariants,
} from '../src/index.js'

describe('partitionMessageRowActions', () => {
  const actions = ['reply', 'react', 'edit', 'copy', 'delete']

  it('keeps the default number inline and overflows the rest in order', () => {
    const { inline, overflow } = partitionMessageRowActions(actions)
    expect(inline).toEqual(actions.slice(0, MESSAGE_ROW_DEFAULT_MAX_INLINE_ACTIONS))
    expect(overflow).toEqual(actions.slice(MESSAGE_ROW_DEFAULT_MAX_INLINE_ACTIONS))
  })

  it('has no overflow when everything fits', () => {
    expect(partitionMessageRowActions(['a', 'b'], 2)).toEqual({ inline: ['a', 'b'], overflow: [] })
  })

  it('puts everything in the menu when the limit is 0', () => {
    expect(partitionMessageRowActions(['a', 'b'], 0)).toEqual({ inline: [], overflow: ['a', 'b'] })
  })

  it('treats undefined actions as none', () => {
    expect(partitionMessageRowActions(undefined, 2)).toEqual({ inline: [], overflow: [] })
  })

  it('does not mutate the input', () => {
    const input = ['a', 'b', 'c', 'd']
    partitionMessageRowActions(input, 1)
    expect(input).toEqual(['a', 'b', 'c', 'd'])
  })
})

describe('resolveMessageRowMaxInlineActions', () => {
  it('defaults for undefined, negative and non-finite values', () => {
    for (const v of [undefined, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(resolveMessageRowMaxInlineActions(v)).toBe(MESSAGE_ROW_DEFAULT_MAX_INLINE_ACTIONS)
    }
  })

  it('floors fractions and accepts 0', () => {
    expect(resolveMessageRowMaxInlineActions(2.9)).toBe(2)
    expect(resolveMessageRowMaxInlineActions(0)).toBe(0)
  })
})

describe('isMessageRowToolbarVisible', () => {
  const base = { hasToolbar: true, hovered: false, focusWithin: false, menuOpen: false, selecting: false }

  it('is hidden at rest', () => {
    expect(isMessageRowToolbarVisible(base)).toBe(false)
  })

  it('shows on hover, on focus inside, and while the menu is open', () => {
    expect(isMessageRowToolbarVisible({ ...base, hovered: true })).toBe(true)
    expect(isMessageRowToolbarVisible({ ...base, focusWithin: true })).toBe(true)
    expect(isMessageRowToolbarVisible({ ...base, menuOpen: true })).toBe(true)
  })

  it('hides while selecting, even when hovered, focused or the menu is open', () => {
    expect(
      isMessageRowToolbarVisible({ ...base, hovered: true, focusWithin: true, menuOpen: true, selecting: true }),
    ).toBe(false)
  })

  it('never shows without a toolbar (e.g. a tombstone)', () => {
    expect(isMessageRowToolbarVisible({ ...base, hasToolbar: false, hovered: true })).toBe(false)
  })
})

describe('roving toolbar index', () => {
  it('wraps with the arrows', () => {
    expect(getNextMessageRowToolbarIndex(0, 'ArrowRight', 3)).toBe(1)
    expect(getNextMessageRowToolbarIndex(2, 'ArrowRight', 3)).toBe(0)
    expect(getNextMessageRowToolbarIndex(0, 'ArrowLeft', 3)).toBe(2)
    expect(getNextMessageRowToolbarIndex(2, 'ArrowLeft', 3)).toBe(1)
  })

  it('jumps with Home / End', () => {
    expect(getNextMessageRowToolbarIndex(1, 'Home', 4)).toBe(0)
    expect(getNextMessageRowToolbarIndex(1, 'End', 4)).toBe(3)
  })

  it('ignores vertical arrows (horizontal toolbar) and other keys', () => {
    expect(getNextMessageRowToolbarIndex(1, 'ArrowDown', 3)).toBe(1)
    expect(getNextMessageRowToolbarIndex(1, 'ArrowUp', 3)).toBe(1)
    expect(getNextMessageRowToolbarIndex(1, 'a', 3)).toBe(1)
  })

  it('leaves the index alone when there are no items', () => {
    expect(getNextMessageRowToolbarIndex(0, 'ArrowRight', 0)).toBe(0)
  })

  it('clamps a stale index into range', () => {
    expect(clampMessageRowToolbarIndex(5, 3)).toBe(2)
    expect(clampMessageRowToolbarIndex(-2, 3)).toBe(0)
    expect(clampMessageRowToolbarIndex(1.7, 3)).toBe(1)
    expect(clampMessageRowToolbarIndex(Number.NaN, 3)).toBe(0)
    expect(clampMessageRowToolbarIndex(2, 0)).toBe(0)
  })
})

describe('long-press helpers', () => {
  it('counts movement only past the tolerance (Euclidean)', () => {
    const start = { x: 0, y: 0 }
    expect(hasMessageRowPointerMoved(start, { x: MESSAGE_ROW_LONG_PRESS_MOVE_TOLERANCE_PX, y: 0 })).toBe(false)
    expect(hasMessageRowPointerMoved(start, { x: MESSAGE_ROW_LONG_PRESS_MOVE_TOLERANCE_PX + 1, y: 0 })).toBe(true)
    // 8,8 → ~11.3 px: diagonal drags count even when each axis is under the tolerance.
    expect(hasMessageRowPointerMoved(start, { x: 8, y: 8 })).toBe(true)
    expect(hasMessageRowPointerMoved(start, { x: 3, y: 3 }, 2)).toBe(true)
  })

  it('resolves the delay, falling back for invalid values', () => {
    expect(resolveMessageRowLongPressDelay(undefined)).toBe(MESSAGE_ROW_LONG_PRESS_DELAY_MS)
    expect(resolveMessageRowLongPressDelay(-5)).toBe(MESSAGE_ROW_LONG_PRESS_DELAY_MS)
    expect(resolveMessageRowLongPressDelay(Number.NaN)).toBe(MESSAGE_ROW_LONG_PRESS_DELAY_MS)
    expect(resolveMessageRowLongPressDelay(0)).toBe(0)
    expect(resolveMessageRowLongPressDelay(800)).toBe(800)
  })
})

describe('shouldMessageRowHandleTap', () => {
  const clean = { targetIsInteractive: false, hasSelection: false, longPressFired: false }

  it('taps on plain row content', () => {
    expect(shouldMessageRowHandleTap(clean)).toBe(true)
  })

  it('yields to controls, selections and a long-press that already fired', () => {
    expect(shouldMessageRowHandleTap({ ...clean, targetIsInteractive: true })).toBe(false)
    expect(shouldMessageRowHandleTap({ ...clean, hasSelection: true })).toBe(false)
    expect(shouldMessageRowHandleTap({ ...clean, longPressFired: true })).toBe(false)
  })
})

describe('selection / toolbar overlap', () => {
  const toolbar = { top: 0, left: 100, right: 200, bottom: 30 }

  it('detects overlapping rectangles', () => {
    expect(doMessageRowRectsOverlap(toolbar, { top: 20, left: 150, right: 300, bottom: 40 })).toBe(true)
  })

  it('treats touching edges and disjoint rects as not overlapping', () => {
    expect(doMessageRowRectsOverlap(toolbar, { top: 30, left: 100, right: 200, bottom: 60 })).toBe(false)
    expect(doMessageRowRectsOverlap(toolbar, { top: 0, left: 0, right: 100, bottom: 30 })).toBe(false)
    expect(doMessageRowRectsOverlap(toolbar, { top: 100, left: 0, right: 50, bottom: 120 })).toBe(false)
  })

  it('ignores empty rects (unlaid-out elements report zeros)', () => {
    expect(doMessageRowRectsOverlap({ top: 0, left: 0, right: 0, bottom: 0 }, toolbar)).toBe(false)
  })

  it('checks every selection rect', () => {
    const away = { top: 200, left: 0, right: 50, bottom: 220 }
    const under = { top: 10, left: 120, right: 140, bottom: 25 }
    expect(doesMessageRowSelectionOverlapToolbar(toolbar, [away])).toBe(false)
    expect(doesMessageRowSelectionOverlapToolbar(toolbar, [away, under])).toBe(true)
    expect(doesMessageRowSelectionOverlapToolbar(toolbar, [])).toBe(false)
  })
})

describe('getMessageRowHighlightSchedule', () => {
  it('holds, fades, then turns off', () => {
    expect(getMessageRowHighlightSchedule(false)).toEqual([
      { phase: 'on', atMs: 0 },
      { phase: 'fading', atMs: MESSAGE_ROW_HIGHLIGHT_HOLD_MS },
      { phase: 'off', atMs: MESSAGE_ROW_HIGHLIGHT_HOLD_MS + MESSAGE_ROW_HIGHLIGHT_FADE_MS },
    ])
  })

  it('is static under reduced motion', () => {
    expect(getMessageRowHighlightSchedule(true)).toEqual([{ phase: 'on', atMs: 0 }])
  })
})

describe('getMessageRowLabelledBy', () => {
  const ids = { author: 'a', time: 't', body: 'b', edited: 'e' }

  it('reads author, time and text', () => {
    expect(getMessageRowLabelledBy({ ids, hasTimestamp: true, hasEditedLabel: false, tombstone: false })).toBe(
      'a t b',
    )
  })

  it('skips a missing time and appends the edited marker', () => {
    expect(getMessageRowLabelledBy({ ids, hasTimestamp: false, hasEditedLabel: true, tombstone: false })).toBe(
      'a b e',
    )
  })

  it('drops the edited marker on a tombstone', () => {
    expect(getMessageRowLabelledBy({ ids, hasTimestamp: true, hasEditedLabel: true, tombstone: true })).toBe('a t b')
  })
})

describe('getMessageRowAvatarGutter', () => {
  it('converts px to rem', () => {
    expect(getMessageRowAvatarGutter(48)).toBe('3rem')
  })

  it('falls back to the default for invalid sizes', () => {
    const fallback = `${MESSAGE_ROW_DEFAULT_AVATAR_SIZE_PX / 16}rem`
    for (const v of [undefined, 0, -4, Number.NaN]) expect(getMessageRowAvatarGutter(v)).toBe(fallback)
  })
})

describe('createMessageRow', () => {
  it('emits state data attributes', () => {
    const { dataAttributes } = createMessageRow({
      continuation: true,
      tombstone: true,
      highlightPhase: 'fading',
      active: true,
      toolbarVisible: false,
    })
    expect(dataAttributes).toEqual({
      'data-message-row': '',
      'data-highlight': 'fading',
      'data-active': 'true',
      'data-toolbar': 'hidden',
      'data-continuation': '',
      'data-tombstone': '',
    })
  })

  it('omits continuation / tombstone flags when off', () => {
    const { dataAttributes } = createMessageRow({
      continuation: false,
      tombstone: false,
      highlightPhase: 'off',
      active: false,
      toolbarVisible: true,
    })
    expect(dataAttributes).not.toHaveProperty('data-continuation')
    expect(dataAttributes).not.toHaveProperty('data-tombstone')
    expect(dataAttributes['data-toolbar']).toBe('visible')
  })
})

describe('selectors', () => {
  it('treat buttons and links as interactive', () => {
    expect(MESSAGE_ROW_INTERACTIVE_SELECTOR).toContain('button')
    expect(MESSAGE_ROW_INTERACTIVE_SELECTOR).toContain('a[href]')
  })

  it('toolbar items skip disabled buttons and do not depend on tabindex', () => {
    expect(MESSAGE_ROW_TOOLBAR_ITEM_SELECTOR).toContain('button:not([disabled])')
    expect(MESSAGE_ROW_TOOLBAR_ITEM_SELECTOR).not.toContain('tabindex')
  })
})

describe('styles', () => {
  it('row carries the focus-visible ring and an active background', () => {
    expect(messageRowVariants()).toContain('focus-visible:ring-2')
    expect(messageRowVariants({ active: 'true' })).toContain('bg-muted/50')
  })

  it('highlight only transitions while fading, and stops under reduced motion', () => {
    expect(messageRowHighlightVariants({ phase: 'on' })).not.toContain('transition-opacity')
    const fading = messageRowHighlightVariants({ phase: 'fading' })
    expect(fading).toContain('transition-opacity')
    expect(fading).toContain('motion-reduce:transition-none')
  })

  it('hidden toolbar ignores the pointer but stays in the layout', () => {
    const hidden = messageRowToolbarVariants({ visible: 'false' })
    expect(hidden).toContain('opacity-0')
    expect(hidden).toContain('pointer-events-none')
    expect(hidden).not.toContain('hidden ')
    expect(messageRowToolbarVariants({ visible: 'true' })).toContain('opacity-100')
  })

  it('continuation time is hidden with opacity', () => {
    expect(messageRowGutterTimeVariants()).toContain('opacity-0')
    expect(messageRowGutterTimeVariants({ visible: 'true' })).toContain('opacity-100')
  })

  it('destructive menu items are styled', () => {
    expect(messageRowMenuItemVariants({ destructive: 'true' })).toContain('text-destructive')
    expect(messageRowMenuItemVariants()).not.toContain('text-destructive')
  })
})
