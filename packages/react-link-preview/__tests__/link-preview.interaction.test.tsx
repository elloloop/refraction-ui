// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { LinkPreview, type LinkPreviewProps } from '../src/index.js'

// Interaction suite (jsdom, no Testing Library). jsdom has no layout engine
// and does not load images or navigate, so the visual position of the
// dismiss button, line clamping, real lazy loading and native Enter/Space
// activation are NOT covered; image failures are simulated with `error`
// events.

// React 19 expects this flag when running outside a browser bundler.
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
  vi.restoreAllMocks()
})

const metadata: LinkPreviewProps = {
  url: 'https://github.com/acme/repo',
  siteName: 'GitHub',
  siteIcon: 'https://github.com/favicon.ico',
  title: 'acme/repo',
  description: 'A repository.',
  image: { src: 'https://example.com/og.png', width: 1200, height: 630 },
}

function render(props: Partial<LinkPreviewProps> = {}) {
  act(() => {
    root.render(<LinkPreview {...metadata} {...props} />)
  })
}

function link(): HTMLAnchorElement {
  const el = container.querySelector('a')
  if (!el) throw new Error('link not rendered')
  return el
}

function dismissButton(): HTMLButtonElement {
  const el = container.querySelector('button')
  if (!el) throw new Error('dismiss button not rendered')
  return el
}

function fire(el: Element, event: Event) {
  act(() => {
    el.dispatchEvent(event)
  })
}

describe('LinkPreview interaction', () => {
  it('routes a click anywhere on the card to the one link', () => {
    render()
    const onClick = vi.fn((event: MouseEvent) => event.preventDefault())
    link().addEventListener('click', onClick)
    const title = Array.from(container.querySelectorAll('span')).find((s) => s.textContent === 'acme/repo')
    if (!title) throw new Error('title not rendered')
    fire(title, new MouseEvent('click', { bubbles: true, cancelable: true }))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(container.querySelectorAll('a')).toHaveLength(1)
  })

  it('reaches the link and then the dismiss button by keyboard', () => {
    render({ onDismiss: () => {} })
    const a = link()
    const button = dismissButton()
    // Both are natively focusable and neither is taken out of the tab order.
    expect(a.hasAttribute('tabindex')).toBe(false)
    expect(button.hasAttribute('tabindex')).toBe(false)
    // Document order is the tab order: link first, then the dismiss button.
    expect(a.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(a.contains(button)).toBe(false)
    act(() => a.focus())
    expect(document.activeElement).toBe(a)
    act(() => button.focus())
    expect(document.activeElement).toBe(button)
  })

  it('calls onDismiss without activating the link', () => {
    const onDismiss = vi.fn()
    render({ onDismiss })
    const onLinkClick = vi.fn()
    link().addEventListener('click', onLinkClick)
    fire(dismissButton(), new MouseEvent('click', { bubbles: true, cancelable: true }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(onLinkClick).not.toHaveBeenCalled()
  })

  it('lets the caller remove the preview on dismiss', () => {
    function Harness() {
      const [shown, setShown] = React.useState(true)
      return shown ? <LinkPreview {...metadata} onDismiss={() => setShown(false)} /> : <p>gone</p>
    }
    act(() => {
      root.render(<Harness />)
    })
    fire(dismissButton(), new MouseEvent('click', { bubbles: true }))
    expect(container.querySelector('[data-slot="link-preview"]')).toBeNull()
    expect(container.textContent).toBe('gone')
  })

  it('keeps the fixed box when the image fails, and retries a new src', () => {
    render()
    const media = container.querySelector<HTMLElement>('[data-link-preview-media]')
    const img = media?.querySelector('img')
    if (!media || !img) throw new Error('image not rendered')
    fire(img, new Event('error'))
    expect(media.querySelector('img')).toBeNull()
    expect(container.querySelector('[data-link-preview-media]')).toBe(media)
    // jsdom's CSSStyleDeclaration drops `aspect-ratio`; the SSR suite asserts the inline ratio.

    render({ image: { src: 'https://example.com/other.png', width: 1200, height: 630 } })
    expect(media.querySelector('img')?.getAttribute('src')).toBe('https://example.com/other.png')
  })

  it('drops a broken site icon but keeps the site name', () => {
    render()
    const icon = container.querySelector('img[src="https://github.com/favicon.ico"]')
    if (!icon) throw new Error('icon not rendered')
    fire(icon, new Event('error'))
    expect(container.querySelector('img[src="https://github.com/favicon.ico"]')).toBeNull()
    expect(container.textContent).toContain('GitHub')
  })

  it('removes the card when the URL becomes unsafe', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    render()
    expect(container.querySelector('a')).not.toBeNull()
    render({ url: 'javascript:alert(document.cookie)' })
    expect(container.innerHTML).toBe('')
  })

  it('forwards the ref to the root element', () => {
    const ref = React.createRef<HTMLDivElement>()
    act(() => {
      root.render(<LinkPreview {...metadata} ref={ref} />)
    })
    expect(ref.current?.getAttribute('data-slot')).toBe('link-preview')
  })

  it('keeps aria-describedby pointing at rendered elements', () => {
    render()
    const ids = link().getAttribute('aria-describedby')?.split(' ') ?? []
    expect(ids.map((id) => document.getElementById(id)?.textContent)).toEqual([
      'github.com',
      'A repository.',
    ])
  })
})
