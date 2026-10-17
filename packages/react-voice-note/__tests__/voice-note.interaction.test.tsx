// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { VoiceNote, type VoiceNoteProps } from '../src/index.js'

// React 19 expects this flag when running outside a browser bundler.
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

/*
 * jsdom has no media pipeline: nothing loads, play() / pause() are "not
 * implemented" and duration is NaN. These tests stub play / pause, give each
 * <audio> a controllable duration / currentTime / readyState, and dispatch the
 * media events a browser would fire. They prove the component's reaction to
 * those events, not that a real browser fires them in this order.
 */

const PEAKS = [0.1, 0.4, 0.8, 0.5, 0.2, 0.6]
const DURATION = 45

interface FakeMedia {
  duration: number
  currentTime: number
  readyState: number
  paused: boolean
}

let container: HTMLDivElement
let root: Root
let media: FakeMedia
const playStub = vi.fn<(this: HTMLMediaElement) => Promise<void>>()
const pauseStub = vi.fn<(this: HTMLMediaElement) => void>()
const restorers: Array<() => void> = []

function stubPrototype<K extends keyof HTMLMediaElement>(key: K, descriptor: PropertyDescriptor) {
  const original = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, key)
  Object.defineProperty(HTMLMediaElement.prototype, key, { configurable: true, ...descriptor })
  restorers.push(() => {
    if (original) Object.defineProperty(HTMLMediaElement.prototype, key, original)
    else Reflect.deleteProperty(HTMLMediaElement.prototype, key)
  })
}

function fire(type: string) {
  act(() => {
    audio().dispatchEvent(new Event(type))
  })
}

beforeEach(() => {
  media = { duration: DURATION, currentTime: 0, readyState: 0, paused: true }
  playStub.mockReset().mockImplementation(function (this: HTMLMediaElement) {
    media.paused = false
    this.dispatchEvent(new Event('play'))
    this.dispatchEvent(new Event('playing'))
    return Promise.resolve()
  })
  pauseStub.mockReset().mockImplementation(function (this: HTMLMediaElement) {
    media.paused = true
    this.dispatchEvent(new Event('pause'))
  })
  stubPrototype('play', { value: playStub })
  stubPrototype('pause', { value: pauseStub })
  stubPrototype('duration', { get: () => media.duration })
  stubPrototype('readyState', { get: () => media.readyState })
  stubPrototype('paused', { get: () => media.paused })
  stubPrototype('currentTime', {
    get: () => media.currentTime,
    set: (value: number) => {
      media.currentTime = value
    },
  })
  // The Waveform canvas: jsdom has no 2D context; returning null skips drawing quietly.
  const originalGetContext = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = (() => null) as typeof originalGetContext
  restorers.push(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext
  })

  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  container.remove()
  while (restorers.length > 0) restorers.pop()?.()
})

function render(props: Partial<VoiceNoteProps> = {}) {
  act(() => {
    root.render(<VoiceNote src="/note.ogg" peaks={PEAKS} {...props} />)
  })
}

function q<T extends Element>(selector: string): T {
  const el = container.querySelector<T>(selector)
  if (!el) throw new Error(`Missing ${selector}`)
  return el
}

const audio = () => q<HTMLAudioElement>('audio')
const group = () => q<HTMLDivElement>('[role="group"]')
const toggle = () => q<HTMLButtonElement>('[data-voice-note-toggle]')
const slider = () => q<HTMLDivElement>('[role="slider"]')
const speed = () => q<HTMLButtonElement>('[data-voice-note-speed]')
const status = () => q<HTMLSpanElement>('[role="status"]')
const clock = () => container.querySelector('[data-voice-note-clock]')

function click(el: Element) {
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}

function press(key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  act(() => {
    slider().dispatchEvent(event)
  })
  return event
}

function pointer(type: 'pointerdown' | 'pointermove' | 'pointerup', clientX: number, button = 0) {
  act(() => {
    slider().dispatchEvent(new PointerEvent(type, { bubbles: true, clientX, button, pointerId: 1 }))
  })
}

/** Render, then simulate the browser finishing the metadata fetch. */
function renderReady(props: Partial<VoiceNoteProps> = {}) {
  render(props)
  fire('loadstart')
  media.readyState = 1
  fire('loadedmetadata')
}

