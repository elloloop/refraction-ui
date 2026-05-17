import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetDevFeedback } from '@refraction-ui/shared'
import { MobileNavTrigger } from '../src/mobile-nav.js'

// Real @refraction-ui/shared devWarn (no mock) — assert via a console.warn spy,
// mirroring the SSR render style used by the rest of this package's tests.

let warnSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  resetDevFeedback()
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  warnSpy.mockRestore()
})

describe('react-mobile-nav devWarn (footgun: compound-context-throw)', () => {
  it('warns and still throws when a part is used outside <MobileNav>', () => {
    expect(() =>
      renderToString(React.createElement(MobileNavTrigger, null, 'x')),
    ).toThrow('MobileNav compound components must be used within <MobileNav>')

    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0][0]).toContain(
      'react-mobile-nav/compound-outside-provider',
    )
  })

  it('warn-once: a repeated misuse does not warn again for the same code', () => {
    expect(() =>
      renderToString(React.createElement(MobileNavTrigger, null, 'x')),
    ).toThrow()
    expect(() =>
      renderToString(React.createElement(MobileNavTrigger, null, 'x')),
    ).toThrow()

    expect(warnSpy).toHaveBeenCalledTimes(1)
  })

  it('is silent in production (NODE_ENV=production) but still throws', () => {
    const prev = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    try {
      expect(() =>
        renderToString(React.createElement(MobileNavTrigger, null, 'x')),
      ).toThrow('MobileNav compound components must be used within <MobileNav>')
      expect(warnSpy).not.toHaveBeenCalled()
    } finally {
      process.env.NODE_ENV = prev
    }
  })
})
