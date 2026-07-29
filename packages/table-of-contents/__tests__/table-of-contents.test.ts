import { describe, it, expect, vi, afterEach } from 'vitest'
import { parseHeadings, observeHeadings } from '../src/index.js'

// The core's parsing logic is DOM-shaped but not DOM-dependent: parseHeadings
// only needs `querySelectorAll` plus `tagName`/`id`/`textContent` per item, so
// minimal fakes cover it without jsdom. observeHeadings needs the real
// IntersectionObserver + document globals — those are stubbed below.
// The DOM seam: jsdom/happy-dom would let these run against real elements.

function fakeHeading(tagName: string, id: string, text: string | null) {
  return { tagName, id, textContent: text } as unknown as HTMLElement
}

function fakeContainer(headings: HTMLElement[]) {
  const querySelectorAll = vi.fn((_selectors: string) => headings)
  return {
    container: { querySelectorAll } as unknown as HTMLElement,
    querySelectorAll,
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('parseHeadings', () => {
  it('parses heading level from the tag name', () => {
    const { container } = fakeContainer([
      fakeHeading('H2', 'a', 'Alpha'),
      fakeHeading('H3', 'b', 'Beta'),
      fakeHeading('H4', 'c', 'Gamma'),
    ])
    const items = parseHeadings(container)
    expect(items.map((i) => i.level)).toEqual([2, 3, 4])
  })

  it('keeps explicit ids and text content', () => {
    const { container } = fakeContainer([fakeHeading('H2', 'intro', 'Introduction')])
    expect(parseHeadings(container)).toEqual([{ id: 'intro', text: 'Introduction', level: 2 }])
  })

  it('derives a slug id from the text when the heading has no id', () => {
    const { container } = fakeContainer([fakeHeading('H2', '', 'Getting Started Guide')])
    const items = parseHeadings(container)
    expect(items).toEqual([{ id: 'getting-started-guide', text: 'Getting Started Guide', level: 2 }])
  })

  it('drops headings that would get an empty id', () => {
    const { container } = fakeContainer([
      fakeHeading('H2', '', ''),
      fakeHeading('H3', '', null),
      fakeHeading('H2', 'kept', 'Kept'),
    ])
    const items = parseHeadings(container)
    expect(items).toHaveLength(1)
    expect(items[0].id).toBe('kept')
  })

  it('returns an empty list when the container has no matching headings', () => {
    const { container } = fakeContainer([])
    expect(parseHeadings(container)).toEqual([])
  })

  it('passes the selectors through to the container', () => {
    const { container, querySelectorAll } = fakeContainer([])
    parseHeadings(container, 'h1, h2')
    expect(querySelectorAll).toHaveBeenCalledWith('h1, h2')
  })

  it('defaults to h2, h3, h4 selectors', () => {
    const { container, querySelectorAll } = fakeContainer([])
    parseHeadings(container)
    expect(querySelectorAll).toHaveBeenCalledWith('h2, h3, h4')
  })
})

describe('observeHeadings', () => {
  interface FakeObserver {
    callback: IntersectionObserverCallback
    options?: IntersectionObserverInit
    observed: unknown[]
    disconnected: boolean
  }

  function stubDom(elements: Record<string, object | null>) {
    const observers: FakeObserver[] = []

    class FakeIntersectionObserver {
      observed: unknown[] = []
      disconnected = false
      constructor(
        public callback: IntersectionObserverCallback,
        public options?: IntersectionObserverInit,
      ) {
        observers.push(this as unknown as FakeObserver)
      }
      observe(el: unknown) {
        this.observed.push(el)
      }
      unobserve() {}
      disconnect() {
        this.disconnected = true
      }
      takeRecords() {
        return []
      }
      root = null
      rootMargin = ''
      thresholds = []
    }

    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
    vi.stubGlobal('document', {
      getElementById: (id: string) => elements[id] ?? null,
    })
    return observers
  }

  it('observes every heading id that resolves to an element', () => {
    const elA = { id: 'a' }
    const elB = { id: 'b' }
    const observers = stubDom({ a: elA, b: elB })
    observeHeadings(['a', 'b'], () => {})
    expect(observers).toHaveLength(1)
    expect(observers[0].observed).toEqual([elA, elB])
  })

  it('skips ids with no matching element', () => {
    const elA = { id: 'a' }
    const observers = stubDom({ a: elA })
    observeHeadings(['a', 'missing'], () => {})
    expect(observers[0].observed).toEqual([elA])
  })

  it('applies the default rootMargin and allows overrides', () => {
    const observers = stubDom({ a: { id: 'a' } })
    observeHeadings(['a'], () => {})
    expect(observers[0].options).toMatchObject({ rootMargin: '0px 0px -80% 0px' })
    observeHeadings(['a'], () => {}, { rootMargin: '0px' })
    expect(observers[1].options).toMatchObject({ rootMargin: '0px' })
  })

  it('calls the callback with the first intersecting entry id', () => {
    const observers = stubDom({ a: { id: 'a' }, b: { id: 'b' } })
    const onActive = vi.fn()
    observeHeadings(['a', 'b'], onActive)
    const entries = [
      { isIntersecting: false, target: { id: 'a' } },
      { isIntersecting: true, target: { id: 'b' } },
    ] as unknown as IntersectionObserverEntry[]
    observers[0].callback(entries, {} as IntersectionObserver)
    expect(onActive).toHaveBeenCalledWith('b')
  })

  it('does not call the callback when nothing intersects', () => {
    const observers = stubDom({ a: { id: 'a' } })
    const onActive = vi.fn()
    observeHeadings(['a'], onActive)
    const entries = [
      { isIntersecting: false, target: { id: 'a' } },
    ] as unknown as IntersectionObserverEntry[]
    observers[0].callback(entries, {} as IntersectionObserver)
    expect(onActive).not.toHaveBeenCalled()
  })

  it('returns a cleanup function that disconnects the observer', () => {
    const observers = stubDom({ a: { id: 'a' } })
    const disconnect = observeHeadings(['a'], () => {})
    expect(observers[0].disconnected).toBe(false)
    disconnect()
    expect(observers[0].disconnected).toBe(true)
  })
})
