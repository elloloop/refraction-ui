import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import {
  CollapsibleRail,
  RailBackdrop,
  RailEdgeToggle,
  useCollapsibleRail,
  type UseCollapsibleRailOptions,
} from '../src/index.js'

/** The opening tag of the first element carrying `data-slot="<slot>"`. */
function tag(html: string, slot: string): string {
  const open = html.match(new RegExp(`<[a-z]+\\b[^>]*data-slot="${slot}"[^>]*>`))?.[0]
  if (!open) throw new Error(`no ${slot} in ${html}`)
  return open
}

/** A rail driven by the hook, as a consumer wires it. */
function Harness(options: UseCollapsibleRailOptions) {
  const rail = useCollapsibleRail(options)
  const { collapsed, open, mobile } = rail.state
  return (
    <CollapsibleRail collapsed={collapsed} open={open} mobile={mobile} onClick={rail.onChromeClick}>
      <RailEdgeToggle collapsed={collapsed} open={open} onClick={rail.toggle} />
      <nav aria-label="Main">
        <a href="/home">Home</a>
      </nav>
    </CollapsibleRail>
  )
}

describe('CollapsibleRail (SSR)', () => {
  it('renders an aside at the full width by default', () => {
    const html = renderToString(<CollapsibleRail collapsed={false} open />)
    const root = tag(html, 'collapsible-rail')
    expect(root.startsWith('<aside')).toBe(true)
    expect(root).toContain('data-collapsed="false"')
    expect(root).toContain('data-open="true"')
    expect(root).toContain('data-mobile="false"')
    expect(root).toContain('width:14rem')
  })

  it('uses the collapsed width and merges className, style and other attributes', () => {
    const html = renderToString(
      <CollapsibleRail
        collapsed
        open
        collapsedWidth="64px"
        className="bg-tertiary"
        style={{ minWidth: 0 }}
        aria-label="Primary"
        id="rail"
      />,
    )
    const root = tag(html, 'collapsible-rail')
    expect(root).toContain('width:64px')
    expect(root).toContain('min-width:0')
    expect(root).toMatch(/class="[^"]*bg-tertiary"/)
    expect(root).toContain('aria-label="Primary"')
    expect(root).toContain('id="rail"')
  })

  it('keeps a closed overlay off screen on a narrow viewport', () => {
    const root = tag(renderToString(<CollapsibleRail collapsed open={false} mobile />), 'collapsible-rail')
    expect(root).toContain('[@media(max-width:767px)]:-translate-x-full')
    expect(root).toContain('data-open="false"')
  })

  it('names the edge control for the action it performs', () => {
    const expand = tag(renderToString(<RailEdgeToggle collapsed open />), 'rail-edge-toggle')
    expect(expand).toContain('type="button"')
    expect(expand).toContain('aria-label="Expand navigation"')
    expect(expand).toContain('title="Expand navigation"')
    expect(expand).toContain('aria-expanded="false"')
    const collapse = tag(
      renderToString(
        <RailEdgeToggle collapsed={false} open collapseLabel="Collapse to icons" tone="tertiary" />,
      ),
      'rail-edge-toggle',
    )
    expect(collapse).toContain('aria-label="Collapse to icons"')
    expect(collapse).toContain('aria-expanded="true"')
    expect(collapse).toContain('bg-tertiary')
  })

  it('hides the chevron from assistive tech and mirrors it in right-to-left text', () => {
    const html = renderToString(<RailEdgeToggle collapsed open={false} />)
    expect(tag(html, 'rail-edge-toggle')).toContain('[@media(max-width:767px)]:hidden')
    expect(html).toMatch(/<svg[^>]*aria-hidden="true"[^>]*class="[^"]*rtl:-scale-x-100/)
  })

  it('renders the backdrop as a named button', () => {
    const backdrop = tag(
      renderToString(<RailBackdrop aria-label="Close navigation" className="bg-black/60" />),
      'rail-backdrop',
    )
    expect(backdrop).toContain('type="button"')
    expect(backdrop).toContain('aria-label="Close navigation"')
    expect(backdrop).toMatch(/class="[^"]*bg-black\/60"/)
  })
})

describe('useCollapsibleRail (SSR)', () => {
  it('server-renders a closed overlay, so a phone never paints the rail over the page', () => {
    const root = tag(renderToString(<Harness />), 'collapsible-rail')
    expect(root).toContain('data-open="false"')
    expect(root).toContain('[@media(max-width:767px)]:-translate-x-full')
    expect(root).not.toContain('inert')
  })

  it('server-renders the default width', () => {
    expect(tag(renderToString(<Harness />), 'collapsible-rail')).toContain('data-collapsed="false"')
    const collapsed = tag(renderToString(<Harness defaultCollapsed />), 'collapsible-rail')
    expect(collapsed).toContain('data-collapsed="true"')
    expect(collapsed).toContain('width:4rem')
  })
})
