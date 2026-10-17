import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { NavItem, type NavItemProps } from '../src/index.js'

const Icon = ({ name }: { name: string }) => <svg data-icon={name} />

/** The always-present tooltip trigger wrapper, inert while expanded. */
const EXPANDED_WRAPPER = '<span class="contents">'

const render = (props: Partial<NavItemProps> & { label?: string } = {}) =>
  renderToString(<NavItem label="Chats" {...props} />)

describe('NavItem (SSR)', () => {
  it('renders a button with the label as accessible name', () => {
    const html = render({ icon: <Icon name="chat" /> })
    expect(html.startsWith(`${EXPANDED_WRAPPER}<button`)).toBe(true)
    expect(html).toContain('type="button"')
    expect(html).toContain('aria-label="Chats"')
    expect(html).toContain('data-slot="label"')
    expect(html).toContain('>Chats</span>')
    expect(html).toContain('data-icon="chat"')
  })

  it('includes the count in the accessible name and hides the visual badge', () => {
    const html = render({ count: 2 })
    expect(html).toContain('aria-label="Chats, 2 unread"')
    expect(html).toMatch(/<span aria-hidden="true" data-slot="count"[^>]*>2<\/span>/)
  })

  it('caps the count at maxCount', () => {
    expect(render({ count: 150 })).toMatch(/data-slot="count"[^>]*>99\+</)
    const html = render({ count: 12, maxCount: 9 })
    expect(html).toMatch(/data-slot="count"[^>]*>9\+</)
    expect(html).toContain('aria-label="Chats, 9+ unread"')
  })

  it('renders no badge for a zero count', () => {
    const html = render({ count: 0 })
    expect(html).not.toContain('data-slot="count"')
    expect(html).toContain('aria-label="Chats"')
  })

  it('uses a custom count formatter for the accessible name', () => {
    const html = render({ count: 3, formatCountLabel: (n) => `${n} nouveaux` })
    expect(html).toContain('aria-label="Chats, 3 nouveaux"')
  })

  it('lets semanticLabel override the composed name', () => {
    expect(render({ count: 3, semanticLabel: 'Inbox' })).toContain('aria-label="Inbox"')
  })

  it('marks the selected item with aria-current and a non-colour indicator', () => {
    const html = render({ selected: true })
    expect(html).toContain('aria-current="page"')
    expect(html).toContain('data-state="active"')
    expect(html).toContain('data-slot="indicator"')
    expect(html).toContain('font-semibold')
  })

  it('does not set aria-current when unselected', () => {
    const html = render()
    expect(html).not.toContain('aria-current')
    expect(html).not.toContain('data-slot="indicator"')
  })

  it('swaps to activeIcon while selected', () => {
    const icons = { icon: <Icon name="outline" />, activeIcon: <Icon name="filled" /> }
    expect(render({ ...icons, selected: true })).toContain('data-icon="filled"')
    expect(render({ ...icons, selected: true })).not.toContain('data-icon="outline"')
    expect(render({ ...icons })).toContain('data-icon="outline"')
  })

  it('collapsed: hides the visible label, keeps the name, and pins the count to the icon', () => {
    const html = render({ collapsed: true, count: 4, icon: <Icon name="chat" /> })
    expect(html).not.toContain('data-slot="label"')
    expect(html).toContain('aria-label="Chats, 4 unread"')
    expect(html).toContain('data-collapsed="true"')
    expect(html).toContain('size-11')
    // The badge sits inside the icon box, with corner placement.
    expect(html).toMatch(/data-slot="icon"[^>]*>.*data-slot="count"[^>]*absolute/)
  })

  it('collapsed: wraps the item in a tooltip trigger (content renders only when open)', () => {
    const html = render({ collapsed: true, icon: <Icon name="chat" /> })
    expect(html).toMatch(/^<span[^>]*aria-describedby=/)
    expect(html).not.toContain('role="tooltip"')
  })

  it('expanded: keeps an inert display-contents wrapper with no tooltip ARIA', () => {
    const html = render({ icon: <Icon name="chat" /> })
    expect(html.startsWith(EXPANDED_WRAPPER)).toBe(true)
    expect(html).not.toContain('aria-describedby')
    expect(html).not.toContain('role="tooltip"')
  })

  it('renders the live-dot slot at the row end, or on the icon corner when collapsed', () => {
    const dot = <i data-dot="" />
    const expanded = render({ liveDot: dot })
    expect(expanded).toMatch(/data-slot="live-dot" class="inline-flex items-center justify-center"/)
    const collapsed = render({ liveDot: dot, collapsed: true, icon: <Icon name="c" /> })
    expect(collapsed).toMatch(/data-slot="live-dot" class="[^"]*absolute/)
  })

  it('asChild renders the child link with the item content and ARIA', () => {
    const html = renderToString(
      <NavItem asChild label="Chats" count={2} selected>
        <a href="/chats">ignored</a>
      </NavItem>,
    )
    expect(html.startsWith(`${EXPANDED_WRAPPER}<a`)).toBe(true)
    expect(html).toContain('href="/chats"')
    expect(html).toContain('aria-current="page"')
    expect(html).toContain('aria-label="Chats, 2 unread"')
    expect(html).toContain('>Chats</span>')
    expect(html).not.toContain('ignored')
    expect(html).not.toContain('type="button"')
  })

  it('merges className and passes through button attributes', () => {
    const html = render({ className: 'custom-x', disabled: true, id: 'nav-chats' })
    expect(html).toContain('custom-x')
    expect(html).toContain('disabled=""')
    expect(html).toContain('id="nav-chats"')
  })
})
