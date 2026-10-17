import { describe, it, expect, vi } from 'vitest'
import { VIRTUAL_LIST_DEFAULT_AT_END_THRESHOLD } from '@refraction-ui/virtual-list'
import {
  JUMP_TO_LATEST_DEFAULT_ANNOUNCE_DELAY,
  JUMP_TO_LATEST_DEFAULT_LATEST_LABEL,
  JUMP_TO_LATEST_DEFAULT_THRESHOLD,
  createJumpToLatestAnnouncer,
  createJumpToLatestState,
  formatJumpToLatestNewCount,
  getJumpToLatestAppendedKeys,
  getJumpToLatestButtonProps,
  getJumpToLatestFirstUnreadIndex,
  getJumpToLatestFirstUnreadKey,
  getJumpToLatestLabel,
  getJumpToLatestLiveRegionProps,
  getJumpToLatestUnreadKeys,
  isJumpToLatestAtEnd,
  isJumpToLatestVisible,
  jumpToLatestReducer,
  jumpToLatestVariants,
  resolveJumpToLatestScrollBehavior,
  type JumpToLatestAction,
  type JumpToLatestState,
  type JumpToLatestTimers,
} from '../src/index.js'

function run(state: JumpToLatestState, ...actions: JumpToLatestAction[]): JumpToLatestState {
  return actions.reduce(jumpToLatestReducer, state)
}

const away: JumpToLatestAction = { type: 'atEnd', atEnd: false }
const back: JumpToLatestAction = { type: 'atEnd', atEnd: true }

describe('isJumpToLatestAtEnd', () => {
  const metrics = { clientHeight: 200, scrollHeight: 1000 }

  it('shares the VirtualList threshold', () => {
    expect(JUMP_TO_LATEST_DEFAULT_THRESHOLD).toBe(VIRTUAL_LIST_DEFAULT_AT_END_THRESHOLD)
  })

  it('is true exactly at the end and within the threshold', () => {
    expect(isJumpToLatestAtEnd({ ...metrics, scrollTop: 800 })).toBe(true)
    expect(isJumpToLatestAtEnd({ ...metrics, scrollTop: 800 - JUMP_TO_LATEST_DEFAULT_THRESHOLD })).toBe(true)
    expect(isJumpToLatestAtEnd({ ...metrics, scrollTop: 800 - JUMP_TO_LATEST_DEFAULT_THRESHOLD - 1 })).toBe(false)
  })

  it('honours a custom threshold, treating negatives as zero', () => {
    expect(isJumpToLatestAtEnd({ ...metrics, scrollTop: 700 }, 100)).toBe(true)
    expect(isJumpToLatestAtEnd({ ...metrics, scrollTop: 799 }, -5)).toBe(false)
    expect(isJumpToLatestAtEnd({ ...metrics, scrollTop: 800 }, -5)).toBe(true)
  })

  it('treats content shorter than the viewport as at the end', () => {
    expect(isJumpToLatestAtEnd({ scrollTop: 0, clientHeight: 200, scrollHeight: 50 })).toBe(true)
  })
})

describe('resolveJumpToLatestScrollBehavior', () => {
  it('defaults to smooth', () => {
    expect(resolveJumpToLatestScrollBehavior(false)).toBe('smooth')
  })

  it('is always instant under reduced motion', () => {
    expect(resolveJumpToLatestScrollBehavior(true)).toBe('auto')
    expect(resolveJumpToLatestScrollBehavior(true, 'smooth')).toBe('auto')
  })

  it('keeps an explicit instant request', () => {
    expect(resolveJumpToLatestScrollBehavior(false, 'auto')).toBe('auto')
  })
})

describe('createJumpToLatestState', () => {
  it('starts at the end with nothing new (SSR-safe: pill hidden)', () => {
    expect(createJumpToLatestState()).toEqual({
      atEnd: true,
      keys: null,
      count: 0,
      unreadKeys: [],
      newCount: 0,
    })
  })

  it('never counts the items present at creation', () => {
    const state = createJumpToLatestState({ keys: ['a', 'b'], atEnd: false })
    expect(state.count).toBe(2)
    expect(state.newCount).toBe(0)
  })

  it('normalises an invalid count', () => {
    expect(createJumpToLatestState({ count: -3 }).count).toBe(0)
    expect(createJumpToLatestState({ count: Number.NaN }).count).toBe(0)
    expect(createJumpToLatestState({ count: 4.7 }).count).toBe(4)
  })
})

