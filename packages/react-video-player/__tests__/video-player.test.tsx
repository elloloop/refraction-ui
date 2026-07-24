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

// ---------------------------------------------------------------
// Expanded SSR coverage
// ---------------------------------------------------------------

describe('VideoPlayer – video element (React)', () => {
  it('sets the src attribute on the video element', () => {
    const html = renderToString(
      React.createElement(VideoPlayer, { src: 'video.mp4' }),
    )
    expect(html).toContain('src="video.mp4"')
  })

  it('applies h-full w-full classes to the video', () => {
    const html = renderToString(
      React.createElement(VideoPlayer, { src: 'video.mp4' }),
    )
    expect(html).toContain('h-full')
    expect(html).toContain('w-full')
  })

  it('renders the muted attribute when muted', () => {
    const html = renderToString(
      React.createElement(VideoPlayer, { src: 'video.mp4', muted: true }),
    )
    expect(html).toContain('muted=""')
  })

  it('labels the mute button Unmute when initially muted', () => {
    const html = renderToString(
      React.createElement(VideoPlayer, { src: 'video.mp4', muted: true }),
    )
    expect(html).toContain('aria-label="Unmute"')
  })

  it('renders the autoplay attribute when autoplay is set', () => {
    const html = renderToString(
      React.createElement(VideoPlayer, { src: 'video.mp4', autoplay: true }),
    )
    // React SSR emits the autoPlay attribute with property casing
    expect(html).toContain('autoPlay=""')
  })

  it('does not render muted or autoplay attributes by default', () => {
    const html = renderToString(
      React.createElement(VideoPlayer, { src: 'video.mp4' }),
    )
    expect(html).not.toContain('muted=""')
    expect(html).not.toContain('autoPlay=""')
  })
})

describe('VideoPlayer – controls (React)', () => {
  it('labels the overlay button Play in the idle state', () => {
    const html = renderToString(
      React.createElement(VideoPlayer, { src: 'video.mp4' }),
    )
    expect(html).toContain('aria-label="Play"')
  })

  it('shows the center overlay in the idle state', () => {
    const html = renderToString(
      React.createElement(VideoPlayer, { src: 'video.mp4' }),
    )
    expect(html).toContain('opacity-100')
    expect(html).toContain('bg-black/40')
  })

  it('renders the bottom controls bar with a gradient', () => {
    const html = renderToString(
      React.createElement(VideoPlayer, { src: 'video.mp4' }),
    )
    expect(html).toContain('bg-gradient-to-t')
  })

  it('labels the mute button Mute by default', () => {
    const html = renderToString(
      React.createElement(VideoPlayer, { src: 'video.mp4' }),
    )
    expect(html).toContain('aria-label="Mute"')
  })

  it('still renders the video element when controls=false', () => {
    const html = renderToString(
      React.createElement(VideoPlayer, { src: 'video.mp4', controls: false }),
    )
    expect(html).toContain('<video')
    expect(html).not.toContain('<button')
  })
})

describe('VideoPlayer – container (React)', () => {
  it('applies aspect-video sizing', () => {
    const html = renderToString(
      React.createElement(VideoPlayer, { src: 'video.mp4' }),
    )
    expect(html).toContain('aspect-video')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(VideoPlayer, { src: 'video.mp4', className: 'my-player' }),
    )
    expect(html).toContain('my-player')
  })

  it('spreads extra props onto the container', () => {
    const html = renderToString(
      React.createElement(VideoPlayer, { src: 'video.mp4', id: 'hero-video' }),
    )
    expect(html).toContain('id="hero-video"')
  })
})

describe('VideoPlayer – placeholder (React)', () => {
  it('does not render a video element without src', () => {
    const html = renderToString(React.createElement(VideoPlayer))
    expect(html).not.toContain('<video')
  })

  it('does not render any control buttons without src', () => {
    const html = renderToString(React.createElement(VideoPlayer))
    expect(html).not.toContain('<button')
  })

  it('centers the placeholder message', () => {
    const html = renderToString(React.createElement(VideoPlayer))
    expect(html).toContain('items-center')
    expect(html).toContain('justify-center')
    expect(html).toContain('text-muted-foreground')
  })
})
