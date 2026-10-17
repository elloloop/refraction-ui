// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import {
  EmojiGlyph,
  type EmojiGlyphAnimationHandle,
  type EmojiGlyphAnimationLoader,
  type EmojiGlyphAnimationRequest,
} from '../src/index.js'
import { EMOJI_GLYPH_PRELOAD_MARGIN, EMOJI_GLYPH_REDUCED_MOTION_QUERY } from '@refraction-ui/emoji-glyph'

// React 19 expects this flag when running outside a browser bundler.
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const THUMBS_UP = '\u{1F44D}'
const FIRE = '\u{1F525}'
const UK_FLAG = '\u{1F1EC}\u{1F1E7}'

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  vi.unstubAllGlobals()
})

function render(ui: React.ReactElement) {
  act(() => root.render(ui))
}

function glyph(): HTMLElement {
  const el = container.querySelector<HTMLElement>('[data-emoji-glyph-source]')
  if (!el) throw new Error('glyph not rendered')
  return el
}

function layer(name: 'native' | 'twemoji' | 'animated'): HTMLElement | null {
  return container.querySelector<HTMLElement>(`[data-emoji-glyph-layer="${name}"]`)
}

function fire(el: Element, type: 'load' | 'error') {
  act(() => {
    el.dispatchEvent(new Event(type))
  })
}

