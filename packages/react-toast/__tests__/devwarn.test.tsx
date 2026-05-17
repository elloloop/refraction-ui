import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetDevFeedback } from '@refraction-ui/shared'
import { useToast } from '../src/toast.js'

// react-toast is a footgun (provider-context-throw): useToast (via the
// internal context guard) throws outside <ToastProvider>. Per
// docs/instrumentation/policy.md the throw is KEPT and a dev-only warn-once
// devWarn is added immediately before it.

function renderHook(hook: () => unknown): void {
  function Probe() {
    hook()
    return null
  }
  renderToString(React.createElement(Probe))
}

describe('react-toast devWarn footgun (useToast outside provider)', () => {
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
    expect(() => renderHook(useToast)).toThrow(
      'useToast must be used within a <ToastProvider>',
    )
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0]?.[0]).toContain(
      'react-toast/use-toast-outside-provider',
    )
  })

  it('does NOT warn in production but still throws', () => {
    process.env.NODE_ENV = 'production'
    expect(() => renderHook(useToast)).toThrow(
      'useToast must be used within a <ToastProvider>',
    )
    expect(warnSpy).not.toHaveBeenCalled()
  })
})
