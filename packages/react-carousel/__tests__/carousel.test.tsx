import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import {
  Carousel,
  CarouselItem,
  CarouselTrigger,
  CarouselContent,
} from '../src/carousel.js'

function renderCarousel(props: Record<string, unknown> = {}) {
  return renderToString(
    React.createElement(
      Carousel,
      props,
      React.createElement(
        CarouselItem,
        { value: 'a' },
        React.createElement(CarouselTrigger, null, 'Panel A'),
        React.createElement(CarouselContent, null, 'Body A'),
      ),
      React.createElement(
        CarouselItem,
        { value: 'b' },
        React.createElement(CarouselTrigger, null, 'Panel B'),
        React.createElement(CarouselContent, null, 'Body B'),
      ),
    ),
  )
}

describe('Carousel (SSR)', () => {
  it('renders panels closed by default', () => {
    const html = renderCarousel()
    // Each item renders data-state on item + trigger + content.
    expect((html.match(/data-state="closed"/g) ?? []).length).toBe(6)
    expect((html.match(/aria-expanded="false"/g) ?? []).length).toBe(2)
    expect((html.match(/hidden=""/g) ?? []).length).toBe(2)
  })

  it('opens the defaultValue panel (single, collapsible)', () => {
    const html = renderCarousel({ collapsible: true, defaultValue: 'a' })
    expect(html).toContain('aria-expanded="true"')
    expect((html.match(/hidden=""/g) ?? []).length).toBe(1)
  })

  it('opens the controlled panels (multiple)', () => {
    const html = renderCarousel({ type: 'multiple', value: ['a', 'b'] })
    expect((html.match(/aria-expanded="true"/g) ?? []).length).toBe(2)
    expect(html).not.toContain('hidden=""')
  })
})