describe('getJumpToLatestAppendedKeys', () => {
  it('returns keys after the previous last key', () => {
    expect(getJumpToLatestAppendedKeys(['a', 'b'], ['a', 'b', 'c', 'd'])).toEqual(['c', 'd'])
  })

  it('ignores prepended history', () => {
    expect(getJumpToLatestAppendedKeys(['c', 'd'], ['a', 'b', 'c', 'd'])).toEqual([])
    expect(getJumpToLatestAppendedKeys(['c', 'd'], ['a', 'b', 'c', 'd', 'e'])).toEqual(['e'])
  })

  it('falls back to the newest surviving key when the last one was deleted', () => {
    expect(getJumpToLatestAppendedKeys(['a', 'b', 'c'], ['a', 'b', 'x'])).toEqual(['x'])
  })

  it('treats a replaced list as nothing appended', () => {
    expect(getJumpToLatestAppendedKeys(['a', 'b'], ['x', 'y'])).toEqual([])
  })

  it('treats everything as appended to an empty list', () => {
    expect(getJumpToLatestAppendedKeys([], [1, 2])).toEqual([1, 2])
  })
})

describe('getJumpToLatestUnreadKeys', () => {
  it('keeps unread keys, adds appended ones and drops deleted ones, in list order', () => {
    expect(getJumpToLatestUnreadKeys(['a', 'b', 'c'], ['a', 'c', 'd'], ['b', 'c'])).toEqual(['c', 'd'])
  })

  it('returns an empty list when nothing is unread', () => {
    expect(getJumpToLatestUnreadKeys(['a'], ['z', 'a'], [])).toEqual([])
  })
})

describe('jumpToLatestReducer — keyed', () => {
  const start = createJumpToLatestState({ keys: ['m1', 'm2'] })

  it('does not count arrivals while at the end', () => {
    const next = run(start, { type: 'items', keys: ['m1', 'm2', 'm3'] })
    expect(next.newCount).toBe(0)
    expect(next.keys).toEqual(['m1', 'm2', 'm3'])
  })

  it('counts arrivals while away', () => {
    const next = run(start, away, { type: 'items', keys: ['m1', 'm2', 'm3'] }, {
      type: 'items',
      keys: ['m1', 'm2', 'm3', 'm4'],
    })
    expect(next.newCount).toBe(2)
    expect(next.unreadKeys).toEqual(['m3', 'm4'])
    expect(getJumpToLatestFirstUnreadKey(next)).toBe('m3')
    expect(getJumpToLatestFirstUnreadIndex(next)).toBe(2)
  })

  it('does not count older history loaded while scrolled back', () => {
    const next = run(start, away, { type: 'items', keys: ['m0', 'm1', 'm2'] })
    expect(next.newCount).toBe(0)
  })

  it('tracks the first unread index across a prepend', () => {
    const next = run(start, away, { type: 'items', keys: ['m1', 'm2', 'm3'] }, {
      type: 'items',
      keys: ['m-1', 'm0', 'm1', 'm2', 'm3'],
    })
    expect(next.newCount).toBe(1)
    expect(getJumpToLatestFirstUnreadIndex(next)).toBe(4)
  })

  it('stops counting a new item that is deleted', () => {
    const next = run(start, away, { type: 'items', keys: ['m1', 'm2', 'm3', 'm4'] }, {
      type: 'items',
      keys: ['m1', 'm2', 'm4'],
    })
    expect(next.unreadKeys).toEqual(['m4'])
    expect(next.newCount).toBe(1)
  })

  it('resets when the list is replaced', () => {
    const next = run(start, away, { type: 'items', keys: ['m1', 'm2', 'm3'] }, {
      type: 'items',
      keys: ['other1', 'other2'],
    })
    expect(next.newCount).toBe(0)
  })

  it('returns the same state for identical keys', () => {
    const state = run(start, away)
    expect(jumpToLatestReducer(state, { type: 'items', keys: ['m1', 'm2'] })).toBe(state)
  })

  it('reaching the end marks everything read', () => {
    const next = run(start, away, { type: 'items', keys: ['m1', 'm2', 'm3'] }, back)
    expect(next.atEnd).toBe(true)
    expect(next.newCount).toBe(0)
    expect(next.unreadKeys).toEqual([])
    expect(getJumpToLatestFirstUnreadKey(next)).toBeNull()
    expect(getJumpToLatestFirstUnreadIndex(next)).toBeNull()
  })

  it('markRead clears the count without changing at-end', () => {
    const next = run(start, away, { type: 'items', keys: ['m1', 'm2', 'm3'] }, { type: 'markRead' })
    expect(next.atEnd).toBe(false)
    expect(next.newCount).toBe(0)
  })

  it('returns the same state for no-op actions', () => {
    expect(jumpToLatestReducer(start, back)).toBe(start)
    expect(jumpToLatestReducer(start, { type: 'markRead' })).toBe(start)
    const awayState = run(start, away)
    expect(jumpToLatestReducer(awayState, away)).toBe(awayState)
  })
})

