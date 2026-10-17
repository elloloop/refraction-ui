// @vitest-environment jsdom
/**
 * jsdom has no layout engine, so the scroller's `clientHeight`,
 * `scrollHeight` and `scrollTop` are stubbed per element (scrollHeight is
 * `ROW` px per item) and `scrollTo` is replaced with a recorder that lands
 * instantly. A VirtualList is stood in for by a fake handle. These tests prove
 * the wiring and decisions given those numbers — not real layout, smooth
 * scroll animation, or VirtualList's own measurement.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { VirtualListHandle } from '@refraction-ui/react-virtual-list'
import {
  JumpToLatest,
  useJumpToLatest,
  JUMP_TO_LATEST_DEFAULT_ANNOUNCE_DELAY,
  JUMP_TO_LATEST_DEFAULT_THRESHOLD,
  type JumpToLatestController,
  type JumpToLatestProps,
  type UseJumpToLatestOptions,
} from '../src/index.js'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

const VIEWPORT = 200
const ROW = 50

let container: HTMLDivElement
let root: Root
const originalMatchMedia = window.matchMedia

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  window.matchMedia = originalMatchMedia
  vi.useRealTimers()
})

function render(ui: React.ReactElement) {
  act(() => root.render(ui))
}

// ---- a stubbed scroll container ---------------------------------------------

interface FakeScroller {
  el: HTMLDivElement
  scrollTo: ReturnType<typeof vi.fn>
}

/** Give `el` fixed layout: VIEWPORT tall, ROW px per child item. */
function stubLayout(el: HTMLDivElement): FakeScroller {
  let top = 0
  const max = () => Math.max(0, el.scrollHeight - VIEWPORT)
  Object.defineProperty(el, 'clientHeight', { configurable: true, get: () => VIEWPORT })
  Object.defineProperty(el, 'scrollHeight', {
    configurable: true,
    get: () => el.childElementCount * ROW,
  })
  Object.defineProperty(el, 'scrollTop', {
    configurable: true,
    get: () => top,
    set: (value: number) => {
      top = Math.min(Math.max(0, value), max())
    },
  })
  const scrollTo = vi.fn((options: ScrollToOptions) => {
    el.scrollTop = options.top ?? 0
    el.dispatchEvent(new Event('scroll'))
  })
  el.scrollTo = scrollTo as unknown as HTMLElement['scrollTo']
  return { el, scrollTo }
}

/** The reader drags the scrollbar. */
function scrollTo(el: HTMLElement, top: number) {
  act(() => {
    el.scrollTop = top
    el.dispatchEvent(new Event('scroll'))
  })
}

function setReducedMotion(matches: boolean) {
  window.matchMedia = ((query: string) =>
    ({ matches, media: query, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList)
}

function ids(count: number, from = 0): string[] {
  return Array.from({ length: count }, (_, i) => `m${from + i}`)
}

interface ChatProps {
  keys: string[]
  options?: Omit<UseJumpToLatestOptions, 'scrollRef' | 'keys'>
  pill?: Partial<JumpToLatestProps>
  onScroller: (s: FakeScroller) => void
}

/** A plain scroller whose children are the items, as a consumer would write it. */
function Chat({ keys, options, pill, onScroller }: ChatProps) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  const setScroller = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (node && scrollRef.current !== node) onScroller(stubLayout(node))
      scrollRef.current = node
    },
    [onScroller],
  )
  const jtl = useJumpToLatest({ scrollRef, keys, ...options })
  return (
    <div>
      <div ref={setScroller} tabIndex={0} aria-label="Messages">
        {keys.map((key) => (
          <div key={key} data-key={key} />
        ))}
      </div>
      <JumpToLatest controller={jtl} {...pill} />
    </div>
  )
}

function mountChat(initial: string[], extra: Omit<ChatProps, 'keys' | 'onScroller'> = {}) {
  let scroller!: FakeScroller
  const onScroller = (s: FakeScroller) => {
    scroller = s
  }
  const renderWith = (keys: string[]) => render(<Chat keys={keys} onScroller={onScroller} {...extra} />)
  renderWith(initial)
  // Open at the end, like a chat.
  scrollTo(scroller.el, scroller.el.scrollHeight)
  return { scroller: () => scroller, renderWith }
}

