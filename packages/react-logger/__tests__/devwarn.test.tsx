import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetDevFeedback } from '@refraction-ui/shared'
import { useTelemetry, useLogger } from '../src/telemetry-provider.js'
import { useSpan } from '../src/use-span.js'

// react-logger hooks degrade gracefully: when called outside a
// <TelemetryProvider> they DO NOT throw — they return a shared no-op
// telemetry so instrumented components/hooks render fine without a provider
// (tests, standalone usage). A dev-only warn-once devWarn (from
// @refraction-ui/shared, zero dependency on the telemetry lib) is emitted for
// discoverability and is stripped in production.

function render(el: React.ReactElement): void {
  renderToString(el)
}

describe('react-logger hooks outside <TelemetryProvider> (no-op, no throw)', () => {
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

  it('useTelemetry: no throw in dev, warns once, returns a usable no-op', () => {
    process.env.NODE_ENV = 'development'
    let t: ReturnType<typeof useTelemetry> | undefined
    function Probe() {
      t = useTelemetry()
      return null
    }
    expect(() => render(React.createElement(Probe))).not.toThrow()
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0]?.[0]).toContain(
      'react-logger/use-telemetry-outside-provider',
    )
    // The returned telemetry is a working no-op (no throw on use).
    expect(t).toBeTruthy()
    expect(() => {
      t!.info('noop')
      const child = t!.child({ k: 'v' })
      child.warn('noop')
      const span = t!.startSpan('s')
      span.end()
    }).not.toThrow()
  })

  it('useTelemetry: no warn in production, still no-op (no throw)', () => {
    process.env.NODE_ENV = 'production'
    function Probe() {
      useTelemetry()
      return null
    }
    expect(() => render(React.createElement(Probe))).not.toThrow()
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('useLogger and useSpan also no-op outside provider (no throw)', () => {
    process.env.NODE_ENV = 'production'
    function Probe() {
      const log = useLogger({ a: 1 })
      useSpan()
      log.info('noop')
      return null
    }
    expect(() => render(React.createElement(Probe))).not.toThrow()
  })
})
