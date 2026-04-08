import { describe, it, expect } from 'vitest'
import { createVideoPlayer } from '../src/video-player.js'
import {
  playerVariants,
  controlsVariants,
  overlayVariants,
} from '../src/video-player.styles.js'

describe('createVideoPlayer', () => {
  it('starts in idle state', () => {
    const api = createVideoPlayer()
    expect(api.state).toBe('idle')
  })

  it('transitions to playing on play()', () => {
    const api = createVideoPlayer()
    api.play()
    expect(api.state).toBe('playing')
  })

  it('transitions to paused on pause()', () => {
    const api = createVideoPlayer()
    api.play()
    api.pause()
    expect(api.state).toBe('paused')
  })

  it('pause() does nothing when not playing', () => {
    const api = createVideoPlayer()
    api.pause()
    expect(api.state).toBe('idle')
  })

  it('togglePlay() plays when idle', () => {
    const api = createVideoPlayer()
    api.togglePlay()
    expect(api.state).toBe('playing')
  })

  it('togglePlay() pauses when playing', () => {
    const api = createVideoPlayer()
    api.play()
    api.togglePlay()
    expect(api.state).toBe('paused')
  })

  it('togglePlay() plays when paused', () => {
    const api = createVideoPlayer()
    api.play()
    api.pause()
    api.togglePlay()
    expect(api.state).toBe('playing')
  })

  it('toggleMute() toggles mute state', () => {
    const api = createVideoPlayer()
    const muted = api.toggleMute()
    expect(muted).toBe(true)
    const unmuted = api.toggleMute()
    expect(unmuted).toBe(false)
  })

  it('respects initial muted prop', () => {
    const api = createVideoPlayer({ muted: true })
    const unmuted = api.toggleMute()
    expect(unmuted).toBe(false)
  })

  it('provides aria props for region', () => {
    const api = createVideoPlayer()
    expect(api.ariaProps.role).toBe('region')
    expect(api.ariaProps['aria-label']).toBe('Video player')
  })

  it('provides play/pause control aria props', () => {
    const api = createVideoPlayer()
    expect(api.controlAriaProps.playPause['aria-label']).toBe('Play')
    api.play()
    expect(api.controlAriaProps.playPause['aria-label']).toBe('Pause')
  })

  it('provides mute control aria props', () => {
    const api = createVideoPlayer()
    expect(api.controlAriaProps.mute['aria-label']).toBe('Mute')
    api.toggleMute()
    expect(api.controlAriaProps.mute['aria-label']).toBe('Unmute')
  })

  it('provides data-state attribute', () => {
    const api = createVideoPlayer()
    expect(api.dataAttributes['data-state']).toBe('idle')
    api.play()
    expect(api.dataAttributes['data-state']).toBe('playing')
  })
})

describe('video-player styles', () => {
  it('playerVariants returns base classes', () => {
    const classes = playerVariants()
    expect(classes).toContain('relative')
    expect(classes).toContain('rounded-lg')
    expect(classes).toContain('bg-black')
  })

  it('controlsVariants returns visible classes', () => {
    const classes = controlsVariants({ visibility: 'visible' })
    expect(classes).toContain('opacity-100')
  })

  it('controlsVariants returns hidden classes', () => {
    const classes = controlsVariants({ visibility: 'hidden' })
    expect(classes).toContain('opacity-0')
    expect(classes).toContain('pointer-events-none')
  })

  it('overlayVariants returns base classes', () => {
    const classes = overlayVariants()
    expect(classes).toContain('absolute')
    expect(classes).toContain('inset-0')
  })
})
