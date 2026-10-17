import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { ListItem, ListItemGroup, ListItemAction } from '../src/list-item.js'

const count = (html: string, pattern: RegExp) => (html.match(pattern) ?? []).length

describe('ListItem (SSR) — slots', () => {
  it('renders title, meta, subtitle, leading and trailing in their slots', () => {
    const html = renderToString(
      <ListItem
        title="Ada Lovelace"
        meta="09:41"
        subtitle="See you at the standup"
        leading={<span data-testid="avatar">AL</span>}
        trailing={<span>3</span>}
        onTap={() => {}}
      />,
    )
    expect(html).toMatch(/data-slot="list-item-title"[^>]*>Ada Lovelace</)
    expect(html).toMatch(/data-slot="list-item-meta"[^>]*>09:41</)
    expect(html).toMatch(/data-slot="list-item-subtitle"[^>]*>See you at the standup</)
    expect(html).toMatch(/data-slot="list-item-trailing"[^>]*><span>3</)
    expect(html).toContain('data-testid="avatar"')
  })

  it('places meta after the title on the same line', () => {
    const html = renderToString(<ListItem title="Ada" meta="09:41" subtitle="Preview" />)
    expect(html).toMatch(
      /<span class="[^"]*items-baseline[^"]*"><span[^>]*data-slot="list-item-title"[^>]*>Ada<\/span><span[^>]*data-slot="list-item-meta"/,
    )
    expect(html.indexOf('list-item-meta')).toBeLessThan(html.indexOf('list-item-subtitle'))
  })

  it('omits optional slots that are not provided', () => {
    const html = renderToString(<ListItem title="Ada" />)
    expect(html).not.toContain('list-item-meta')
    expect(html).not.toContain('list-item-subtitle')
    expect(html).not.toContain('list-item-trailing')
  })

  it('truncates title and subtitle while meta stays whole', () => {
    const html = renderToString(<ListItem title="Ada" subtitle="Preview" meta="Now" />)
    expect(html).toMatch(/class="[^"]*truncate[^"]*" data-slot="list-item-title"/)
    expect(html).toMatch(/class="[^"]*truncate[^"]*" data-slot="list-item-subtitle"/)
    expect(html).toMatch(/class="[^"]*whitespace-nowrap[^"]*" data-slot="list-item-meta"/)
  })

  it('applies density and emphasis', () => {
    const html = renderToString(<ListItem title="Ada" density="compact" emphasized />)
    expect(html).toContain('data-density="compact"')
    expect(html).toContain('data-emphasized=""')
    expect(html).toContain('min-h-11')
    expect(html).toMatch(/class="[^"]*font-bold[^"]*" data-slot="list-item-title"/)
  })
})

describe('ListItem (SSR) — navigation context', () => {
  const nav = (ui: React.ReactNode) =>
    renderToString(<ListItemGroup context="navigation">{ui}</ListItemGroup>)

  it('renders an explicit role="list" with plain list items', () => {
    const html = nav(<ListItem title="General" onTap={() => {}} />)
    expect(html).toMatch(/^<ul[^>]*role="list"/)
    expect(html).not.toContain('role="option"')
    expect(html).not.toContain('role="listbox"')
  })

  it('puts aria-current on the button of the selected row only', () => {
    const html = nav(
      <>
        <ListItem title="General" selected onTap={() => {}} />
        <ListItem title="Random" onTap={() => {}} />
      </>,
    )
    expect(count(html, /aria-current="true"/g)).toBe(1)
    expect(html).toMatch(/<button[^>]*aria-current="true"/)
    expect(html).not.toContain('aria-selected')
  })

  it('renders the action as a sibling of the row button, not inside it', () => {
    const html = nav(
      <ListItem
        title="General"
        onTap={() => {}}
        action={<ListItemAction aria-label="Mute General">M</ListItemAction>}
      />,
    )
    expect(count(html, /<button/g)).toBe(2)
    // The first button closes before the action button opens.
    const firstClose = html.indexOf('</button>')
    const actionOpen = html.indexOf('data-slot="list-item-action"')
    expect(firstClose).toBeGreaterThan(-1)
    expect(actionOpen).toBeGreaterThan(firstClose)
    expect(html).toContain('aria-label="Mute General"')
  })

  it('uses semanticLabel as the button name', () => {
    const html = nav(<ListItem title="Ada" semanticLabel="Ada Lovelace, 3 unread" onTap={() => {}} />)
    expect(html).toMatch(/<button[^>]*aria-label="Ada Lovelace, 3 unread"/)
  })

  it('renders static content (no button) without onTap, with aria-current on the row', () => {
    const html = nav(<ListItem title="Archived" selected />)
    expect(html).not.toContain('<button')
    expect(html).toMatch(/<li[^>]*aria-current="true"/)
  })

  it('is the default context outside a group', () => {
    const html = renderToString(<ListItem title="Ada" selected onTap={() => {}} />)
    expect(html).toContain('data-context="navigation"')
    expect(html).toContain('aria-current="true"')
  })
})

describe('ListItem (SSR) — listbox context', () => {
  const listbox = (ui: React.ReactNode, props: Record<string, unknown> = {}) =>
    renderToString(
      <ListItemGroup context="listbox" aria-label="People" {...props}>
        {ui}
      </ListItemGroup>,
    )

  it('renders a labelled listbox of options with aria-selected', () => {
    const html = listbox(
      <>
        <ListItem title="Ada" selected />
        <ListItem title="Grace" />
      </>,
    )
    expect(html).toMatch(/^<ul[^>]*role="listbox"/)
    expect(html).toContain('aria-label="People"')
    expect(count(html, /role="option"/g)).toBe(2)
    expect(count(html, /aria-selected="true"/g)).toBe(1)
    expect(count(html, /aria-selected="false"/g)).toBe(1)
    expect(html).not.toContain('aria-current')
  })

  it('contains no nested interactive elements', () => {
    const html = listbox(<ListItem title="Ada" trailing="3" onTap={() => {}} />)
    expect(html).not.toContain('<button')
  })

  it('does not render an action inside an option', () => {
    const html = listbox(<ListItem title="Ada" action={<ListItemAction aria-label="Remove">x</ListItemAction>} />)
    expect(html).not.toContain('list-item-action')
  })

  it('makes the selected option the tab stop before hydration', () => {
    const html = listbox(
      <>
        <ListItem title="Ada" id="a" />
        <ListItem title="Grace" id="g" selected />
      </>,
    )
    expect(html).toMatch(/id="a" tabindex="-1"/)
    expect(html).toMatch(/id="g" tabindex="0"/)
  })

  it('sets aria-multiselectable when asked', () => {
    expect(listbox(<ListItem title="Ada" />, { multiselectable: true })).toContain('aria-multiselectable="true"')
  })

  it('uses semanticLabel as the option name', () => {
    expect(listbox(<ListItem title="Ada" semanticLabel="Ada Lovelace" />)).toMatch(
      /<li[^>]*aria-label="Ada Lovelace"/,
    )
  })

  it('a row context prop overrides the group context', () => {
    const html = listbox(<ListItem title="Ada" context="navigation" selected onTap={() => {}} />)
    expect(html).toContain('aria-current="true"')
    expect(html).not.toContain('role="option"')
  })
})

describe('ListItemAction (SSR)', () => {
  it('is a 44px type="button" with an accessible name and focus ring', () => {
    const html = renderToString(<ListItemAction aria-label="More">…</ListItemAction>)
    expect(html).toContain('type="button"')
    expect(html).toContain('aria-label="More"')
    expect(html).toContain('size-11')
    expect(html).toContain('focus-visible:ring-2')
  })
})