describe('jumpToLatestReducer — count mode', () => {
  const start = createJumpToLatestState({ count: 10 })

  it('counts growth while away', () => {
    const next = run(start, away, { type: 'items', count: 12 }, { type: 'items', count: 13 })
    expect(next.newCount).toBe(3)
    expect(next.keys).toBeNull()
    expect(getJumpToLatestFirstUnreadIndex(next)).toBe(10)
    expect(getJumpToLatestFirstUnreadKey(next)).toBeNull()
  })

  it('ignores growth while at the end', () => {
    expect(run(start, { type: 'items', count: 15 }).newCount).toBe(0)
  })

  it('never claims more new items than exist', () => {
    const next = run(start, away, { type: 'items', count: 13 }, { type: 'items', count: 1 })
    expect(next.newCount).toBe(1)
    expect(getJumpToLatestFirstUnreadIndex(next)).toBe(0)
  })

  it('treats a missing count as an empty list', () => {
    expect(run(start, { type: 'items' }).count).toBe(0)
  })

  it('returns the same state for an unchanged count', () => {
    expect(jumpToLatestReducer(start, { type: 'items', count: 10 })).toBe(start)
  })
})

describe('labels', () => {
  it('pluralises in English by default', () => {
    expect(formatJumpToLatestNewCount(1)).toBe('1 new message')
    expect(formatJumpToLatestNewCount(3)).toBe('3 new messages')
  })

  it('says "Jump to latest" when nothing is new', () => {
    expect(getJumpToLatestLabel(0)).toBe(JUMP_TO_LATEST_DEFAULT_LATEST_LABEL)
    expect(getJumpToLatestLabel(-2)).toBe(JUMP_TO_LATEST_DEFAULT_LATEST_LABEL)
  })

  it('accepts overrides for pluralisation and the fallback label', () => {
    const formatNewCount = (n: number) => (n === 1 ? '1 nouveau message' : `${n} nouveaux messages`)
    expect(getJumpToLatestLabel(2, { formatNewCount })).toBe('2 nouveaux messages')
    expect(getJumpToLatestLabel(0, { latestLabel: 'Aller au plus récent' })).toBe('Aller au plus récent')
  })
})

describe('visibility and ARIA', () => {
  it('is visible only away from the end', () => {
    expect(isJumpToLatestVisible(false)).toBe(true)
    expect(isJumpToLatestVisible(true)).toBe(false)
  })

  it('takes a hidden pill out of the tab order and accessibility tree', () => {
    expect(getJumpToLatestButtonProps(false)).toEqual({
      'data-state': 'hidden',
      'aria-hidden': true,
      tabIndex: -1,
    })
    expect(getJumpToLatestButtonProps(true)).toEqual({ 'data-state': 'visible' })
  })

  it('uses a polite atomic status region', () => {
    expect(getJumpToLatestLiveRegionProps()).toEqual({
      role: 'status',
      'aria-live': 'polite',
      'aria-atomic': true,
    })
  })

  it('styles the pill with tokens, a focus ring, a 44px target and reduced motion', () => {
    const shown = jumpToLatestVariants({ visible: 'true' })
    expect(shown).toContain('min-h-11')
    expect(shown).toContain('bg-primary')
    expect(shown).toContain('focus-visible:ring-ring')
    expect(shown).toContain('motion-reduce:transition-none')
    expect(shown).toContain('opacity-100')
    expect(jumpToLatestVariants()).toContain('pointer-events-none')
  })
})

/** Manual clock: timers fire only when the test advances time. */
function fakeTimers() {
  let now = 0
  let nextId = 1
  const queue = new Map<number, { at: number; callback: () => void }>()
  const timers: JumpToLatestTimers = {
    setTimeout(callback, ms) {
      const id = nextId++
      queue.set(id, { at: now + ms, callback })
      return id
    },
    clearTimeout(handle) {
      queue.delete(handle as number)
    },
  }
  const advance = (ms: number) => {
    now += ms
    for (const [id, timer] of [...queue]) {
      if (timer.at <= now) {
        queue.delete(id)
        timer.callback()
      }
    }
  }
  return { timers, advance, pending: () => queue.size }
}