function pill(): HTMLButtonElement {
  const el = container.querySelector<HTMLButtonElement>('button')
  if (!el) throw new Error('pill not rendered')
  return el
}

function region(): HTMLElement {
  const el = container.querySelector<HTMLElement>('[role="status"]')
  if (!el) throw new Error('live region not rendered')
  return el
}

function click(el: Element) {
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  })
}

// ---- plain scroller -------------------------------------------------------------

describe('JumpToLatest with a plain scroller (jsdom)', () => {
  it('is hidden at the end and appears when the reader scrolls away', () => {
    const { scroller } = mountChat(ids(20))
    expect(pill().dataset.state).toBe('hidden')
    expect(pill().tabIndex).toBe(-1)
    expect(pill().getAttribute('aria-hidden')).toBe('true')

    scrollTo(scroller().el, 100)
    expect(pill().dataset.state).toBe('visible')
    expect(pill().tabIndex).toBe(0)
    expect(pill().hasAttribute('aria-hidden')).toBe(false)
    expect(pill().textContent).toBe('Jump to latest')
  })

  it('treats a position within the threshold as the end', () => {
    const { scroller } = mountChat(ids(20))
    const max = scroller().el.scrollHeight - VIEWPORT
    scrollTo(scroller().el, max - JUMP_TO_LATEST_DEFAULT_THRESHOLD)
    expect(pill().dataset.state).toBe('hidden')
    scrollTo(scroller().el, max - JUMP_TO_LATEST_DEFAULT_THRESHOLD - 1)
    expect(pill().dataset.state).toBe('visible')
  })

  it('counts items that arrive while away', () => {
    const { scroller, renderWith } = mountChat(ids(20))
    scrollTo(scroller().el, 0)
    renderWith(ids(21))
    expect(pill().textContent).toBe('1 new message')
    renderWith(ids(23))
    expect(pill().textContent).toBe('3 new messages')
  })

  it('does not count older history loaded while scrolled back', () => {
    const { scroller, renderWith } = mountChat(ids(20, 10))
    scrollTo(scroller().el, 0)
    renderWith(ids(30, 0))
    expect(pill().textContent).toBe('Jump to latest')
  })

  it('click scrolls smoothly to the end, then hides and resets the count', () => {
    setReducedMotion(false)
    const { scroller, renderWith } = mountChat(ids(20))
    scrollTo(scroller().el, 0)
    renderWith(ids(22))
    click(pill())
    expect(scroller().scrollTo).toHaveBeenCalledWith({
      top: scroller().el.scrollHeight,
      behavior: 'smooth',
    })
    expect(pill().dataset.state).toBe('hidden')
    scrollTo(scroller().el, 0)
    expect(pill().textContent).toBe('Jump to latest')
  })

  it('jumps instantly under prefers-reduced-motion', () => {
    setReducedMotion(true)
    const { scroller } = mountChat(ids(20))
    scrollTo(scroller().el, 0)
    click(pill())
    expect(scroller().scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'auto' }))
  })

  it('hands focus to the scroller when a focused pill hides after the jump', () => {
    const { scroller } = mountChat(ids(20))
    scrollTo(scroller().el, 0)
    act(() => pill().focus())
    expect(document.activeElement).toBe(pill())
    click(pill())
    expect(pill().dataset.state).toBe('hidden')
    expect(document.activeElement).toBe(scroller().el)
  })

  it('respects a consumer onClick that prevents the default', () => {
    const { scroller } = mountChat(ids(20), {
      pill: { onClick: (event) => event.preventDefault() },
    })
    scrollTo(scroller().el, 0)
    click(pill())
    expect(scroller().scrollTo).not.toHaveBeenCalled()
  })

  it('ignores clicks on the hidden pill', () => {
    const { scroller } = mountChat(ids(20))
    click(pill())
    expect(scroller().scrollTo).not.toHaveBeenCalled()
  })

  it('stickToEnd keeps a reader at the end when items arrive, and does not count them', () => {
    const { scroller, renderWith } = mountChat(ids(20), { options: { stickToEnd: true } })
    renderWith(ids(25))
    expect(scroller().el.scrollTop).toBe(scroller().el.scrollHeight - VIEWPORT)
    expect(pill().dataset.state).toBe('hidden')
    scrollTo(scroller().el, 0)
    expect(pill().textContent).toBe('Jump to latest')
  })

  it('without stickToEnd, arrivals seen at the end are not counted as new', () => {
    const { renderWith } = mountChat(ids(20))
    renderWith(ids(25))
    // Content grew below the reader, so they are now away — but saw those arrive.
    expect(pill().dataset.state).toBe('visible')
    expect(pill().textContent).toBe('Jump to latest')
  })

  it('first-unread: scrolls the first missed item into view, then the next press goes to the end', () => {
    setReducedMotion(false)
    const scrollToItem = vi.fn()
    const { scroller, renderWith } = mountChat(ids(20), {
      options: { scrollToItem },
      pill: { jumpTo: 'first-unread' },
    })
    scrollTo(scroller().el, 0)
    renderWith(ids(23))
    click(pill())
    expect(scrollToItem).toHaveBeenCalledWith({ key: 'm20', index: 20 }, 'smooth')
    expect(scroller().scrollTo).not.toHaveBeenCalled()
    expect(pill().textContent).toBe('Jump to latest')

    click(pill())
    expect(scroller().scrollTo).toHaveBeenCalledTimes(1)
    expect(scrollToItem).toHaveBeenCalledTimes(1)
  })

  it('first-unread without scrollToItem falls back to the end', () => {
    const { scroller, renderWith } = mountChat(ids(20), { pill: { jumpTo: 'first-unread' } })
    scrollTo(scroller().el, 0)
    renderWith(ids(22))
    click(pill())
    expect(scroller().scrollTo).toHaveBeenCalledTimes(1)
  })

  it('counts by item count when keys are not available', () => {
    function CountChat({ count, onScroller }: { count: number; onScroller: (s: FakeScroller) => void }) {
      const scrollRef = React.useRef<HTMLDivElement | null>(null)
      const jtl = useJumpToLatest({ scrollRef, count })
      return (
        <div>
          <div
            ref={(node) => {
              if (node && scrollRef.current !== node) onScroller(stubLayout(node))
              scrollRef.current = node
            }}
          >
            {Array.from({ length: count }, (_, i) => (
              <div key={i} />
            ))}
          </div>
          <JumpToLatest controller={jtl} />
        </div>
      )
    }
    let scroller!: FakeScroller
    const onScroller = (s: FakeScroller) => {
      scroller = s
    }
    render(<CountChat count={20} onScroller={onScroller} />)
    scrollTo(scroller.el, 0)
    render(<CountChat count={24} onScroller={onScroller} />)
    expect(pill().textContent).toBe('4 new messages')
  })
})

