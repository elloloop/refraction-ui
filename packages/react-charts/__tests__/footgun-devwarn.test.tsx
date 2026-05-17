import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
// Real @refraction-ui/shared — no mock. devWarn/resetDevFeedback come from the
// actual published primitive (epic #248), exercising the genuine env guard and
// warn-once dedupe across the package boundary.
import { resetDevFeedback } from '@refraction-ui/shared'
import { Chart, Bars, Line, Circles } from '../src/index.js'

const barData = [
  { label: 'A', value: 10 },
  { label: 'B', value: 20 },
]
const xyData = [
  { x: 0, y: 10 },
  { x: 1, y: 20 },
]

function renderBarsAlone() {
  return renderToString(
    React.createElement(Bars, {
      data: barData,
      x: (d: (typeof barData)[0]) => d.label,
      y: (d: (typeof barData)[0]) => d.value,
    }),
  )
}

describe('react-charts — silent-default-context footgun (devWarn)', () => {
  const originalEnv = process.env.NODE_ENV
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    resetDevFeedback()
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
    warnSpy.mockRestore()
    resetDevFeedback()
  })

  describe('in development', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development'
    })

    it('warns when a sub-chart renders without a <Chart> ancestor', () => {
      renderBarsAlone()
      expect(warnSpy).toHaveBeenCalledTimes(1)
      const msg = String(warnSpy.mock.calls[0][0])
      expect(msg).toContain('react-charts/no-chart-provider')
      expect(msg).toContain('<Chart>')
    })

    it('warns for Line and Circles used outside <Chart> too', () => {
      renderToString(
        React.createElement(Line, {
          data: xyData,
          x: (d: (typeof xyData)[0]) => d.x,
          y: (d: (typeof xyData)[0]) => d.y,
        }),
      )
      // warn-once is keyed by code; one shared code across sub-charts.
      expect(warnSpy).toHaveBeenCalledTimes(1)
      resetDevFeedback()
      warnSpy.mockClear()
      renderToString(
        React.createElement(Circles, {
          data: xyData,
          cx: (d: (typeof xyData)[0]) => d.x,
          cy: (d: (typeof xyData)[0]) => d.y,
        }),
      )
      expect(warnSpy).toHaveBeenCalledTimes(1)
    })

    it('does NOT warn when wrapped in <Chart>', () => {
      renderToString(
        React.createElement(
          Chart,
          { width: 500, height: 300 },
          React.createElement(Bars, {
            data: barData,
            x: (d: (typeof barData)[0]) => d.label,
            y: (d: (typeof barData)[0]) => d.value,
          }),
        ),
      )
      expect(warnSpy).not.toHaveBeenCalled()
    })

    it('warns at most once (warn-once dedupe) across many misuses', () => {
      renderBarsAlone()
      renderBarsAlone()
      renderBarsAlone()
      expect(warnSpy).toHaveBeenCalledTimes(1)
    })

    it('does not throw — behaviour is unchanged, devWarn is the only signal', () => {
      let html = ''
      expect(() => {
        html = renderBarsAlone()
      }).not.toThrow()
      // Still renders with the silent default dimensions (no breaking change).
      expect(html).toContain('<rect')
    })
  })

  describe('in production', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production'
    })

    it('does NOT warn (devWarn is stripped/guarded in prod)', () => {
      renderBarsAlone()
      expect(warnSpy).not.toHaveBeenCalled()
    })

    it('still renders identically (no behavioural change in prod)', () => {
      const html = renderBarsAlone()
      expect(html).toContain('<rect')
      expect(warnSpy).not.toHaveBeenCalled()
    })
  })
})
