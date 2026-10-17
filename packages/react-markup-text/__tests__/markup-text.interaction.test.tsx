// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { resetDevFeedback } from '@refraction-ui/shared'
import { MarkupText, type MarkupTextMention } from '../src/index.js'

// React 19 expects this flag when running outside a browser bundler.
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let root: Root
let errorSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  resetDevFeedback()
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  container.remove()
  errorSpy.mockRestore()
})

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui)
  })
}

function click(el: Element) {
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}

const ann: MarkupTextMention = { id: 'u1', start: 3, end: 7, type: 'user' }
const bo: MarkupTextMention = { id: 'u2', start: 12, end: 15, type: 'user' }

describe('MarkupText interaction', () => {
  it('calls onMentionClick with the clicked mention', () => {
    const onMentionClick = vi.fn()
    render(
      <MarkupText mode="message" text="hi @ann and @bo" mentions={[ann, bo]} onMentionClick={onMentionClick} />,
    )
    const chips = container.querySelectorAll('button[data-slot="markup-text-mention"]')
    expect(Array.from(chips).map((c) => c.textContent)).toEqual(['@ann', '@bo'])

    click(chips[1] as Element)
    expect(onMentionClick).toHaveBeenCalledTimes(1)
    expect(onMentionClick).toHaveBeenCalledWith(bo)
  })

  it('makes mention buttons and links keyboard-focusable', () => {
    render(
      <MarkupText
        mode="message"
        text="hi @ann see https://example.com"
        mentions={[ann]}
        onMentionClick={() => undefined}
      />,
    )
    const chip = container.querySelector<HTMLButtonElement>('button')
    const link = container.querySelector<HTMLAnchorElement>('a')
    expect(chip?.tabIndex).toBe(0)
    expect(link?.tabIndex).toBe(0)

    act(() => chip?.focus())
    expect(document.activeElement).toBe(chip)
    act(() => link?.focus())
    expect(document.activeElement).toBe(link)
  })

  it('a mention chip is a native button, so Enter/Space activation comes from the platform', () => {
    render(<MarkupText mode="message" text="hi @ann" mentions={[ann]} onMentionClick={() => undefined} />)
    const chip = container.querySelector('button')
    expect(chip?.getAttribute('type')).toBe('button')
  })

  it('keeps non-interactive chips out of the tab order', () => {
    render(<MarkupText mode="message" text="hi @ann" mentions={[ann]} />)
    const chip = container.querySelector<HTMLElement>('[data-slot="markup-text-mention"]')
    expect(chip?.tagName).toBe('SPAN')
    expect(chip?.tabIndex).toBe(-1)
  })

  it('re-parses when the text changes', () => {
    render(<MarkupText text="**a**" />)
    expect(container.querySelector('strong')?.textContent).toBe('a')
    render(<MarkupText text="plain" />)
    expect(container.querySelector('strong')).toBeNull()
    expect(container.textContent).toBe('plain')
  })

  it('swaps inline nodes when the inline map changes', () => {
    render(<MarkupText text="Press {key}" inline={{ key: <kbd>A</kbd> }} />)
    expect(container.querySelector('kbd')?.textContent).toBe('A')
    render(<MarkupText text="Press {key}" inline={{ key: <kbd>B</kbd> }} />)
    expect(container.querySelector('kbd')?.textContent).toBe('B')
  })

  it('reports a missing token once (console.error) and renders nothing for it', () => {
    render(<MarkupText text="Press {key} now" />)
    render(<MarkupText text="Press {key} now!" />)
    expect(container.textContent).toBe('Press  now!')
    const calls = errorSpy.mock.calls.filter((c) => String(c[0]).includes('missing-inline-node:key'))
    expect(calls).toHaveLength(1)
  })

  it('forwards the ref to the root element', () => {
    const ref = React.createRef<HTMLElement>()
    render(<MarkupText ref={ref} as="p" text="x" />)
    expect(ref.current?.tagName).toBe('P')
  })

  it('exposes the accessible link name with the new-tab hint', () => {
    render(<MarkupText mode="message" text="https://example.com" />)
    expect(container.querySelector('a')?.textContent).toBe('https://example.com (opens in a new tab)')
  })
})