// ---- live region ---------------------------------------------------------------

describe('JumpToLatest announcements (jsdom)', () => {
  it('politely announces arrivals while away, coalesced, and clears at the end', () => {
    vi.useFakeTimers()
    const { scroller, renderWith } = mountChat(ids(20))
    scrollTo(scroller().el, 0)
    renderWith(ids(21))
    renderWith(ids(22))
    expect(region().textContent).toBe('')
    act(() => vi.advanceTimersByTime(JUMP_TO_LATEST_DEFAULT_ANNOUNCE_DELAY))
    expect(region().textContent).toBe('2 new messages')

    scrollTo(scroller().el, scroller().el.scrollHeight)
    expect(region().textContent).toBe('')
  })

  it('does not announce the state it mounted with', () => {
    vi.useFakeTimers()
    const controller: JumpToLatestController = {
      atEnd: false,
      newCount: 3,
      firstUnreadKey: null,
      firstUnreadIndex: null,
      jump: vi.fn(),
      jumpToFirstUnread: vi.fn(),
      getScrollElement: () => null,
    }
    render(<JumpToLatest controller={controller} />)
    act(() => vi.advanceTimersByTime(JUMP_TO_LATEST_DEFAULT_ANNOUNCE_DELAY * 2))
    expect(region().textContent).toBe('')

    render(<JumpToLatest controller={{ ...controller, newCount: 5 }} />)
    act(() => vi.advanceTimersByTime(JUMP_TO_LATEST_DEFAULT_ANNOUNCE_DELAY))
    expect(region().textContent).toBe('5 new messages')
  })

  it('uses formatAnnouncement and announceDelay', () => {
    vi.useFakeTimers()
    const delay = 300
    const { scroller, renderWith } = mountChat(ids(20), {
      pill: { announceDelay: delay, formatAnnouncement: (n) => `${n} unread below` },
    })
    scrollTo(scroller().el, 0)
    renderWith(ids(24))
    act(() => vi.advanceTimersByTime(delay))
    expect(region().textContent).toBe('4 unread below')
  })
})

