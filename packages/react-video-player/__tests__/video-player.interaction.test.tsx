// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { VideoPlayer } from '../src/video-player.js'

// React 19 expects this flag when running tests outside a browser bundler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  // jsdom's media element methods are unimplemented stubs; replace them with
  // spies so media interactions can be simulated without console noise.
  vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(
    () => Promise.resolve(),
  )
  vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})

  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  container.remove()
  vi.restoreAllMocks()
})

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui)
  })
}

function click(el: Element) {
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  })
}

function region(): HTMLElement {
  const el = container.querySelector('[role="region"]')
  if (!el) throw new Error('player region not rendered')
  return el as HTMLElement
}

function video(): HTMLVideoElement {
  const el = container.querySelector('video')
  if (!el) throw new Error('video element not rendered')
  return el
}

function button(label: string): HTMLButtonElement | null {
  return container.querySelector(`button[aria-label="${label}"]`)
}

function overlay(): HTMLElement | undefined {
  return Array.from(container.querySelectorAll('div')).find((d) =>
    d.className.includes('inset-0'),
  )
}

function fireMediaEvent(type: 'play' | 'pause') {
  act(() => {
    video().dispatchEvent(new Event(type, { bubbles: false }))
  })
}

describe('play/pause toggle', () => {
  it('starts idle with a Play button', () => {
    render(React.createElement(VideoPlayer, { src: 'video.mp4' }))
    expect(region().getAttribute('data-state')).toBe('idle')
    expect(button('Play')).not.toBeNull()
    expect(button('Pause')).toBeNull()
  })

  it('clicking Play switches to the playing state with a Pause button', () => {
    render(React.createElement(VideoPlayer, { src: 'video.mp4' }))
    click(button('Play')!)
    expect(region().getAttribute('data-state')).toBe('playing')
    expect(button('Pause')).not.toBeNull()
    expect(button('Play')).toBeNull()
  })

  it('clicking Pause returns to the paused state with a Play button', () => {
    render(React.createElement(VideoPlayer, { src: 'video.mp4' }))
    click(button('Play')!)
    click(button('Pause')!)
    expect(region().getAttribute('data-state')).toBe('paused')
    expect(button('Play')).not.toBeNull()
  })

  it('hides the center overlay while playing', () => {
    render(React.createElement(VideoPlayer, { src: 'video.mp4' }))
    expect(overlay()!.className).toContain('opacity-100')
    click(button('Play')!)
    expect(overlay()!.className).toContain('opacity-0')
    expect(overlay()!.className).toContain('pointer-events-none')
  })

  it('the play event from the media element drives the playing state', () => {
    render(React.createElement(VideoPlayer, { src: 'video.mp4' }))
    fireMediaEvent('play')
    expect(region().getAttribute('data-state')).toBe('playing')
    expect(button('Pause')).not.toBeNull()
  })

  it('the pause event from the media element drives the paused state', () => {
    render(React.createElement(VideoPlayer, { src: 'video.mp4' }))
    fireMediaEvent('play')
    fireMediaEvent('pause')
    expect(region().getAttribute('data-state')).toBe('paused')
    expect(button('Play')).not.toBeNull()
  })

  it('a stray pause event while idle does not change the state', () => {
    render(React.createElement(VideoPlayer, { src: 'video.mp4' }))
    fireMediaEvent('pause')
    expect(region().getAttribute('data-state')).toBe('idle')
  })
})

describe('mute toggle', () => {
  it('starts with a Mute button by default', () => {
    render(React.createElement(VideoPlayer, { src: 'video.mp4' }))
    expect(button('Mute')).not.toBeNull()
    expect(button('Unmute')).toBeNull()
  })

  it('clicking Mute switches to Unmute', () => {
    render(React.createElement(VideoPlayer, { src: 'video.mp4' }))
    click(button('Mute')!)
    expect(button('Unmute')).not.toBeNull()
    expect(button('Mute')).toBeNull()
  })

  it('clicking Unmute switches back to Mute', () => {
    render(React.createElement(VideoPlayer, { src: 'video.mp4' }))
    click(button('Mute')!)
    click(button('Unmute')!)
    expect(button('Mute')).not.toBeNull()
  })

  it('starts as Unmute when the muted prop is set', () => {
    render(React.createElement(VideoPlayer, { src: 'video.mp4', muted: true }))
    expect(button('Unmute')).not.toBeNull()
    expect(video().muted).toBe(true)
  })
})

describe('controls=false', () => {
  it('renders no control buttons', () => {
    render(React.createElement(VideoPlayer, { src: 'video.mp4', controls: false }))
    expect(container.querySelector('button')).toBeNull()
    expect(container.querySelector('video')).not.toBeNull()
  })

  it('still tracks media events when controls are hidden', () => {
    render(React.createElement(VideoPlayer, { src: 'video.mp4', controls: false }))
    fireMediaEvent('play')
    expect(region().getAttribute('data-state')).toBe('playing')
  })
})

describe('placeholder', () => {
  it('renders no video element without src', () => {
    render(React.createElement(VideoPlayer))
    expect(container.querySelector('video')).toBeNull()
    expect(container.textContent).toContain('Coming soon')
    expect(region().getAttribute('aria-label')).toBe('Video player')
  })
})
