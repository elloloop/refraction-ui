import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetDevFeedback } from '@refraction-ui/shared'
import { useAnalytics } from '../src/analytics-provider.js'

// react-analytics is a footgun (provider-context-throw): useAnalytics throws
// outside <AnalyticsProvider>. Per docs/instrumentation/policy.md the throw is
// KEPT and a dev-only warn-once devWarn is added immediately before it.

function renderHook(hook: () => unknown): void {
  function Probe() {
    hook()
    return null
  }
  renderToString(React.createElement(Probe))
}

describe('react-analytics devWarn footgun (useAnalytics outside provider)', () => {
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

  it('warns once in dev AND still throws', () => {
    process.env.NODE_ENV = 'development'
    expect(() => renderHook(useAnalytics)).toThrow(
      'useAnalytics must be used within an <AnalyticsProvider>',
    )
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0]?.[0]).toContain(
      'react-analytics/use-analytics-outside-provider',
    )
  })

  it('does NOT warn in production but still throws', () => {
    process.env.NODE_ENV = 'production'
    expect(() => renderHook(useAnalytics)).toThrow(
      'useAnalytics must be used within an <AnalyticsProvider>',
    )
    expect(warnSpy).not.toHaveBeenCalled()
  })
})
