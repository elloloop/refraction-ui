import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { LiveTranscript } from '../src/live-transcript.js'
import type { TranscriptEntry } from '../src/live-transcript.js'

const render = (props: Partial<React.ComponentProps<typeof LiveTranscript>> & { entries: TranscriptEntry[] }) =>
  renderToString(React.createElement(LiveTranscript, props))

const sampleEntries: TranscriptEntry[] = [
  { id: '1', speaker: 'Alice', text: 'Hello everyone.', timestamp: '0:01' },
  { id: '2', speaker: 'Bob', text: 'Hi Alice!', timestamp: '0:03' },
  { id: '3', speaker: 'Alice', text: 'Great to be here.', timestamp: '0:05' },
]

describe('LiveTranscript (SSR)', () => {
  it('renders role="log" on the container', () => {
    const html = render({ entries: sampleEntries })
    expect(html).toContain('role="log"')
  })

  it('renders aria-live="polite" on the container', () => {
    const html = render({ entries: sampleEntries })
    expect(html).toContain('aria-live="polite"')
  })

  it('renders speaker names', () => {
    const html = render({ entries: sampleEntries })
    expect(html).toContain('Alice')
    expect(html).toContain('Bob')
  })

  it('renders transcript text', () => {
    const html = render({ entries: sampleEntries })
    expect(html).toContain('Hello everyone.')
    expect(html).toContain('Hi Alice!')
    expect(html).toContain('Great to be here.')
  })

  it('groups consecutive same-speaker entries under one header', () => {
    const entries: TranscriptEntry[] = [
      { id: '1', speaker: 'Alice', text: 'First line.', timestamp: '0:01' },
      { id: '2', speaker: 'Alice', text: 'Second line.', timestamp: '0:02' },
    ]
    const html = render({ entries })
    // Alice appears as a speaker name exactly once (one block header)
    const speakerMatches = html.match(/>Alice</g) ?? []
    expect(speakerMatches).toHaveLength(1)
    // Both text lines are present
    expect(html).toContain('First line.')
    expect(html).toContain('Second line.')
  })

  it('starts a new block when the speaker changes', () => {
    const html = render({ entries: sampleEntries })
    // Alice appears twice (first block + third block after Bob)
    const speakerMatches = html.match(/>Alice</g) ?? []
    expect(speakerMatches).toHaveLength(2)
  })

  it('applies speakerColor as an inline style', () => {
    const entries: TranscriptEntry[] = [
      { id: '1', speaker: 'Alice', text: 'Hi', speakerColor: '#3b82f6' },
    ]
    const html = render({ entries })
    expect(html).toContain('#3b82f6')
  })

  it('renders timestamps alongside speaker names', () => {
    const html = render({ entries: sampleEntries })
    expect(html).toContain('0:01')
    expect(html).toContain('0:03')
  })

  it('accepts className without collision', () => {
    const html = render({ entries: sampleEntries, className: 'my-custom' })
    expect(html).toContain('my-custom')
  })
})
