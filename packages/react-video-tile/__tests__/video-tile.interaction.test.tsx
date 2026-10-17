// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { VideoTile } from '../src/video-tile.js'

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

describe('VideoTile (interaction)', () => {
  it('hands the live <video> element to the consumer so a stream can be attached', () => {
    const attach = vi.fn()
    render(<VideoTile name="Ada" mediaSlot={<video ref={attach} muted playsInline />} />)
    expect(attach).toHaveBeenCalledWith(expect.any(HTMLVideoElement))
    expect(container.querySelector('[role="group"] video')).not.toBeNull()
  })

  it('forwards its ref to the tile root', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<VideoTile ref={ref} name="Ada" />)
    expect(ref.current?.getAttribute('role')).toBe('group')
  })

  it('keeps the menu slot keyboard reachable and clickable above the media', () => {
    const onOpen = vi.fn()
    render(
      <VideoTile
        name="Ada"
        mediaSlot={<video />}
        menu={
          <button type="button" aria-label="Options for Ada" onClick={onOpen}>
            ...
          </button>
        }
      />,
    )
    const trigger = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Options for Ada"]',
    )
    expect(trigger).not.toBeNull()
    act(() => {
      trigger!.focus()
    })
    expect(document.activeElement).toBe(trigger)
    act(() => {
      trigger!.click()
    })
    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  it('updates indicators when the participant state changes', () => {
    render(<VideoTile name="Ada" />)
    const tile = container.querySelector('[role="group"]')!
    expect(tile.getAttribute('data-hand-raised')).toBe('false')
    render(<VideoTile name="Ada" handRaised speaking />)
    expect(tile.getAttribute('data-hand-raised')).toBe('true')
    expect(container.querySelector('[aria-label="Hand raised"]')).not.toBeNull()
    expect(container.querySelector('[aria-label="Speaking"]')).not.toBeNull()
  })
})
