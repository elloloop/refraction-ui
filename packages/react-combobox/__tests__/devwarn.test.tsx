import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetDevFeedback } from '@refraction-ui/shared'
import { ComboboxInput } from '../src/combobox.js'

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

describe('react-combobox devWarn (footgun: compound part outside <Combobox>)', () => {
  it('warns once in dev AND still throws when used outside <Combobox>', () => {
    process.env.NODE_ENV = 'development'
    expect(() =>
      renderToString(React.createElement(ComboboxInput, null)),
    ).toThrow('Combobox compound components must be used within <Combobox>')
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0]?.[0]).toContain(
      'react-combobox/context-outside-provider',
    )
  })

  it('is silent in production but the throw is preserved', () => {
    process.env.NODE_ENV = 'production'
    expect(() =>
      renderToString(React.createElement(ComboboxInput, null)),
    ).toThrow('Combobox compound components must be used within <Combobox>')
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('warns only once across repeated misuse (warn-once dedupe)', () => {
    process.env.NODE_ENV = 'development'
    for (let i = 0; i < 3; i++) {
      expect(() =>
        renderToString(React.createElement(ComboboxInput, null)),
      ).toThrow()
    }
    expect(warnSpy).toHaveBeenCalledTimes(1)
  })
})
