import { describe, it, expect } from 'vitest'
import {
  VIRTUAL_LIST_DEFAULT_ESTIMATED_ITEM_SIZE,
  VIRTUAL_LIST_DEFAULT_AT_END_THRESHOLD,
  VIRTUAL_LIST_DEFAULT_INITIAL_ITEM_COUNT,
  getVirtualListCount,
  getVirtualListTotalSize,
  getVirtualListSizes,
  computeVirtualListOffsets,
  findVirtualListIndexAtOffset,
  getVirtualListRange,
  getVirtualListInitialRange,
  getVirtualListRenderIndexes,
  areVirtualListWindowsEqual,
  areVirtualListKeysEqual,
  createVirtualListKeyIndex,
  getVirtualListContentSize,
  getVirtualListMaxScrollOffset,
  getVirtualListDistanceFromEnd,
  isVirtualListAtEnd,
  getVirtualListScrollOffsetForIndex,
  captureVirtualListAnchor,
  resolveVirtualListAnchorOffset,
  getVirtualListCorrectedScrollOffset,
  resolveVirtualListScrollBehavior,
  getVirtualListAriaProps,
  getVirtualListItemAriaProps,
  virtualListScrollerClass,
  virtualListItemClass,
  type VirtualListKey,
} from '../src/index.js'

/** Uniform list helper: `count` items of `size` px. */
function uniform(count: number, size: number): number[] {
  return computeVirtualListOffsets(Array.from({ length: count }, () => size))
}

describe('computeVirtualListOffsets', () => {
  it('builds prefix sums of length count + 1', () => {
    expect(computeVirtualListOffsets([10, 20, 30])).toEqual([0, 10, 30, 60])
  })

  it('returns [0] for an empty list', () => {
    expect(computeVirtualListOffsets([])).toEqual([0])
  })

  it('substitutes the estimate for unmeasured items', () => {
    expect(computeVirtualListOffsets([10, undefined, 30], 50)).toEqual([0, 10, 60, 90])
  })

  it('uses the default estimate when none is given', () => {
    expect(computeVirtualListOffsets([undefined])).toEqual([
      0,
      VIRTUAL_LIST_DEFAULT_ESTIMATED_ITEM_SIZE,
    ])
  })

  it('treats negative, NaN and infinite sizes as unmeasured', () => {
    expect(computeVirtualListOffsets([-5, Number.NaN, Infinity], 10)).toEqual([0, 10, 20, 30])
  })

  it('keeps a measured size of 0 (collapsed item)', () => {
    expect(computeVirtualListOffsets([10, 0, 10], 50)).toEqual([0, 10, 10, 20])
  })

  it('falls back to the default estimate when the estimate itself is invalid', () => {
    const d = VIRTUAL_LIST_DEFAULT_ESTIMATED_ITEM_SIZE
    expect(computeVirtualListOffsets([undefined], -1)).toEqual([0, d])
    expect(computeVirtualListOffsets([undefined], Number.NaN)).toEqual([0, d])
  })

  it('keeps fractional sizes exactly (no rounding drift)', () => {
    const offsets = computeVirtualListOffsets([10.5, 10.25, 10.25])
    expect(getVirtualListTotalSize(offsets)).toBe(31)
  })
})

describe('getVirtualListCount / getVirtualListTotalSize', () => {
  it('reads count and total from offsets', () => {
    const offsets = uniform(4, 25)
    expect(getVirtualListCount(offsets)).toBe(4)
    expect(getVirtualListTotalSize(offsets)).toBe(100)
  })

  it('handles empty arrays defensively', () => {
    expect(getVirtualListCount([])).toBe(0)
    expect(getVirtualListTotalSize([])).toBe(0)
    expect(getVirtualListCount([0])).toBe(0)
  })
})

