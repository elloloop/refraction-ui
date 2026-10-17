// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { LevelBars, LiveLevelBars } from '../src/index.js'

// React 19 expects this flag when running outside a browser bundler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const HEIGHT = 10
const INTERVAL = 100

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  vi.useFakeTimers()
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  container.remove()
  vi.useRealTimers()
})

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui)
  })
}

function tick(times = 1) {
  act(() => {
    vi.advanceTimersByTime(INTERVAL * times)
  })
}

const meter = () => container.querySelector<HTMLDivElement>('[data-level-bars]')!

/** Bar heights as 0–1 levels, oldest first. */
function levels(): number[] {
  return Array.from(container.querySelectorAll<HTMLSpanElement>('[data-level-bar]'), (bar) =>
    Number.parseFloat(bar.style.height) / HEIGHT,
  )
}

function Live(props: { level: number; bars?: number; label?: string }) {
  return <LiveLevelBars height={HEIGHT} interval={INTERVAL} bars={3} {...props} />
}

describe('LiveLevelBars (interaction)', () => {
  it('samples the current level into the history on each interval', () => {
    render(<Live level={0.2} />)
    expect(levels()).toEqual([0, 0, 0.2])

    render(<Live level={0.6} />)
    // A new level is not drawn until it is sampled.
    expect(levels()).toEqual([0, 0, 0.2])
    tick()
    expect(levels()).toEqual([0, 0.2, 0.6])

    render(<Live level={1} />)
    tick()
    expect(levels()).toEqual([0.2, 0.6, 1])
  })

  it('keeps scrolling while the level holds steady, so silence clears old sound', () => {
    render(<Live level={0.8} />)
    render(<Live level={0} />)
    tick(3)
    expect(levels()).toEqual([0, 0, 0])
  })

  it('never keeps more than `bars` entries', () => {
    render(<Live level={0.5} />)
    tick(10)
    expect(levels()).toHaveLength(3)
  })

  it('resizes the history when `bars` changes, keeping the newest readings', () => {
    render(<Live level={0.4} />)
    tick()
    render(<Live level={0.4} bars={5} />)
    expect(levels()).toEqual([0, 0, 0, 0.4, 0.4])
    render(<Live level={0.4} bars={2} />)
    expect(levels()).toEqual([0.4, 0.4])
    tick()
    expect(levels()).toHaveLength(2)
  })

  it('clamps out-of-range and missing readings', () => {
    render(<Live level={4} />)
    tick()
    render(<Live level={Number.NaN} />)
    tick()
    expect(levels()).toEqual([1, 1, 0])
  })

  it('updates the meter value with the live level', () => {
    render(<Live level={0.25} label="Microphone level" />)
    expect(meter().getAttribute('role')).toBe('meter')
    expect(meter().getAttribute('aria-valuenow')).toBe('25')
    render(<Live level={0.9} label="Microphone level" />)
    expect(meter().getAttribute('aria-valuenow')).toBe('90')
    expect(meter().getAttribute('aria-valuetext')).toBe('90%')
  })

  it('stops sampling when unmounted', () => {
    render(<Live level={0.5} />)
    act(() => {
      root.unmount()
    })
    expect(vi.getTimerCount()).toBe(0)
    root = createRoot(container)
  })

  it('drops easing under reduced motion via a motion-reduce class on every bar', () => {
    render(<Live level={0.5} />)
    for (const bar of container.querySelectorAll('[data-level-bar]')) {
      expect(bar.className).toContain('motion-reduce:transition-none')
    }
  })

  it('takes no focus: it is a readout, not a control', () => {
    render(<Live level={0.5} label="Microphone level" />)
    expect(meter().tabIndex).toBe(-1)
    expect(container.querySelectorAll('[tabindex]')).toHaveLength(0)
  })
})

describe('LevelBars (interaction)', () => {
  it('redraws exactly the levels it is given, with no timer', () => {
    render(<LevelBars levels={[0.1, 0.5]} height={HEIGHT} />)
    expect(levels()).toEqual([0.1, 0.5])
    render(<LevelBars levels={[0.9, 0.3, 0.2]} height={HEIGHT} />)
    expect(levels()).toEqual([0.9, 0.3, 0.2])
    expect(vi.getTimerCount()).toBe(0)
  })

  it('forwards its ref to the root element', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<LevelBars ref={ref} levels={[0.5]} />)
    expect(ref.current).toBe(meter())
  })
})
