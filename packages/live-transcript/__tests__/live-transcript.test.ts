import { describe, it, expect } from 'vitest'
import {
  groupConsecutiveBySpeaker,
  createLiveTranscript,
  type TranscriptEntry,
} from '../src/index.js'

const entry = (
  id: string,
  speaker: string,
  text: string,
  timestamp?: string,
): TranscriptEntry => ({ id, speaker, text, timestamp })

describe('groupConsecutiveBySpeaker', () => {
  it('returns an empty array for no entries', () => {
    expect(groupConsecutiveBySpeaker([])).toEqual([])
  })

  it('merges consecutive entries from the same speaker into one block', () => {
    const entries: TranscriptEntry[] = [
      entry('1', 'Alice', 'Hello', '0:01'),
      entry('2', 'Alice', 'world', '0:02'),
    ]
    const blocks = groupConsecutiveBySpeaker(entries)
    expect(blocks).toHaveLength(1)
    expect(blocks[0].speaker).toBe('Alice')
    expect(blocks[0].texts).toEqual(['Hello', 'world'])
    expect(blocks[0].timestamp).toBe('0:01')
  })

  it('starts a new block when the speaker changes', () => {
    const entries: TranscriptEntry[] = [
      entry('1', 'Alice', 'Hello', '0:01'),
      entry('2', 'Bob', 'Hi there', '0:03'),
      entry('3', 'Alice', 'How are you?', '0:05'),
    ]
    const blocks = groupConsecutiveBySpeaker(entries)
    expect(blocks).toHaveLength(3)
    expect(blocks[0].speaker).toBe('Alice')
    expect(blocks[1].speaker).toBe('Bob')
    expect(blocks[2].speaker).toBe('Alice')
  })

  it('uses the timestamp of the first entry in a run', () => {
    const entries: TranscriptEntry[] = [
      entry('1', 'Alice', 'First', '0:10'),
      entry('2', 'Alice', 'Second', '0:11'),
    ]
    const blocks = groupConsecutiveBySpeaker(entries)
    expect(blocks[0].timestamp).toBe('0:10')
  })

  it('collects all texts from a run', () => {
    const entries: TranscriptEntry[] = [
      entry('1', 'Bob', 'One'),
      entry('2', 'Bob', 'Two'),
      entry('3', 'Bob', 'Three'),
    ]
    const blocks = groupConsecutiveBySpeaker(entries)
    expect(blocks).toHaveLength(1)
    expect(blocks[0].texts).toEqual(['One', 'Two', 'Three'])
  })

  it('forwards speakerColor from the first entry in a run', () => {
    const entries: TranscriptEntry[] = [
      { id: '1', speaker: 'Alice', text: 'Hi', speakerColor: '#3b82f6' },
      { id: '2', speaker: 'Alice', text: 'Bye' },
    ]
    const blocks = groupConsecutiveBySpeaker(entries)
    expect(blocks[0].speakerColor).toBe('#3b82f6')
  })
})

describe('createLiveTranscript', () => {
  it('returns role="log" in ariaProps', () => {
    const { ariaProps } = createLiveTranscript()
    expect(ariaProps['role']).toBe('log')
  })

  it('returns aria-live="polite" in ariaProps', () => {
    const { ariaProps } = createLiveTranscript()
    expect(ariaProps['aria-live']).toBe('polite')
  })

  it('includes the component data attribute', () => {
    const { dataAttributes } = createLiveTranscript()
    expect(dataAttributes['data-component']).toBe('live-transcript')
  })
})
