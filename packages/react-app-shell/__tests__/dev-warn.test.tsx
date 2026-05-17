import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetDevFeedback } from '@refraction-ui/shared'
import { AppShell, PageShell, AuthShell } from '../src/index.js'

// Real @refraction-ui/shared devWarn (no mock) — assert via a console.warn spy,
// mirroring the SSR render-throw style used by the rest of this package's tests.

let warnSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  resetDevFeedback()
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  warnSpy.mockRestore()
})

describe('react-app-shell devWarn (footgun: compound-context-throw)', () => {
  it('warns and still throws when useAppShell is used outside <AppShell>', () => {
    expect(() =>
      renderToString(React.createElement(AppShell.Sidebar, null, 'x')),
    ).toThrow('useAppShell must be used within <AppShell>')

    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0][0]).toContain(
      'react-app-shell/use-app-shell-outside-provider',
    )
  })

  it('warns and still throws when a PageShell part is used outside <PageShell>', () => {
    expect(() =>
      renderToString(React.createElement(PageShell.Nav, null, 'x')),
    ).toThrow('PageShell compound components must be used within <PageShell>')

    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0][0]).toContain(
      'react-app-shell/page-shell-compound-outside-provider',
    )
  })

  it('warns and still throws when an AuthShell part is used outside <AuthShell>', () => {
    expect(() =>
      renderToString(React.createElement(AuthShell.Card, null, 'x')),
    ).toThrow('AuthShell compound components must be used within <AuthShell>')

    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0][0]).toContain(
      'react-app-shell/auth-shell-compound-outside-provider',
    )
  })

  it('warn-once: a repeated misuse does not warn again for the same code', () => {
    expect(() =>
      renderToString(React.createElement(AppShell.Sidebar, null, 'x')),
    ).toThrow()
    expect(() =>
      renderToString(React.createElement(AppShell.Sidebar, null, 'x')),
    ).toThrow()

    expect(warnSpy).toHaveBeenCalledTimes(1)
  })

  it('is silent in production (NODE_ENV=production) but still throws', () => {
    const prev = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    try {
      expect(() =>
        renderToString(React.createElement(AppShell.Sidebar, null, 'x')),
      ).toThrow('useAppShell must be used within <AppShell>')
      expect(warnSpy).not.toHaveBeenCalled()
    } finally {
      process.env.NODE_ENV = prev
    }
  })
})
