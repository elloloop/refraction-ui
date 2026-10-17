// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { LiveTranscript, type LiveTranscriptProps } from '../src/live-transcript.js'
import { applyTranscriptUpdate, type TranscriptEntry } from '../src/index.js'

// Interaction suite for auto-follow. jsdom has no layout, so the panel is
// given one: each text line is LINE px tall, the visible area is VIEW px,
// and scrollTop clamps to the scrollable range as it does in a browser.

// React 19 expects this flag when running outside a browser bundler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const LINE = 40
const VIEW = 120

const scrollTops = new WeakMap<HTMLElement, number>()
let scrollToCalls: ScrollToOptions[]
let reducedMotion: boolean
let lineHeight: number

function contentHeight(el: HTMLElement): number {
  return el.querySelectorAll('p').length * lineHeight
}

function maxScrollTop(el: HTMLElement): number {
  return Math.max(0, contentHeight(el) - VIEW)
}

function installLayout() {
  Object.defineProperties(HTMLElement.prototype, {
    scrollHeight: {
      configurable: true,
      get(this: HTMLElement) {
        return Math.max(contentHeight(this), VIEW)
      },
    },
    clientHeight: {
      configurable: true,
      get() {
        return VIEW
      },
    },
    scrollTop: {
      configurable: true,
      get(this: HTMLElement) {
        return scrollTops.get(this) ?? 0
      },
      set(this: HTMLElement, value: number) {
        scrollTops.set(this, Math.min(Math.max(0, value), maxScrollTop(this)))
      },
    },
    scrollTo: {
      configurable: true,
      value(this: HTMLElement, options: ScrollToOptions) {
        scrollToCalls.push(options)
        this.scrollTop = options.top ?? this.scrollTop
      },
    },
  })
}

function removeLayout() {
  for (const key of ['scrollHeight', 'clientHeight', 'scrollTop', 'scrollTo']) {
    delete (HTMLElement.prototype as unknown as Record<string, unknown>)[key]
  }
}

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  installLayout()
  scrollToCalls = []
  reducedMotion = false
  lineHeight = LINE
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('prefers-reduced-motion') && reducedMotion,
    media: query,
  }))
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  container.remove()
  vi.unstubAllGlobals()
  removeLayout()
})

function lines(count: number, from = 0): TranscriptEntry[] {
  return Array.from({ length: count }, (_, i) => ({
    id: String(from + i),
    speaker: i % 2 === 0 ? 'You' : 'Priya',
    side: i % 2 === 0 ? ('me' as const) : ('them' as const),
    text: `Line ${from + i}`,
  }))
}

function render(props: LiveTranscriptProps) {
  act(() => {
    root.render(<LiveTranscript {...props} />)
  })
}

function log(): HTMLElement {
  const el = container.querySelector<HTMLElement>('[role="log"]')
  if (!el) throw new Error('no transcript rendered')
  return el
}

function jumpControl(): HTMLButtonElement | null {
  return container.querySelector<HTMLButtonElement>('button')
}

/** The reader scrolls the panel to `top`. */
function scrollTo(top: number) {
  act(() => {
    log().scrollTop = top
    log().dispatchEvent(new Event('scroll'))
  })
}

