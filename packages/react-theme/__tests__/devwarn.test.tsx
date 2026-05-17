import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetDevFeedback } from '@refraction-ui/shared'
import { useTheme } from '../src/theme-provider.js'

// react-theme is a footgun (provider-context-throw): useTheme throws outside
// <ThemeProvider>. Per docs/instrumentation/policy.md the throw is KEPT and a
// dev-only warn-once devWarn is added immediately before it.

function renderHook(hook: () => unknown): void {
  function Probe() {
    hook()
    return null
  }
  renderToString(React.createElement(Probe))
}

describe('react-theme devWarn footgun (useTheme outside provider)', () => {
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
    expect(() => renderHook(useTheme)).toThrow(
      'useTheme must be used within a <ThemeProvider>',
    )
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0]?.[0]).toContain(
      'react-theme/use-theme-outside-provider',
    )
  })

  it('does NOT warn in production but still throws', () => {
    process.env.NODE_ENV = 'production'
    expect(() => renderHook(useTheme)).toThrow(
      'useTheme must be used within a <ThemeProvider>',
    )
    expect(warnSpy).not.toHaveBeenCalled()
  })
})
