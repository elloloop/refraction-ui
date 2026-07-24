import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetDevFeedback } from '@refraction-ui/shared'
import { TooltipContent } from '../src/tooltip.js'

// Extends devwarn.test.tsx (which covers TooltipTrigger) to the remaining
// compound part: TooltipContent must warn once in dev AND still throw when
// used outside <Tooltip>, and stay silent in production. Uses the REAL
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

describe('react-tooltip devWarn — remaining compound parts', () => {
  it('TooltipContent warns once in dev AND still throws outside <Tooltip>', () => {
    process.env.NODE_ENV = 'development'
    expect(() =>
      renderToString(React.createElement(TooltipContent, null, 'Tip')),
    ).toThrow('Tooltip compound components must be used within <Tooltip>')
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0]?.[0]).toContain(
      'react-tooltip/context-outside-provider',
    )
  })

  it('is silent in production, but the throw is preserved', () => {
    process.env.NODE_ENV = 'production'
    expect(() =>
      renderToString(React.createElement(TooltipContent, null, 'Tip')),
    ).toThrow('Tooltip compound components must be used within <Tooltip>')
    expect(warnSpy).not.toHaveBeenCalled()
  })
})