describe('getVirtualListSizes', () => {
  it('looks sizes up by key, leaving unmeasured keys undefined', () => {
    const measured = new Map<VirtualListKey, number>([
      ['a', 10],
      [3, 30],
    ])
    expect(getVirtualListSizes(['a', 'b', 3], measured)).toEqual([10, undefined, 30])
  })

  it('a measurement follows its key when items are prepended', () => {
    const measured = new Map<VirtualListKey, number>([['m1', 99]])
    expect(getVirtualListSizes(['m1'], measured)).toEqual([99])
    expect(getVirtualListSizes(['old', 'm1'], measured)).toEqual([undefined, 99])
  })
})

describe('findVirtualListIndexAtOffset', () => {
  const offsets = computeVirtualListOffsets([10, 20, 30]) // [0,10,30,60]

  it('returns -1 for an empty list', () => {
    expect(findVirtualListIndexAtOffset([0], 5)).toBe(-1)
  })

  it('finds the item containing an offset', () => {
    expect(findVirtualListIndexAtOffset(offsets, 0)).toBe(0)
    expect(findVirtualListIndexAtOffset(offsets, 9.9)).toBe(0)
    expect(findVirtualListIndexAtOffset(offsets, 10)).toBe(1)
    expect(findVirtualListIndexAtOffset(offsets, 29)).toBe(1)
    expect(findVirtualListIndexAtOffset(offsets, 30)).toBe(2)
  })

  it('clamps below 0 and past the end', () => {
    expect(findVirtualListIndexAtOffset(offsets, -100)).toBe(0)
    expect(findVirtualListIndexAtOffset(offsets, 60)).toBe(2)
    expect(findVirtualListIndexAtOffset(offsets, 10_000)).toBe(2)
  })

  it('skips zero-size items to the one occupying the space', () => {
    const withCollapsed = computeVirtualListOffsets([10, 0, 0, 10]) // [0,10,10,10,20]
    expect(findVirtualListIndexAtOffset(withCollapsed, 10)).toBe(3)
  })

  it('agrees with a linear scan across a large variable list', () => {
    const sizes = Array.from({ length: 1000 }, (_, i) => 20 + ((i * 37) % 80))
    const big = computeVirtualListOffsets(sizes)
    const linear = (offset: number) => {
      let found = 0
      for (let i = 0; i < sizes.length; i++) if (big[i] <= offset) found = i
      return found
    }
    for (let offset = 0; offset < getVirtualListTotalSize(big); offset += 997) {
      expect(findVirtualListIndexAtOffset(big, offset)).toBe(linear(offset))
    }
  })
})

