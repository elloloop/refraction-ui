import { describe, it, expect } from 'vitest'
import {
  CONTEXT_MENU_COLLISION_PADDING_PX,
  CONTEXT_MENU_LONG_PRESS_TOLERANCE_PX,
  CONTEXT_MENU_TYPEAHEAD_INITIAL,
  CONTEXT_MENU_TYPEAHEAD_RESET_MS,
  CONTEXT_SUBMENU_ALIGN_OFFSET_PX,
  appendContextMenuTypeahead,
  computeContextMenuPosition,
  computeContextSubmenuPosition,
  contextMenuContentVariants,
  contextMenuItemVariants,
  contextMenuLabelVariants,
  exceedsContextMenuLongPressTolerance,
  findContextMenuTypeaheadIndex,
  getContextMenuElementAnchor,
  getContextMenuItemAria,
  getNextContextMenuIndex,
  isContextMenuLongPressPointer,
  isContextMenuOpenKey,
  isContextMenuTypeaheadKey,
  isContextSubmenuCloseKey,
  isContextSubmenuOpenKey,
} from '../src/index.js'
import { menuContentVariants, menuItemVariants } from '@refraction-ui/dropdown-menu'

const VIEWPORT = { width: 1000, height: 800 }
const MENU = { width: 200, height: 300 }
const PAD = CONTEXT_MENU_COLLISION_PADDING_PX

describe('computeContextMenuPosition', () => {
  it('places the top-left corner on the point when it fits', () => {
    expect(computeContextMenuPosition({ x: 100, y: 120 }, MENU, VIEWPORT)).toEqual({
      x: 100,
      y: 120,
      flippedX: false,
      flippedY: false,
      maxHeight: VIEWPORT.height - PAD * 2,
    })
  })

  it('fits exactly against the padded right/bottom edge without flipping', () => {
    const point = { x: VIEWPORT.width - PAD - MENU.width, y: VIEWPORT.height - PAD - MENU.height }
    const p = computeContextMenuPosition(point, MENU, VIEWPORT)
    expect(p).toMatchObject({ x: point.x, y: point.y, flippedX: false, flippedY: false })
  })

  it('flips left when the menu would overflow the right edge', () => {
    const p = computeContextMenuPosition({ x: 900, y: 100 }, MENU, VIEWPORT)
    expect(p.x).toBe(900 - MENU.width)
    expect(p.flippedX).toBe(true)
    expect(p.flippedY).toBe(false)
  })

  it('flips up when the menu would overflow the bottom edge', () => {
    const p = computeContextMenuPosition({ x: 100, y: 700 }, MENU, VIEWPORT)
    expect(p.y).toBe(700 - MENU.height)
    expect(p.flippedY).toBe(true)
  })

  it('flips both axes in the bottom-right corner', () => {
    const p = computeContextMenuPosition({ x: 990, y: 790 }, MENU, VIEWPORT)
    expect(p).toMatchObject({ x: 790, y: 490, flippedX: true, flippedY: true })
  })

  it('shifts inside the viewport when neither side fits', () => {
    const narrow = { width: 300, height: 800 }
    // 200 px wide menu at x=150 in a 300 px viewport: right needs 358, left would be -50.
    const p = computeContextMenuPosition({ x: 150, y: 10 }, MENU, narrow)
    expect(p.x).toBe(narrow.width - PAD - MENU.width)
    expect(p.flippedX).toBe(false)
  })

  it('pins to the start edge when the menu is larger than the viewport', () => {
    const tiny = { width: 150, height: 200 }
    const p = computeContextMenuPosition({ x: 100, y: 100 }, MENU, tiny)
    expect(p.x).toBe(PAD)
    expect(p.y).toBe(PAD)
    expect(p.maxHeight).toBe(tiny.height - PAD * 2)
  })

  it('pushes a point inside the padding back out to the padding', () => {
    const p = computeContextMenuPosition({ x: 2, y: -5 }, MENU, VIEWPORT)
    expect(p).toMatchObject({ x: PAD, y: PAD, flippedX: false, flippedY: false })
  })

  it('honours a custom padding and never reports a negative maxHeight', () => {
    const p = computeContextMenuPosition({ x: 995, y: 10 }, MENU, VIEWPORT, { padding: 0 })
    expect(p.x).toBe(795)
    const squashed = computeContextMenuPosition({ x: 0, y: 0 }, MENU, { width: 10, height: 10 }, { padding: 20 })
    expect(squashed.maxHeight).toBe(0)
  })
})

