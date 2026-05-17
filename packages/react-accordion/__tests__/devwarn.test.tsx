import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetDevFeedback } from '@refraction-ui/shared'
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../src/accordion.js'

// Verifies the footgun devWarn (epic #254 / batch 1C) augments — never
// replaces — the existing compound-context throws, fires once in dev, and is
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

describe('react-accordion devWarn (footgun: compound parts outside their root)', () => {
  it('warns once + throws for <AccordionItem> outside <Accordion>', () => {
    process.env.NODE_ENV = 'development'
    expect(() =>
      renderToString(
        React.createElement(AccordionItem, { value: 'a' }, 'x'),
      ),
    ).toThrow('AccordionItem must be within Accordion')
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0]?.[0]).toContain(
      'react-accordion/item-outside-accordion',
    )
  })

  it('warns once + throws for <AccordionTrigger> missing context', () => {
    process.env.NODE_ENV = 'development'
    expect(() =>
      renderToString(React.createElement(AccordionTrigger, null, 'x')),
    ).toThrow('AccordionTrigger missing context')
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0]?.[0]).toContain(
      'react-accordion/trigger-missing-context',
    )
  })

  it('warns once + throws for <AccordionContent> missing context', () => {
    process.env.NODE_ENV = 'development'
    expect(() =>
      renderToString(React.createElement(AccordionContent, null, 'x')),
    ).toThrow('AccordionContent missing context')
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0]?.[0]).toContain(
      'react-accordion/content-missing-context',
    )
  })

  it('is silent in production but each throw is preserved', () => {
    process.env.NODE_ENV = 'production'
    expect(() =>
      renderToString(
        React.createElement(AccordionItem, { value: 'a' }, 'x'),
      ),
    ).toThrow('AccordionItem must be within Accordion')
    expect(() =>
      renderToString(React.createElement(AccordionTrigger, null, 'x')),
    ).toThrow('AccordionTrigger missing context')
    expect(() =>
      renderToString(React.createElement(AccordionContent, null, 'x')),
    ).toThrow('AccordionContent missing context')
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('each guard warns only once across repeated misuse', () => {
    process.env.NODE_ENV = 'development'
    for (let i = 0; i < 3; i++) {
      expect(() =>
        renderToString(
          React.createElement(AccordionItem, { value: 'a' }, 'x'),
        ),
      ).toThrow()
    }
    expect(warnSpy).toHaveBeenCalledTimes(1)
  })
})