// ---- VirtualList handle ----------------------------------------------------------

describe('JumpToLatest with a VirtualList handle (jsdom)', () => {
  function fakeHandle(el: HTMLDivElement): VirtualListHandle {
    return {
      scrollToEnd: vi.fn(),
      scrollToIndex: vi.fn(),
      scrollToKey: vi.fn(),
      isAtEnd: () => false,
      getScrollElement: () => el,
    }
  }

  interface ListChatProps {
    keys?: string[]
    count?: number
    handle: VirtualListHandle
    jumpTo?: JumpToLatestProps['jumpTo']
  }

  /** Stands in for `<VirtualList ref={listRef} />`: the handle is attached in a layout effect. */
  function ListChat({ keys, count, handle, jumpTo }: ListChatProps) {
    const listRef = React.useRef<VirtualListHandle | null>(null)
    React.useLayoutEffect(() => {
      listRef.current = handle
    }, [])
    const jtl = useJumpToLatest({ listRef, keys, count })
    return <JumpToLatest controller={jtl} jumpTo={jumpTo} />
  }

  function setup(items: number) {
    const el = document.createElement('div')
    for (let i = 0; i < items; i++) el.appendChild(document.createElement('div'))
    document.body.appendChild(el)
    const scroller = stubLayout(el)
    scroller.el.scrollTop = scroller.el.scrollHeight
    return { scroller, handle: fakeHandle(el) }
  }

  it('tracks at-end through the handle’s scroll element and jumps with scrollToEnd', () => {
    setReducedMotion(false)
    const { scroller, handle } = setup(20)
    render(<ListChat keys={ids(20)} handle={handle} />)
    expect(pill().dataset.state).toBe('hidden')

    scrollTo(scroller.el, 0)
    expect(pill().dataset.state).toBe('visible')
    click(pill())
    expect(handle.scrollToEnd).toHaveBeenCalledWith({ behavior: 'smooth' })
    expect(scroller.scrollTo).not.toHaveBeenCalled()
    scroller.el.remove()
  })

  it('first-unread scrolls to the missed key, aligned to the start', () => {
    setReducedMotion(true)
    const { scroller, handle } = setup(20)
    render(<ListChat keys={ids(20)} handle={handle} jumpTo="first-unread" />)
    scrollTo(scroller.el, 0)
    render(<ListChat keys={ids(23)} handle={handle} jumpTo="first-unread" />)
    expect(pill().textContent).toBe('3 new messages')
    click(pill())
    expect(handle.scrollToKey).toHaveBeenCalledWith('m20', { align: 'start', behavior: 'auto' })
    scroller.el.remove()
  })

  it('first-unread in count mode scrolls by index', () => {
    setReducedMotion(false)
    const { scroller, handle } = setup(20)
    render(<ListChat count={20} handle={handle} jumpTo="first-unread" />)
    scrollTo(scroller.el, 0)
    render(<ListChat count={22} handle={handle} jumpTo="first-unread" />)
    click(pill())
    expect(handle.scrollToIndex).toHaveBeenCalledWith(20, { align: 'start', behavior: 'smooth' })
    scroller.el.remove()
  })
})

// ---- scroller lifecycle -------------------------------------------------------