describe('computeContextSubmenuPosition', () => {
  const anchor = { top: 100, bottom: 132, left: 300, right: 500 }

  it('opens to the right of the trigger, pulled up by the align offset', () => {
    const p = computeContextSubmenuPosition(anchor, MENU, VIEWPORT)
    expect(p).toMatchObject({
      x: anchor.right,
      y: anchor.top - CONTEXT_SUBMENU_ALIGN_OFFSET_PX,
      flippedX: false,
      flippedY: false,
    })
  })

  it('flips to the left of the parent menu when there is no room on the right', () => {
    const p = computeContextSubmenuPosition({ ...anchor, left: 700, right: 900 }, MENU, VIEWPORT)
    expect(p.x).toBe(700 - MENU.width)
    expect(p.flippedX).toBe(true)
  })

  it('bottom-aligns with the trigger when there is no room below', () => {
    const low = { top: 700, bottom: 732, left: 100, right: 300 }
    const p = computeContextSubmenuPosition(low, MENU, VIEWPORT, { alignOffset: 0 })
    expect(p.y).toBe(low.bottom - MENU.height)
    expect(p.flippedY).toBe(true)
  })

  it('shifts inside the viewport when neither side fits', () => {
    const p = computeContextSubmenuPosition({ top: 10, bottom: 40, left: 20, right: 280 }, MENU, { width: 300, height: 800 })
    expect(p.x).toBe(300 - PAD - MENU.width)
  })
})

describe('getContextMenuElementAnchor', () => {
  it('anchors at the bottom-start corner of the focused element', () => {
    expect(getContextMenuElementAnchor({ top: 10, bottom: 50, left: 30, right: 300 })).toEqual({ x: 30, y: 50 })
  })
})

describe('opening gestures', () => {
  it('recognises the ContextMenu key and Shift+F10 only', () => {
    expect(isContextMenuOpenKey({ key: 'ContextMenu' })).toBe(true)
    expect(isContextMenuOpenKey({ key: 'F10', shiftKey: true })).toBe(true)
    expect(isContextMenuOpenKey({ key: 'F10' })).toBe(false)
    expect(isContextMenuOpenKey({ key: 'Enter', shiftKey: true })).toBe(false)
  })

  it('uses long-press for touch and pen but not mouse', () => {
    expect(isContextMenuLongPressPointer('touch')).toBe(true)
    expect(isContextMenuLongPressPointer('pen')).toBe(true)
    expect(isContextMenuLongPressPointer('mouse')).toBe(false)
    expect(isContextMenuLongPressPointer('')).toBe(false)
  })

  it('cancels a long-press once the pointer drifts past the tolerance', () => {
    const start = { x: 100, y: 100 }
    expect(exceedsContextMenuLongPressTolerance(start, { x: 100 + CONTEXT_MENU_LONG_PRESS_TOLERANCE_PX, y: 100 })).toBe(false)
    expect(exceedsContextMenuLongPressTolerance(start, { x: 108, y: 108 })).toBe(true)
    expect(exceedsContextMenuLongPressTolerance(start, { x: 104, y: 103 }, 4)).toBe(true)
  })
})