describe('createJumpToLatestAnnouncer', () => {
  function setup(delay?: number) {
    const clock = fakeTimers()
    const onAnnounce = vi.fn()
    const onClear = vi.fn()
    const announcer = createJumpToLatestAnnouncer({ timers: clock.timers, onAnnounce, onClear, delay })
    return { ...clock, onAnnounce, onClear, announcer }
  }

  it('never announces the state at mount', () => {
    const { announcer, advance, onAnnounce } = setup()
    announcer.update({ atEnd: false, newCount: 4 })
    advance(JUMP_TO_LATEST_DEFAULT_ANNOUNCE_DELAY * 2)
    expect(onAnnounce).not.toHaveBeenCalled()
  })

  it('coalesces a burst into one announcement of the latest count', () => {
    const { announcer, advance, onAnnounce } = setup()
    announcer.update({ atEnd: false, newCount: 0 })
    announcer.update({ atEnd: false, newCount: 1 })
    advance(JUMP_TO_LATEST_DEFAULT_ANNOUNCE_DELAY / 2)
    announcer.update({ atEnd: false, newCount: 2 })
    announcer.update({ atEnd: false, newCount: 3 })
    expect(onAnnounce).not.toHaveBeenCalled()
    advance(JUMP_TO_LATEST_DEFAULT_ANNOUNCE_DELAY / 2)
    expect(onAnnounce).toHaveBeenCalledTimes(1)
    expect(onAnnounce).toHaveBeenCalledWith(3)
  })

  it('keeps speaking during a steady stream (window, not a restarting debounce)', () => {
    const { announcer, advance, onAnnounce } = setup(100)
    announcer.update({ atEnd: false, newCount: 0 })
    for (let count = 1; count <= 6; count++) {
      announcer.update({ atEnd: false, newCount: count })
      advance(40)
    }
    expect(onAnnounce.mock.calls.map(([n]) => n)).toEqual([3, 6])
  })

  it('does not announce decreases or unchanged counts', () => {
    const { announcer, advance, onAnnounce, pending } = setup()
    announcer.update({ atEnd: false, newCount: 3 })
    announcer.update({ atEnd: false, newCount: 2 })
    announcer.update({ atEnd: false, newCount: 2 })
    expect(pending()).toBe(0)
    advance(JUMP_TO_LATEST_DEFAULT_ANNOUNCE_DELAY)
    expect(onAnnounce).not.toHaveBeenCalled()
  })

  it('cancels a pending announcement when the reader returns to the end', () => {
    const { announcer, advance, onAnnounce, onClear } = setup()
    announcer.update({ atEnd: false, newCount: 0 })
    announcer.update({ atEnd: false, newCount: 1 })
    announcer.update({ atEnd: true, newCount: 0 })
    advance(JUMP_TO_LATEST_DEFAULT_ANNOUNCE_DELAY)
    expect(onAnnounce).not.toHaveBeenCalled()
    expect(onClear).not.toHaveBeenCalled()
  })

  it('clears a spoken announcement at the end so the same text is heard again later', () => {
    const { announcer, advance, onAnnounce, onClear } = setup()
    announcer.update({ atEnd: false, newCount: 0 })
    announcer.update({ atEnd: false, newCount: 1 })
    advance(JUMP_TO_LATEST_DEFAULT_ANNOUNCE_DELAY)
    announcer.update({ atEnd: true, newCount: 0 })
    expect(onClear).toHaveBeenCalledTimes(1)
    announcer.update({ atEnd: false, newCount: 0 })
    announcer.update({ atEnd: false, newCount: 1 })
    advance(JUMP_TO_LATEST_DEFAULT_ANNOUNCE_DELAY)
    expect(onAnnounce.mock.calls.map(([n]) => n)).toEqual([1, 1])
  })

  it('dispose cancels a pending announcement', () => {
    const { announcer, advance, onAnnounce } = setup()
    announcer.update({ atEnd: false, newCount: 0 })
    announcer.update({ atEnd: false, newCount: 2 })
    announcer.dispose()
    advance(JUMP_TO_LATEST_DEFAULT_ANNOUNCE_DELAY)
    expect(onAnnounce).not.toHaveBeenCalled()
  })

  it('falls back to the default delay for an invalid one', () => {
    const { announcer, advance, onAnnounce } = setup(Number.NaN)
    announcer.update({ atEnd: false, newCount: 0 })
    announcer.update({ atEnd: false, newCount: 1 })
    advance(JUMP_TO_LATEST_DEFAULT_ANNOUNCE_DELAY - 1)
    expect(onAnnounce).not.toHaveBeenCalled()
    advance(1)
    expect(onAnnounce).toHaveBeenCalledWith(1)
  })
})
