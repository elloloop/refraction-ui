import { describe, it, expect } from 'vitest'
import {
  createPinnedBar,
  createPinnedBarAnchor,
  clampPinnedBarIndex,
  getNextPinnedBarIndex,
  getPreviousPinnedBarIndex,
  locatePinnedBarIndex,
  resolvePinnedBarLabels,
  truncatePinnedBarText,
  PINNED_BAR_DEFAULT_LABELS,
  PINNED_BAR_NO_INDEX,
  PINNED_BAR_ANNOUNCEMENT_SNIPPET_MAX_CHARS,
  type PinnedBarItem,
} from '../src/index.js'

const item = (id: string, author = `Author ${id}`, snippet = `Snippet ${id}`): PinnedBarItem => ({
  id,
  author,
  snippet,
})
const ITEMS = ['a', 'b', 'c', 'd', 'e'].map((id) => item(id))

describe('clampPinnedBarIndex', () => {
  it('returns NO_INDEX when there are no pins', () => {
    expect(clampPinnedBarIndex(0, 0)).toBe(PINNED_BAR_NO_INDEX)
    expect(clampPinnedBarIndex(3, -1)).toBe(PINNED_BAR_NO_INDEX)
  })

  it('keeps in-range indices', () => {
    expect(clampPinnedBarIndex(0, 5)).toBe(0)
    expect(clampPinnedBarIndex(4, 5)).toBe(4)
  })

  it('clamps rather than wraps out-of-range indices', () => {
    expect(clampPinnedBarIndex(7, 5)).toBe(4)
    expect(clampPinnedBarIndex(-2, 5)).toBe(0)
  })

  it('treats undefined / NaN / Infinity as "first pin" and floors fractions', () => {
    expect(clampPinnedBarIndex(undefined, 5)).toBe(0)
    expect(clampPinnedBarIndex(Number.NaN, 5)).toBe(0)
    expect(clampPinnedBarIndex(Number.POSITIVE_INFINITY, 5)).toBe(0)
    expect(clampPinnedBarIndex(2.9, 5)).toBe(2)
  })
})

describe('getNextPinnedBarIndex / getPreviousPinnedBarIndex', () => {
  it('steps by one in the middle', () => {
    expect(getNextPinnedBarIndex(1, 5)).toBe(2)
    expect(getPreviousPinnedBarIndex(3, 5)).toBe(2)
  })

  it('wraps at both ends', () => {
    expect(getNextPinnedBarIndex(4, 5)).toBe(0)
    expect(getPreviousPinnedBarIndex(0, 5)).toBe(4)
  })

  it('stays put with a single pin', () => {
    expect(getNextPinnedBarIndex(0, 1)).toBe(0)
    expect(getPreviousPinnedBarIndex(0, 1)).toBe(0)
  })

  it('returns NO_INDEX with no pins', () => {
    expect(getNextPinnedBarIndex(0, 0)).toBe(PINNED_BAR_NO_INDEX)
    expect(getPreviousPinnedBarIndex(0, 0)).toBe(PINNED_BAR_NO_INDEX)
  })

  it('clamps a stale index before stepping', () => {
    // Was on index 6 of a list that is now 5 long: treat as the last pin.
    expect(getNextPinnedBarIndex(6, 5)).toBe(0)
    expect(getPreviousPinnedBarIndex(6, 5)).toBe(3)
  })
})

describe('locatePinnedBarIndex', () => {
  it('keeps the index when the anchored pin has not moved', () => {
    expect(locatePinnedBarIndex(ITEMS, { id: 'c', index: 2 })).toBe(2)
  })

  it('follows the anchored pin when pins before it are removed or added', () => {
    const removedBefore = ITEMS.filter((i) => i.id !== 'a')
    expect(locatePinnedBarIndex(removedBefore, { id: 'c', index: 2 })).toBe(1)
    const addedBefore = [item('z'), ...ITEMS]
    expect(locatePinnedBarIndex(addedBefore, { id: 'c', index: 2 })).toBe(3)
  })

  it('shows the pin that slid into place when the current one is removed', () => {
    const withoutC = ITEMS.filter((i) => i.id !== 'c')
    expect(withoutC[locatePinnedBarIndex(withoutC, { id: 'c', index: 2 })].id).toBe('d')
  })

  it('clamps to the new last pin when the last one is removed', () => {
    const withoutLast = ITEMS.slice(0, 4)
    expect(locatePinnedBarIndex(withoutLast, { id: 'e', index: 4 })).toBe(3)
  })

  it('clamps when several pins including the current one are removed', () => {
    expect(locatePinnedBarIndex(ITEMS.slice(0, 2), { id: 'e', index: 4 })).toBe(1)
  })

  it('returns NO_INDEX when every pin is gone', () => {
    expect(locatePinnedBarIndex([], { id: 'a', index: 0 })).toBe(PINNED_BAR_NO_INDEX)
  })

  it('falls back to the index when there was no anchored id', () => {
    expect(locatePinnedBarIndex(ITEMS, { id: undefined, index: 3 })).toBe(3)
    expect(locatePinnedBarIndex(ITEMS, { id: undefined, index: 9 })).toBe(4)
  })
})