describe('getVirtualListRange', () => {
  const offsets = uniform(100, 10) // total 1000

  it('mounts the visible items plus overscan on both sides', () => {
    expect(
      getVirtualListRange({ offsets, scrollOffset: 200, viewportSize: 50, overscan: 2 }),
    ).toEqual({ start: 18, end: 27, visibleStart: 20, visibleEnd: 25 })
  })

  it('includes a partially visible item at each edge', () => {
    const r = getVirtualListRange({ offsets, scrollOffset: 205, viewportSize: 50, overscan: 0 })
    expect(r).toEqual({ start: 20, end: 26, visibleStart: 20, visibleEnd: 26 })
  })

  it('clamps overscan at the start and end of the list', () => {
    expect(
      getVirtualListRange({ offsets, scrollOffset: 0, viewportSize: 30, overscan: 5 }),
    ).toEqual({ start: 0, end: 8, visibleStart: 0, visibleEnd: 3 })
    expect(
      getVirtualListRange({ offsets, scrollOffset: 970, viewportSize: 30, overscan: 5 }),
    ).toEqual({ start: 92, end: 100, visibleStart: 97, visibleEnd: 100 })
  })

  it('returns an empty window for an empty list', () => {
    expect(getVirtualListRange({ offsets: [0], scrollOffset: 0, viewportSize: 100 })).toEqual({
      start: 0,
      end: 0,
      visibleStart: 0,
      visibleEnd: 0,
    })
  })

  it('mounts at least the item at the scroll position for a 0px viewport', () => {
    const r = getVirtualListRange({ offsets, scrollOffset: 55, viewportSize: 0, overscan: 0 })
    expect(r).toEqual({ start: 5, end: 6, visibleStart: 5, visibleEnd: 6 })
  })

  it('treats negative scroll (overscroll bounce) as 0', () => {
    const r = getVirtualListRange({ offsets, scrollOffset: -40, viewportSize: 20, overscan: 0 })
    expect(r.visibleStart).toBe(0)
    expect(r.visibleEnd).toBe(2)
  })

  it('sanitises fractional and invalid overscan', () => {
    const base = { offsets, scrollOffset: 500, viewportSize: 10 }
    expect(getVirtualListRange({ ...base, overscan: 1.9 }).start).toBe(49)
    expect(getVirtualListRange({ ...base, overscan: -3 }).start).toBe(50)
    expect(getVirtualListRange({ ...base, overscan: Number.NaN }).start).toBe(50)
  })

  it('works on variable heights', () => {
    const variable = computeVirtualListOffsets([100, 10, 10, 10, 100]) // [0,100,110,120,130,230]
    const r = getVirtualListRange({ offsets: variable, scrollOffset: 95, viewportSize: 30, overscan: 0 })
    expect(r).toEqual({ start: 0, end: 4, visibleStart: 0, visibleEnd: 4 })
  })
})

describe('getVirtualListInitialRange', () => {
  it('renders the first items for a top-anchored list', () => {
    expect(getVirtualListInitialRange({ count: 100, initialItemCount: 5 })).toEqual({
      start: 0,
      end: 5,
      visibleStart: 0,
      visibleEnd: 5,
    })
  })

  it('renders the last items for a bottom-anchored list', () => {
    expect(getVirtualListInitialRange({ count: 100, initialItemCount: 5, anchor: 'end' })).toEqual({
      start: 95,
      end: 100,
      visibleStart: 95,
      visibleEnd: 100,
    })
  })

  it('defaults initialItemCount and clamps to the list length', () => {
    expect(getVirtualListInitialRange({ count: 100 }).end).toBe(
      VIRTUAL_LIST_DEFAULT_INITIAL_ITEM_COUNT,
    )
    expect(getVirtualListInitialRange({ count: 3, initialItemCount: 50, anchor: 'end' })).toEqual({
      start: 0,
      end: 3,
      visibleStart: 0,
      visibleEnd: 3,
    })
  })

  it('handles empty and invalid counts', () => {
    expect(getVirtualListInitialRange({ count: 0 }).end).toBe(0)
    expect(getVirtualListInitialRange({ count: -4, initialItemCount: -1 }).end).toBe(0)
  })
})

describe('getVirtualListRenderIndexes', () => {
  it('lists the range in order', () => {
    expect(getVirtualListRenderIndexes({ start: 3, end: 6 }, [], 10)).toEqual([3, 4, 5])
  })

  it('adds a pinned (focused) index outside the range, sorted', () => {
    expect(getVirtualListRenderIndexes({ start: 50, end: 53 }, [2], 100)).toEqual([2, 50, 51, 52])
  })

  it('does not duplicate a pinned index inside the range', () => {
    expect(getVirtualListRenderIndexes({ start: 0, end: 3 }, [1, 1], 10)).toEqual([0, 1, 2])
  })

  it('drops pinned and ranged indexes that no longer exist', () => {
    expect(getVirtualListRenderIndexes({ start: 8, end: 20 }, [-1, 1.5, 42], 10)).toEqual([8, 9])
  })

  it('handles an inverted range', () => {
    expect(getVirtualListRenderIndexes({ start: 5, end: 2 }, [], 10)).toEqual([])
  })
})

