import { describe, it, expect } from 'vitest'
import {
  createLinkPreview,
  parseLinkPreviewUrl,
  getLinkPreviewHost,
  normalizeLinkPreviewText,
  resolveLinkPreviewAspectRatio,
  linkPreviewOpensNewContext,
  getLinkPreviewAccessibleName,
  shouldShowLinkPreviewHost,
  getLinkPreviewDescribedBy,
  shouldReserveLinkPreviewDismissSpace,
  linkPreviewBodyVariants,
  linkPreviewCardVariants,
  linkPreviewMediaVariants,
  linkPreviewTitleVariants,
  linkPreviewDescriptionVariants,
  LINK_PREVIEW_REL,
  LINK_PREVIEW_DEFAULT_TARGET,
  LINK_PREVIEW_DEFAULT_NEW_TAB_LABEL,
  LINK_PREVIEW_DEFAULT_ASPECT_RATIO,
  LINK_PREVIEW_MIN_ASPECT_RATIO,
  LINK_PREVIEW_MAX_ASPECT_RATIO,
  LINK_PREVIEW_COMPACT_ASPECT_RATIO,
} from '../src/index.js'

function hostOf(url: string): string {
  const parsed = parseLinkPreviewUrl(url)
  if (!parsed) throw new Error(`expected ${url} to parse`)
  return getLinkPreviewHost(parsed)
}

describe('parseLinkPreviewUrl', () => {
  it.each(['https://example.com', 'http://example.com/a?b=c#d', '  https://example.com/  '])(
    'accepts %s',
    (url) => {
      expect(parseLinkPreviewUrl(url)).toBeInstanceOf(URL)
    },
  )

  it.each([
    'javascript:alert(1)',
    'JavaScript:alert(1)',
    ' javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    'mailto:a@example.com',
    'ftp://example.com',
    'file:///etc/passwd',
    '//example.com',
    '/relative/path',
    'example.com',
    '',
    '   ',
  ])('rejects %s', (url) => {
    expect(parseLinkPreviewUrl(url)).toBeNull()
  })

  it('rejects non-strings', () => {
    expect(parseLinkPreviewUrl(undefined)).toBeNull()
    expect(parseLinkPreviewUrl(null)).toBeNull()
  })

  it('normalises and percent-encodes the href', () => {
    expect(parseLinkPreviewUrl('HTTPS://Example.COM/a b')?.href).toBe('https://example.com/a%20b')
  })
})

describe('getLinkPreviewHost', () => {
  it('strips a leading www.', () => {
    expect(hostOf('https://www.example.com/page')).toBe('example.com')
  })

  it('keeps other subdomains and a www that is not a prefix', () => {
    expect(hostOf('https://docs.example.com')).toBe('docs.example.com')
    expect(hostOf('https://wwwexample.com')).toBe('wwwexample.com')
  })

  it('keeps a non-default port and drops the default one', () => {
    expect(hostOf('http://localhost:3000/x')).toBe('localhost:3000')
    expect(hostOf('https://example.com:443/x')).toBe('example.com')
  })

  it('never shows credentials, path or query', () => {
    expect(hostOf('https://user:pass@example.com/secret?token=1')).toBe('example.com')
  })

  it('shows internationalised domains in the parser’s punycode form', () => {
    expect(hostOf('https://münchen.de')).toBe('xn--mnchen-3ya.de')
  })
})

describe('normalizeLinkPreviewText', () => {
  it('trims and drops blank values', () => {
    expect(normalizeLinkPreviewText('  hi ')).toBe('hi')
    expect(normalizeLinkPreviewText('   ')).toBeUndefined()
    expect(normalizeLinkPreviewText(undefined)).toBeUndefined()
    expect(normalizeLinkPreviewText(null)).toBeUndefined()
  })
})

describe('resolveLinkPreviewAspectRatio', () => {
  it('is square for compact regardless of the image', () => {
    expect(resolveLinkPreviewAspectRatio('compact', { width: 1200, height: 630 })).toBe(
      LINK_PREVIEW_COMPACT_ASPECT_RATIO,
    )
  })

  it('follows the image size for full', () => {
    expect(resolveLinkPreviewAspectRatio('full', { width: 1600, height: 900 })).toBeCloseTo(16 / 9)
  })

  it('falls back to the Open Graph ratio without a usable size', () => {
    for (const image of [
      undefined,
      {},
      { width: 100 },
      { width: 0, height: 100 },
      { width: -1, height: 100 },
      { width: Number.NaN, height: 100 },
      { width: 100, height: Number.POSITIVE_INFINITY },
    ]) {
      expect(resolveLinkPreviewAspectRatio('full', image)).toBe(LINK_PREVIEW_DEFAULT_ASPECT_RATIO)
    }
  })

  it('clamps portrait and banner images', () => {
    expect(resolveLinkPreviewAspectRatio('full', { width: 300, height: 900 })).toBe(
      LINK_PREVIEW_MIN_ASPECT_RATIO,
    )
    expect(resolveLinkPreviewAspectRatio('full', { width: 5000, height: 100 })).toBe(
      LINK_PREVIEW_MAX_ASPECT_RATIO,
    )
  })
})

