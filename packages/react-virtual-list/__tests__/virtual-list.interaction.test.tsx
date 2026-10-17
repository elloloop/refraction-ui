// @vitest-environment jsdom
/**
 * jsdom has no layout engine, so these tests stub the three things the
 * component reads from the browser:
 *  - the scroller's `clientHeight` (a fixed VIEWPORT) and `scrollTop`
 *    (stored and clamped to the sizer's height, as browsers clamp it);
 *  - each item's `getBoundingClientRect().height`, taken from a `data-h`
 *    attribute the test's renderItem writes;
 *  - `ResizeObserver`, replaced with a fake the test triggers by hand.
 * They therefore prove the component's wiring and decisions given those
 * numbers — not real CSS layout, real scrolling physics, smooth-scroll
 * animation, or real ResizeObserver timing.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { VirtualList, type VirtualListHandle, type VirtualListProps } from '../src/index.js'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

const VIEWPORT = 200
const ROW = 50

interface Row {
  id: string
  h: number
}

function rows(count: number, height = ROW, prefix = 'r'): Row[] {
  return Array.from({ length: count }, (_, i) => ({ id: `${prefix}${i}`, h: height }))
}

// ---- layout stubs ---------------------------------------------------------

const scrollTops = new WeakMap<Element, number>()
const originals = {
  clientHeight: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight'),
  scrollTop: Object.getOwnPropertyDescriptor(Element.prototype, 'scrollTop'),
  rect: HTMLElement.prototype.getBoundingClientRect,
  ResizeObserver: globalThis.ResizeObserver,
  matchMedia: window.matchMedia,
}

function isScroller(el: Element): boolean {
  return el.hasAttribute('data-anchor')
}

function contentHeight(scroller: Element): number {
  const sizer = scroller.firstElementChild as HTMLElement | null
  return sizer ? parseFloat(sizer.style.height) || 0 : 0
}

class FakeResizeObserver {
  static instances: FakeResizeObserver[] = []
  targets = new Set<Element>()
  constructor(private callback: ResizeObserverCallback) {
    FakeResizeObserver.instances.push(this)
  }
  observe(el: Element) {
    this.targets.add(el)
  }
  unobserve(el: Element) {
    this.targets.delete(el)
  }
  disconnect() {
    this.targets.clear()
  }
  /** Deliver entries for every observed target (no borderBoxSize, like old engines). */
  fire() {
    const entries = Array.from(this.targets, (target) => ({ target }) as ResizeObserverEntry)
    if (entries.length) this.callback(entries, this as unknown as ResizeObserver)
  }
}

function fireResizeObservers() {
  act(() => {
    FakeResizeObserver.instances.forEach((o) => o.fire())
  })
}

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get(this: HTMLElement) {
      return isScroller(this) ? VIEWPORT : 0
    },
  })
  Object.defineProperty(Element.prototype, 'scrollTop', {
    configurable: true,
    get(this: Element) {
      return scrollTops.get(this) ?? 0
    },
    set(this: Element, value: number) {
      const max = Math.max(0, contentHeight(this) - (this as HTMLElement).clientHeight)
      scrollTops.set(this, Math.min(Math.max(0, value), max))
    },
  })
  HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
    const height = Number(this.firstElementChild?.getAttribute('data-h') ?? 0)
    return { x: 0, y: 0, top: 0, left: 0, right: 0, width: 0, bottom: height, height, toJSON() {} } as DOMRect
  }
})

afterAll(() => {
  if (originals.clientHeight) Object.defineProperty(HTMLElement.prototype, 'clientHeight', originals.clientHeight)
  if (originals.scrollTop) Object.defineProperty(Element.prototype, 'scrollTop', originals.scrollTop)
  HTMLElement.prototype.getBoundingClientRect = originals.rect
})

// ---- harness --------------------------------------------------------------

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  FakeResizeObserver.instances = []
  globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  globalThis.ResizeObserver = originals.ResizeObserver
  window.matchMedia = originals.matchMedia
})

type Props = Partial<VirtualListProps<Row>> & { items: Row[] }

function render(props: Props, ref?: React.Ref<VirtualListHandle>) {
  act(() => {
    root.render(
      <VirtualList<Row>
        ref={ref}
        getItemKey={(row) => row.id}
        renderItem={(row) => (
          <div data-h={row.h}>
            {row.id}
            <button type="button">Reply to {row.id}</button>
          </div>
        )}
        estimatedItemSize={ROW}
        overscan={2}
        aria-label="History"
        {...props}
      />,
    )
  })
}