describe('getNextContextMenuIndex', () => {
  const none = [false, false, false, false]

  it('moves down and up, wrapping at the ends', () => {
    expect(getNextContextMenuIndex(none, 0, 'ArrowDown')).toBe(1)
    expect(getNextContextMenuIndex(none, 3, 'ArrowDown')).toBe(0)
    expect(getNextContextMenuIndex(none, 0, 'ArrowUp')).toBe(3)
    expect(getNextContextMenuIndex(none, 2, 'ArrowUp')).toBe(1)
  })

  it('jumps to the first / last row with Home / End', () => {
    expect(getNextContextMenuIndex(none, 2, 'Home')).toBe(0)
    expect(getNextContextMenuIndex(none, 1, 'End')).toBe(3)
  })

  it('enters from the menu itself (current -1) at the first or last row', () => {
    expect(getNextContextMenuIndex(none, -1, 'ArrowDown')).toBe(0)
    expect(getNextContextMenuIndex(none, -1, 'ArrowUp')).toBe(3)
  })

  it('skips disabled rows in every direction', () => {
    const disabled = [true, false, true, false, true]
    expect(getNextContextMenuIndex(disabled, 1, 'ArrowDown')).toBe(3)
    expect(getNextContextMenuIndex(disabled, 3, 'ArrowDown')).toBe(1)
    expect(getNextContextMenuIndex(disabled, 1, 'ArrowUp')).toBe(3)
    expect(getNextContextMenuIndex(disabled, 3, 'Home')).toBe(1)
    expect(getNextContextMenuIndex(disabled, 1, 'End')).toBe(3)
    expect(getNextContextMenuIndex(disabled, -1, 'ArrowDown')).toBe(1)
  })

  it('stays put on the only enabled row and returns -1 when none are enabled', () => {
    expect(getNextContextMenuIndex([true, false, true], 1, 'ArrowDown')).toBe(1)
    expect(getNextContextMenuIndex([true, true], -1, 'ArrowDown')).toBe(-1)
    expect(getNextContextMenuIndex([], -1, 'Home')).toBe(-1)
  })

  it('returns current for unhandled keys', () => {
    expect(getNextContextMenuIndex(none, 2, 'a')).toBe(2)
    expect(getNextContextMenuIndex(none, 2, 'ArrowRight')).toBe(2)
  })
})

describe('submenu keys', () => {
  it('opens with ArrowRight, Enter and Space and closes with ArrowLeft', () => {
    expect(isContextSubmenuOpenKey('ArrowRight')).toBe(true)
    expect(isContextSubmenuOpenKey('Enter')).toBe(true)
    expect(isContextSubmenuOpenKey(' ')).toBe(true)
    expect(isContextSubmenuOpenKey('ArrowLeft')).toBe(false)
    expect(isContextSubmenuCloseKey('ArrowLeft')).toBe(true)
    expect(isContextSubmenuCloseKey('Escape')).toBe(false)
  })
})