describe('linkPreviewOpensNewContext', () => {
  it('is true for _blank and named targets', () => {
    expect(linkPreviewOpensNewContext('_blank')).toBe(true)
    expect(linkPreviewOpensNewContext('docs')).toBe(true)
  })

  it('is false for same-context targets and no target', () => {
    for (const target of [undefined, '_self', '_parent', '_top']) {
      expect(linkPreviewOpensNewContext(target)).toBe(false)
    }
  })
})

describe('getLinkPreviewAccessibleName', () => {
  it('is title then site name', () => {
    expect(
      getLinkPreviewAccessibleName({ title: 'Release notes', siteName: 'GitHub', host: 'github.com' }),
    ).toBe('Release notes, GitHub')
  })

  it('uses the host as the site when there is no site name', () => {
    expect(getLinkPreviewAccessibleName({ title: 'Release notes', host: 'github.com' })).toBe(
      'Release notes, github.com',
    )
  })

  it('uses the host as the title when there is no title, without repeating it', () => {
    expect(getLinkPreviewAccessibleName({ host: 'github.com' })).toBe('github.com')
    expect(getLinkPreviewAccessibleName({ siteName: 'GitHub', host: 'github.com' })).toBe(
      'github.com, GitHub',
    )
  })

  it('appends the new-tab hint, ignoring a blank one', () => {
    expect(
      getLinkPreviewAccessibleName({ title: 'T', host: 'a.com', newTabLabel: 'opens in a new tab' }),
    ).toBe('T, a.com, opens in a new tab')
    expect(getLinkPreviewAccessibleName({ title: 'T', host: 'a.com', newTabLabel: ' ' })).toBe(
      'T, a.com',
    )
  })
})

describe('shouldShowLinkPreviewHost / getLinkPreviewDescribedBy', () => {
  it('gives the host its own slot only when title and site name both exist', () => {
    expect(shouldShowLinkPreviewHost(true, true)).toBe(true)
    expect(shouldShowLinkPreviewHost(true, false)).toBe(false)
    expect(shouldShowLinkPreviewHost(false, true)).toBe(false)
    expect(shouldShowLinkPreviewHost(false, false)).toBe(false)
  })

  it('lists host then description ids, skipping missing ones', () => {
    const ids = { hostId: 'h', descriptionId: 'd' }
    expect(getLinkPreviewDescribedBy({ ...ids, includeHost: true, hasDescription: true })).toBe('h d')
    expect(getLinkPreviewDescribedBy({ ...ids, includeHost: false, hasDescription: true })).toBe('d')
    expect(getLinkPreviewDescribedBy({ ...ids, includeHost: true, hasDescription: false })).toBe('h')
    expect(getLinkPreviewDescribedBy({ ...ids, includeHost: false, hasDescription: false })).toBeUndefined()
    expect(getLinkPreviewDescribedBy({ includeHost: true, hasDescription: true })).toBeUndefined()
  })
})

describe('shouldReserveLinkPreviewDismissSpace', () => {
  it('only reserves space when the button would cover text', () => {
    expect(shouldReserveLinkPreviewDismissSpace('compact', false, true)).toBe(false)
    expect(shouldReserveLinkPreviewDismissSpace('compact', true, true)).toBe(true)
    expect(shouldReserveLinkPreviewDismissSpace('full', true, true)).toBe(false)
    expect(shouldReserveLinkPreviewDismissSpace('full', true, false)).toBe(true)
  })
})