describe('createPinnedBarAnchor', () => {
  it('pairs the clamped index with that pin id', () => {
    expect(createPinnedBarAnchor(ITEMS, 1)).toEqual({ id: 'b', index: 1 })
    expect(createPinnedBarAnchor(ITEMS, 99)).toEqual({ id: 'e', index: 4 })
    expect(createPinnedBarAnchor(ITEMS, undefined)).toEqual({ id: 'a', index: 0 })
  })

  it('has no id when there are no pins', () => {
    expect(createPinnedBarAnchor([], 2)).toEqual({ id: undefined, index: PINNED_BAR_NO_INDEX })
  })
})

describe('truncatePinnedBarText', () => {
  it('collapses whitespace runs including newlines', () => {
    expect(truncatePinnedBarText('  line one\n\n  line\ttwo ', 50)).toBe('line one line two')
  })

  it('leaves text within the limit untouched', () => {
    expect(truncatePinnedBarText('exactly ten', 11)).toBe('exactly ten')
  })

  it('cuts to the limit including the ellipsis', () => {
    const out = truncatePinnedBarText('abcdefghijklmnop', 6)
    expect(out).toBe('abcde…')
    expect(out).toHaveLength(6)
  })

  it('does not leave a space before the ellipsis', () => {
    expect(truncatePinnedBarText('hello world again', 7)).toBe('hello…')
  })

  it('returns empty for a non-positive limit', () => {
    expect(truncatePinnedBarText('anything', 0)).toBe('')
  })
})

describe('labels', () => {
  it('formats the position as "current of total"', () => {
    expect(PINNED_BAR_DEFAULT_LABELS.position(2, 5)).toBe('2 of 5')
  })

  it('pluralises the collapsed summary', () => {
    expect(PINNED_BAR_DEFAULT_LABELS.collapsedSummary(1)).toBe('1 pinned message')
    expect(PINNED_BAR_DEFAULT_LABELS.collapsedSummary(3)).toBe('3 pinned messages')
  })

  it('announces position, author and a truncated snippet', () => {
    const long = item('x', 'Ada', 'word '.repeat(100))
    const text = PINNED_BAR_DEFAULT_LABELS.announcement(long, '1 of 1')
    expect(text.startsWith('Pinned message 1 of 1. Ada: word')).toBe(true)
    expect(text.endsWith('…')).toBe(true)
    const prefix = 'Pinned message 1 of 1. Ada: '
    expect(text.length - prefix.length).toBeLessThanOrEqual(
      PINNED_BAR_ANNOUNCEMENT_SNIPPET_MAX_CHARS,
    )
  })

  it('merges overrides onto the defaults', () => {
    const labels = resolvePinnedBarLabels({ region: 'Épinglés', position: (c, t) => `${c}/${t}` })
    expect(labels.region).toBe('Épinglés')
    expect(labels.position(2, 5)).toBe('2/5')
    expect(labels.next).toBe(PINNED_BAR_DEFAULT_LABELS.next)
  })
})

describe('createPinnedBar', () => {
  it('describes the current pin and its position', () => {
    const api = createPinnedBar({ items: ITEMS, index: 1 })
    expect(api.total).toBe(5)
    expect(api.currentIndex).toBe(1)
    expect(api.currentItem?.id).toBe('b')
    expect(api.positionText).toBe('2 of 5')
    expect(api.announcement).toBe('Pinned message 2 of 5. Author b: Snippet b')
    expect(api.nextIndex).toBe(2)
    expect(api.previousIndex).toBe(0)
    expect(api.canNavigate).toBe(true)
  })

  it('is a labelled region', () => {
    expect(createPinnedBar({ items: ITEMS, index: 0 }).ariaProps).toEqual({
      role: 'region',
      'aria-label': 'Pinned messages',
    })
    expect(
      createPinnedBar({ items: ITEMS, index: 0, labels: { region: 'Pins' } }).ariaProps[
        'aria-label'
      ],
    ).toBe('Pins')
  })

  it('reports expanded state on the toggle and the root', () => {
    const open = createPinnedBar({ items: ITEMS, index: 0 })
    expect(open.toggleAriaProps['aria-expanded']).toBe(true)
    expect(open.toggleLabel).toBe('Collapse pinned messages')
    expect(open.dataAttributes['data-state']).toBe('expanded')

    const closed = createPinnedBar({ items: ITEMS, index: 0, collapsed: true })
    expect(closed.toggleAriaProps['aria-expanded']).toBe(false)
    expect(closed.toggleLabel).toBe('Expand pinned messages')
    expect(closed.dataAttributes['data-state']).toBe('collapsed')
    expect(closed.dataAttributes['data-count']).toBe('5')
  })

  it('clamps an out-of-range index', () => {
    const api = createPinnedBar({ items: ITEMS, index: 12 })
    expect(api.currentItem?.id).toBe('e')
    expect(api.positionText).toBe('5 of 5')
  })

  it('cannot navigate with a single pin', () => {
    expect(createPinnedBar({ items: [item('only')], index: 0 }).canNavigate).toBe(false)
  })

  it('is empty-safe', () => {
    const api = createPinnedBar({ items: [], index: 0 })
    expect(api.currentItem).toBeUndefined()
    expect(api.currentIndex).toBe(PINNED_BAR_NO_INDEX)
    expect(api.positionText).toBe('')
    expect(api.announcement).toBe('')
    expect(api.canNavigate).toBe(false)
  })
})
