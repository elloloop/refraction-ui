import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetDevFeedback } from '@refraction-ui/shared'
import { PopoverTrigger } from '../src/popover.js'

// Verifies the footgun devWarn (epic #254 / batch 1C) augments — never
// replaces — the existing compound-context throw, fires once in dev, and is
// fully silent in production. Uses the REAL @refraction-ui/shared primitive.

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

describe('react-popover devWarn (footgun: compound part outside <Popover>)', () => {
  it('warns once in dev AND still throws when used outside <Popover>', () => {
    process.env.NODE_ENV = 'development'
    expect(() =>
      renderToString(React.createElement(PopoverTrigger, null, 'Open')),
    ).toThrow('Popover compound components must be used within <Popover>')
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0]?.[0]).toContain(
      'react-popover/context-outside-provider',
    )
  })

  it('is silent in production but the throw is preserved', () => {
    process.env.NODE_ENV = 'production'
    expect(() =>
      renderToString(React.createElement(PopoverTrigger, null, 'Open')),
    ).toThrow('Popover compound components must be used within <Popover>')
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('warns only once across repeated misuse (warn-once dedupe)', () => {
    process.env.NODE_ENV = 'development'
    for (let i = 0; i < 3; i++) {
      expect(() =>
        renderToString(React.createElement(PopoverTrigger, null, 'Open')),
      ).toThrow()
    }
    expect(warnSpy).toHaveBeenCalledTimes(1)
  })
})