describe('createLinkPreview', () => {
  const metadata = {
    url: 'https://www.github.com/acme/repo/releases',
    siteName: 'GitHub',
    siteIcon: 'https://github.com/favicon.ico',
    title: 'v2.0.0 release notes',
    description: 'Faster builds and a new plugin API.',
    image: { src: 'https://example.com/og.png', width: 1200, height: 600, alt: '' },
  }

  it('returns null for unsafe or invalid URLs', () => {
    expect(createLinkPreview({ ...metadata, url: 'javascript:alert(1)' })).toBeNull()
    expect(createLinkPreview({ ...metadata, url: 'not a url' })).toBeNull()
  })

  it('builds safe link attributes with the default target', () => {
    const api = createLinkPreview(metadata)
    expect(api?.linkProps).toMatchObject({
      href: 'https://www.github.com/acme/repo/releases',
      target: LINK_PREVIEW_DEFAULT_TARGET,
      rel: LINK_PREVIEW_REL,
      'aria-label': `v2.0.0 release notes, GitHub, ${LINK_PREVIEW_DEFAULT_NEW_TAB_LABEL}`,
    })
    expect(LINK_PREVIEW_REL).toBe('noopener noreferrer nofollow')
  })

  it('drops the new-tab hint for a same-tab target and honours a custom hint', () => {
    expect(createLinkPreview({ ...metadata, target: '_self' })?.linkProps['aria-label']).toBe(
      'v2.0.0 release notes, GitHub',
    )
    expect(
      createLinkPreview({ ...metadata, newTabLabel: 'nouvel onglet' })?.linkProps['aria-label'],
    ).toBe('v2.0.0 release notes, GitHub, nouvel onglet')
  })

  it('describes the link by host and description ids', () => {
    const api = createLinkPreview({ ...metadata, hostId: 'h', descriptionId: 'd' })
    expect(api?.linkProps['aria-describedby']).toBe('h d')
    expect(api?.showHost).toBe(true)
  })

  it('omits aria-describedby when there is nothing to describe', () => {
    const api = createLinkPreview({ url: 'https://a.com', hostId: 'h', descriptionId: 'd' })
    expect(api?.linkProps).not.toHaveProperty('aria-describedby')
  })

  it('resolves visible text fallbacks', () => {
    const full = createLinkPreview(metadata)
    expect(full).toMatchObject({ host: 'github.com', title: 'v2.0.0 release notes', siteLabel: 'GitHub' })

    const noSite = createLinkPreview({ url: metadata.url, title: 'T' })
    expect(noSite).toMatchObject({ title: 'T', siteLabel: 'github.com', showHost: false })

    const bare = createLinkPreview({ url: metadata.url, title: '  ', description: ' ' })
    expect(bare).toMatchObject({ title: 'github.com', siteLabel: undefined, description: undefined })
  })

  it('drops an image with a blank src and sizes the box from the image', () => {
    expect(createLinkPreview({ ...metadata, image: { src: ' ' } })?.image).toBeUndefined()
    const api = createLinkPreview(metadata)
    expect(api?.aspectRatio).toBe(2)
    expect(api?.dataAttributes).toEqual({
      'data-slot': 'link-preview',
      'data-variant': 'full',
      'data-has-image': 'true',
    })
  })

  it('reserves dismiss space per variant', () => {
    expect(createLinkPreview({ ...metadata, dismissible: true })?.reserveDismissSpace).toBe(false)
    expect(
      createLinkPreview({ ...metadata, dismissible: true, variant: 'compact' })?.reserveDismissSpace,
    ).toBe(true)
    expect(
      createLinkPreview({ ...metadata, dismissible: true, image: undefined })?.reserveDismissSpace,
    ).toBe(true)
  })

  it('is deterministic', () => {
    expect(createLinkPreview(metadata)).toEqual(createLinkPreview(metadata))
  })
})

describe('styles', () => {
  it('card carries the focus-visible ring and stops motion under reduced motion', () => {
    const classes = linkPreviewCardVariants()
    expect(classes).toContain('focus-visible:ring-2')
    expect(classes).toContain('focus-visible:ring-ring')
    expect(classes).toContain('motion-reduce:transition-none')
  })

  it('switches layout, clamp and padding by variant', () => {
    expect(linkPreviewCardVariants({ variant: 'compact' })).toContain('flex-row')
    expect(linkPreviewCardVariants({ variant: 'full' })).toContain('flex-col')
    expect(linkPreviewMediaVariants({ variant: 'compact' })).toContain('w-16')
    expect(linkPreviewTitleVariants({ variant: 'compact' })).toContain('line-clamp-1')
    expect(linkPreviewDescriptionVariants({ variant: 'full' })).toContain('line-clamp-3')
    expect(linkPreviewBodyVariants({ variant: 'compact', reserveDismissSpace: 'true' })).toContain('pe-12')
    expect(linkPreviewBodyVariants({ variant: 'full' })).toContain('p-4')
  })
})
