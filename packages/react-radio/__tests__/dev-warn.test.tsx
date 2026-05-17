import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetDevFeedback } from '@refraction-ui/shared'
import { RadioItem } from '../src/radio.js'

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

describe('react-radio devWarn (footgun: compound-context-throw)', () => {
  it('warns and still throws when RadioItem is used outside <RadioGroup>', () => {
    expect(() =>
      renderToString(React.createElement(RadioItem, { value: 'a' }, 'x')),
    ).toThrow('RadioItem must be used within RadioGroup')

    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0][0]).toContain(
      'react-radio/radio-item-outside-group',
    )
  })

  it('warn-once: a repeated misuse does not warn again for the same code', () => {
    expect(() =>
      renderToString(React.createElement(RadioItem, { value: 'a' }, 'x')),
    ).toThrow()
    expect(() =>
      renderToString(React.createElement(RadioItem, { value: 'a' }, 'x')),
    ).toThrow()

    expect(warnSpy).toHaveBeenCalledTimes(1)
  })

  it('is silent in production (NODE_ENV=production) but still throws', () => {
    const prev = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    try {
      expect(() =>
        renderToString(React.createElement(RadioItem, { value: 'a' }, 'x')),
      ).toThrow('RadioItem must be used within RadioGroup')
      expect(warnSpy).not.toHaveBeenCalled()
    } finally {
      process.env.NODE_ENV = prev
    }
  })
})
