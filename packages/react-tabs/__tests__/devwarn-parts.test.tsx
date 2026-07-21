import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetDevFeedback } from '@refraction-ui/shared'
import { TabsTrigger, TabsContent } from '../src/tabs.js'

// Extends devwarn.test.tsx (which covers TabsList) to the remaining compound
// parts: every part must warn once in dev AND still throw when used outside
// <Tabs>, and stay silent in production. Uses the REAL
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

describe('react-tabs devWarn — remaining compound parts', () => {
  it('TabsTrigger warns once in dev AND still throws outside <Tabs>', () => {
    process.env.NODE_ENV = 'development'
    expect(() =>
      renderToString(React.createElement(TabsTrigger, { value: 'a' }, 'Tab')),
    ).toThrow('Tabs compound components must be used within <Tabs>')
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0]?.[0]).toContain(
      'react-tabs/context-outside-provider',
    )
  })

  it('TabsContent warns once in dev AND still throws outside <Tabs>', () => {
    process.env.NODE_ENV = 'development'
    expect(() =>
      renderToString(React.createElement(TabsContent, { value: 'a' }, 'Panel')),
    ).toThrow('Tabs compound components must be used within <Tabs>')
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0]?.[0]).toContain(
      'react-tabs/context-outside-provider',
    )
  })

  it('mixed parts share the warn-once key (single warning total)', () => {
    process.env.NODE_ENV = 'development'
    expect(() =>
      renderToString(React.createElement(TabsTrigger, { value: 'a' }, 'Tab')),
    ).toThrow()
    expect(() =>
      renderToString(React.createElement(TabsContent, { value: 'a' }, 'Panel')),
    ).toThrow()
    expect(warnSpy).toHaveBeenCalledTimes(1)
  })

  it('is silent in production for every part, but the throw is preserved', () => {
    process.env.NODE_ENV = 'production'
    expect(() =>
      renderToString(React.createElement(TabsTrigger, { value: 'a' }, 'Tab')),
    ).toThrow('Tabs compound components must be used within <Tabs>')
    expect(() =>
      renderToString(React.createElement(TabsContent, { value: 'a' }, 'Panel')),
    ).toThrow('Tabs compound components must be used within <Tabs>')
    expect(warnSpy).not.toHaveBeenCalled()
  })
})
