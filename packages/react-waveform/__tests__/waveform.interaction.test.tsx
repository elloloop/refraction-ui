// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { Waveform } from '../src/waveform.js'

// React 19 expects this flag when running outside a browser bundler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

/**
 * jsdom has no canvas implementation, so the 2D context is stubbed and the
 * drawing calls are spied on. requestAnimationFrame is replaced with a spy
 * that never invokes its callback, so a "playing" waveform schedules exactly
 * one frame and tests stay deterministic.
 */
interface FakeContext {
  setTransform: ReturnType<typeof vi.fn>
  clearRect: ReturnType<typeof vi.fn>
  fillRect: ReturnType<typeof vi.fn>
  beginPath: ReturnType<typeof vi.fn>
  moveTo: ReturnType<typeof vi.fn>
  lineTo: ReturnType<typeof vi.fn>
  stroke: ReturnType<typeof vi.fn>
  arc: ReturnType<typeof vi.fn>
  save: ReturnType<typeof vi.fn>
  restore: ReturnType<typeof vi.fn>
  fillStyle: string
  strokeStyle: string
  lineWidth: number
  lineCap: string
  lineJoin: string
  globalAlpha: number
}

let container: HTMLDivElement
let root: Root
let ctx: FakeContext
let getContextSpy: ReturnType<typeof vi.spyOn>
let rafSpy: ReturnType<typeof vi.fn>
let cancelRafSpy: ReturnType<typeof vi.fn>
let originalRaf: typeof window.requestAnimationFrame | undefined
let originalCancelRaf: typeof window.cancelAnimationFrame | undefined

beforeEach(() => {
  ctx = {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    lineCap: '',
    lineJoin: '',
    globalAlpha: 1,
  }
  getContextSpy = vi
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .mockReturnValue(ctx as any)

  originalRaf = window.requestAnimationFrame
  originalCancelRaf = window.cancelAnimationFrame
  rafSpy = vi.fn().mockReturnValue(1)
  cancelRafSpy = vi.fn()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  window.requestAnimationFrame = rafSpy as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  window.cancelAnimationFrame = cancelRafSpy as any

  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  container.remove()
  getContextSpy.mockRestore()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  window.requestAnimationFrame = originalRaf as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  window.cancelAnimationFrame = originalCancelRaf as any
})

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui)
  })
}

describe('Waveform interaction – bar rendering from data', () => {
  it('draws one bar per sample, with heights proportional to the data', () => {
    render(
      React.createElement(Waveform, {
        samples: [0.25, 0.5, 0.75, 1],
        barCount: 4,
        width: 400,
        height: 100,
        paused: true,
      }),
    )

    expect(ctx.fillRect).toHaveBeenCalledTimes(4)
    const heights = ctx.fillRect.mock.calls.map((call) => call[3])
    expect(heights).toEqual([25, 50, 75, 100])
  })

  it('centers bars vertically', () => {
    render(
      React.createElement(Waveform, {
        samples: [0.5],
        barCount: 1,
        width: 400,
        height: 100,
        paused: true,
      }),
    )

    expect(ctx.fillRect).toHaveBeenCalledTimes(1)
    const [, y, , barHeight] = ctx.fillRect.mock.calls[0]
    expect(barHeight).toBe(50)
    expect(y).toBe(25)
  })

  it('draws zero-height bars for silent samples', () => {
    render(
      React.createElement(Waveform, {
        samples: [],
        barCount: 4,
        width: 400,
        height: 100,
        paused: true,
      }),
    )

    expect(ctx.fillRect).toHaveBeenCalledTimes(4)
    for (const call of ctx.fillRect.mock.calls) {
      expect(call[3]).toBe(0)
    }
  })

  it('resamples input data down to the requested bar count', () => {
    render(
      React.createElement(Waveform, {
        samples: [1, 1, 1, 1, 1, 1, 1, 1],
        barCount: 2,
        width: 400,
        height: 100,
        paused: true,
      }),
    )

    expect(ctx.fillRect).toHaveBeenCalledTimes(2)
  })
})

describe('Waveform interaction – variants', () => {
  it('strokes a path for the line variant instead of drawing bars', () => {
    render(
      React.createElement(Waveform, {
        variant: 'line',
        samples: [0.25, 0.5, 0.75],
        barCount: 3,
        width: 400,
        height: 100,
        paused: true,
      }),
    )

    expect(ctx.fillRect).not.toHaveBeenCalled()
    expect(ctx.beginPath).toHaveBeenCalled()
    expect(ctx.moveTo).toHaveBeenCalledTimes(1)
    expect(ctx.lineTo).toHaveBeenCalledTimes(2)
    expect(ctx.stroke).toHaveBeenCalledTimes(1)
  })

  it('draws three rings for the rings variant', () => {
    render(
      React.createElement(Waveform, {
        variant: 'rings',
        samples: [0.25, 0.5, 0.75],
        width: 400,
        height: 100,
        paused: true,
      }),
    )

    expect(ctx.arc).toHaveBeenCalledTimes(3)
    expect(ctx.stroke).toHaveBeenCalledTimes(3)
  })
})

describe('Waveform interaction – playing state', () => {
  it('schedules an animation frame while playing', () => {
    render(
      React.createElement(Waveform, { samples: [0.5], paused: false }),
    )

    expect(rafSpy).toHaveBeenCalled()
    expect(container.querySelector('[data-paused="false"]')).toBeTruthy()
  })

  it('does not schedule frames while paused', () => {
    render(React.createElement(Waveform, { samples: [0.5], paused: true }))

    expect(rafSpy).not.toHaveBeenCalled()
    expect(container.querySelector('[data-paused="true"]')).toBeTruthy()
  })

  it('cancels the scheduled frame on unmount', () => {
    render(React.createElement(Waveform, { samples: [0.5], paused: false }))

    act(() => {
      root.unmount()
    })

    expect(cancelRafSpy).toHaveBeenCalled()
  })
})
