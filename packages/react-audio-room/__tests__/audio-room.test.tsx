import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { AudioRoom, SpeakingOrb } from '../src/audio-room.js'
import type { AudioParticipant } from '../src/audio-room.js'

const render = (element: React.ReactElement) => renderToString(element)

const PARTICIPANTS: AudioParticipant[] = [
  { id: '1', name: 'Alice Chen' },
  { id: '2', name: 'Bob Smith', speaking: true },
  { id: '3', name: 'Carol White', muted: true },
]

describe('AudioRoom (SSR)', () => {
  it('renders one orb per participant', () => {
    const html = render(<AudioRoom participants={PARTICIPANTS} />)
    // Each orb has role="img"
    expect((html.match(/role="img"/g) ?? []).length).toBe(PARTICIPANTS.length)
  })

  it('renders the room container with role="group"', () => {
    const html = render(<AudioRoom participants={PARTICIPANTS} />)
    expect(html).toContain('role="group"')
  })

  it('sets data-speaking="true" for a speaking participant', () => {
    const html = render(<AudioRoom participants={PARTICIPANTS} />)
    expect(html).toContain('data-speaking="true"')
  })

  it('sets data-muted="true" for a muted participant', () => {
    const html = render(<AudioRoom participants={PARTICIPANTS} />)
    expect(html).toContain('data-muted="true"')
  })

  it('includes participant names in the output', () => {
    const html = render(<AudioRoom participants={PARTICIPANTS} />)
    for (const p of PARTICIPANTS) {
      expect(html).toContain(p.name)
    }
  })

  it('renders empty grid when participants list is empty', () => {
    const html = render(<AudioRoom participants={[]} />)
    expect(html).toContain('role="group"')
    expect((html.match(/role="img"/g) ?? [])).toHaveLength(0)
  })
})

describe('SpeakingOrb (SSR)', () => {
  it('renders initials when no avatarUrl is given', () => {
    const html = render(<SpeakingOrb name="Alice Chen" />)
    expect(html).toContain('AC')
  })

  it('renders the participant name as aria-label', () => {
    const html = render(<SpeakingOrb name="Bob Smith" />)
    expect(html).toContain('aria-label="Bob Smith"')
  })

  it('sets data-speaking="true" when speaking', () => {
    const html = render(<SpeakingOrb name="Carol" speaking />)
    expect(html).toContain('data-speaking="true"')
  })

  it('sets data-speaking="false" when not speaking', () => {
    const html = render(<SpeakingOrb name="Dave" />)
    expect(html).toContain('data-speaking="false"')
  })

  it('renders muted badge when muted', () => {
    const html = render(<SpeakingOrb name="Eve" muted />)
    expect(html).toContain('data-muted="true"')
    expect(html).toContain('Muted')
  })

  it('renders hand-raise badge when handRaised', () => {
    const html = render(<SpeakingOrb name="Frank" handRaised />)
    expect(html).toContain('data-hand-raised="true"')
    expect(html).toContain('Hand raised')
  })

  it('renders an img element when avatarUrl is provided', () => {
    const html = render(
      <SpeakingOrb name="Grace" avatarUrl="https://example.com/grace.jpg" />,
    )
    expect(html).toContain('src="https://example.com/grace.jpg"')
  })
})
