import { describe, it, expect, beforeEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetIdCounter } from '@elloloop/shared'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../src/dropdown-menu.js'

beforeEach(() => {
  resetIdCounter()
})

describe('DropdownMenu (React SSR)', () => {
  it('renders trigger button with aria attributes', () => {
    const html = renderToString(
      React.createElement(
        DropdownMenu,
        null,
        React.createElement(DropdownMenuTrigger, null, 'Open'),
      ),
    )
    expect(html).toContain('<button')
    expect(html).toContain('Open')
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('aria-haspopup="menu"')
    expect(html).toContain('aria-controls')
  })

  it('renders trigger with aria-expanded true when open', () => {
    const html = renderToString(
      React.createElement(
        DropdownMenu,
        { open: true },
        React.createElement(DropdownMenuTrigger, null, 'Open'),
      ),
    )
    expect(html).toContain('aria-expanded="true"')
  })

  it('does not render content when closed', () => {
    const html = renderToString(
      React.createElement(
        DropdownMenu,
        null,
        React.createElement(DropdownMenuContent, null, 'Content'),
      ),
    )
    expect(html).not.toContain('role="menu"')
    expect(html).not.toContain('Content')
  })

  it('renders content with menu role when open', () => {
    const html = renderToString(
      React.createElement(
        DropdownMenu,
        { open: true },
        React.createElement(DropdownMenuContent, null, 'Menu Items'),
      ),
    )
    expect(html).toContain('role="menu"')
    expect(html).toContain('Menu Items')
    expect(html).toContain('data-state="open"')
  })

  it('renders menu item with menuitem role', () => {
    const html = renderToString(
      React.createElement(
        DropdownMenu,
        { open: true },
        React.createElement(
          DropdownMenuContent,
          null,
          React.createElement(DropdownMenuItem, null, 'Item 1'),
        ),
      ),
    )
    expect(html).toContain('role="menuitem"')
    expect(html).toContain('Item 1')
    expect(html).toContain('tabindex="0"')
  })

  it('renders disabled menu item', () => {
    const html = renderToString(
      React.createElement(
        DropdownMenu,
        { open: true },
        React.createElement(
          DropdownMenuContent,
          null,
          React.createElement(DropdownMenuItem, { disabled: true }, 'Disabled'),
        ),
      ),
    )
    expect(html).toContain('data-disabled=""')
    expect(html).toContain('aria-disabled="true"')
    expect(html).toContain('tabindex="-1"')
  })

  it('renders separator with separator role', () => {
    const html = renderToString(
      React.createElement(
        DropdownMenu,
        { open: true },
        React.createElement(
          DropdownMenuContent,
          null,
          React.createElement(DropdownMenuSeparator, null),
        ),
      ),
    )
    expect(html).toContain('role="separator"')
  })

  it('renders label', () => {
    const html = renderToString(
      React.createElement(
        DropdownMenu,
        { open: true },
        React.createElement(
          DropdownMenuContent,
          null,
          React.createElement(DropdownMenuLabel, null, 'My Label'),
        ),
      ),
    )
    expect(html).toContain('My Label')
    expect(html).toContain('font-semibold')
  })

  it('applies custom className to content', () => {
    const html = renderToString(
      React.createElement(
        DropdownMenu,
        { open: true },
        React.createElement(DropdownMenuContent, { className: 'my-menu' }, 'Custom'),
      ),
    )
    expect(html).toContain('my-menu')
  })

  it('applies custom className to item', () => {
    const html = renderToString(
      React.createElement(
        DropdownMenu,
        { open: true },
        React.createElement(
          DropdownMenuContent,
          null,
          React.createElement(DropdownMenuItem, { className: 'my-item' }, 'Custom Item'),
        ),
      ),
    )
    expect(html).toContain('my-item')
  })

  it('applies custom className to separator', () => {
    const html = renderToString(
      React.createElement(
        DropdownMenu,
        { open: true },
        React.createElement(
          DropdownMenuContent,
          null,
          React.createElement(DropdownMenuSeparator, { className: 'my-sep' }),
        ),
      ),
    )
    expect(html).toContain('my-sep')
  })

  it('renders complete dropdown menu composition', () => {
    const html = renderToString(
      React.createElement(
        DropdownMenu,
        { open: true },
        React.createElement(DropdownMenuTrigger, null, 'Actions'),
        React.createElement(
          DropdownMenuContent,
          null,
          React.createElement(DropdownMenuLabel, null, 'Actions'),
          React.createElement(DropdownMenuSeparator, null),
          React.createElement(DropdownMenuItem, null, 'Edit'),
          React.createElement(DropdownMenuItem, null, 'Delete'),
          React.createElement(DropdownMenuSeparator, null),
          React.createElement(DropdownMenuItem, { disabled: true }, 'Archive'),
        ),
      ),
    )
    expect(html).toContain('Actions')
    expect(html).toContain('Edit')
    expect(html).toContain('Delete')
    expect(html).toContain('Archive')
    expect(html).toContain('role="menu"')
    expect(html).toContain('role="menuitem"')
    expect(html).toContain('role="separator"')
  })

  it('throws when compound components used outside provider', () => {
    expect(() => {
      renderToString(
        React.createElement(DropdownMenuTrigger, null, 'Trigger'),
      )
    }).toThrow('DropdownMenu compound components must be used within <DropdownMenu>')
  })

  it('DropdownMenuLabel renders with label text', () => {
    const html = renderToString(
      React.createElement(
        DropdownMenu,
        { open: true },
        React.createElement(
          DropdownMenuContent,
          null,
          React.createElement(DropdownMenuLabel, null, 'File Actions'),
        ),
      ),
    )
    expect(html).toContain('File Actions')
    expect(html).toContain('font-semibold')
  })

  it('DropdownMenuSeparator renders as div with separator role', () => {
    const html = renderToString(
      React.createElement(
        DropdownMenu,
        { open: true },
        React.createElement(
          DropdownMenuContent,
          null,
          React.createElement(DropdownMenuSeparator, null),
        ),
      ),
    )
    expect(html).toContain('role="separator"')
    expect(html).toContain('h-px')
  })

  it('multiple DropdownMenuItems render correctly', () => {
    const html = renderToString(
      React.createElement(
        DropdownMenu,
        { open: true },
        React.createElement(
          DropdownMenuContent,
          null,
          React.createElement(DropdownMenuItem, null, 'Cut'),
          React.createElement(DropdownMenuItem, null, 'Copy'),
          React.createElement(DropdownMenuItem, null, 'Paste'),
        ),
      ),
    )
    expect(html).toContain('Cut')
    expect(html).toContain('Copy')
    expect(html).toContain('Paste')
    const matches = html.match(/role="menuitem"/g)
    expect(matches).toHaveLength(3)
  })

  it('custom className on content is merged with defaults', () => {
    const html = renderToString(
      React.createElement(
        DropdownMenu,
        { open: true },
        React.createElement(DropdownMenuContent, { className: 'custom-content-cls' }, 'Body'),
      ),
    )
    expect(html).toContain('custom-content-cls')
    // Should still have default content styles
    expect(html).toContain('z-50')
  })

  it('custom className on items is merged with defaults', () => {
    const html = renderToString(
      React.createElement(
        DropdownMenu,
        { open: true },
        React.createElement(
          DropdownMenuContent,
          null,
          React.createElement(DropdownMenuItem, { className: 'custom-item-cls' }, 'Action'),
        ),
      ),
    )
    expect(html).toContain('custom-item-cls')
    // Should still have default item styles
    expect(html).toContain('text-sm')
  })
})
