import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { LiveCaptions } from '../src/live-captions.js'
import type { CaptionCue } from '../src/live-captions.js'

const render = (props: React.ComponentProps<typeof LiveCaptions>) =>
  renderToString(React.createElement(LiveCaptions, props))

const cues: CaptionCue[] = [
  { id: '1', speaker: 'Maya', text: 'the bottleneck is review capacity', final: true },
  { id: '2', speaker: 'Alex', text: 'agreed, let me pull up the dashboard', final: true },
  { id: '3', text: 'loading...', final: false },
]

describe('LiveCaptions (SSR)', () => {
  it('renders role=log', () => {
    const html = render({ cues })
    expect(html).toContain('role="log"')
  })

  it('renders aria-live=polite', () => {
    const html = render({ cues })
    expect(html).toContain('aria-live="polite"')
  })

  it('shows the latest cue text', () => {
    const html = render({ cues })
    expect(html).toContain('loading...')
  })

  it('renders speaker prefix for the visible cues', () => {
    const html = render({ cues, maxLines: 3 })
    expect(html).toContain('Maya')
    expect(html).toContain('the bottleneck is review capacity')
  })

  it('respects maxLines — renders at most N cue elements', () => {
    const html = render({ cues, maxLines: 1 })
    // Only the last cue should appear
    expect(html).toContain('loading...')
    expect(html).not.toContain('the bottleneck is review capacity')
    expect(html).not.toContain('agreed')
  })

  it('renders exactly maxLines paragraphs when enough cues exist', () => {
    const html = render({ cues, maxLines: 2 })
    // 2 <p> elements — count opening tags only to avoid counting attributes
    const matches = html.match(/<p /g) ?? []
    expect(matches.length).toBe(2)
  })

  it('applies interim styling for non-final cues', () => {
    const html = render({ cues, maxLines: 1 })
    // The interim cue should carry the opacity/italic variant classes
    expect(html).toContain('opacity-60')
  })
})
