// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { LineChart } from '../src/line-chart.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let observed: Array<(width: number) => void> = []
class FakeResizeObserver {
  constructor(private cb: ResizeObserverCallback) {}
  observe() {
    observed.push((width) =>
      this.cb([{ contentRect: { width } } as ResizeObserverEntry], this as unknown as ResizeObserver),
    )
  }
  disconnect() {}
  unobserve() {}
}

let container: HTMLDivElement
let root: Root
beforeEach(() => {
  observed = []
  ;(globalThis as { ResizeObserver?: unknown }).ResizeObserver = FakeResizeObserver
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})
afterEach(() => {
  act(() => root.unmount())
  container.remove()
  delete (globalThis as { ResizeObserver?: unknown }).ResizeObserver
})

const props = {
  ariaLabel: 'Revenue',
  labels: ['Jan', 'Feb', 'Mar'],
  series: [{ id: 'r', name: 'Revenue', data: [1200, 5555, 3100] }],
  height: 200,
  formatTick: (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`),
}

describe('LineChart measures its container', () => {
  it('draws at the measured width so text is not scaled down', () => {
    act(() => root.render(<LineChart {...props} />))
    const svg = () => container.querySelector('svg')!
    act(() => observed.forEach((fire) => fire(430)))
    expect(svg().getAttribute('viewBox')).toBe('0 0 430 200')
    act(() => observed.forEach((fire) => fire(900)))
    expect(svg().getAttribute('viewBox')).toBe('0 0 900 200')
  })

  it('renders clean tick labels from the nice scale', () => {
    act(() => root.render(<LineChart {...props} />))
    const ticks = Array.from(container.querySelectorAll('text[text-anchor="end"]')).map((t) => t.textContent)
    expect(ticks).toEqual(['0', '2.0k', '4.0k', '6.0k'])
  })
})
