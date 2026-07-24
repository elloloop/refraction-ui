import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetDevFeedback } from '@refraction-ui/shared'
import { PopoverContent, PopoverClose } from '../src/popover.js'

// Extends devwarn.test.tsx (which covers PopoverTrigger) to the remaining
// compound parts: every part must warn once in dev AND still throw when used
// outside <Popover>, and stay silent in production. Uses the REAL
// @refraction-ui/shared primitive.

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

describe('react-popover devWarn — remaining compound parts', () => {
  it('PopoverContent warns once in dev AND still throws outside <Popover>', () => {
    process.env.NODE_ENV = 'development'
    expect(() =>
      renderToString(React.createElement(PopoverContent, null, 'Body')),
    ).toThrow('Popover compound components must be used within <Popover>')
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0]?.[0]).toContain(
      'react-popover/context-outside-provider',
    )
  })

  it('PopoverClose warns once in dev AND still throws outside <Popover>', () => {
    process.env.NODE_ENV = 'development'
    expect(() =>
      renderToString(React.createElement(PopoverClose, null, 'X')),
    ).toThrow('Popover compound components must be used within <Popover>')
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0]?.[0]).toContain(
      'react-popover/context-outside-provider',
    )
  })

  it('mixed parts share the warn-once key (single warning total)', () => {
    process.env.NODE_ENV = 'development'
    for (const Part of [PopoverContent, PopoverClose] as const) {
      expect(() =>
        renderToString(React.createElement(Part, null, 'x')),
      ).toThrow()
    }
    expect(warnSpy).toHaveBeenCalledTimes(1)
  })

  it('is silent in production for every part, but the throw is preserved', () => {
    process.env.NODE_ENV = 'production'
    for (const Part of [PopoverContent, PopoverClose] as const) {
      expect(() =>
        renderToString(React.createElement(Part, null, 'x')),
      ).toThrow('Popover compound components must be used within <Popover>')
    }
    expect(warnSpy).not.toHaveBeenCalled()
  })
})
