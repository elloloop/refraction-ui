import { describe, it, expect, vi } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { VideoTile } from '@refraction-ui/react-video-tile'
import {
  VideoStage,
  videoStageDefaultLabels,
  type VideoStageParticipant,
  type VideoStageProps,
  type VideoStageRegion,
} from '../src/index.js'

const render = <T extends VideoStageParticipant>(props: VideoStageProps<T>) =>
  renderToString(<VideoStage {...props} />)

const people = (n: number): VideoStageParticipant[] =>
  Array.from({ length: n }, (_, i) => ({ id: `p${i + 1}`, name: `Person ${i + 1}` }))

const count = (html: string, needle: string) => html.split(needle).length - 1

/** The markup inside the first element carrying `attr`, up to the next region marker. */
function region(html: string, name: VideoStageRegion): string {
  const start = html.indexOf(`data-video-stage-region="${name}"`)
  if (start === -1) return ''
  const next = html.indexOf('data-video-stage-region="', start + 1)
  return html.slice(start, next === -1 ? undefined : next)
}

describe('VideoStage (SSR)', () => {
  it('renders a labelled group with the stage state as data attributes', () => {
    const html = render({ participants: people(3) })
    expect(html).toContain('role="group"')
    expect(html).toContain(`aria-label="${videoStageDefaultLabels.stage}"`)
    expect(html).toContain('data-mode="grid"')
    // Unmeasured on the server: a landscape, regular-width stage.
    expect(html).toContain('data-orientation="landscape"')
    expect(html).toContain('data-narrow="false"')
    expect(html).toContain('data-zoomed="false"')
    expect(html).not.toContain('data-focus-reason')
  })

  it.each([
    [1, 'single'],
    [2, 'pair-side'],
    [4, 'quad'],
    [5, 'paged-horizontal'],
    [9, 'paged-horizontal'],
  ])('shapes a grid of %i as %s', (n, shape) => {
    expect(render({ participants: people(n) })).toContain(`data-shape="${shape}"`)
  })

  it('renders one filling tile per participant, each in its own cell', () => {
    const html = render({ participants: people(6) })
    for (let i = 1; i <= 6; i++) expect(html).toContain(`data-participant-id="p${i}"`)
    expect(count(html, 'aria-label="Person ')).toBeGreaterThanOrEqual(6)
    expect(html).toContain('h-full w-full')
    expect(html).not.toContain('aspect-video')
  })

  it('renders no scroll control before the grid is measured', () => {
    expect(render({ participants: people(9) })).not.toContain('data-video-stage-scroller')
  })

  it('gives every tile a collapsed options trigger named for its participant', () => {
    const html = render({ participants: people(2) })
    expect(count(html, 'data-video-stage-trigger')).toBe(2)
    expect(html).toContain('aria-label="Options for Person 1"')
    expect(html).toContain('aria-expanded="false"')
    expect(html).not.toContain('aria-controls')
    expect(html).not.toContain('Spotlight Person 1')
  })

  it('puts a pinned participant on the stage, with a pin badge, and the rest in the rail', () => {
    const html = render({ participants: people(4), defaultPinnedId: 'p3' })
    expect(html).toContain('data-mode="spotlight"')
    expect(html).toContain('data-focus-reason="pinned"')
    expect(html).toContain('data-placement="side"')
    const stage = region(html, 'stage')
    expect(stage).toContain('data-participant-id="p3"')
    expect(stage).toContain('aria-label="Pinned"')
    const rail = region(html, 'rail')
    expect(count(rail, 'data-video-stage-trigger')).toBe(3)
    expect(rail).not.toContain('Person 3')
  })

  it('puts a shared screen on the stage, named as presenting', () => {
    const participants = [
      ...people(2),
      { id: 'p1-screen', name: 'Person 1', screenShare: true },
    ]
    const html = render({ participants })
    expect(html).toContain('data-focus-reason="screen-share"')
    const stage = region(html, 'stage')
    expect(stage).toContain('data-participant-id="p1-screen"')
    expect(stage).toContain('aria-label="Options for Person 1 (Presenting)"')
  })

  it('prefers a pin over a shared screen', () => {
    const participants = [...people(2), { id: 's', name: 'Person 2', screenShare: true }]
    const html = render({ participants, defaultPinnedId: 'p1' })
    expect(html).toContain('data-focus-reason="pinned"')
    expect(region(html, 'stage')).toContain('data-participant-id="p1"')
  })

  it('stays a grid while someone speaks, unless auto-spotlight is on', () => {
    const participants = [...people(3)]
    participants[1] = { ...participants[1], speaking: true }
    expect(render({ participants })).toContain('data-mode="grid"')

    const html = render({ participants, autoSpotlightSpeaker: true })
    expect(html).toContain('data-focus-reason="active-speaker"')
    expect(region(html, 'stage')).toContain('data-participant-id="p2"')
  })

  it('never makes the viewer the active speaker', () => {
    const participants: VideoStageParticipant[] = [
      { id: 'me', name: 'Me', local: true, speaking: true },
      ...people(2),
    ]
    expect(render({ participants, autoSpotlightSpeaker: true })).toContain('data-mode="grid"')
  })

  it('puts someone other than the viewer on the spotlight layout when nobody stands out', () => {
    const participants: VideoStageParticipant[] = [{ id: 'me', name: 'Me', local: true }, ...people(2)]
    const html = render({ participants, layout: 'spotlight' })
    expect(html).toContain('data-focus-reason="layout"')
    expect(region(html, 'stage')).toContain('data-participant-id="p1"')
  })

  it('ignores a pin in the grid layout', () => {
    const html = render({ participants: people(3), layout: 'grid', defaultPinnedId: 'p1' })
    expect(html).toContain('data-mode="grid"')
    expect(html).not.toContain('aria-label="Pinned"')
  })

  it('ignores a pin for someone who is not in the call', () => {
    expect(render({ participants: people(3), defaultPinnedId: 'gone' })).toContain('data-mode="grid"')
  })

  it('renders a maximized participant over the stage with a visible minimize button', () => {
    const html = render({ participants: people(3), defaultZoomedId: 'p2' })
    expect(html).toContain('data-zoomed="true"')
    const zoom = region(html, 'zoom')
    expect(zoom).toContain('Options for Person 2')
    expect(zoom).toMatch(/data-video-stage-zoom-exit=""[^>]*>.*Minimize<\/button>/)
    // The maximized tile offers no second maximize.
    expect(zoom).not.toContain('Maximize Person 2')
  })

  it('hands renderMedia each tile with its region', () => {
    const renderMedia = vi.fn((p: VideoStageParticipant) => <video data-stream={p.id} muted />)
    const html = render({
      participants: people(3),
      defaultPinnedId: 'p1',
      defaultZoomedId: 'p2',
      renderMedia,
    })
    const calls = renderMedia.mock.calls.map(([p, ctx]) => `${p.id}:${ctx.region}`)
    expect(calls).toEqual(['p1:stage', 'p2:rail', 'p3:rail', 'p2:zoom'])
    expect(count(html, '<video')).toBe(4)
  })

  it('passes typed participants and the tile props, options included, to renderTile', () => {
    type Live = VideoStageParticipant & { track: string }
    const participants: Live[] = [
      { id: 'a', name: 'Ada', track: 'track-a' },
      { id: 'b', name: 'Ben', track: 'track-b' },
    ]
    const seen: string[] = []
    const html = render<Live>({
      participants,
      renderTile: (p, { region: r, tileProps }) => {
        seen.push(`${p.track}:${r}:${tileProps.fill}:${tileProps.menu != null}`)
        return <VideoTile {...tileProps} className="custom-tile" />
      },
    })
    expect(seen).toEqual(['track-a:grid:true:true', 'track-b:grid:true:true'])
    expect(count(html, 'custom-tile')).toBe(2)
    expect(count(html, 'data-video-stage-trigger')).toBe(2)
  })

  it('localises its labels', () => {
    const html = render({
      participants: people(2),
      labels: { stage: 'Llamada', tileOptions: (n) => `Opciones de ${n}` },
      defaultZoomedId: 'p1',
    })
    expect(html).toContain('aria-label="Llamada"')
    expect(html).toContain('aria-label="Opciones de Person 1"')
    expect(html).toContain('Minimize')
  })

  it('passes tile labels to every tile', () => {
    const participants = [{ id: 's', name: 'Ada', screenShare: true }]
    const html = render({ participants, tileLabels: { screenShare: 'presenta' } })
    expect(html).toContain('Ada (presenta)')
  })

  it('forwards className and attributes, and lets an aria-label override the default', () => {
    const html = render({
      participants: people(1),
      className: 'my-stage',
      id: 'stage-1',
      'aria-label': 'Standup',
    })
    expect(html).toContain('my-stage')
    expect(html).toContain('id="stage-1"')
    expect(html).toContain('aria-label="Standup"')
    expect(html).not.toContain(`aria-label="${videoStageDefaultLabels.stage}"`)
  })

  it('renders an empty stage for an empty call', () => {
    const html = render({ participants: [] })
    expect(html).toContain('data-mode="grid"')
    expect(html).not.toContain('data-video-stage-trigger')
  })
})