describe('equality helpers and key index', () => {
  it('compares windows field by field', () => {
    const a = { start: 0, end: 5, visibleStart: 1, visibleEnd: 4 }
    expect(areVirtualListWindowsEqual(a, { ...a })).toBe(true)
    expect(areVirtualListWindowsEqual(a, { ...a, visibleEnd: 5 })).toBe(false)
  })

  it('compares key lists by value', () => {
    const keys = ['a', 'b']
    expect(areVirtualListKeysEqual(keys, keys)).toBe(true)
    expect(areVirtualListKeysEqual(['a', 'b'], ['a', 'b'])).toBe(true)
    expect(areVirtualListKeysEqual(['a', 'b'], ['a'])).toBe(false)
    expect(areVirtualListKeysEqual(['a', 'b'], ['b', 'a'])).toBe(false)
    expect(areVirtualListKeysEqual([1], ['1'])).toBe(false)
  })

  it('maps keys to indexes', () => {
    const index = createVirtualListKeyIndex(['x', 7, 'z'])
    expect(index.get('x')).toBe(0)
    expect(index.get(7)).toBe(1)
    expect(index.get('missing')).toBeUndefined()
  })
})

describe('getVirtualListContentSize', () => {
  it('adds no leading space to a top-anchored list', () => {
    expect(getVirtualListContentSize({ totalSize: 50, viewportSize: 200 })).toEqual({
      leadingSpace: 0,
      contentSize: 50,
    })
  })

  it('sits short bottom-anchored content at the bottom of the viewport', () => {
    expect(
      getVirtualListContentSize({ totalSize: 50, viewportSize: 200, anchor: 'end' }),
    ).toEqual({ leadingSpace: 150, contentSize: 200 })
  })

  it('adds no leading space once content overflows', () => {
    expect(
      getVirtualListContentSize({ totalSize: 500, viewportSize: 200, anchor: 'end' }),
    ).toEqual({ leadingSpace: 0, contentSize: 500 })
  })
})

describe('getVirtualListMaxScrollOffset', () => {
  it('is content minus viewport, never negative', () => {
    expect(getVirtualListMaxScrollOffset(1000, 300)).toBe(700)
    expect(getVirtualListMaxScrollOffset(100, 300)).toBe(0)
    expect(getVirtualListMaxScrollOffset(100, -5)).toBe(100)
  })
})

describe('at-end maths (shared with JumpToLatest)', () => {
  it('measures the distance from the viewport bottom to the end', () => {
    expect(
      getVirtualListDistanceFromEnd({ scrollOffset: 600, viewportSize: 300, contentSize: 1000 }),
    ).toBe(100)
    expect(
      getVirtualListDistanceFromEnd({ scrollOffset: 800, viewportSize: 300, contentSize: 1000 }),
    ).toBe(0)
  })

  it('is at the end within the threshold, inclusive', () => {
    const base = { viewportSize: 300, contentSize: 1000, threshold: 20 }
    expect(isVirtualListAtEnd({ ...base, scrollOffset: 700 })).toBe(true)
    expect(isVirtualListAtEnd({ ...base, scrollOffset: 680 })).toBe(true)
    expect(isVirtualListAtEnd({ ...base, scrollOffset: 679 })).toBe(false)
  })

  it('uses the default threshold when none is given', () => {
    const t = VIRTUAL_LIST_DEFAULT_AT_END_THRESHOLD
    expect(isVirtualListAtEnd({ scrollOffset: 700 - t, viewportSize: 300, contentSize: 1000 })).toBe(true)
    expect(
      isVirtualListAtEnd({ scrollOffset: 700 - t - 1, viewportSize: 300, contentSize: 1000 }),
    ).toBe(false)
  })

  it('treats a negative or invalid threshold as exact', () => {
    const base = { scrollOffset: 699, viewportSize: 300, contentSize: 1000 }
    expect(isVirtualListAtEnd({ ...base, threshold: -10 })).toBe(false)
    expect(isVirtualListAtEnd({ ...base, threshold: Number.NaN })).toBe(false)
    expect(isVirtualListAtEnd({ ...base, scrollOffset: 700, threshold: -10 })).toBe(true)
  })

  it('content shorter than the viewport is always at the end', () => {
    expect(
      isVirtualListAtEnd({ scrollOffset: 0, viewportSize: 300, contentSize: 100, threshold: 0 }),
    ).toBe(true)
  })
})

