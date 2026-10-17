import { describe, it, expect, afterEach, vi } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetDevFeedback } from '@refraction-ui/shared'
import { AdaptiveTabNav, type AdaptiveTabNavItem } from '../src/index.js'

type Section = 'home' | 'inbox' | 'settings'

const ITEMS: readonly AdaptiveTabNavItem<Section>[] = [
  { id: 'home', label: 'Home', icon: <svg data-icon="home" /> },
  { id: 'inbox', label: 'Inbox' },
  { id: 'settings', label: 'Settings' },
]

function render(active: Section | null, props: Partial<React.ComponentProps<typeof AdaptiveTabNav<Section>>> = {}) {
  return renderToString(
    <AdaptiveTabNav items={ITEMS} active={active} onSelect={() => {}} aria-label="Sections" {...props} />,
  )
}

/** Opening tags of the tab buttons, in order. */
const tabs = (html: string) => html.match(/<button\b[^>]*>/g) ?? []

/** The text between tags, in order. */
const text = (html: string) => [...html.matchAll(/>([^<]+)</g)].map((match) => match[1]).join('')

afterEach(() => {
  vi.restoreAllMocks()
  resetDevFeedback()
})

describe('AdaptiveTabNav (SSR)', () => {
  it('is one labelled navigation landmark', () => {
    const html = render('home', { className: 'my-bar', id: 'primary' })
    expect(html.match(/<nav\b/g)).toHaveLength(1)
    const nav = html.match(/<nav\b[^>]*>/)![0]
    expect(nav).toContain('data-slot="adaptive-tab-nav"')
    expect(nav).toContain('aria-label="Sections"')
    expect(nav).toContain('id="primary"')
    expect(nav).toMatch(/class="[^"]*\[@media\(max-width:767px\)\]:fixed[^"]* my-bar"/)
  })

  it('renders a native button per section, in order, that submits nothing', () => {
    const buttons = tabs(render('home'))
    expect(buttons).toHaveLength(3)
    for (const button of buttons) expect(button).toContain('type="button"')
    expect(buttons.map((b) => b.match(/data-tab="([^"]+)"/)![1])).toEqual(['home', 'inbox', 'settings'])
    expect(text(render('home'))).toBe('HomeInboxSettings')
  })

  it('marks only the section on screen as the current page, with the active pill', () => {
    const [home, inbox, settings] = tabs(render('inbox'))
    expect(inbox).toContain('aria-current="page"')
    expect(inbox).toContain('data-state="active"')
    expect(inbox).toContain('bg-primary-soft')
    for (const other of [home, settings]) {
      expect(other).not.toContain('aria-current')
      expect(other).toContain('data-state="inactive"')
      expect(other).not.toContain('bg-primary-soft')
    }
  })

  it('marks none on a page outside every section', () => {
    expect(render(null)).not.toContain('aria-current')
    expect(render(null)).not.toContain('data-state="active"')
  })

  it('keeps icons out of the accessible name', () => {
    const html = render('home')
    expect(html).toMatch(/<span aria-hidden="true"[^>]*><svg data-icon="home"><\/svg><\/span>/)
    // Only the first item has an icon; the others render just their label.
    expect(html.match(/aria-hidden="true"/g)).toHaveLength(1)
  })

  it('warns once in development when ids repeat', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const repeated = [...ITEMS, { id: 'home' as const, label: 'Home again' }]
    renderToString(<AdaptiveTabNav items={repeated} active="home" onSelect={() => {}} />)
    renderToString(<AdaptiveTabNav items={repeated} active="home" onSelect={() => {}} />)
    const ours = warn.mock.calls.filter((call) => String(call[0]).includes('react-adaptive-tab-nav/duplicate-id'))
    expect(ours).toHaveLength(1)
    warn.mockClear()
    render('home')
    expect(warn.mock.calls.some((call) => String(call[0]).includes('react-adaptive-tab-nav'))).toBe(false)
  })
})
