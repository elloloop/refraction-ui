import { describe, it, expect } from 'vitest'
import {
  visibleCues,
  formatCue,
  createLiveCaptions,
  type CaptionCue,
} from '../src/index.js'

const cues: CaptionCue[] = [
  { id: '1', speaker: 'Maya', text: 'the bottleneck is review capacity', final: true },
  { id: '2', speaker: 'Alex', text: 'agreed, let me pull up the dashboard', final: true },
  { id: '3', text: 'loading...', final: false },
]

describe('visibleCues', () => {
  it('returns the last N cues', () => {
    const visible = visibleCues(cues, 2)
    expect(visible).toHaveLength(2)
    expect(visible[0].id).toBe('2')
    expect(visible[1].id).toBe('3')
  })

  it('defaults to 2 lines', () => {
    expect(visibleCues(cues)).toHaveLength(2)
  })

  it('returns all cues when fewer than maxLines exist', () => {
    expect(visibleCues([cues[0]], 5)).toHaveLength(1)
  })

  it('returns empty array for empty input', () => {
    expect(visibleCues([], 2)).toEqual([])
  })

  it('returns empty array when maxLines is 0', () => {
    expect(visibleCues(cues, 0)).toEqual([])
  })
})

describe('formatCue', () => {
  it('prefixes speaker name when present', () => {
    expect(formatCue(cues[0])).toBe('Maya: the bottleneck is review capacity')
  })

  it('returns plain text when no speaker is present', () => {
    expect(formatCue(cues[2])).toBe('loading...')
  })
})

describe('createLiveCaptions', () => {
  it('returns role=log', () => {
    const { ariaProps } = createLiveCaptions()
    expect(ariaProps.role).toBe('log')
  })

  it('returns aria-live=polite', () => {
    const { ariaProps } = createLiveCaptions()
    expect(ariaProps['aria-live']).toBe('polite')
  })

  it('returns aria-atomic=false', () => {
    const { ariaProps } = createLiveCaptions()
    expect(ariaProps['aria-atomic']).toBe(false)
  })

  it('returns a data-component data attribute', () => {
    const { dataAttributes } = createLiveCaptions()
    expect(dataAttributes['data-component']).toBe('live-captions')
  })
})