describe('getVirtualListScrollOffsetForIndex', () => {
  const offsets = uniform(100, 20) // total 2000
  const base = { offsets, scrollOffset: 0, viewportSize: 100 }

  it('aligns to start, center and end', () => {
    expect(getVirtualListScrollOffsetForIndex({ ...base, index: 50, align: 'start' })).toBe(1000)
    expect(getVirtualListScrollOffsetForIndex({ ...base, index: 50, align: 'end' })).toBe(920)
    expect(getVirtualListScrollOffsetForIndex({ ...base, index: 50, align: 'center' })).toBe(960)
  })

  it('clamps to the scrollable range', () => {
    expect(getVirtualListScrollOffsetForIndex({ ...base, index: 0, align: 'end' })).toBe(0)
    expect(getVirtualListScrollOffsetForIndex({ ...base, index: 0, align: 'center' })).toBe(0)
    expect(getVirtualListScrollOffsetForIndex({ ...base, index: 99, align: 'start' })).toBe(1900)
  })

  it('clamps out-of-range and fractional indexes', () => {
    expect(getVirtualListScrollOffsetForIndex({ ...base, index: -5, align: 'start' })).toBe(0)
    expect(getVirtualListScrollOffsetForIndex({ ...base, index: 500, align: 'start' })).toBe(1900)
    expect(getVirtualListScrollOffsetForIndex({ ...base, index: 10.7, align: 'start' })).toBe(200)
  })

  it('returns 0 for an empty list', () => {
    expect(
      getVirtualListScrollOffsetForIndex({ offsets: [0], index: 3, scrollOffset: 50, viewportSize: 100 }),
    ).toBe(0)
  })

  describe("align 'auto'", () => {
    it('leaves a fully visible item alone', () => {
      expect(
        getVirtualListScrollOffsetForIndex({ ...base, scrollOffset: 500, index: 26, align: 'auto' }),
      ).toBe(500)
    })

    it('scrolls up the least to reveal an item above', () => {
      expect(
        getVirtualListScrollOffsetForIndex({ ...base, scrollOffset: 500, index: 10, align: 'auto' }),
      ).toBe(200)
    })

    it('scrolls down the least to reveal an item below', () => {
      expect(
        getVirtualListScrollOffsetForIndex({ ...base, scrollOffset: 500, index: 40 }),
      ).toBe(720)
    })

    it('reveals a partially visible item', () => {
      // Item 30 spans 600–620; viewport 505–605 shows only part of it.
      expect(
        getVirtualListScrollOffsetForIndex({ ...base, scrollOffset: 505, index: 30, align: 'auto' }),
      ).toBe(520)
    })

    it('aligns an item taller than the viewport to its start', () => {
      const tall = computeVirtualListOffsets([20, 500, 20])
      expect(
        getVirtualListScrollOffsetForIndex({
          offsets: tall,
          scrollOffset: 0,
          viewportSize: 100,
          index: 1,
          align: 'auto',
        }),
      ).toBe(20)
    })
  })

  it('accounts for leading space in a short bottom-anchored list', () => {
    const short = uniform(3, 20) // total 60, viewport 100 -> leading 40
    expect(
      getVirtualListScrollOffsetForIndex({
        offsets: short,
        index: 2,
        align: 'start',
        scrollOffset: 0,
        viewportSize: 100,
        leadingSpace: 40,
      }),
    ).toBe(0)
  })
})