describe('LiveTranscript auto-follow', () => {
  it('opens at the newest line', () => {
    render({ entries: lines(6), autoFollow: true })
    expect(log().scrollTop).toBe(maxScrollTop(log()))
    expect(log().dataset.following).toBe('true')
  })

  it('keeps the newest line in view as lines arrive', () => {
    render({ entries: lines(6), autoFollow: true })
    render({ entries: lines(9), autoFollow: true })
    expect(log().scrollTop).toBe(maxScrollTop(log()))
    expect(jumpControl()).toBeNull()
  })

  it('pauses when the reader scrolls up, and offers to jump to live', () => {
    render({ entries: lines(6), autoFollow: true })
    scrollTo(0)
    expect(log().dataset.following).toBe('false')
    expect(jumpControl()?.textContent).toBe('Jump to live')

    render({ entries: lines(9), autoFollow: true })
    expect(log().scrollTop).toBe(0)
  })

  it('does not pull the reader back when a line lands before their scroll is reported', () => {
    render({ entries: lines(6), autoFollow: true })
    act(() => {
      log().scrollTop = 0
    })
    render({ entries: lines(9), autoFollow: true })
    expect(log().scrollTop).toBe(0)
    expect(log().dataset.following).toBe('false')
  })

  it('resumes when the reader scrolls back to the bottom', () => {
    render({ entries: lines(6), autoFollow: true })
    scrollTo(0)
    scrollTo(maxScrollTop(log()))
    expect(log().dataset.following).toBe('true')
    expect(jumpControl()).toBeNull()

    render({ entries: lines(9), autoFollow: true })
    expect(log().scrollTop).toBe(maxScrollTop(log()))
  })

  it('stays paused while the reader scrolls down short of the bottom', () => {
    render({ entries: lines(12), autoFollow: true })
    scrollTo(0)
    scrollTo(LINE)
    expect(log().dataset.following).toBe('false')
  })

  it('jumps to live smoothly and resumes following', () => {
    render({ entries: lines(6), autoFollow: true })
    scrollTo(0)
    act(() => {
      jumpControl()?.click()
    })
    expect(scrollToCalls).toEqual([{ top: log().scrollHeight, behavior: 'smooth' }])
    expect(log().dataset.following).toBe('true')
    expect(jumpControl()).toBeNull()

    render({ entries: lines(9), autoFollow: true })
    expect(log().scrollTop).toBe(maxScrollTop(log()))
  })

  it('jumps without animating when the reader prefers reduced motion', () => {
    reducedMotion = true
    render({ entries: lines(6), autoFollow: true })
    scrollTo(0)
    act(() => {
      jumpControl()?.click()
    })
    expect(scrollToCalls).toEqual([{ top: log().scrollHeight, behavior: 'auto' }])
  })

  it('keeps keyboard focus in the transcript when the control goes away', () => {
    render({ entries: lines(6), autoFollow: true })
    scrollTo(0)
    const control = jumpControl()
    act(() => {
      control?.focus()
    })
    expect(document.activeElement).toBe(control)
    act(() => {
      control?.click()
    })
    expect(document.activeElement).toBe(log())
  })

  it('names the control from jumpToLiveLabel', () => {
    render({ entries: lines(6), autoFollow: true, jumpToLiveLabel: 'Aller au direct' })
    scrollTo(0)
    expect(jumpControl()?.textContent).toBe('Aller au direct')
  })

  it('keeps the control out of the log announcements', () => {
    render({ entries: lines(6), autoFollow: true })
    scrollTo(0)
    expect(jumpControl()?.parentElement?.getAttribute('aria-live')).toBe('off')
    expect(jumpControl()?.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('still calls the caller onScroll', () => {
    const onScroll = vi.fn()
    render({ entries: lines(6), autoFollow: true, onScroll })
    scrollTo(0)
    expect(onScroll).toHaveBeenCalledTimes(1)
  })

  it('leaves the scroll alone without autoFollow', () => {
    render({ entries: lines(6) })
    expect(log().scrollTop).toBe(0)
    render({ entries: lines(9) })
    expect(log().scrollTop).toBe(0)
    scrollTo(LINE)
    expect(jumpControl()).toBeNull()
    expect(log().hasAttribute('data-following')).toBe(false)
  })

  describe('when the panel resizes', () => {
    let notifyResize: () => void

    beforeEach(() => {
      const callbacks: Array<() => void> = []
      notifyResize = () => {
        act(() => {
          for (const callback of callbacks) callback()
        })
      }
      vi.stubGlobal(
        'ResizeObserver',
        class {
          constructor(callback: () => void) {
            callbacks.push(callback)
          }
          observe() {}
          disconnect() {}
        },
      )
    })

    it('stays at the live edge when its lines re-wrap taller', () => {
      render({ entries: lines(6), autoFollow: true })
      lineHeight = LINE * 2
      notifyResize()
      expect(log().scrollTop).toBe(maxScrollTop(log()))
      expect(log().dataset.following).toBe('true')
    })

    it('does not pull the reader back when it lands before their scroll is reported', () => {
      render({ entries: lines(6), autoFollow: true })
      act(() => {
        log().scrollTop = 0
      })
      notifyResize()
      expect(log().scrollTop).toBe(0)
      expect(log().dataset.following).toBe('false')
    })
  })

  it('forwards its ref to the scroll container', () => {
    const ref = React.createRef<HTMLDivElement>()
    act(() => {
      root.render(<LiveTranscript ref={ref} entries={lines(3)} autoFollow />)
    })
    expect(ref.current).toBe(log())
  })
})

describe('LiveTranscript interim lines', () => {
  it('replaces an interim line with its final as a new line', () => {
    let entries = applyTranscriptUpdate([], {
      id: 'u1',
      speaker: 'Priya',
      side: 'them',
      text: 'shall we',
      interim: true,
    })
    render({ entries })
    const interim = container.querySelector('p[data-interim="true"]')
    expect(interim?.textContent).toBe('shall we (still listening)')

    entries = applyTranscriptUpdate(entries, {
      id: 'u1',
      speaker: 'Priya',
      side: 'them',
      text: 'Shall we start?',
    })
    render({ entries })
    const paragraphs = container.querySelectorAll('p')
    expect(paragraphs).toHaveLength(1)
    expect(paragraphs[0]?.textContent).toBe('Shall we start?')
    expect(paragraphs[0]?.hasAttribute('data-interim')).toBe(false)
    expect(paragraphs[0]).not.toBe(interim)
  })
})
