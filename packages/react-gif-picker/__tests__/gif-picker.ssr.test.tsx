import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { GifPicker, type GifPickerItem, type GifPickerProps } from '../src/index.js'

function gif(id: string, overrides: Partial<GifPickerItem> = {}): GifPickerItem {
  return {
    id,
    previewUrl: `https://media.example/${id}/still.png`,
    animatedUrl: `https://media.example/${id}/anim.gif`,
    width: 320,
    height: 180,
    alt: `Alt ${id}`,
    ...overrides,
  }
}

const RESULTS = [gif('a'), gif('b', { badge: 'In review' }), gif('c', { title: 'Cee' })]

function render(props: Partial<GifPickerProps> = {}): string {
  return renderToString(<GifPicker results={RESULTS} onSelect={() => {}} {...props} />)
}

/** Every opening `<button …>` tag in the markup. */
function buttons(html: string): string[] {
  return html.match(/<button[^>]*>/g) ?? []
}

describe('GifPicker (SSR)', () => {
  it('renders a labelled group with a search box and the three tabs', () => {
    const html = render()
    expect(html).toContain('role="group"')
    expect(html).toContain('aria-label="GIF picker"')
    expect(html).toMatch(/<input[^>]*type="search"[^>]*aria-label="Search GIFs"/)
    expect(html).toContain('placeholder="Search GIFs…"')
    expect(html).toContain('role="tablist"')
    const tabs = html.match(/role="tab"[^>]*>[^<]*/g) ?? []
    expect(tabs).toHaveLength(3)
    expect(html).toMatch(/aria-selected="true"[^>]*>Popular</)
    expect(html).toContain('>Recent<')
    expect(html).toContain('>Yours<')
    expect(html).toContain('role="tabpanel"')
  })

  it('honours defaultTab, a tab subset and label overrides', () => {
    const html = render({
      tabs: ['yours', 'recent'],
      defaultTab: 'recent',
      labels: { tabs: { yours: 'Mine' }, search: 'Find a GIF' },
    })
    expect(html).not.toContain('>Popular<')
    expect(html.indexOf('>Mine<')).toBeLessThan(html.indexOf('>Recent<'))
    expect(html).toMatch(/aria-selected="true"[^>]*>Recent</)
    expect(html).toContain('aria-label="Find a GIF"')
    expect(html).toContain('data-tab="recent"')
  })

  it('renders each item as a button named by its alt text and badge', () => {
    const html = render()
    expect(html).toContain('aria-label="GIF results"')
    expect(html).toContain('aria-label="Alt a"')
    expect(html).toContain('aria-label="Alt b (In review)"')
    expect(html).toContain('title="Cee"')
    // The badge is visible text; it is already in the accessible name.
    expect(html).toMatch(/<span[^>]*aria-hidden="true"[^>]*>In review<\/span>/)
  })

  it('uses a roving tab stop: only the first item is tabbable', () => {
    const items = buttons(render()).filter((b) => b.includes('data-gif-id'))
    expect(items).toHaveLength(3)
    expect(items[0]).toContain('tabindex="0"')
    expect(items[1]).toContain('tabindex="-1"')
    expect(items[2]).toContain('tabindex="-1"')
  })

  it('lazy-loads images that keep their aspect ratio', () => {
    const html = render()
    expect(html).toMatch(/<img[^>]*loading="lazy"/)
    expect(html).toMatch(/<img[^>]*width="320"[^>]*height="180"/)
    expect(html).toContain('aspect-ratio:320 / 180')
    expect(html).toContain('grid-template-columns:repeat(3, minmax(0, 1fr))')
  })

  it('shows animated images with a reduced-motion still source by default', () => {
    const html = render()
    expect(html).toContain('src="https://media.example/a/anim.gif"')
    expect(html).toMatch(
      /<source media="\(prefers-reduced-motion: reduce\)" srcSet="https:\/\/media.example\/a\/still.png"/,
    )
  })

  it('shows only still images when reducedMotion is set', () => {
    const html = render({ reducedMotion: true })
    expect(html).toContain('src="https://media.example/a/still.png"')
    expect(html).not.toContain('anim.gif')
    expect(html).not.toContain('<source')
  })

  it('honours the columns prop', () => {
    expect(render({ columns: 2 })).toContain('grid-template-columns:repeat(2, minmax(0, 1fr))')
  })

  it('drops items whose sources are unsafe', () => {
    const html = render({
      results: [gif('ok'), gif('bad', { previewUrl: 'javascript:alert(1)', animatedUrl: 'javascript:1' })],
    })
    expect(html).toContain('data-gif-id="ok"')
    expect(html).not.toContain('data-gif-id="bad"')
    expect(html).not.toContain('javascript:')
  })

  it('announces the result count in a polite live region', () => {
    expect(render()).toMatch(/role="status" aria-live="polite" aria-atomic="true"[^>]*>3 GIFs</)
  })

  it('shows the tab empty state, or a no-match message for a query', () => {
    expect(render({ results: [], defaultTab: 'recent' })).toContain('GIFs you send will appear here.')
    expect(render({ results: [], defaultQuery: 'zebra' })).toContain('No GIFs match “zebra”.')
    const custom = render({ results: [], emptyState: <strong>Upload one</strong> })
    expect(custom).toContain('<strong>Upload one</strong>')
  })

  it('shows skeleton cells, aria-busy and a loading announcement while loading', () => {
    const html = render({ results: [], status: 'loading' })
    expect(html).toMatch(/data-gif-skeleton=""/)
    expect(html).toMatch(/aria-hidden="true"[^>]*data-gif-skeleton/)
    expect(html).toContain('aria-busy="true"')
    expect(html).toContain('Loading GIFs…')
    expect(html).toContain('motion-safe:animate-pulse')
  })

  it('shows the error state with a retry button only when onRetry is given', () => {
    const withRetry = render({ results: [], status: 'error', onRetry: () => {} })
    expect(withRetry).toContain('GIFs could not be loaded.')
    expect(withRetry).toContain('>Try again</button>')
    const without = render({ results: [], status: 'error' })
    expect(without).not.toContain('Try again')
  })

  it('keeps results on screen while more load or after a load-more failure', () => {
    const loading = render({ status: 'loading', hasMore: true, onLoadMore: () => {} })
    expect(loading).toContain('data-gif-id="a"')
    expect(loading).toContain('Loading more GIFs…')
    expect(loading).toMatch(/<button[^>]*disabled=""[^>]*>Load more<\/button>/)

    const failed = render({ status: 'error', hasMore: true, onLoadMore: () => {}, onRetry: () => {} })
    expect(failed).toContain('data-gif-id="a"')
    expect(failed).toContain('Try again')
    expect(failed).not.toContain('Load more')
  })

  it('shows load more only with hasMore and onLoadMore', () => {
    expect(render({ hasMore: true, onLoadMore: () => {} })).toContain('>Load more</button>')
    expect(render({ hasMore: true })).not.toContain('Load more')
    expect(render({ onLoadMore: () => {} })).not.toContain('Load more')
  })

  it('renders the attribution slot in the footer', () => {
    const html = render({ attribution: <span>Powered by Example</span> })
    expect(html).toContain('<span>Powered by Example</span>')
    expect(render()).not.toContain('Powered by')
  })

  it('applies size and className and passes through DOM props', () => {
    const html = render({ size: 'lg', className: 'custom-x', id: 'picker-1' })
    expect(html).toContain('max-w-md')
    expect(html).toContain('custom-x')
    expect(html).toContain('id="picker-1"')
  })

  it('gives every interactive part the focus-visible ring and 44px action targets', () => {
    const html = render({ hasMore: true, onLoadMore: () => {} })
    for (const button of buttons(html)) {
      expect(button).toContain('focus-visible:ring-2')
    }
    expect(html).toMatch(/<button[^>]*min-h-11[^>]*>Load more/)
    expect(html).toMatch(/<input[^>]*focus-visible:ring-2/)
  })
})
