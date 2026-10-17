import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { VideoGrid } from '../src/video-grid.js'
import type { VideoGridRegion, VideoTileData } from '../src/video-grid.js'
import { VideoTile } from '@refraction-ui/react-video-tile'

const render = (props: React.ComponentProps<typeof VideoGrid>) =>
  renderToString(React.createElement(VideoGrid, props))

const makeParticipants = (n: number): VideoTileData[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `p${i + 1}`,
    name: `Participant ${i + 1}`,
  }))

describe('VideoGrid (SSR)', () => {
  it('renders a group container', () => {
    const html = render({ participants: makeParticipants(4) })
    expect(html).toContain('role="group"')
  })

  it('reflects layout=grid in data attribute', () => {
    const html = render({ participants: makeParticipants(4), layout: 'grid' })
    expect(html).toContain('data-layout="grid"')
  })

  it('renders N tiles for N participants in grid mode', () => {
    const participants = makeParticipants(6)
    const html = render({ participants, layout: 'grid' })
    // Each VideoTile renders the participant name
    for (const p of participants) {
      expect(html).toContain(p.name)
    }
  })

  it('applies inline gridTemplateColumns in grid layout', () => {
    // 4 participants → 2 columns
    const html = render({ participants: makeParticipants(4), layout: 'grid' })
    expect(html).toContain('grid-template-columns:repeat(2, 1fr)')
  })

  it('renders spotlight and filmstrip in speaker mode', () => {
    const participants = makeParticipants(3)
    const html = render({
      participants,
      layout: 'speaker',
      spotlightId: 'p1',
    })
    expect(html).toContain('data-layout="speaker"')
    // Spotlight: p1 rendered
    expect(html).toContain('Participant 1')
    // Filmstrip: p2 and p3 rendered
    expect(html).toContain('Participant 2')
    expect(html).toContain('Participant 3')
  })

  it('in speaker mode with spotlightId the spotlight participant appears first', () => {
    const participants = makeParticipants(3)
    const html = render({
      participants,
      layout: 'speaker',
      spotlightId: 'p2',
    })
    // p2 is spotlighted; p1 and p3 go to filmstrip
    const p1Pos = html.indexOf('Participant 1')
    const p2Pos = html.indexOf('Participant 2')
    // p2 (spotlight) should appear before p1 (filmstrip)
    expect(p2Pos).toBeLessThan(p1Pos)
  })

  it('auto layout resolves to speaker for a solo participant', () => {
    const html = render({ participants: makeParticipants(1), layout: 'auto' })
    expect(html).toContain('data-layout="speaker"')
  })

  it('auto layout resolves to grid for multiple participants', () => {
    const html = render({ participants: makeParticipants(4), layout: 'auto' })
    expect(html).toContain('data-layout="grid"')
  })
})

describe('VideoGrid (SSR) — media and custom tiles', () => {
  it('renders the media from renderMedia inside each tile', () => {
    const html = render({
      participants: makeParticipants(2),
      layout: 'grid',
      renderMedia: (p) => React.createElement('video', { 'data-stream': p.id }),
    })
    expect(html).toContain('data-stream="p1"')
    expect(html).toContain('data-stream="p2"')
    // Media replaces the initials fallback.
    expect(html).not.toContain('>P1<')
  })

  it('falls back to the avatar when renderMedia returns null', () => {
    const html = render({
      participants: makeParticipants(2),
      layout: 'grid',
      renderMedia: (p) => (p.id === 'p1' ? React.createElement('video') : null),
    })
    expect(html.match(/<video/g)?.length).toBe(1)
    expect(html).toContain('>P2<')
  })

  it('tells renderMedia which region each tile sits in', () => {
    const seen: Array<[string, VideoGridRegion]> = []
    render({
      participants: makeParticipants(3),
      layout: 'speaker',
      spotlightId: 'p2',
      renderMedia: (p, { region }) => {
        seen.push([p.id, region])
        return null
      },
    })
    expect(seen).toEqual([
      ['p2', 'spotlight'],
      ['p1', 'filmstrip'],
      ['p3', 'filmstrip'],
    ])
  })

  it('passes avatar, raised hand and screen share through to the tiles', () => {
    const html = render({
      participants: [
        { id: 'a', name: 'Ada', handRaised: true, avatarUrl: 'https://example.com/ada.png' },
        { id: 'b', name: 'Ben', screenShare: true },
      ],
      layout: 'grid',
    })
    expect(html).toContain('aria-label="Hand raised"')
    expect(html).toContain('src="https://example.com/ada.png"')
    expect(html).toContain('aria-label="Ben (Presenting)"')
  })

  it('fills the spotlight and keeps grid and filmstrip tiles at 16:9', () => {
    const html = render({ participants: makeParticipants(2), layout: 'speaker', spotlightId: 'p1' })
    const tiles = (html.match(/<div[^>]*role="group"[^>]*>/g) ?? []).filter((tag) =>
      tag.includes('aria-label="Participant'),
    )
    expect(tiles).toHaveLength(2)
    expect(tiles[0]).toContain('h-full w-full')
    expect(tiles[0]).not.toContain('aspect-video')
    expect(tiles[1]).toContain('aspect-video')
  })

  it('renders custom tiles from renderTile with the default tile props', () => {
    const html = render({
      participants: makeParticipants(2),
      layout: 'grid',
      renderTile: (p, { region, tileProps }) =>
        React.createElement(VideoTile, {
          ...tileProps,
          'data-region': region,
          menu: React.createElement('button', { type: 'button', 'aria-label': `Options for ${p.name}` }),
        }),
    })
    expect(html).toContain('data-region="grid"')
    expect(html).toContain('aria-label="Options for Participant 1"')
    expect(html).toContain('aria-label="Options for Participant 2"')
  })

  it('hands renderTile the media from renderMedia', () => {
    let media: React.ReactNode
    render({
      participants: makeParticipants(1),
      layout: 'grid',
      renderMedia: () => React.createElement('video'),
      renderTile: (_p, { tileProps }) => {
        media = tileProps.mediaSlot
        return null
      },
    })
    expect(React.isValidElement(media)).toBe(true)
  })

  it('types extra participant fields through to the render props', () => {
    type Live = VideoTileData & { streamKey: string }
    const participants: Live[] = [{ id: 'a', name: 'Ada', streamKey: 'cam-a' }]
    const html = renderToString(
      <VideoGrid
        participants={participants}
        layout="grid"
        renderMedia={(p) => <video data-key={p.streamKey} />}
      />,
    )
    expect(html).toContain('data-key="cam-a"')
  })
})
