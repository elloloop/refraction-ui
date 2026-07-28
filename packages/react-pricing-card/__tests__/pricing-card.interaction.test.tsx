// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { act } from 'react'
import { fireEvent } from '@testing-library/dom'
import { PricingCard } from '../src/index.js'

// React 19 expects this flag to be set when running tests outside a browser bundler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  container.remove()
})

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui)
  })
}

describe('PricingCard interactions', () => {
  it('CTA click fires onCtaClick (button)', async () => {
    const handleClick = vi.fn()
    render(
      <PricingCard
        name="Pro"
        price=""
        features={['A', 'B']}
        cta="Subscribe"
        onCtaClick={handleClick}
      />
    )
    
    const button = container.querySelector('button')
    expect(button).not.toBeNull()
    expect(button!.textContent).toBe('Subscribe')
    
    await act(async () => {
      fireEvent.click(button!)
    })
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders <a href> when ctaHref is provided', () => {
    render(
      <PricingCard
        name="Pro"
        price=""
        features={['A', 'B']}
        cta="Subscribe"
        ctaHref="/checkout"
      />
    )
    
    const anchor = container.querySelector('a')
    expect(anchor).not.toBeNull()
    expect(anchor!.getAttribute('href')).toBe('/checkout')
    expect(anchor!.textContent).toBe('Subscribe')
  })

  it('featured applies the ring; badge renders when provided', () => {
    render(
      <PricingCard
        name="Pro"
        price=""
        features={['A', 'B']}
        cta="Subscribe"
        featured
        badge="Most Popular"
      />
    )
    
    const card = container.firstElementChild
    expect(card?.getAttribute('data-featured')).toBe('true')
    
    const spanElements = Array.from(container.querySelectorAll('span'))
    const badge = spanElements.find(span => span.textContent === 'Most Popular')
    expect(badge).toBeTruthy()
  })
})
