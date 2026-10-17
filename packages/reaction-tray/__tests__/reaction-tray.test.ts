import { describe, it, expect } from 'vitest'
import {
  createReactionTray,
  buildReactionTrayLayout,
  getNextReactionTrayIndex,
  isReactionTrayNavigationKey,
  clampReactionTrayIndex,
  resolveReactionTrayInlineCount,
  resolveReactionTrayCellSize,
  resolveReactionTrayGlyphSize,
  reactionTrayPxToRem,
  reactionTrayOptionVariants,
  reactionTrayGlyphVariants,
  reactionTrayToggleIconVariants,
  REACTION_TRAY_DEFAULT_INLINE_COUNT,
  REACTION_TRAY_MIN_CELL_SIZE,
  REACTION_TRAY_DEFAULT_GLYPH_SIZE,
} from '../src/index.js'

describe('resolveReactionTrayInlineCount', () => {
  it('defaults to the documented inline count', () => {
    expect(resolveReactionTrayInlineCount(20)).toBe(REACTION_TRAY_DEFAULT_INLINE_COUNT)
  })

  it('clamps to 0..optionCount', () => {
    expect(resolveReactionTrayInlineCount(3, 10)).toBe(3)
    expect(resolveReactionTrayInlineCount(3, -2)).toBe(0)
    expect(resolveReactionTrayInlineCount(0, 4)).toBe(0)
  })

  it('floors fractions and falls back on non-finite input', () => {
    expect(resolveReactionTrayInlineCount(10, 2.7)).toBe(2)
    expect(resolveReactionTrayInlineCount(10, Number.NaN)).toBe(
      REACTION_TRAY_DEFAULT_INLINE_COUNT,
    )
  })
})

describe('buildReactionTrayLayout', () => {
  it('without overflow renders one row of options and no toggle', () => {
    const layout = buildReactionTrayLayout(4, 6, false)
    expect(layout.hasOverflow).toBe(false)
    expect(layout.toggleIndex).toBe(-1)
    expect(layout.columns).toBe(4)
    expect(layout.rows).toHaveLength(1)
    expect(layout.cells.every((c) => c.type === 'option')).toBe(true)
  })

  it('collapsed: inline options then the toggle, in a single row', () => {
    const layout = buildReactionTrayLayout(10, 3, false)
    expect(layout.hasOverflow).toBe(true)
    expect(layout.columns).toBe(4)
    expect(layout.toggleIndex).toBe(3)
    expect(layout.cells.map((c) => c.type)).toEqual(['option', 'option', 'option', 'toggle'])
    expect(layout.rows).toHaveLength(1)
  })

  it('expanded: the toggle keeps its index and the rest flow into rows of the same width', () => {
    const layout = buildReactionTrayLayout(10, 3, true)
    expect(layout.toggleIndex).toBe(3)
    expect(layout.cells).toHaveLength(11)
    expect(layout.rows.map((r) => r.length)).toEqual([4, 4, 3])
    const optionIndexes = layout.cells
      .filter((c) => c.type === 'option')
      .map((c) => (c.type === 'option' ? c.optionIndex : -1))
    expect(optionIndexes).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    layout.cells.forEach((cell, i) => expect(cell.index).toBe(i))
  })

  it('inlineCount 0 puts everything behind the toggle in a single column', () => {
    const collapsed = buildReactionTrayLayout(3, 0, false)
    expect(collapsed.cells.map((c) => c.type)).toEqual(['toggle'])
    expect(collapsed.columns).toBe(1)
    expect(buildReactionTrayLayout(3, 0, true).rows).toHaveLength(4)
  })

  it('handles an empty option list', () => {
    const layout = buildReactionTrayLayout(0, 6, true)
    expect(layout.cells).toEqual([])
    expect(layout.rows).toEqual([])
    expect(layout.columns).toBe(1)
    expect(layout.hasOverflow).toBe(false)
  })
})