describe('scroll anchors (prepend / measure without jumping)', () => {
  it('captures the first visible item and the offset into it', () => {
    const offsets = uniform(10, 50)
    expect(
      captureVirtualListAnchor({ offsets, keys: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'], scrollOffset: 120 }),
    ).toEqual({ key: 'c', offsetWithinItem: 20 })
  })

  it('returns null for an empty list', () => {
    expect(captureVirtualListAnchor({ offsets: [0], keys: [], scrollOffset: 0 })).toBeNull()
  })

  it('removes leading space before locating the anchor', () => {
    const offsets = uniform(2, 20)
    expect(
      captureVirtualListAnchor({ offsets, keys: ['a', 'b'], scrollOffset: 0, leadingSpace: 60 }),
    ).toEqual({ key: 'a', offsetWithinItem: 0 })
  })

  it('keeps the anchored item in place when older items are prepended', () => {
    const keys = ['m3', 'm4', 'm5', 'm6']
    const before = computeVirtualListOffsets([40, 40, 40, 40])
    const anchor = captureVirtualListAnchor({ offsets: before, keys, scrollOffset: 50 })
    expect(anchor).toEqual({ key: 'm4', offsetWithinItem: 10 })

    const nextKeys = ['m1', 'm2', ...keys]
    const after = computeVirtualListOffsets([48, 48, 40, 40, 40, 40])
    const resolved = resolveVirtualListAnchorOffset({
      anchor: anchor!,
      offsets: after,
      keyIndex: createVirtualListKeyIndex(nextKeys),
    })
    // Two prepended items of 48px push m4 down by 96px.
    expect(resolved).toBe(146)
  })

  it('compensates when an item above the viewport is measured', () => {
    const keys = ['a', 'b', 'c']
    const keyIndex = createVirtualListKeyIndex(keys)
    const estimated = computeVirtualListOffsets([undefined, undefined, undefined], 50)
    const anchor = captureVirtualListAnchor({ offsets: estimated, keys, scrollOffset: 110 })!
    const measured = computeVirtualListOffsets([80, undefined, undefined], 50)
    expect(resolveVirtualListAnchorOffset({ anchor, offsets: measured, keyIndex })).toBe(140)
  })

  it('returns null when the anchored item was removed', () => {
    expect(
      resolveVirtualListAnchorOffset({
        anchor: { key: 'gone', offsetWithinItem: 0 },
        offsets: uniform(2, 10),
        keyIndex: createVirtualListKeyIndex(['a', 'b']),
      }),
    ).toBeNull()
  })

  it('returns null for an index map that is out of sync with offsets', () => {
    expect(
      resolveVirtualListAnchorOffset({
        anchor: { key: 'c', offsetWithinItem: 0 },
        offsets: uniform(2, 10),
        keyIndex: createVirtualListKeyIndex(['a', 'b', 'c']),
      }),
    ).toBeNull()
  })
})

describe('getVirtualListCorrectedScrollOffset', () => {
  const keys = Array.from({ length: 100 }, (_, i) => `k${i}`)
  const keyIndex = createVirtualListKeyIndex(keys)
  const offsets = uniform(100, 20) // total 2000, max 1900 with viewport 100
  const base = {
    anchor: 'start' as const,
    wasAtEnd: false,
    scrollAnchor: null,
    target: null,
    offsets,
    keyIndex,
    scrollOffset: 400,
    viewportSize: 100,
  }

  it('returns null when nothing applies', () => {
    expect(getVirtualListCorrectedScrollOffset(base)).toBeNull()
  })

  it('pins a bottom-anchored list that was at the end', () => {
    expect(
      getVirtualListCorrectedScrollOffset({ ...base, anchor: 'end', wasAtEnd: true }),
    ).toBe(1900)
  })

  it('does not pin a top-anchored list, even at the end', () => {
    expect(getVirtualListCorrectedScrollOffset({ ...base, wasAtEnd: true })).toBeNull()
  })

  it('does not pin a bottom-anchored list the reader scrolled away from', () => {
    const scrollAnchor = { key: 'k20', offsetWithinItem: 5 }
    expect(
      getVirtualListCorrectedScrollOffset({ ...base, anchor: 'end', wasAtEnd: false, scrollAnchor }),
    ).toBe(405)
  })

  it('restores the reader anchor, clamped to the scrollable range', () => {
    expect(
      getVirtualListCorrectedScrollOffset({ ...base, scrollAnchor: { key: 'k99', offsetWithinItem: 0 } }),
    ).toBe(1900)
  })

  it('returns null when the anchor item disappeared', () => {
    expect(
      getVirtualListCorrectedScrollOffset({ ...base, scrollAnchor: { key: 'nope', offsetWithinItem: 0 } }),
    ).toBeNull()
  })

  it('a pending key target wins over pinning and anchors', () => {
    expect(
      getVirtualListCorrectedScrollOffset({
        ...base,
        anchor: 'end',
        wasAtEnd: true,
        scrollAnchor: { key: 'k1', offsetWithinItem: 0 },
        target: { type: 'key', key: 'k10', align: 'start' },
      }),
    ).toBe(200)
  })

  it('a pending end target scrolls to the end', () => {
    expect(getVirtualListCorrectedScrollOffset({ ...base, target: { type: 'end' } })).toBe(1900)
  })

  it('falls through when the pending key no longer exists', () => {
    expect(
      getVirtualListCorrectedScrollOffset({
        ...base,
        target: { type: 'key', key: 'missing', align: 'start' },
        scrollAnchor: { key: 'k3', offsetWithinItem: 2 },
      }),
    ).toBe(62)
  })
})

describe('resolveVirtualListScrollBehavior', () => {
  it('honours the requested behaviour, defaulting to auto', () => {
    expect(resolveVirtualListScrollBehavior('smooth', false)).toBe('smooth')
    expect(resolveVirtualListScrollBehavior(undefined, false)).toBe('auto')
  })

  it('never animates under prefers-reduced-motion', () => {
    expect(resolveVirtualListScrollBehavior('smooth', true)).toBe('auto')
  })
})

describe('ARIA', () => {
  it('list role: the scroller is the list', () => {
    expect(getVirtualListAriaProps({ atEnd: true })).toEqual({
      scroller: { role: 'list' },
      sizer: { role: 'presentation' },
    })
  })

  it('log role: a live region that is only live at the end', () => {
    expect(getVirtualListAriaProps({ role: 'log', atEnd: true })).toEqual({
      scroller: { role: 'log', 'aria-live': 'polite', 'aria-relevant': 'additions' },
      sizer: { role: 'list' },
    })
    expect(getVirtualListAriaProps({ role: 'log', atEnd: false }).scroller['aria-live']).toBe('off')
  })

  it('items carry a 1-based position in the full set', () => {
    expect(getVirtualListItemAriaProps(0, 3000)).toEqual({
      role: 'listitem',
      'aria-posinset': 1,
      'aria-setsize': 3000,
    })
    expect(getVirtualListItemAriaProps(511, 3000)['aria-posinset']).toBe(512)
  })
})

describe('styles', () => {
  it('scroller has a visible focus ring and disables native scroll anchoring', () => {
    expect(virtualListScrollerClass).toContain('focus-visible:ring-2')
    expect(virtualListScrollerClass).toContain('focus-visible:ring-ring')
    expect(virtualListScrollerClass).toContain('[overflow-anchor:none]')
    expect(virtualListScrollerClass).toContain('overflow-y-auto')
  })

  it('items are absolutely positioned and contain their margins', () => {
    expect(virtualListItemClass).toContain('absolute')
    expect(virtualListItemClass).toContain('flow-root')
  })
})