interface Deferred<T> {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (error: unknown) => void
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

/** A loader whose every call can be settled by the test; never touches the network. */
function fakeLoader() {
  const calls: { request: EmojiGlyphAnimationRequest; pending: Deferred<EmojiGlyphAnimationHandle> }[] = []
  const loader: EmojiGlyphAnimationLoader = (request) => {
    const pending = deferred<EmojiGlyphAnimationHandle>()
    calls.push({ request, pending })
    return pending.promise
  }
  return { loader: vi.fn(loader), calls }
}

async function settle(fn: () => void) {
  await act(async () => {
    fn()
    await Promise.resolve()
  })
}

/** A controllable `prefers-reduced-motion` media query. */
function stubReducedMotion(initial: boolean) {
  const listeners = new Set<() => void>()
  const media = {
    matches: initial,
    media: EMOJI_GLYPH_REDUCED_MOTION_QUERY,
    addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
  }
  vi.stubGlobal('matchMedia', (query: string) => {
    expect(query).toBe(EMOJI_GLYPH_REDUCED_MOTION_QUERY)
    return media
  })
  return {
    set(matches: boolean) {
      act(() => {
        media.matches = matches
        listeners.forEach((listener) => listener())
      })
    },
  }
}

describe('EmojiGlyph fallback order', () => {
  it('loads the animated art on first use and shows it once playing', async () => {
    const { loader, calls } = fakeLoader()
    render(<EmojiGlyph emoji={THUMBS_UP} animatedBaseUrl="/a" twemojiBaseUrl="/t" loadAnimation={loader} />)

    expect(loader).toHaveBeenCalledTimes(1)
    expect(calls[0].request.url).toBe('/a/1f44d.json')
    expect(calls[0].request.container).toBe(layer('animated'))
    expect(glyph().dataset.emojiGlyphSource).toBe('native')

    const destroy = vi.fn()
    await settle(() => calls[0].pending.resolve({ destroy }))
    expect(glyph().dataset.emojiGlyphSource).toBe('animated')
    expect(layer('animated')!.className).toContain('opacity-100')
    expect(layer('native')!.className).toContain('opacity-0')
  })

  it('shows the Twemoji still once it loads, and the native glyph if it fails', () => {
    render(<EmojiGlyph emoji={UK_FLAG} twemojiBaseUrl="/t" />)
    const still = layer('twemoji') as HTMLImageElement
    expect(still.getAttribute('src')).toBe('/t/1f1ec-1f1e7.svg')
    expect(glyph().dataset.emojiGlyphSource).toBe('native')

    fire(still, 'load')
    expect(glyph().dataset.emojiGlyphSource).toBe('twemoji')

    fire(still, 'error')
    expect(glyph().dataset.emojiGlyphSource).toBe('native')
    expect(layer('native')!.className).toContain('opacity-100')
  })

  it('keeps the still in place and reports the error when animated art fails', async () => {
    const { loader, calls } = fakeLoader()
    const onAnimationError = vi.fn()
    render(<EmojiGlyph emoji={THUMBS_UP} loadAnimation={loader} onAnimationError={onAnimationError} />)
    fire(layer('twemoji')!, 'load')

    const failure = new Error('HTTP 404')
    await settle(() => calls[0].pending.reject(failure))
    expect(onAnimationError).toHaveBeenCalledWith(failure)
    expect(glyph().dataset.emojiGlyphSource).toBe('twemoji')
  })
})

describe('EmojiGlyph motion', () => {
  it('never loads animation with animate={false}', () => {
    const { loader } = fakeLoader()
    render(<EmojiGlyph emoji={THUMBS_UP} animate={false} loadAnimation={loader} />)
    expect(loader).not.toHaveBeenCalled()
    expect(layer('animated')).toBeNull()
    expect(layer('twemoji')).not.toBeNull()
  })

  it('never loads animation when the reader prefers reduced motion', () => {
    stubReducedMotion(true)
    const { loader } = fakeLoader()
    render(<EmojiGlyph emoji={THUMBS_UP} loadAnimation={loader} />)
    expect(loader).not.toHaveBeenCalled()
    expect(layer('animated')).toBeNull()
  })

  it('stops a playing animation when reduced motion turns on, and resumes when it turns off', async () => {
    const motion = stubReducedMotion(false)
    const { loader, calls } = fakeLoader()
    render(<EmojiGlyph emoji={THUMBS_UP} loadAnimation={loader} />)
    const destroy = vi.fn()
    await settle(() => calls[0].pending.resolve({ destroy }))
    expect(glyph().dataset.emojiGlyphSource).toBe('animated')

    motion.set(true)
    expect(destroy).toHaveBeenCalledTimes(1)
    expect(glyph().dataset.emojiGlyphSource).not.toBe('animated')
    expect(layer('animated')).toBeNull()

    motion.set(false)
    expect(loader).toHaveBeenCalledTimes(2)
  })

  it('stops a playing animation when animate turns off', async () => {
    const { loader, calls } = fakeLoader()
    render(<EmojiGlyph emoji={THUMBS_UP} loadAnimation={loader} />)
    const destroy = vi.fn()
    await settle(() => calls[0].pending.resolve({ destroy }))

    render(<EmojiGlyph emoji={THUMBS_UP} animate={false} loadAnimation={loader} />)
    expect(destroy).toHaveBeenCalledTimes(1)
    expect(glyph().dataset.emojiGlyphSource).toBe('native')
  })
})

describe('EmojiGlyph lifecycle', () => {
  it('aborts on unmount and destroys an animation that arrives late, without reporting an error', async () => {
    const { loader, calls } = fakeLoader()
    const onAnimationError = vi.fn()
    render(<EmojiGlyph emoji={THUMBS_UP} loadAnimation={loader} onAnimationError={onAnimationError} />)
    const { signal } = calls[0].request

    act(() => root.render(<></>))
    expect(signal.aborted).toBe(true)

    const destroy = vi.fn()
    await settle(() => calls[0].pending.resolve({ destroy }))
    expect(destroy).toHaveBeenCalledTimes(1)
    expect(onAnimationError).not.toHaveBeenCalled()
  })

  it('ignores a rejection caused by its own abort', async () => {
    const { loader, calls } = fakeLoader()
    const onAnimationError = vi.fn()
    render(<EmojiGlyph emoji={THUMBS_UP} loadAnimation={loader} onAnimationError={onAnimationError} />)
    act(() => root.render(<></>))
    await settle(() => calls[0].pending.reject(new Error('aborted')))
    expect(onAnimationError).not.toHaveBeenCalled()
  })

  it('swaps animations when the emoji changes', async () => {
    const { loader, calls } = fakeLoader()
    render(<EmojiGlyph emoji={THUMBS_UP} animatedBaseUrl="/a" loadAnimation={loader} />)
    const destroy = vi.fn()
    await settle(() => calls[0].pending.resolve({ destroy }))

    render(<EmojiGlyph emoji={FIRE} animatedBaseUrl="/a" loadAnimation={loader} />)
    expect(destroy).toHaveBeenCalledTimes(1)
    expect(loader).toHaveBeenCalledTimes(2)
    expect(calls[1].request.url).toBe('/a/1f525.json')
    expect(calls[1].request.container).toBe(layer('animated'))
    expect(glyph().dataset.emojiGlyphSource).toBe('native')
  })

  it('does not reload when only the loader identity changes between renders', async () => {
    const { loader, calls } = fakeLoader()
    render(<EmojiGlyph emoji={THUMBS_UP} loadAnimation={(request) => loader(request)} />)
    await settle(() => calls[0].pending.resolve({ destroy: vi.fn() }))
    render(<EmojiGlyph emoji={THUMBS_UP} loadAnimation={(request) => loader(request)} />)
    expect(loader).toHaveBeenCalledTimes(1)
    expect(glyph().dataset.emojiGlyphSource).toBe('animated')
  })

  it('waits until the glyph nears the viewport before loading', () => {
    const observers: { callback: IntersectionObserverCallback; options?: IntersectionObserverInit; disconnect: ReturnType<typeof vi.fn> }[] = []
    class FakeIntersectionObserver {
      disconnect = vi.fn()
      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        observers.push({ callback, options, disconnect: this.disconnect })
      }
      observe() {}
    }
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
    const { loader } = fakeLoader()
    render(<EmojiGlyph emoji={THUMBS_UP} loadAnimation={loader} />)

    expect(loader).not.toHaveBeenCalled()
    expect(observers).toHaveLength(1)
    expect(observers[0].options?.rootMargin).toBe(EMOJI_GLYPH_PRELOAD_MARGIN)

    act(() => observers[0].callback([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver))
    expect(loader).not.toHaveBeenCalled()

    act(() => observers[0].callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver))
    expect(loader).toHaveBeenCalledTimes(1)
    expect(observers[0].disconnect).toHaveBeenCalled()
  })

  it('forwards its ref to the root span', () => {
    const ref = React.createRef<HTMLSpanElement>()
    render(<EmojiGlyph ref={ref} emoji={UK_FLAG} />)
    expect(ref.current).toBe(glyph())
  })
})
