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

describe('LiveTranscript sides (SSR)', () => {
  const twoSided: TranscriptEntry[] = [
    { id: '1', speaker: 'You', side: 'me', text: 'Can you hear me?' },
    { id: '2', speaker: 'Priya', side: 'them', text: 'Loud and clear.' },
  ]

  it('marks each block with its side', () => {
    const html = render({ entries: twoSided })
    expect(html).toContain('data-side="me"')
    expect(html).toContain('data-side="them"')
  })

  it('places me at the end edge and them at the start edge', () => {
    const html = render({ entries: twoSided })
    expect(html).toMatch(/class="[^"]*self-end[^"]*" data-side="me"/)
    expect(html).toMatch(/class="[^"]*self-start[^"]*" data-side="them"/)
  })

  it('leaves a single-sided transcript unmarked', () => {
    const html = render({ entries: sampleEntries })
    expect(html).not.toContain('data-side')
    expect(html).not.toContain('self-end')
  })
})

describe('LiveTranscript interim lines (SSR)', () => {
  const withInterim: TranscriptEntry[] = [
    { id: '1', speaker: 'Priya', text: 'Let us start.' },
    { id: '2', speaker: 'Priya', text: 'with the roadm', interim: true },
  ]

  it('marks an interim line and styles it apart from finals', () => {
    const html = render({ entries: withInterim })
    expect(html).toMatch(/<p class="[^"]*decoration-dotted[^"]*" data-interim="true"/)
    expect(html.match(/data-interim="true"/g) ?? []).toHaveLength(1)
  })

  it('keeps an interim line out of the log announcements', () => {
    const html = render({ entries: withInterim })
    expect(html).toMatch(/data-interim="true" aria-live="off"/)
  })

  it('tells screen readers the line is still being heard', () => {
    const html = render({ entries: withInterim })
    expect(html).toContain('<span class="sr-only"> (still listening)</span>')
  })

  it('accepts a localised interim label', () => {
    const html = render({ entries: withInterim, interimLabel: 'en cours' })
    expect(html).toContain(' (en cours)')
  })

  it('keeps the interim line in its speaker block', () => {
    const html = render({ entries: withInterim })
    expect(html.match(/>Priya</g) ?? []).toHaveLength(1)
  })
})

describe('LiveTranscript autoFollow (SSR)', () => {
  it('renders no follow state or jump control by default', () => {
    const html = render({ entries: sampleEntries })
    expect(html).not.toContain('data-following')
    expect(html).not.toContain('Jump to live')
  })

  it('starts following, with no jump control', () => {
    const html = render({ entries: sampleEntries, autoFollow: true })
    expect(html).toContain('data-following="true"')
    expect(html).not.toContain('Jump to live')
  })
})

describe('LiveTranscript keyboard access (SSR)', () => {
  it('can be focused, so the scrolling panel can be scrolled by keyboard', () => {
    const html = render({ entries: sampleEntries })
    expect(html).toMatch(/<div[^>]*role="log"[^>]*tabindex="0"|<div[^>]*tabindex="0"[^>]*role="log"/)
  })

  it('keeps a caller-supplied tabIndex', () => {
    const html = render({ entries: sampleEntries, autoFollow: true, tabIndex: -1 })
    expect(html).toContain('tabindex="-1"')
    expect(html).not.toContain('tabindex="0"')
  })
})