describe('JumpToLatest when the scroller mounts late or changes (jsdom)', () => {
  interface LateChatProps {
    keys: string[]
    /** `null` renders a placeholder instead of the scroller; a new id remounts it. */
    scrollerId: string | null
    onScroller: (s: FakeScroller) => void
  }

  /** `loading ? <Spinner /> : <div ref={scrollRef}>…</div>`, keyed so the scroller can be swapped. */
  function LateChat({ keys, scrollerId, onScroller }: LateChatProps) {
    const scrollRef = React.useRef<HTMLDivElement | null>(null)
    const setScroller = React.useCallback(
      (node: HTMLDivElement | null) => {
        if (node && scrollRef.current !== node) onScroller(stubLayout(node))
        scrollRef.current = node
      },
      [onScroller],
    )
    const jtl = useJumpToLatest({ scrollRef, keys })
    return (
      <div>
        {scrollerId === null ? (
          <div role="progressbar" />
        ) : (
          <div key={scrollerId} ref={setScroller}>
            {keys.map((key) => (
              <div key={key} />
            ))}
          </div>
        )}
        <JumpToLatest controller={jtl} />
      </div>
    )
  }

  function mountLate() {
    const scrollers: FakeScroller[] = []
    const onScroller = (s: FakeScroller) => {
      scrollers.push(s)
    }
    const renderWith = (keys: string[], scrollerId: string | null) =>
      render(<LateChat keys={keys} scrollerId={scrollerId} onScroller={onScroller} />)
    return { scrollers, renderWith }
  }

  it('tracks a scroller that mounts after the hook', () => {
    const { scrollers, renderWith } = mountLate()
    renderWith([], null)
    expect(scrollers).toHaveLength(0)

    renderWith(ids(20), 'a')
    const [scroller] = scrollers
    scrollTo(scroller.el, scroller.el.scrollHeight)
    expect(pill().dataset.state).toBe('hidden')

    scrollTo(scroller.el, 0)
    expect(pill().dataset.state).toBe('visible')
    renderWith(ids(22), 'a')
    expect(pill().textContent).toBe('2 new messages')
  })

  it('moves the listener when the scroller is replaced', () => {
    const { scrollers, renderWith } = mountLate()
    renderWith(ids(20), 'a')
    const [first] = scrollers
    scrollTo(first.el, first.el.scrollHeight)

    renderWith(ids(20), 'b')
    const second = scrollers[1]
    expect(second.el).not.toBe(first.el)
    scrollTo(second.el, second.el.scrollHeight)
    expect(pill().dataset.state).toBe('hidden')

    // The detached old element no longer drives the state…
    scrollTo(first.el, 0)
    expect(pill().dataset.state).toBe('hidden')
    // …the new one does.
    scrollTo(second.el, 0)
    expect(pill().dataset.state).toBe('visible')
    renderWith(ids(23), 'b')
    expect(pill().textContent).toBe('3 new messages')
  })

  it('removes its scroll and resize listeners on unmount', () => {
    const el = document.createElement('div')
    stubLayout(el)
    const added = vi.spyOn(el, 'addEventListener')
    const removed = vi.spyOn(el, 'removeEventListener')
    const windowAdded = vi.spyOn(window, 'addEventListener')
    const windowRemoved = vi.spyOn(window, 'removeEventListener')

    function Tracker() {
      const scrollRef = React.useRef<HTMLElement | null>(el)
      useJumpToLatest({ scrollRef, count: 0 })
      return null
    }
    render(<Tracker />)
    const scrollHandler = added.mock.calls.find(([type]) => type === 'scroll')?.[1]
    const resizeHandler = windowAdded.mock.calls.find(([type]) => type === 'resize')?.[1]
    expect(scrollHandler).toBeTypeOf('function')
    expect(resizeHandler).toBeTypeOf('function')

    render(<></>)
    expect(removed).toHaveBeenCalledWith('scroll', scrollHandler)
    expect(windowRemoved).toHaveBeenCalledWith('resize', resizeHandler)
    windowAdded.mockRestore()
    windowRemoved.mockRestore()
  })
})