describe('typeahead', () => {
  const items = [
    { label: 'Copy' },
    { label: 'Cut' },
    { label: 'Paste', disabled: true },
    { label: '  Pin message' },
    { label: 'Delete' },
  ]

  it('accepts single printable characters without command modifiers', () => {
    expect(isContextMenuTypeaheadKey({ key: 'c' })).toBe(true)
    expect(isContextMenuTypeaheadKey({ key: 'C' })).toBe(true)
    expect(isContextMenuTypeaheadKey({ key: ' ' })).toBe(false)
    expect(isContextMenuTypeaheadKey({ key: 'ArrowDown' })).toBe(false)
    expect(isContextMenuTypeaheadKey({ key: 'c', ctrlKey: true })).toBe(false)
    expect(isContextMenuTypeaheadKey({ key: 'c', metaKey: true })).toBe(false)
    expect(isContextMenuTypeaheadKey({ key: 'c', altKey: true })).toBe(false)
  })

  it('builds a lower-cased query and resets it after a pause', () => {
    let state = appendContextMenuTypeahead(CONTEXT_MENU_TYPEAHEAD_INITIAL, 'C', 1000)
    expect(state).toEqual({ query: 'c', lastKeyAt: 1000 })
    state = appendContextMenuTypeahead(state, 'u', 1000 + CONTEXT_MENU_TYPEAHEAD_RESET_MS)
    expect(state.query).toBe('cu')
    state = appendContextMenuTypeahead(state, 'd', 1000 + CONTEXT_MENU_TYPEAHEAD_RESET_MS * 3)
    expect(state.query).toBe('d')
    expect(appendContextMenuTypeahead(state, 'x', state.lastKeyAt! + 50, 10).query).toBe('x')
  })

  it('finds the next match after the current row and cycles on repeats', () => {
    expect(findContextMenuTypeaheadIndex(items, 'c', -1)).toBe(0)
    expect(findContextMenuTypeaheadIndex(items, 'c', 0)).toBe(1)
    expect(findContextMenuTypeaheadIndex(items, 'c', 1)).toBe(0)
    expect(findContextMenuTypeaheadIndex(items, 'cc', 0)).toBe(1)
  })

  it('keeps the current row while a longer query still matches it', () => {
    expect(findContextMenuTypeaheadIndex(items, 'cu', 1)).toBe(1)
    expect(findContextMenuTypeaheadIndex(items, 'co', 1)).toBe(0)
  })

  it('skips disabled rows, trims labels, and returns -1 for no match', () => {
    expect(findContextMenuTypeaheadIndex(items, 'p', -1)).toBe(3)
    expect(findContextMenuTypeaheadIndex(items, 'pa', -1)).toBe(-1)
    expect(findContextMenuTypeaheadIndex(items, 'z', 0)).toBe(-1)
    expect(findContextMenuTypeaheadIndex(items, '', 0)).toBe(-1)
    expect(findContextMenuTypeaheadIndex([], 'a', 0)).toBe(-1)
  })
})

describe('getContextMenuItemAria', () => {
  it('describes a plain action item', () => {
    expect(getContextMenuItemAria({ kind: 'item' })).toEqual({ role: 'menuitem', tabIndex: -1 })
  })

  it('marks disabled rows for AT and styling', () => {
    expect(getContextMenuItemAria({ kind: 'item', disabled: true })).toMatchObject({
      'aria-disabled': true,
      'data-disabled': '',
    })
  })

  it('reports checked state for checkbox and radio rows', () => {
    expect(getContextMenuItemAria({ kind: 'checkbox', checked: true })).toMatchObject({
      role: 'menuitemcheckbox',
      'aria-checked': true,
      'data-state': 'checked',
    })
    expect(getContextMenuItemAria({ kind: 'radio' })).toMatchObject({
      role: 'menuitemradio',
      'aria-checked': false,
      'data-state': 'unchecked',
    })
  })

  it('links a sub-trigger to its submenu', () => {
    expect(getContextMenuItemAria({ kind: 'subtrigger', expanded: true, controls: 'sub-1' })).toEqual({
      role: 'menuitem',
      tabIndex: -1,
      'aria-haspopup': 'menu',
      'aria-expanded': true,
      'aria-controls': 'sub-1',
      'data-state': 'open',
    })
    expect(getContextMenuItemAria({ kind: 'subtrigger' })).not.toHaveProperty('aria-controls')
  })
})

describe('styles', () => {
  it('builds on the DropdownMenu surface and item so both menus match', () => {
    expect(contextMenuContentVariants()).toContain(menuContentVariants())
    expect(contextMenuItemVariants()).toContain(menuItemVariants())
  })

  it('stops the entry animation under reduced motion', () => {
    expect(contextMenuContentVariants()).toContain('motion-reduce:animate-none')
  })

  it('shows a focus-visible ring on rows', () => {
    expect(contextMenuItemVariants()).toContain('focus-visible:ring-2 focus-visible:ring-ring')
  })

  it('applies destructive tone and inset variants', () => {
    expect(contextMenuItemVariants({ variant: 'destructive' })).toContain('text-destructive')
    expect(contextMenuItemVariants()).not.toContain('text-destructive')
    expect(contextMenuItemVariants({ inset: 'true' })).toContain('pl-8')
    expect(contextMenuLabelVariants({ inset: 'true' })).toContain('pl-8')
    expect(contextMenuLabelVariants()).not.toContain('pl-8')
  })
})
