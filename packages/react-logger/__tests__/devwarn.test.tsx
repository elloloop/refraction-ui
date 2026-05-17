import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetDevFeedback } from '@refraction-ui/shared'
import { useTelemetry } from '../src/telemetry-provider.js'

// react-logger is a footgun (provider-context-throw): useTelemetry/useSpan
// throw outside <TelemetryProvider>. Per docs/instrumentation/policy.md the
// throw is KEPT and a dev-only warn-once devWarn is added immediately before
// it. devWarn comes from @refraction-ui/shared, which has zero dependency on
// the telemetry library (no hard-dep / no cycle).

function renderHook(hook: () => unknown): void {
  function Probe() {
    hook()
    return null
  }
  renderToString(React.createElement(Probe))
}

describe('react-logger devWarn footgun (useTelemetry outside provider)', () => {
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
    expect(() => renderHook(useTelemetry)).toThrow(
      'useTelemetry must be used within a <TelemetryProvider>',
    )
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0]?.[0]).toContain(
      'react-logger/use-telemetry-outside-provider',
    )
  })

  it('does NOT warn in production but still throws', () => {
    process.env.NODE_ENV = 'production'
    expect(() => renderHook(useTelemetry)).toThrow(
      'useTelemetry must be used within a <TelemetryProvider>',
    )
    expect(warnSpy).not.toHaveBeenCalled()
  })
})
