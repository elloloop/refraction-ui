// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { VideoGrid, type VideoTileData } from '../src/index.js'
import { VideoTile } from '@refraction-ui/react-video-tile'

// React 19 expects this flag when running outside a browser bundler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  container.remove()
})

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui)
  })
}

type Live = VideoTileData & { stream: string }

const PEOPLE: Live[] = [
  { id: 'a', name: 'Ada', stream: 'stream-a' },
  { id: 'b', name: 'Ben', stream: 'stream-b' },
  { id: 'c', name: 'Cy', stream: 'stream-c' },
]

describe('VideoGrid (interaction)', () => {
  it('hands each mounted <video> to the consumer with its participant', () => {
    const attach = vi.fn()
    render(
      <VideoGrid
        participants={PEOPLE}
        layout="grid"
        renderMedia={(p) => <video ref={(el) => el && attach(p.stream, el)} muted />}
      />,
    )
    expect(attach.mock.calls.map(([stream]) => stream)).toEqual([
      'stream-a',
      'stream-b',
      'stream-c',
    ])
    for (const [, el] of attach.mock.calls) expect(el).toBeInstanceOf(HTMLVideoElement)
  })

  it('keeps a participant video element mounted while others join', () => {
    const elements = new Map<string, HTMLVideoElement>()
    const media = (p: Live) => (
      <video ref={(el) => void (el && elements.set(p.id, el))} />
    )
    render(<VideoGrid participants={PEOPLE.slice(0, 2)} layout="grid" renderMedia={media} />)
    const before = elements.get('a')
    render(<VideoGrid participants={PEOPLE} layout="grid" renderMedia={media} />)
    expect(container.contains(before!)).toBe(true)
    expect(elements.get('a')).toBe(before)
  })

  it('reaches a tile-options menu from renderTile by keyboard', () => {
    const onOptions = vi.fn()
    render(
      <VideoGrid
        participants={PEOPLE}
        layout="speaker"
        spotlightId="b"
        renderTile={(p, { tileProps }) => (
          <VideoTile
            {...tileProps}
            menu={
              <button type="button" aria-label={`Options for ${p.name}`} onClick={() => onOptions(p.id)}>
                ...
              </button>
            }
          />
        )}
      />,
    )
    const trigger = container.querySelector<HTMLButtonElement>('button[aria-label="Options for Cy"]')!
    act(() => trigger.focus())
    expect(document.activeElement).toBe(trigger)
    act(() => trigger.click())
    expect(onOptions).toHaveBeenCalledWith('c')
  })
})
