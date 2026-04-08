import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { VideoPlayer } from '../src/video-player.js'

describe('VideoPlayer (React)', () => {
  it('renders "Coming soon" when no src is provided', () => {
    const html = renderToString(React.createElement(VideoPlayer))
    expect(html).toContain('Coming soon')
  })

  it('renders with region role', () => {
    const html = renderToString(React.createElement(VideoPlayer))
    expect(html).toContain('role="region"')
    expect(html).toContain('aria-label="Video player"')
  })

  it('renders video element when src is provided', () => {
    const html = renderToString(
      React.createElement(VideoPlayer, { src: 'video.mp4' }),
    )
    expect(html).toContain('<video')
    expect(html).toContain('video.mp4')
  })

  it('renders play button when src is provided', () => {
    const html = renderToString(
      React.createElement(VideoPlayer, { src: 'video.mp4' }),
    )
    expect(html).toContain('Play')
  })

  it('renders mute button when src is provided', () => {
    const html = renderToString(
      React.createElement(VideoPlayer, { src: 'video.mp4' }),
    )
    expect(html).toContain('Mute')
  })

  it('applies poster attribute', () => {
    const html = renderToString(
      React.createElement(VideoPlayer, { src: 'video.mp4', poster: 'thumb.jpg' }),
    )
    expect(html).toContain('thumb.jpg')
  })

  it('sets data-state attribute', () => {
    const html = renderToString(
      React.createElement(VideoPlayer, { src: 'video.mp4' }),
    )
    expect(html).toContain('data-state="idle"')
  })

  it('applies player variant classes', () => {
    const html = renderToString(
      React.createElement(VideoPlayer, { src: 'video.mp4' }),
    )
    expect(html).toContain('rounded-lg')
    expect(html).toContain('bg-black')
  })

  it('hides controls when controls=false', () => {
    const html = renderToString(
      React.createElement(VideoPlayer, { src: 'video.mp4', controls: false }),
    )
    // Should not have play/mute buttons
    expect(html).not.toContain('aria-label="Play"')
    expect(html).not.toContain('aria-label="Mute"')
  })
})