describe('getNextReactionTrayIndex', () => {
  // 3 columns, 8 cells:
  //   0 1 2
  //   3 4 5
  //   6 7
  const nav = { count: 8, columns: 3 }

  it('moves right/left in reading order without wrapping past the ends', () => {
    expect(getNextReactionTrayIndex(0, 'ArrowRight', nav)).toBe(1)
    expect(getNextReactionTrayIndex(2, 'ArrowRight', nav)).toBe(3)
    expect(getNextReactionTrayIndex(7, 'ArrowRight', nav)).toBe(7)
    expect(getNextReactionTrayIndex(3, 'ArrowLeft', nav)).toBe(2)
    expect(getNextReactionTrayIndex(0, 'ArrowLeft', nav)).toBe(0)
  })

  it('moves down/up by a row, staying in the column', () => {
    expect(getNextReactionTrayIndex(1, 'ArrowDown', nav)).toBe(4)
    expect(getNextReactionTrayIndex(4, 'ArrowDown', nav)).toBe(7)
    expect(getNextReactionTrayIndex(4, 'ArrowUp', nav)).toBe(1)
    expect(getNextReactionTrayIndex(1, 'ArrowUp', nav)).toBe(1)
  })

  it('Down onto a shorter last row lands on its final cell; Down on the last row stays', () => {
    expect(getNextReactionTrayIndex(5, 'ArrowDown', nav)).toBe(7)
    expect(getNextReactionTrayIndex(6, 'ArrowDown', nav)).toBe(6)
    expect(getNextReactionTrayIndex(7, 'ArrowDown', nav)).toBe(7)
  })

  it('Home/End go to the ends of the current row', () => {
    expect(getNextReactionTrayIndex(4, 'Home', nav)).toBe(3)
    expect(getNextReactionTrayIndex(4, 'End', nav)).toBe(5)
    expect(getNextReactionTrayIndex(6, 'End', nav)).toBe(7)
  })

  it('Ctrl+Home/Ctrl+End go to the ends of the grid', () => {
    expect(getNextReactionTrayIndex(4, 'Home', { ...nav, ctrlKey: true })).toBe(0)
    expect(getNextReactionTrayIndex(4, 'End', { ...nav, ctrlKey: true })).toBe(7)
  })

  it('returns current for unhandled keys and empty grids', () => {
    expect(getNextReactionTrayIndex(4, 'a', nav)).toBe(4)
    expect(getNextReactionTrayIndex(4, 'Enter', nav)).toBe(4)
    expect(getNextReactionTrayIndex(2, 'ArrowRight', { count: 0, columns: 3 })).toBe(2)
  })

  it('treats a single column as a vertical list', () => {
    const list = { count: 3, columns: 1 }
    expect(getNextReactionTrayIndex(0, 'ArrowDown', list)).toBe(1)
    expect(getNextReactionTrayIndex(2, 'ArrowDown', list)).toBe(2)
    expect(getNextReactionTrayIndex(1, 'End', list)).toBe(1)
  })

  it('normalises out-of-range current indexes and bad column counts', () => {
    expect(getNextReactionTrayIndex(99, 'ArrowLeft', nav)).toBe(6)
    expect(getNextReactionTrayIndex(-5, 'ArrowRight', nav)).toBe(1)
    expect(getNextReactionTrayIndex(0, 'ArrowDown', { count: 3, columns: 0 })).toBe(1)
  })

  it('matches the expanded layout: Down from the toggle reaches the overflow row', () => {
    const layout = buildReactionTrayLayout(10, 3, true)
    const next = getNextReactionTrayIndex(layout.toggleIndex, 'ArrowDown', {
      count: layout.cells.length,
      columns: layout.columns,
    })
    expect(layout.cells[next]).toEqual({ type: 'option', index: 7, optionIndex: 6 })
  })
})

describe('isReactionTrayNavigationKey', () => {
  it('claims arrows and Home/End only', () => {
    for (const key of ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Home', 'End']) {
      expect(isReactionTrayNavigationKey(key)).toBe(true)
    }
    for (const key of ['Enter', ' ', 'Tab', 'Escape', 'a']) {
      expect(isReactionTrayNavigationKey(key)).toBe(false)
    }
  })
})

