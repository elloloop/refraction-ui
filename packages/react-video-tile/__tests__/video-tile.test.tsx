import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { VideoTile } from '../src/video-tile.js'

const render = (props: React.ComponentProps<typeof VideoTile>) =>
  renderToString(React.createElement(VideoTile, props))

describe('VideoTile (SSR)', () => {
  it('renders with role=group and aria-label of the participant name', () => {
    const html = render({ name: 'Maya Goldberg' })
    expect(html).toContain('role="group"')
    expect(html).toContain('aria-label="Maya Goldberg"')
  })

  it('renders the participant name in the name chip', () => {
    const html = render({ name: 'Alice Chen' })
    expect(html).toContain('Alice Chen')
  })

  it('renders initials fallback when no mediaSlot is provided', () => {
    const html = render({ name: 'Maya Goldberg' })
    expect(html).toContain('MG')
  })

  it('renders a single initial for a single-word name', () => {
    const html = render({ name: 'Alice' })
    expect(html).toContain('>A<')
  })

  it('sets data-speaking=true when speaking', () => {
    const html = render({ name: 'Bob', speaking: true })
    expect(html).toContain('data-speaking="true"')
  })

  it('sets data-speaking=false when not speaking', () => {
    const html = render({ name: 'Bob', speaking: false })
    expect(html).toContain('data-speaking="false"')
  })

  it('sets data-pinned=true when pinned', () => {
    const html = render({ name: 'Carol', pinned: true })
    expect(html).toContain('data-pinned="true"')
  })

  it('renders the mic-muted indicator when micState is muted', () => {
    const html = render({ name: 'Dave', micState: 'muted' })
    expect(html).toContain('aria-label="Microphone muted"')
  })

  it('does not render the mic-muted indicator when micState is on', () => {
    const html = render({ name: 'Dave', micState: 'on' })
    expect(html).not.toContain('Microphone muted')
  })

  it('renders the media slot when provided instead of the avatar fallback', () => {
    const media = React.createElement('video', { 'data-testid': 'media' })
    const html = render({ name: 'Eve', mediaSlot: media })
    expect(html).toContain('data-testid="media"')
    // Initials should not appear when media is present
    expect(html).not.toContain('>E<')
  })

  it('renders the reaction badge when a reaction is provided', () => {
    const html = render({ name: 'Frank', reaction: React.createElement('span', null, '👋') })
    expect(html).toContain('👋')
  })
})
