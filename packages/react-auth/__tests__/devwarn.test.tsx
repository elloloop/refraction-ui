import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetDevFeedback } from '@refraction-ui/shared'
import { AuthProvider, useAuth } from '../src/auth-provider.js'

// react-auth is a footgun (required-prop-throw + provider-context-throw):
// AuthProvider throws without an `adapter`; useAuth throws outside the
// provider. Per docs/instrumentation/policy.md both throws are KEPT and a
// dev-only warn-once devWarn is added immediately before each.

function renderHook(hook: () => unknown): void {
  function Probe() {
    hook()
    return null
  }
  renderToString(React.createElement(Probe))
}

describe('react-auth devWarn footgun', () => {
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

  it('AuthProvider without `adapter`: warns once in dev AND still throws', () => {
    process.env.NODE_ENV = 'development'
    expect(() =>
      renderToString(
        React.createElement(AuthProvider, null, 'child'),
      ),
    ).toThrow('You must provide an `adapter` to AuthProvider.')
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0]?.[0]).toContain(
      'react-auth/missing-adapter',
    )
  })

  it('useAuth outside provider: warns once in dev AND still throws', () => {
    process.env.NODE_ENV = 'development'
    expect(() => renderHook(useAuth)).toThrow(
      'useAuth must be used within an <AuthProvider>',
    )
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0]?.[0]).toContain(
      'react-auth/use-auth-outside-provider',
    )
  })

  it('does NOT warn in production but still throws', () => {
    process.env.NODE_ENV = 'production'
    expect(() => renderHook(useAuth)).toThrow(
      'useAuth must be used within an <AuthProvider>',
    )
    expect(warnSpy).not.toHaveBeenCalled()
  })
})
