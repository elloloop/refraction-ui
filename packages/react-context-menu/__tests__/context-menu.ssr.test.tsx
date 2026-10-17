import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuGroup,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from '../src/index.js'

function renderMenu(open: boolean, subOpen = false): string {
  return renderToString(
    <ContextMenu defaultOpen={open}>
      <ContextMenuTrigger className="row">Message</ContextMenuTrigger>
      <ContextMenuContent aria-label="Message actions">
        <ContextMenuLabel>Actions</ContextMenuLabel>
        <ContextMenuGroup aria-label="Edit">
          <ContextMenuItem onSelect={() => {}}>
            Copy<ContextMenuShortcut>⌘C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem disabled>Paste</ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked>Show previews</ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem checked={false}>Mute</ContextMenuCheckboxItem>
        <ContextMenuRadioGroup value="all" aria-label="Notify">
          <ContextMenuRadioItem value="all">All messages</ContextMenuRadioItem>
          <ContextMenuRadioItem value="none">Nothing</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
        <ContextMenuSub defaultOpen={subOpen}>
          <ContextMenuSubTrigger>Move to</ContextMenuSubTrigger>
          <ContextMenuSubContent aria-label="Destinations">
            <ContextMenuItem>Archive</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>,
  )
}

describe('ContextMenu (SSR)', () => {
  it('renders only the trigger while closed', () => {
    const html = renderMenu(false)
    expect(html).toContain('Message')
    expect(html).toContain('data-state="closed"')
    expect(html).not.toContain('role="menu"')
  })

  it('renders an open menu inline with menu semantics', () => {
    const html = renderMenu(true)
    expect(html).toMatch(/role="menu"[^>]*aria-label="Message actions"|aria-label="Message actions"[^>]*role="menu"/)
    expect(html).toContain('aria-orientation="vertical"')
    expect(html).toContain('position:fixed')
  })

  it('renders items with menuitem roles, programmatic focus only', () => {
    const html = renderMenu(true)
    expect(html.match(/role="menuitem"/g)?.length).toBe(4) // Copy, Paste, Move to, Delete
    expect(html).toContain('tabindex="-1"')
    expect(html).not.toContain('tabindex="0"')
  })

  it('marks disabled items for assistive tech and styling', () => {
    expect(renderMenu(true)).toMatch(/aria-disabled="true"[^>]*data-disabled=""/)
  })

  it('reports checkbox and radio state with aria-checked', () => {
    const html = renderMenu(true)
    expect(html.match(/role="menuitemcheckbox"/g)?.length).toBe(2)
    expect(html.match(/role="menuitemradio"/g)?.length).toBe(2)
    expect(html.match(/aria-checked="true"/g)?.length).toBe(2)
    expect(html.match(/aria-checked="false"/g)?.length).toBe(2)
  })

  it('draws a check / dot glyph for checked rows, so state is not colour alone', () => {
    const html = renderMenu(true)
    expect(html).toContain('M20 6 9 17l-5-5')
    expect(html).toContain('<circle')
  })

  it('renders separators, groups, labels and shortcut hints', () => {
    const html = renderMenu(true)
    expect(html).toContain('role="separator"')
    expect(html.match(/role="group"/g)?.length).toBe(2)
    expect(html).toContain('Actions')
    expect(html).toContain('⌘C')
  })

  it('tags destructive items with a data-variant hook and the destructive tone', () => {
    const html = renderMenu(true)
    expect(html).toContain('data-variant="destructive"')
    expect(html).toContain('text-destructive')
  })

  it('links a closed sub-trigger as a collapsed menu popup', () => {
    const html = renderMenu(true)
    expect(html).toMatch(/aria-haspopup="menu"[^>]*aria-expanded="false"/)
    expect(html).not.toContain('Archive')
  })

  it('links an open sub-trigger to its submenu by id', () => {
    const html = renderMenu(true, true)
    const controls = html.match(/aria-controls="([^"]+)"/)?.[1]
    expect(controls).toBeTruthy()
    expect(html).toContain(`id="${controls}"`)
    expect(html).toContain('aria-expanded="true"')
    expect(html).toContain('Archive')
  })

  it('renders an asChild trigger as the child element', () => {
    const html = renderToString(
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <button type="button" className="mine">Row</button>
        </ContextMenuTrigger>
      </ContextMenu>,
    )
    expect(html).toMatch(/^<button[^>]*class="[^"]*mine/)
    expect(html).toContain('data-state="closed"')
  })

  it('throws a clear error outside <ContextMenu>', () => {
    expect(() => renderToString(<ContextMenuItem>Orphan</ContextMenuItem>)).toThrow(/within <ContextMenu>/)
  })
})
