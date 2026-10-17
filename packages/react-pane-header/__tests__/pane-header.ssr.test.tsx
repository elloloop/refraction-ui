import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { PaneHeader, type PaneHeaderProps } from '../src/index.js'

const render = (props: Partial<PaneHeaderProps> = {}) =>
  renderToString(<PaneHeader title="Ana Ruiz" {...props} />)

describe('PaneHeader (SSR)', () => {
  it('renders a <header> with no landmark role and an h2 title by default', () => {
    const html = render()
    expect(html).toMatch(/^<header/)
    expect(html).not.toContain('role=')
    expect(html).toContain('data-slot="pane-header"')
    expect(html).toMatch(/<h2[^>]*>Ana Ruiz<\/h2>/)
  })

  it('reads the shared height custom property with the rem default', () => {
    const html = render()
    expect(html).toContain('height:var(--pane-header-height, 3.5rem)')
    expect(html).not.toContain('--pane-header-height:')
  })

  it('sets the custom property for a per-instance height', () => {
    expect(render({ height: '4rem' })).toContain('--pane-header-height:4rem')
    expect(render({ height: 64 })).toContain('--pane-header-height:64px')
  })

  it('merges a consumer style after the core style', () => {
    const html = render({ style: { background: 'transparent' } })
    expect(html).toContain('height:var(--pane-header-height, 3.5rem)')
    expect(html).toContain('background:transparent')
  })

  it('honours the heading level', () => {
    expect(render({ headingLevel: 1 })).toMatch(/<h1[^>]*>Ana Ruiz<\/h1>/)
    expect(render({ headingLevel: 3, onTitleTap: () => {} })).toMatch(/<h3[^>]*><button/)
  })

  it('renders leading, avatar, subtitle and actions in reading order', () => {
    const html = render({
      leading: <button type="button" aria-label="Back">‹</button>,
      avatar: <span data-testid="avatar">AR</span>,
      subtitle: 'Online',
      actions: <button type="button" aria-label="Call">☎</button>,
    })
    const order = ['aria-label="Back"', 'data-testid="avatar"', 'Ana Ruiz', 'Online', 'aria-label="Call"']
    const positions = order.map((needle) => html.indexOf(needle))
    expect(positions.every((p) => p >= 0)).toBe(true)
    expect([...positions].sort((a, b) => a - b)).toEqual(positions)
  })

  it('omits empty slots', () => {
    const html = render()
    expect(html).not.toContain('<button')
    expect(html).not.toContain('<p')
    expect(html).not.toContain('flex-none items-center gap-1')
  })

  it('has no button when onTitleTap is absent', () => {
    const html = render({ subtitle: 'Online', avatar: <span>AR</span> })
    expect(html).not.toContain('<button')
    expect(html).toContain('data-interactive="false"')
  })

  it('wraps avatar + title + subtitle in one button inside the heading when tappable', () => {
    const html = render({
      id: 'chat',
      subtitle: 'Online',
      avatar: <span data-testid="avatar">AR</span>,
      onTitleTap: () => {},
      titleTapHint: 'Show contact details',
    })
    expect(html).toContain('data-interactive="true"')
    expect((html.match(/<button/g) ?? []).length).toBe(1)
    const button = html.slice(html.indexOf('<button'), html.indexOf('</button>'))
    expect(button).toContain('type="button"')
    expect(button).toContain('aria-labelledby="chat-title"')
    expect(button).toContain('aria-describedby="chat-subtitle chat-hint"')
    expect(button).toContain('data-testid="avatar"')
    expect(button).toContain('id="chat-title"')
    expect(button).toContain('id="chat-subtitle"')
    expect(button).toContain('Show contact details')
    // The heading wraps the button; no heading inside the button.
    expect(button).not.toMatch(/<h[1-6]/)
    expect(html).toMatch(/<h2[^>]*><button/)
  })

  it('does not nest interactive elements inside the title button', () => {
    const html = render({
      leading: <button type="button" aria-label="Back">‹</button>,
      actions: <button type="button" aria-label="More">⋯</button>,
      onTitleTap: () => {},
    })
    const button = html.slice(html.indexOf('<h2'), html.indexOf('</h2>'))
    expect((button.match(/<button/g) ?? []).length).toBe(1)
    expect(button).not.toContain('Back')
    expect(button).not.toContain('More')
  })

  it('derives the title id from the root id so a pane can be labelled by it', () => {
    const html = render({ id: 'thread' })
    expect(html).toContain('id="thread"')
    expect(html).toContain('id="thread-title"')
  })

  it('gives the tappable title block a focus-visible ring and 44px target', () => {
    const html = render({ onTitleTap: () => {} })
    expect(html).toContain('focus-visible:ring-2')
    expect(html).toContain('min-h-11')
  })

  it('truncates the title while the actions never shrink', () => {
    const html = render({ subtitle: 'Online', actions: <span>A</span> })
    expect(html).toMatch(/<h2[^>]*class="[^"]*truncate/)
    expect(html).toContain('flex flex-none items-center gap-1')
  })

  it('forwards className and arbitrary attributes', () => {
    const html = render({ className: 'custom', 'aria-label': 'Conversation header' } as Partial<PaneHeaderProps>)
    expect(html).toContain('custom')
    expect(html).toContain('aria-label="Conversation header"')
  })
})
