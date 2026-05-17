import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetDevFeedback } from '@refraction-ui/shared'
import { CarouselItem, CarouselTrigger, CarouselContent } from '../src/index'

// Real @refraction-ui/shared devWarn (no mock) — assert via a console.warn spy.

let warnSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  resetDevFeedback()
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  warnSpy.mockRestore()
})

describe('react-carousel devWarn (footgun: compound-context-throw)', () => {
  it('warns and still throws when CarouselItem is used outside <Carousel>', () => {
    expect(() =>
      renderToString(React.createElement(CarouselItem, { value: 'a' }, 'x')),
    ).toThrow('CarouselItem must be within Carousel')

    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0][0]).toContain(
      'react-carousel/carousel-item-outside-carousel',
    )
  })

  it('warns and still throws when CarouselTrigger is used outside an item', () => {
    expect(() =>
      renderToString(React.createElement(CarouselTrigger, null, 'x')),
    ).toThrow('CarouselTrigger missing context')

    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0][0]).toContain(
      'react-carousel/carousel-trigger-outside-item',
    )
  })

  it('warns and still throws when CarouselContent is used outside an item', () => {
    expect(() =>
      renderToString(React.createElement(CarouselContent, null, 'x')),
    ).toThrow('CarouselContent missing context')

    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0][0]).toContain(
      'react-carousel/carousel-content-outside-item',
    )
  })

  it('warn-once: a repeated misuse does not warn again for the same code', () => {
    expect(() =>
      renderToString(React.createElement(CarouselItem, { value: 'a' }, 'x')),
    ).toThrow()
    expect(() =>
      renderToString(React.createElement(CarouselItem, { value: 'a' }, 'x')),
    ).toThrow()

    expect(warnSpy).toHaveBeenCalledTimes(1)
  })

  it('is silent in production (NODE_ENV=production) but still throws', () => {
    const prev = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    try {
      expect(() =>
        renderToString(React.createElement(CarouselItem, { value: 'a' }, 'x')),
      ).toThrow('CarouselItem must be within Carousel')
      expect(warnSpy).not.toHaveBeenCalled()
    } finally {
      process.env.NODE_ENV = prev
    }
  })
})
