import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { RefractionComposer, type RefractionComposerProps } from '../src/index.js'

const render = (props: RefractionComposerProps = {}) =>
  renderToString(React.createElement(RefractionComposer, props))

describe('RefractionComposer surface variant (SSR)', () => {
  it('defaults to the outlined surface (background fill)', () => {
    const html = render({ placeholder: 'hi' })
    expect(html).toContain('bg-background')
  })

  it('renders the filled surface fill when surface="filled"', () => {
    const html = render({ surface: 'filled', placeholder: 'hi' })
    expect(html).toContain('bg-muted/50')
  })

  it('keeps a tasteful focus-visible ring on the pill', () => {
    const html = render({ placeholder: 'hi' })
    expect(html).toContain('focus-within:ring-ring')
  })
})

describe('RefractionComposer accessory panel (SSR)', () => {
  it('renders no toggle and no panel when accessoryPanel is absent', () => {
    const html = render({ placeholder: 'hi' })
    expect(html).not.toContain('Emoji and stickers')
  })

  it('renders the toggle button (collapsed) when accessoryPanel is provided', () => {
    const html = render({
      placeholder: 'hi',
      accessoryPanel: React.createElement('div', null, 'PANEL_CONTENT'),
    })
    expect(html).toContain('aria-label="Emoji and stickers"')
    expect(html).toContain('aria-expanded="false"')
    // Panel is closed by default, so its content is not in the DOM.
    expect(html).not.toContain('PANEL_CONTENT')
  })

  it('renders the panel INLINE (not portaled) when open, with the field still present', () => {
    const html = render({
      placeholder: 'hi',
      accessoryPanel: React.createElement('div', null, 'PANEL_CONTENT'),
      defaultAccessoryPanelOpen: true,
    })
    expect(html).toContain('aria-expanded="true"')
    expect(html).toContain('PANEL_CONTENT')
    // Inline: the panel markup is inside the composer's own form landmark and
    // the textarea (the message in progress) is still rendered alongside it.
    expect(html).toContain('<textarea')
    const formStart = html.indexOf('role="form"')
    const panelIndex = html.indexOf('PANEL_CONTENT')
    expect(formStart).toBeGreaterThanOrEqual(0)
    expect(panelIndex).toBeGreaterThan(formStart)
  })
})