function scroller(): HTMLDivElement {
  const el = container.querySelector<HTMLDivElement>('[data-anchor]')
  if (!el) throw new Error('scroller not rendered')
  return el
}

function sizer(): HTMLDivElement {
  return scroller().firstElementChild as HTMLDivElement
}

function renderedIds(): string[] {
  return Array.from(container.querySelectorAll('[role="listitem"]'), (el) =>
    (el.firstElementChild?.firstChild?.textContent ?? '').trim(),
  )
}

function itemEl(id: string): HTMLElement {
  const found = Array.from(container.querySelectorAll<HTMLElement>('[role="listitem"]')).find(
    (el) => el.firstElementChild?.firstChild?.textContent === id,
  )
  if (!found) throw new Error(`${id} not mounted`)
  return found
}

/** Item position relative to the viewport top — what the reader sees. */
function screenTop(id: string): number {
  return parseFloat(itemEl(id).style.top) - scroller().scrollTop
}

function userScroll(top: number) {
  act(() => {
    scroller().scrollTop = top
    scroller().dispatchEvent(new Event('scroll'))
  })
}

// ---- tests ----------------------------------------------------------------

describe('VirtualList (interaction, jsdom)', () => {
  describe('windowing and measurement', () => {
    it('mounts only the visible items plus overscan', () => {
      render({ items: rows(1000) })
      // Viewport 200 / 50px rows = items 0–3 visible, + 2 overscan below.
      expect(renderedIds()).toEqual(['r0', 'r1', 'r2', 'r3', 'r4', 'r5'])
      expect(sizer().style.height).toBe(`${1000 * ROW}px`)
    })

    it('mounts a new window as the reader scrolls', () => {
      render({ items: rows(1000) })
      userScroll(100 * ROW)
      expect(renderedIds()).toEqual(['r98', 'r99', 'r100', 'r101', 'r102', 'r103', 'r104', 'r105'])
      expect(itemEl('r100').getAttribute('aria-posinset')).toBe('101')
      expect(itemEl('r100').getAttribute('aria-setsize')).toBe('1000')
    })

    it('replaces estimates with measured heights', () => {
      const items = rows(100).map((row, i) => ({ ...row, h: i % 2 === 0 ? 20 : 100 }))
      render({ items, initialItemCount: 10 })
      // The initial 10-item window was measured; measurements stay cached by
      // key after the window narrows, the other 90 keep the 50px estimate.
      const measured = items.slice(0, 10).reduce((sum, row) => sum + row.h, 0)
      expect(sizer().style.height).toBe(`${measured + 90 * ROW}px`)
      expect(itemEl('r1').style.top).toBe('20px')
      expect(itemEl('r2').style.top).toBe('120px')
    })

    it('re-measures when the ResizeObserver reports a size change', () => {
      const items = rows(10)
      render({ items })
      expect(itemEl('r1').style.top).toBe('50px')
      itemEl('r0').firstElementChild!.setAttribute('data-h', '90')
      fireResizeObservers()
      expect(itemEl('r1').style.top).toBe('90px')
    })

    it('still measures on mount when ResizeObserver is unavailable', () => {
      // @ts-expect-error -- simulating an environment without ResizeObserver
      delete globalThis.ResizeObserver
      render({ items: rows(20, 80) })
      expect(itemEl('r1').style.top).toBe('80px')
      expect(renderedIds().length).toBeGreaterThan(0)
    })
  })

  describe('bottom anchoring', () => {
    it('opens at the end and reports at-end', () => {
      const onAtEndChange = vi.fn()
      render({ items: rows(100), anchor: 'end', onAtEndChange })
      expect(scroller().scrollTop).toBe(100 * ROW - VIEWPORT)
      expect(renderedIds()).toContain('r99')
      expect(onAtEndChange).toHaveBeenCalledWith(true)
      expect(scroller().getAttribute('data-at-end')).toBe('true')
    })

    it('sticks to the bottom when items are appended while at the end', () => {
      const items = rows(100)
      render({ items, anchor: 'end' })
      render({ items: [...items, { id: 'new', h: 120 }], anchor: 'end' })
      expect(scroller().scrollTop).toBe(100 * ROW + 120 - VIEWPORT)
      expect(renderedIds()).toContain('new')
    })

    it('stays pinned when the last item grows (e.g. a streaming reply)', () => {
      render({ items: rows(100), anchor: 'end' })
      itemEl('r99').firstElementChild!.setAttribute('data-h', '300')
      fireResizeObservers()
      expect(scroller().scrollTop).toBe(99 * ROW + 300 - VIEWPORT)
    })

    it('does not follow new items once the reader scrolled away', () => {
      const onAtEndChange = vi.fn()
      const items = rows(100)
      render({ items, anchor: 'end', onAtEndChange })
      userScroll(1000)
      expect(onAtEndChange).toHaveBeenLastCalledWith(false)
      render({ items: [...items, { id: 'new', h: 50 }], anchor: 'end', onAtEndChange })
      expect(scroller().scrollTop).toBe(1000)
    })

    it('applies the at-end threshold', () => {
      const onAtEndChange = vi.fn()
      render({ items: rows(100), anchor: 'end', atEndThreshold: 40, onAtEndChange })
      const max = 100 * ROW - VIEWPORT
      onAtEndChange.mockClear()
      userScroll(max - 40)
      expect(onAtEndChange).not.toHaveBeenCalled()
      userScroll(max - 41)
      expect(onAtEndChange).toHaveBeenCalledWith(false)
      userScroll(max)
      expect(onAtEndChange).toHaveBeenLastCalledWith(true)
    })

    it('sits short content at the bottom of the viewport', () => {
      render({ items: rows(2), anchor: 'end' })
      expect(sizer().style.height).toBe(`${VIEWPORT}px`)
      expect(itemEl('r0').style.top).toBe(`${VIEWPORT - 2 * ROW}px`)
    })
  })

  describe('no jumping', () => {
    it('prepending older items keeps the reader on the same item', () => {
      const items = rows(100)
      render({ items, anchor: 'end' })
      userScroll(2000) // r40 at the top of the viewport
      const before = screenTop('r41')
      const older = rows(10, 80, 'old')
      render({ items: [...older, ...items], anchor: 'end' })
      expect(screenTop('r41')).toBe(before)
      // Prepended items are unmeasured (estimate 50px) and far above.
      expect(scroller().scrollTop).toBe(2000 + 10 * ROW)
    })

    it('a measurement change above the viewport does not move the content', () => {
      render({ items: rows(100) })
      userScroll(1000) // r20 at top; r18, r19 mounted as overscan above
      const before = screenTop('r21')
      itemEl('r18').firstElementChild!.setAttribute('data-h', '150')
      fireResizeObservers()
      expect(screenTop('r21')).toBe(before)
      expect(scroller().scrollTop).toBe(1100)
    })
  })

  describe('imperative handle', () => {
    it('scrollToIndex aligns start, center and end', () => {
      const ref = React.createRef<VirtualListHandle>()
      render({ items: rows(100) }, ref)
      act(() => ref.current!.scrollToIndex(50, { align: 'start' }))
      expect(scroller().scrollTop).toBe(2500)
      expect(renderedIds()).toContain('r50')
      act(() => ref.current!.scrollToIndex(50, { align: 'center' }))
      expect(scroller().scrollTop).toBe(2500 + ROW / 2 - VIEWPORT / 2)
      act(() => ref.current!.scrollToIndex(50, { align: 'end' }))
      expect(scroller().scrollTop).toBe(2550 - VIEWPORT)
    })

    it('re-aims once the target is measured', () => {
      const ref = React.createRef<VirtualListHandle>()
      const items = rows(100)
      items[50] = { id: 'r50', h: 120 }
      render({ items }, ref)
      act(() => ref.current!.scrollToIndex(50, { align: 'end' }))
      // Estimated end 2550; measured end 2500 + 120 = 2620.
      expect(scroller().scrollTop).toBe(2620 - VIEWPORT)
    })

    it('scrollToKey scrolls by key and ignores unknown keys', () => {
      const ref = React.createRef<VirtualListHandle>()
      render({ items: rows(100) }, ref)
      act(() => ref.current!.scrollToKey('r30', { align: 'start' }))
      expect(scroller().scrollTop).toBe(1500)
      act(() => ref.current!.scrollToKey('nope', { align: 'start' }))
      expect(scroller().scrollTop).toBe(1500)
    })

    it('scrollToIndex clamps out-of-range indexes', () => {
      const ref = React.createRef<VirtualListHandle>()
      render({ items: rows(100) }, ref)
      act(() => ref.current!.scrollToIndex(10_000, { align: 'start' }))
      expect(scroller().scrollTop).toBe(100 * ROW - VIEWPORT)
    })

    it('scrollToEnd returns to the end and resumes sticking', () => {
      const ref = React.createRef<VirtualListHandle>()
      const items = rows(100)
      render({ items, anchor: 'end' }, ref)
      userScroll(500)
      expect(ref.current!.isAtEnd()).toBe(false)
      act(() => ref.current!.scrollToEnd())
      expect(ref.current!.isAtEnd()).toBe(true)
      render({ items: [...items, { id: 'new', h: 50 }], anchor: 'end' }, ref)
      expect(scroller().scrollTop).toBe(101 * ROW - VIEWPORT)
    })

    it('getScrollElement returns the scroller', () => {
      const ref = React.createRef<VirtualListHandle>()
      render({ items: rows(5) }, ref)
      expect(ref.current!.getScrollElement()).toBe(scroller())
    })

    it('smooth scrolls use scrollTo, but not under prefers-reduced-motion', () => {
      const ref = React.createRef<VirtualListHandle>()
      render({ items: rows(100) }, ref)
      const scrollTo = vi.fn()
      scroller().scrollTo = scrollTo as unknown as HTMLElement['scrollTo']

      window.matchMedia = ((query: string) => ({ matches: false, media: query })) as typeof window.matchMedia
      act(() => ref.current!.scrollToIndex(40, { align: 'start', behavior: 'smooth' }))
      expect(scrollTo).toHaveBeenCalledWith({ top: 2000, behavior: 'smooth' })

      scrollTo.mockClear()
      window.matchMedia = ((query: string) => ({ matches: true, media: query })) as typeof window.matchMedia
      act(() => ref.current!.scrollToIndex(10, { align: 'start', behavior: 'smooth' }))
      expect(scrollTo).not.toHaveBeenCalled()
      expect(scroller().scrollTop).toBe(500)
    })
  })

  describe('focus and accessibility', () => {
    it('keeps the focused item mounted while scrolled away', () => {
      render({ items: rows(1000) })
      const button = itemEl('r1').querySelector('button')!
      act(() => button.focus())
      userScroll(500 * ROW)
      expect(renderedIds()).toContain('r1')
      expect(document.activeElement).toBe(button)
      expect(itemEl('r1').style.top).toBe(`${ROW}px`)
    })

    it('releases the item once focus leaves the list', () => {
      render({ items: rows(1000) })
      const outside = document.createElement('button')
      document.body.appendChild(outside)
      act(() => itemEl('r1').querySelector('button')!.focus())
      act(() => outside.focus())
      userScroll(500 * ROW)
      expect(renderedIds()).not.toContain('r1')
      outside.remove()
    })

    it('the scroller is keyboard-focusable', () => {
      render({ items: rows(10) })
      act(() => scroller().focus())
      expect(document.activeElement).toBe(scroller())
    })

    it('a log is only live while the reader is at the end', () => {
      render({ items: rows(100), anchor: 'end', role: 'log' })
      expect(scroller().getAttribute('aria-live')).toBe('polite')
      userScroll(0)
      expect(scroller().getAttribute('aria-live')).toBe('off')
    })

    it('reports the visible range', () => {
      const onRangeChange = vi.fn()
      render({ items: rows(100), onRangeChange })
      expect(onRangeChange).toHaveBeenLastCalledWith({ start: 0, end: 4 })
      userScroll(1025)
      expect(onRangeChange).toHaveBeenLastCalledWith({ start: 20, end: 25 })
    })
  })
})

describe('VirtualList (cache hygiene, jsdom)', () => {
  it('forgets the size of a removed item, so a re-added key is re-measured', () => {
    const items = rows(5)
    render({ items })
    itemEl('r0').firstElementChild!.setAttribute('data-h', '90')
    fireResizeObservers()
    expect(itemEl('r1').style.top).toBe('90px')
    render({ items: items.slice(1) })
    // Re-added with a new height: measured afresh on mount, not the stale 90px.
    render({ items: [{ id: 'r0', h: 30 }, ...items.slice(1)] })
    expect(itemEl('r1').style.top).toBe('30px')
  })
})
