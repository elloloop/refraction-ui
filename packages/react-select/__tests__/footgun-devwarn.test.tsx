import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
// Real @refraction-ui/shared — no mock. Exercises the genuine #248 primitive
// (env guard + warn-once) across the package boundary.
import { resetDevFeedback } from '@refraction-ui/shared'
import { Select, SelectTrigger, SelectContent, SelectItem } from '../src/select.js'

describe('react-select — silent-default-context footgun (devWarn)', () => {
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

  describe('in development', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development'
    })

    it('warns when SelectTrigger renders without a <Select> ancestor', () => {
      renderToString(React.createElement(SelectTrigger, null, 'Pick'))
      expect(warnSpy).toHaveBeenCalledTimes(1)
      const msg = String(warnSpy.mock.calls[0][0])
      expect(msg).toContain('react-select/no-select-provider')
      expect(msg).toContain('<Select>')
    })

    it('warns when SelectItem renders without a <Select> ancestor', () => {
      renderToString(
        React.createElement(SelectItem, { value: 'a' }, 'Apple'),
      )
      expect(warnSpy).toHaveBeenCalledTimes(1)
      expect(String(warnSpy.mock.calls[0][0])).toContain(
        'react-select/no-select-provider',
      )
    })

    it('warns for SelectContent rendered out of context (seam is before the closed-null return)', () => {
      renderToString(
        React.createElement(SelectContent, null, 'hidden'),
      )
      expect(warnSpy).toHaveBeenCalledTimes(1)
    })

    it('does NOT warn when parts are inside <Select>', () => {
      renderToString(
        React.createElement(
          Select,
          null,
          React.createElement(SelectTrigger, null, 'Pick'),
          React.createElement(
            'div',
            null,
            React.createElement(SelectItem, { value: 'a' }, 'Apple'),
          ),
        ),
      )
      expect(warnSpy).not.toHaveBeenCalled()
    })

    it('warns at most once (warn-once dedupe) across many misuses', () => {
      renderToString(React.createElement(SelectTrigger, null, 'one'))
      renderToString(React.createElement(SelectTrigger, null, 'two'))
      renderToString(React.createElement(SelectItem, { value: 'b' }, 'x'))
      expect(warnSpy).toHaveBeenCalledTimes(1)
    })

    it('does not throw — behaviour unchanged, devWarn is the only signal', () => {
      let html = ''
      expect(() => {
        html = renderToString(
          React.createElement(SelectTrigger, null, 'Pick'),
        )
      }).not.toThrow()
      // Still renders the (inert) button with the silent default context.
      expect(html).toContain('<button')
      expect(html).toContain('Pick')
    })
  })

  describe('in production', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production'
    })

    it('does NOT warn (devWarn is stripped/guarded in prod)', () => {
      renderToString(React.createElement(SelectTrigger, null, 'Pick'))
      renderToString(
        React.createElement(SelectItem, { value: 'a' }, 'Apple'),
      )
      expect(warnSpy).not.toHaveBeenCalled()
    })

    it('still renders identically (no behavioural change in prod)', () => {
      const html = renderToString(
        React.createElement(SelectTrigger, null, 'Pick'),
      )
      expect(html).toContain('<button')
      expect(warnSpy).not.toHaveBeenCalled()
    })
  })
})
