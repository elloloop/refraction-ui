import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetDevFeedback } from '@refraction-ui/shared'
import { useAnalytics, useTrackEvent } from '../src/analytics-provider.js'

// react-analytics hooks degrade gracefully: when called outside an
// <AnalyticsProvider> they DO NOT throw — they return a shared no-op
// Analytics (createNoopAnalytics) so instrumented components/hooks render
// fine without a provider (tests, standalone usage). A dev-only warn-once
// devWarn (from @refraction-ui/shared, zero dependency on the analytics lib)
// is emitted for discoverability and is stripped in production.

function render(el: React.ReactElement): void {
  renderToString(el)
}

describe('react-analytics hooks outside <AnalyticsProvider> (no-op, no throw)', () => {
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

  it('useAnalytics: no throw in dev, warns once, returns a usable no-op', () => {
    process.env.NODE_ENV = 'development'
    let a: ReturnType<typeof useAnalytics> | undefined
    function Probe() {
      a = useAnalytics()
      return null
    }
    expect(() => render(React.createElement(Probe))).not.toThrow()
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0]?.[0]).toContain(
      'react-analytics/use-analytics-outside-provider',
    )
    // The returned analytics is a working no-op (no throw on use).
    expect(a).toBeTruthy()
    expect(() => {
      a!.track('evt', { k: 'v' })
      a!.identify('u1')
      a!.page()
      const child = a!.with({ scope: 's' } as never)
      child.track('evt2')
    }).not.toThrow()
  })

  it('useAnalytics: no warn in production, still no-op (no throw)', () => {
    process.env.NODE_ENV = 'production'
    function Probe() {
      useAnalytics()
      return null
    }
    expect(() => render(React.createElement(Probe))).not.toThrow()
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('useTrackEvent also no-ops outside provider (no throw)', () => {
    process.env.NODE_ENV = 'production'
    function Probe() {
      const track = useTrackEvent()
      track('evt', { a: 1 })
      return null
    }
    expect(() => render(React.createElement(Probe))).not.toThrow()
  })
})
