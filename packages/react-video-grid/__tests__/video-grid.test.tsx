import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { VideoGrid } from '../src/video-grid.js'
import type { VideoTileData } from '../src/video-grid.js'

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