describe('clampReactionTrayIndex', () => {
  it('keeps the roving index inside the visible cells', () => {
    expect(clampReactionTrayIndex(9, 4)).toBe(3)
    expect(clampReactionTrayIndex(-1, 4)).toBe(0)
    expect(clampReactionTrayIndex(2, 4)).toBe(2)
    expect(clampReactionTrayIndex(2, 0)).toBe(0)
  })
})

describe('sizes', () => {
  it('cells never go below the 44px minimum target', () => {
    expect(resolveReactionTrayCellSize()).toBe(REACTION_TRAY_MIN_CELL_SIZE)
    expect(resolveReactionTrayCellSize(30)).toBe(REACTION_TRAY_MIN_CELL_SIZE)
    expect(resolveReactionTrayCellSize(56)).toBe(56)
    expect(resolveReactionTrayCellSize(Number.NaN)).toBe(REACTION_TRAY_MIN_CELL_SIZE)
  })

  it('glyphs default, stay positive and never exceed the cell', () => {
    expect(resolveReactionTrayGlyphSize(undefined, 44)).toBe(REACTION_TRAY_DEFAULT_GLYPH_SIZE)
    expect(resolveReactionTrayGlyphSize(0, 44)).toBe(REACTION_TRAY_DEFAULT_GLYPH_SIZE)
    expect(resolveReactionTrayGlyphSize(64, 48)).toBe(48)
    expect(resolveReactionTrayGlyphSize(32, 48)).toBe(32)
  })

  it('converts px to rem against the 16px root', () => {
    expect(reactionTrayPxToRem(44)).toBe('2.75rem')
    expect(reactionTrayPxToRem(24)).toBe('1.5rem')
  })
})

describe('createReactionTray', () => {
  it('exposes a labelled grid with a state hook', () => {
    const api = createReactionTray({ expanded: false, hasOverflow: true })
    expect(api.ariaProps).toEqual({ role: 'grid', 'aria-label': 'Reactions' })
    expect(api.dataAttributes['data-state']).toBe('collapsed')
    expect(
      createReactionTray({ expanded: true, hasOverflow: true, ariaLabel: 'React' }).ariaProps[
        'aria-label'
      ],
    ).toBe('React')
  })

  it('reports a static state when nothing overflows', () => {
    expect(
      createReactionTray({ expanded: true, hasOverflow: false }).dataAttributes['data-state'],
    ).toBe('static')
  })

  it('option props carry toggle semantics named by the label', () => {
    const api = createReactionTray({ expanded: false, hasOverflow: false })
    expect(api.getOptionAriaProps({ label: 'Thumbs up', isActive: true })).toEqual({
      'aria-pressed': true,
      'aria-label': 'Thumbs up',
    })
    expect(api.getOptionAriaProps({ label: 'Heart' })['aria-pressed']).toBe(false)
  })

  it('toggle props reflect expansion and the next action', () => {
    const labels = { moreLabel: 'More', fewerLabel: 'Fewer' }
    expect(createReactionTray({ expanded: false, hasOverflow: true }).getToggleAriaProps(labels))
      .toEqual({ 'aria-expanded': false, 'aria-label': 'More' })
    expect(createReactionTray({ expanded: true, hasOverflow: true }).getToggleAriaProps(labels))
      .toEqual({ 'aria-expanded': true, 'aria-label': 'Fewer' })
  })
})

describe('styles', () => {
  it('active cells get a visible border, not only a tint', () => {
    expect(reactionTrayOptionVariants({ active: 'true' })).toContain('border-primary')
    expect(reactionTrayOptionVariants({ active: 'false' })).toContain('border-transparent')
    expect(reactionTrayOptionVariants()).toContain('focus-visible:ring-2')
  })

  it('the pop and chevron turn are disabled under reduced motion', () => {
    const popping = reactionTrayGlyphVariants({ popping: 'true' })
    expect(popping).toContain('scale-125')
    expect(popping).toContain('motion-reduce:scale-100')
    expect(popping).toContain('motion-reduce:transition-none')
    expect(reactionTrayToggleIconVariants({ expanded: 'true' })).toContain('motion-reduce:transition-none')
  })
})
