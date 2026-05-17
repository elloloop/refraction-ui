import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetDevFeedback } from '@refraction-ui/shared'
import { TooltipTrigger } from '../src/tooltip.js'

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

describe('react-tooltip devWarn (footgun: compound part outside <Tooltip>)', () => {
  it('warns once in dev AND still throws when used outside <Tooltip>', () => {
    process.env.NODE_ENV = 'development'
    expect(() =>
      renderToString(React.createElement(TooltipTrigger, null, 'Hover')),
    ).toThrow('Tooltip compound components must be used within <Tooltip>')
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0]?.[0]).toContain(
      'react-tooltip/context-outside-provider',
    )
  })

  it('is silent in production but the throw is preserved', () => {
    process.env.NODE_ENV = 'production'
    expect(() =>
      renderToString(React.createElement(TooltipTrigger, null, 'Hover')),
    ).toThrow('Tooltip compound components must be used within <Tooltip>')
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('warns only once across repeated misuse (warn-once dedupe)', () => {
    process.env.NODE_ENV = 'development'
    for (let i = 0; i < 3; i++) {
      expect(() =>
        renderToString(React.createElement(TooltipTrigger, null, 'Hover')),
      ).toThrow()
    }
    expect(warnSpy).toHaveBeenCalledTimes(1)
  })
})
