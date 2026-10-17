import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { VideoTile } from '../src/video-tile.js'

const render = (props: React.ComponentProps<typeof VideoTile>) =>
  renderToString(React.createElement(VideoTile, props))

describe('VideoTile (SSR)', () => {
  it('renders with role=group and aria-label of the participant name', () => {
    const html = render({ name: 'Maya Goldberg' })
    expect(html).toContain('role="group"')
    expect(html).toContain('aria-label="Maya Goldberg"')
  })

  it('renders the participant name in the name chip', () => {
    const html = render({ name: 'Alice Chen' })
    expect(html).toContain('Alice Chen')
  })

  it('renders initials fallback when no mediaSlot is provided', () => {
    const html = render({ name: 'Maya Goldberg' })
    expect(html).toContain('MG')
  })

  it('renders a single initial for a single-word name', () => {
    const html = render({ name: 'Alice' })
    expect(html).toContain('>A<')
  })

  it('draws the initials as SVG text that scales with the avatar circle', () => {
    const html = render({ name: 'Maya Goldberg' })
    expect(html).toMatch(/<svg viewBox="0 0 40 40"[^>]*><text[^>]*text-anchor="middle"[^>]*>MG<\/text><\/svg>/)
  })

  it('sets data-speaking=true when speaking', () => {
    const html = render({ name: 'Bob', speaking: true })
    expect(html).toContain('data-speaking="true"')
  })

  it('sets data-speaking=false when not speaking', () => {
    const html = render({ name: 'Bob', speaking: false })
    expect(html).toContain('data-speaking="false"')
  })

  it('sets data-pinned=true when pinned', () => {
    const html = render({ name: 'Carol', pinned: true })
    expect(html).toContain('data-pinned="true"')
  })

  it('renders the mic-muted indicator when micState is muted', () => {
    const html = render({ name: 'Dave', micState: 'muted' })
    expect(html).toContain('aria-label="Microphone muted"')
  })

  it('does not render the mic-muted indicator when micState is on', () => {
    const html = render({ name: 'Dave', micState: 'on' })
    expect(html).not.toContain('Microphone muted')
  })

  it('renders the media slot when provided instead of the avatar fallback', () => {
    const media = React.createElement('video', { 'data-testid': 'media' })
    const html = render({ name: 'Eve', mediaSlot: media })
    expect(html).toContain('data-testid="media"')
    // Initials should not appear when media is present
    expect(html).not.toContain('>E<')
  })

  it('renders the reaction badge when a reaction is provided', () => {
    const html = render({ name: 'Frank', reaction: React.createElement('span', null, '👋') })
    expect(html).toContain('👋')
  })
})

describe('VideoTile (SSR) — call states', () => {
  it('renders the raised-hand badge with an accessible name', () => {
    const html = render({ name: 'Gita', handRaised: true })
    expect(html).toContain('data-hand-raised="true"')
    expect(html).toContain('aria-label="Hand raised"')
  })

  it('omits the raised-hand badge by default', () => {
    const html = render({ name: 'Gita' })
    expect(html).toContain('data-hand-raised="false"')
    expect(html).not.toContain('Hand raised')
  })

  it('labels a shared-screen tile and qualifies its accessible name', () => {
    const html = render({ name: 'Hiro', screenShare: true })
    expect(html).toContain('data-screen-share="true"')
    expect(html).toContain('aria-label="Hiro (Presenting)"')
    // One truncating string, so a narrow tile cuts the qualifier before the name.
    expect(html).toContain('>Hiro (Presenting)<')
  })

  it('letterboxes shared-screen media and crops camera media', () => {
    const media = React.createElement('video')
    expect(render({ name: 'Hiro', screenShare: true, mediaSlot: media })).toContain(
      '[&amp;&gt;video]:object-contain',
    )
    expect(render({ name: 'Hiro', mediaSlot: media })).toContain(
      '[&amp;&gt;video]:object-cover',
    )
  })

  it('shows a sound-wave cue while speaking, so the cue is not colour-only', () => {
    const html = render({ name: 'Ines', speaking: true })
    expect(html).toContain('aria-label="Speaking"')
    expect(html).toContain('data-emphasis="speaking"')
  })

  it('shows no speaking cue when silent', () => {
    expect(render({ name: 'Ines' })).not.toContain('aria-label="Speaking"')
  })

  it('marks a pinned tile with a badge and the primary edge', () => {
    const html = render({ name: 'Jon', pinned: true })
    expect(html).toContain('aria-label="Pinned"')
    expect(html).toContain('data-emphasis="pinned"')
    expect(html).toContain('border-primary')
  })

  it('keeps the speaking edge on a pinned speaker', () => {
    const html = render({ name: 'Jon', pinned: true, speaking: true })
    expect(html).toContain('data-emphasis="speaking"')
    expect(html).toContain('aria-label="Pinned"')
  })

  it('renders the menu slot', () => {
    const menu = React.createElement('button', { type: 'button', 'aria-label': 'Options for Kim' })
    expect(render({ name: 'Kim', menu })).toContain('aria-label="Options for Kim"')
  })

  it('accepts localised labels', () => {
    const html = render({
      name: 'Lea',
      micState: 'muted',
      handRaised: true,
      screenShare: true,
      labels: { muted: 'Stumm', handRaised: 'Hand gehoben', screenShare: 'Bildschirm' },
    })
    expect(html).toContain('aria-label="Stumm"')
    expect(html).toContain('aria-label="Hand gehoben"')
    expect(html).toContain('aria-label="Lea (Bildschirm)"')
  })

  it('uses the avatar image when no media is provided', () => {
    const html = render({ name: 'Mo', avatarUrl: 'https://example.com/a.png' })
    expect(html).toContain('src="https://example.com/a.png"')
    expect(html).toContain('alt="Mo"')
  })

  it('keeps a 16:9 aspect ratio by default and fills its parent with fill', () => {
    expect(render({ name: 'Ola' })).toContain('aspect-video')
    const filled = render({ name: 'Ola', fill: true })
    expect(filled).toContain('h-full w-full')
    expect(filled).not.toContain('aspect-video')
  })

  it('lets a consumer aria-label win over the derived one', () => {
    expect(render({ name: 'Nia', 'aria-label': 'Custom' })).toContain('aria-label="Custom"')
  })
})

describe('react-video-tile entry', () => {
  it('re-exports the label helpers so menus can name a tile the way it announces itself', async () => {
    const entry = await import('../src/index.js')
    expect(entry.getVideoTileLabel('Ada', { screenShare: true })).toBe('Ada (Presenting)')
    expect(entry.videoTileDefaultLabels.handRaised).toBe('Hand raised')
  })
})
