import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { JSDOM } from 'jsdom'
import { ThreadSummary, type ThreadSummaryProps } from '../src/index.js'

const people = [
  { id: 'u1', name: 'Ada Lovelace', src: 'https://example.com/ada.png' },
  { id: 'u2', name: 'Grace Hopper' },
  { id: 'u3', name: 'Alan Turing' },
  { id: 'u4', name: 'Katherine Johnson' },
]

const render = (props: ThreadSummaryProps) =>
  renderToString(React.createElement(ThreadSummary, props))

/**
 * Parse the server HTML (rendered in the node env) so assertions are about
 * structure rather than attribute order. jsdom is only the HTML parser here.
 */
function parse(html: string): HTMLElement {
  const { document } = new JSDOM(`<body>${html}</body>`).window
  // React 19 may hoist an image `<link rel="preload">` ahead of the button.
  const button = document.querySelector('button')
  if (!button) throw new Error('no button rendered')
  return button
}

describe('ThreadSummary (SSR)', () => {
  it('renders the whole line as ONE button with no nested controls', () => {
    const html = render({ avatars: people, label: '12 replies', detail: 'Last reply 2 h ago' })
    expect((html.match(/<button/g) ?? []).length).toBe(1)
    expect(html).toContain('type="button"')
    expect(html).not.toContain('role="button"')
    expect(html).not.toContain('<a ')
    expect(html).not.toContain('<div')
    expect(html).not.toContain('<p')
  })

  it('derives the accessible name from label + detail', () => {
    const html = render({ label: '12 replies', detail: 'Last reply 2 h ago' })
    expect(html).toContain('aria-label="12 replies, Last reply 2 h ago"')
    expect(html).toContain('12 replies')
    expect(html).toContain('Last reply 2 h ago')
  })

  it('uses semanticLabel when given', () => {
    const html = render({ label: '12 replies', detail: '2 h ago', semanticLabel: 'Open thread' })
    expect(html).toContain('aria-label="Open thread"')
  })

  it('lets an explicit aria-label win over the derived name', () => {
    const html = render({ label: '12 replies', 'aria-label': 'Custom' })
    expect(html).toContain('aria-label="Custom"')
    expect(html).not.toContain('aria-label="12 replies"')
  })

  it('hides the avatar stack from assistive technology and caps it', () => {
    const button = parse(render({ avatars: people, label: '4 replies' }))
    const stack = button.querySelector('[data-slot="thread-summary-avatars"]')
    expect(stack?.getAttribute('aria-hidden')).toBe('true')
    expect(stack?.querySelectorAll('[data-slot="avatar"]')).toHaveLength(3)
    expect(stack?.querySelector('img')?.getAttribute('alt')).toBe('')
    expect(stack?.textContent).toContain('AL')
    expect(stack?.textContent).toContain('GH')
    expect(button.querySelector('[role="img"]')).toBeNull()
    expect(button.getAttribute('data-avatar-count')).toBe('4')
  })

  it('honours maxAvatars and avatarSize', () => {
    const button = parse(render({ avatars: people, label: 'x', maxAvatars: 4, avatarSize: 'sm' }))
    const avatars = button.querySelectorAll('[data-slot="avatar"]')
    expect(avatars).toHaveLength(4)
    expect(avatars[0].className).toContain('h-8')
  })

  it('omits the avatar stack and detail when not provided', () => {
    const button = parse(render({ label: '1 reply' }))
    expect(button.querySelector('[data-slot="thread-summary-avatars"]')).toBeNull()
    expect(button.querySelector('[data-slot="thread-summary-detail"]')).toBeNull()
    expect(button.getAttribute('data-has-detail')).toBe('false')
  })

  it('lays out as wrapping flex items so a narrow row breaks onto a second line', () => {
    const button = parse(
      render({ avatars: people, label: '12 replies', detail: 'Last reply 2 h ago', className: 'w-40' }),
    )
    expect(button.className).toContain('flex-wrap')
    expect(button.className).toContain('max-w-full')
    expect(button.className).toContain('w-40')
    const items = Array.from(button.children).map((el) => el.getAttribute('data-slot'))
    // Avatars, label and detail are separate siblings, so each can wrap.
    expect(items).toEqual([
      'thread-summary-avatars',
      'thread-summary-label',
      'thread-summary-detail',
    ])
    expect(button.querySelector('[data-slot="thread-summary-label"]')?.className).toContain(
      'break-words',
    )
  })

  it('passes disabled through to the native button', () => {
    const button = parse(render({ label: '2 replies', disabled: true }))
    expect(button.hasAttribute('disabled')).toBe(true)
  })
})
