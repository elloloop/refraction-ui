import { describe, it, expect, vi, afterEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { LinkPreview, type LinkPreviewProps } from '../src/index.js'

// SSR structure + ARIA (node env). Layout, line clamping and the lazy image's
// real loading are not observable here.

const metadata: LinkPreviewProps = {
  url: 'https://www.github.com/acme/repo/releases/tag/v2.0.0',
  siteName: 'GitHub',
  siteIcon: 'https://github.com/favicon.ico',
  title: 'v2.0.0 release notes',
  description: 'Faster builds and a new plugin API.',
  image: { src: 'https://example.com/og.png', width: 1200, height: 600 },
}

function render(props: Partial<LinkPreviewProps> = {}): string {
  return renderToString(<LinkPreview {...metadata} {...props} />)
}

/** Extract one element's opening tag by a marker it contains. */
function openingTag(html: string, marker: string): string {
  const index = html.indexOf(marker)
  if (index === -1) throw new Error(`${marker} not found in ${html}`)
  const start = html.lastIndexOf('<', index)
  return html.slice(start, html.indexOf('>', index) + 1)
}

function attr(tag: string, name: string): string | undefined {
  const match = new RegExp(`\\s${name}="([^"]*)"`).exec(tag)
  return match?.[1]
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('LinkPreview (SSR)', () => {
  it('renders one safe link with the normalised href', () => {
    const html = render()
    expect(html.match(/<a\s/g)).toHaveLength(1)
    const link = openingTag(html, '<a ')
    expect(attr(link, 'href')).toBe('https://www.github.com/acme/repo/releases/tag/v2.0.0')
    expect(attr(link, 'rel')).toBe('noopener noreferrer nofollow')
    expect(attr(link, 'target')).toBe('_blank')
  })

  it('names the link by title and site, and describes it by host and description', () => {
    const html = render()
    const link = openingTag(html, '<a ')
    expect(attr(link, 'aria-label')).toBe('v2.0.0 release notes, GitHub, opens in a new tab')
    const describedBy = attr(link, 'aria-describedby')?.split(' ') ?? []
    expect(describedBy).toHaveLength(2)
    const [hostId, descriptionId] = describedBy
    expect(html).toContain(`id="${hostId}" class="truncate">github.com</span>`)
    expect(openingTag(html, `id="${descriptionId}"`)).toContain('line-clamp-3')
    expect(html).toContain('Faster builds and a new plugin API.</span>')
  })

  it('honours a custom target and new-tab hint', () => {
    expect(attr(openingTag(render({ target: '_self' }), '<a '), 'aria-label')).toBe(
      'v2.0.0 release notes, GitHub',
    )
    expect(attr(openingTag(render({ newTabLabel: '' }), '<a '), 'aria-label')).toBe(
      'v2.0.0 release notes, GitHub',
    )
  })

  it('lazy-loads the image inside a fixed aspect box', () => {
    const html = render()
    const media = openingTag(html, 'data-link-preview-media')
    expect(media).toContain('aspect-ratio:2')
    const img = openingTag(html, 'src="https://example.com/og.png"')
    expect(attr(img, 'loading')).toBe('lazy')
    expect(attr(img, 'alt')).toBe('')
    expect(attr(img, 'width')).toBe('1200')
    expect(attr(img, 'height')).toBe('600')
  })

  it('hides the site icon and the separator from assistive tech', () => {
    const html = render()
    const icon = openingTag(html, 'src="https://github.com/favicon.ico"')
    expect(attr(icon, 'aria-hidden')).toBe('true')
    expect(attr(icon, 'alt')).toBe('')
    expect(html).toContain('<span aria-hidden="true" class="shrink-0">·</span>')
  })

  it('exposes variant and image hooks on the root and switches layout', () => {
    const full = openingTag(render(), 'data-slot="link-preview"')
    expect(attr(full, 'data-variant')).toBe('full')
    expect(attr(full, 'data-has-image')).toBe('true')

    const html = render({ variant: 'compact', className: 'my-preview' })
    const root = openingTag(html, 'data-slot="link-preview"')
    expect(attr(root, 'data-variant')).toBe('compact')
    expect(attr(root, 'class')).toContain('my-preview')
    expect(attr(openingTag(html, '<a '), 'class')).toContain('flex-row')
    expect(openingTag(html, 'data-link-preview-media')).toContain('aspect-ratio:1')
  })

  it('falls back to the host when there is no title or site name', () => {
    const html = renderToString(<LinkPreview url="https://example.com/page" />)
    const link = openingTag(html, '<a ')
    expect(attr(link, 'aria-label')).toBe('example.com, opens in a new tab')
    expect(link).not.toContain('aria-describedby')
    expect(html).toContain('>example.com</span>')
    expect(html).not.toContain('<img')
    expect(html).not.toContain('<button')
  })

  it.each(['javascript:alert(1)', 'data:text/html,hi', 'mailto:a@b.c', 'nope'])(
    'renders nothing for %s',
    (url) => {
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      expect(render({ url })).toBe('')
    },
  )

  it('renders the dismiss button as a sibling of the link, not inside it', () => {
    const html = render({ onDismiss: () => {} })
    const linkEnd = html.indexOf('</a>')
    const buttonStart = html.indexOf('<button')
    expect(buttonStart).toBeGreaterThan(linkEnd)
    const button = openingTag(html, '<button')
    expect(attr(button, 'aria-label')).toBe('Remove preview')
    expect(attr(button, 'type')).toBe('button')
    expect(attr(button, 'class')).toContain('absolute')
  })

  it('uses a custom dismiss label and reserves text space only where needed', () => {
    const compact = render({ variant: 'compact', onDismiss: () => {}, dismissLabel: 'Hide' })
    expect(attr(openingTag(compact, '<button'), 'aria-label')).toBe('Hide')
    expect(compact).toContain('pe-12')
    expect(render({ onDismiss: () => {} })).not.toContain('pe-12')
  })

  it('passes native attributes to the root', () => {
    const root = openingTag(render({ id: 'preview-1', lang: 'en' }), 'data-slot="link-preview"')
    expect(attr(root, 'id')).toBe('preview-1')
    expect(attr(root, 'lang')).toBe('en')
  })
})