describe('VoiceNote (interaction, jsdom)', () => {
  it('plays and pauses, swapping the button label and the state', () => {
    renderReady()
    expect(group().dataset.state).toBe('idle')
    expect(toggle().getAttribute('aria-label')).toBe('Play')

    click(toggle())
    expect(playStub).toHaveBeenCalledTimes(1)
    expect(group().dataset.state).toBe('playing')
    expect(toggle().getAttribute('aria-label')).toBe('Pause')
    expect(toggle().hasAttribute('aria-pressed')).toBe(false)

    click(toggle())
    expect(pauseStub).toHaveBeenCalledTimes(1)
    expect(group().dataset.state).toBe('paused')
    expect(toggle().getAttribute('aria-label')).toBe('Play')
  })

  it('shows and announces loading until metadata arrives, then the clock', () => {
    render()
    fire('loadstart')
    expect(group().dataset.state).toBe('loading')
    expect(status().textContent).toBe('Loading…')
    expect(clock()).toBeNull()

    media.readyState = 1
    fire('loadedmetadata')
    expect(group().dataset.state).toBe('idle')
    expect(status().textContent).toBe('')
    expect(clock()?.textContent).toBe('0:00 / 0:45')
    expect(slider().getAttribute('aria-valuemax')).toBe('45')
    expect(slider().getAttribute('aria-valuetext')).toBe('0:00 of 0:45')
  })

  it('tracks playback progress from timeupdate', () => {
    renderReady()
    media.currentTime = 12.3
    fire('timeupdate')
    expect(slider().getAttribute('aria-valuenow')).toBe('12')
    expect(slider().getAttribute('aria-valuetext')).toBe('0:12 of 0:45')
    expect(clock()?.textContent).toBe('0:12 / 0:45')
    const percent = (12.3 / DURATION) * 100
    expect(q<HTMLElement>('[data-voice-note-playhead]').style.left).toBe(`${percent}%`)
    expect(q<HTMLElement>('[data-voice-note-played]').style.clipPath).toBe(`inset(0 ${100 - percent}% 0 0)`)
  })

  it('seeks ±5 s with the arrow keys, clamped, and jumps with Home / End', () => {
    renderReady()
    act(() => slider().focus())
    expect(document.activeElement).toBe(slider())

    expect(press('ArrowRight').defaultPrevented).toBe(true)
    expect(media.currentTime).toBe(5)
    expect(slider().getAttribute('aria-valuetext')).toBe('0:05 of 0:45')
    press('ArrowUp')
    expect(media.currentTime).toBe(10)
    press('ArrowLeft')
    expect(media.currentTime).toBe(5)
    press('ArrowDown')
    expect(media.currentTime).toBe(0)
    press('ArrowLeft')
    expect(media.currentTime).toBe(0)

    press('End')
    expect(media.currentTime).toBe(DURATION)
    expect(slider().getAttribute('aria-valuetext')).toBe('0:45 of 0:45')
    press('ArrowRight')
    expect(media.currentTime).toBe(DURATION)
    press('Home')
    expect(media.currentTime).toBe(0)
  })

  it('leaves unhandled keys alone', () => {
    renderReady()
    media.currentTime = 7
    expect(press('Tab').defaultPrevented).toBe(false)
    expect(press('Enter').defaultPrevented).toBe(false)
    expect(media.currentTime).toBe(7)
  })

  it('seeks to the pointer on press and while dragging, and stops on release', () => {
    renderReady()
    vi.spyOn(slider(), 'getBoundingClientRect').mockReturnValue({
      left: 100, width: 200, top: 0, height: 44, right: 300, bottom: 44, x: 100, y: 0, toJSON: () => ({}),
    })

    pointer('pointerdown', 150)
    expect(media.currentTime).toBe(11.25)
    pointer('pointermove', 200)
    expect(media.currentTime).toBe(22.5)
    pointer('pointermove', 900)
    expect(media.currentTime).toBe(DURATION)
    pointer('pointerup', 900)

    pointer('pointermove', 100)
    expect(media.currentTime).toBe(DURATION)
  })

  it('ignores a non-primary pointer button', () => {
    renderReady()
    vi.spyOn(slider(), 'getBoundingClientRect').mockReturnValue({
      left: 0, width: 200, top: 0, height: 44, right: 200, bottom: 44, x: 0, y: 0, toJSON: () => ({}),
    })
    pointer('pointerdown', 100, 2)
    expect(media.currentTime).toBe(0)
  })

  it('cycles the speed 1× → 1.5× → 2× → 1× and applies it to the audio', () => {
    const onPlaybackRateChange = vi.fn()
    renderReady({ onPlaybackRateChange })
    expect(audio().playbackRate).toBe(1)
    expect(speed().textContent).toBe('Playback speed 1×')

    click(speed())
    expect(speed().textContent).toBe('Playback speed 1.5×')
    expect(audio().playbackRate).toBe(1.5)
    expect(audio().defaultPlaybackRate).toBe(1.5)
    expect(onPlaybackRateChange).toHaveBeenLastCalledWith(1.5)

    click(speed())
    expect(audio().playbackRate).toBe(2)
    click(speed())
    expect(audio().playbackRate).toBe(1)
    expect(speed().textContent).toBe('Playback speed 1×')
  })

  it('keeps a controlled playbackRate until the parent changes it', () => {
    const onPlaybackRateChange = vi.fn()
    renderReady({ playbackRate: 2, onPlaybackRateChange })
    expect(audio().playbackRate).toBe(2)
    click(speed())
    expect(onPlaybackRateChange).toHaveBeenCalledWith(1)
    expect(audio().playbackRate).toBe(2)
  })

  it('shows the error state: message, disabled controls, inert slider', () => {
    renderReady()
    media.currentTime = 10
    fire('error')
    expect(group().dataset.state).toBe('error')
    expect(status().textContent).toBe('This voice note could not be played')
    expect(status().querySelector('svg')).not.toBeNull()
    expect(clock()).toBeNull()
    expect(toggle().disabled).toBe(true)
    expect(speed().disabled).toBe(true)
    expect(slider().getAttribute('aria-disabled')).toBe('true')
    expect(slider().getAttribute('tabindex')).toBe('-1')

    expect(press('ArrowRight').defaultPrevented).toBe(false)
    expect(media.currentTime).toBe(10)
  })

  it('recovers from an error when a new source starts loading', () => {
    renderReady()
    fire('error')
    fire('loadstart')
    expect(group().dataset.state).toBe('loading')
    expect(toggle().disabled).toBe(false)
  })

  it('ends, then returns to paused when the user seeks back', () => {
    renderReady()
    click(toggle())
    media.currentTime = DURATION
    media.paused = true
    fire('pause')
    fire('ended')
    expect(group().dataset.state).toBe('ended')
    expect(toggle().getAttribute('aria-label')).toBe('Play')

    press('Home')
    fire('seeked')
    expect(group().dataset.state).toBe('paused')
  })

  it('uses the duration prop when the browser reports Infinity', () => {
    renderReady({ duration: 30 })
    media.duration = Number.POSITIVE_INFINITY
    fire('durationchange')
    expect(slider().getAttribute('aria-valuemax')).toBe('30')
    press('End')
    expect(media.currentTime).toBe(30)
  })

  it('re-reads the element when play() is rejected', async () => {
    render()
    fire('loadstart')
    media.readyState = 4
    playStub.mockImplementationOnce(() => Promise.reject(new DOMException('blocked', 'NotAllowedError')))
    await act(async () => {
      toggle().click()
    })
    expect(group().dataset.state).toBe('idle')
    expect(toggle().getAttribute('aria-label')).toBe('Play')
  })

  it('reads an error the element already holds on mount (events lost before hydration)', () => {
    stubPrototype('error', { get: () => ({ code: 4 }) })
    render()
    expect(group().dataset.state).toBe('error')
  })

  it('reports state changes, but not the initial state', () => {
    const onStateChange = vi.fn()
    render({ onStateChange })
    expect(onStateChange).not.toHaveBeenCalled()
    fire('loadstart')
    media.readyState = 1
    fire('loadedmetadata')
    click(toggle())
    expect(onStateChange.mock.calls.map(([s]) => s)).toEqual(['loading', 'idle', 'playing'])
  })

  it('applies defaultPlaybackRate on mount', () => {
    render({ defaultPlaybackRate: 1.5 })
    expect(audio().playbackRate).toBe(1.5)
  })
})
