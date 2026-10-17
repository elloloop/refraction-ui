import { describe, it, expect } from 'vitest'
import {
  applyTranscriptUpdate,
  createLiveTranscript,
  followAfterScroll,
  groupConsecutiveBySpeaker,
  interimLineAriaProps,
  isAtLiveEdge,
  LIVE_EDGE_TOLERANCE_PX,
  transcriptBlockVariants,
  transcriptTextLineVariants,
  type TranscriptEntry,
} from '../src/index.js'

const entry = (
  id: string,
  speaker: string,
  text: string,
  timestamp?: string,
): TranscriptEntry => ({ id, speaker, text, timestamp })

const texts = (entries: TranscriptEntry[]) => entries.map((e) => e.text)

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
    expect(blocks[0].lines.map((l) => l.text)).toEqual(['Hello', 'world'])
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

  it('collects every line of a run with its id', () => {
    const entries: TranscriptEntry[] = [
      entry('1', 'Bob', 'One'),
      entry('2', 'Bob', 'Two'),
      entry('3', 'Bob', 'Three'),
    ]
    const blocks = groupConsecutiveBySpeaker(entries)
    expect(blocks).toHaveLength(1)
    expect(blocks[0].lines).toEqual([
      { id: '1', text: 'One', interim: false },
      { id: '2', text: 'Two', interim: false },
      { id: '3', text: 'Three', interim: false },
    ])
  })

  it('forwards speakerColor from the first entry in a run', () => {
    const entries: TranscriptEntry[] = [
      { id: '1', speaker: 'Alice', text: 'Hi', speakerColor: '#3b82f6' },
      { id: '2', speaker: 'Alice', text: 'Bye' },
    ]
    const blocks = groupConsecutiveBySpeaker(entries)
    expect(blocks[0].speakerColor).toBe('#3b82f6')
  })

  it('carries the side onto the block', () => {
    const blocks = groupConsecutiveBySpeaker([
      { id: '1', speaker: 'You', text: 'Hi', side: 'me' },
      { id: '2', speaker: 'Them', text: 'Hello', side: 'them' },
    ])
    expect(blocks.map((b) => b.side)).toEqual(['me', 'them'])
  })

  it('starts a new block when the side changes under the same speaker name', () => {
    const blocks = groupConsecutiveBySpeaker([
      { id: '1', speaker: 'Sam', text: 'From my mic', side: 'me' },
      { id: '2', speaker: 'Sam', text: 'From the call', side: 'them' },
    ])
    expect(blocks).toHaveLength(2)
  })

  it('keeps an interim line in its speaker block, flagged', () => {
    const blocks = groupConsecutiveBySpeaker([
      { id: '1', speaker: 'Them', text: 'So the plan', side: 'them' },
      { id: '2', speaker: 'Them', text: 'is to ship', side: 'them', interim: true },
    ])
    expect(blocks).toHaveLength(1)
    expect(blocks[0].lines.map((l) => l.interim)).toEqual([false, true])
  })
})

describe('applyTranscriptUpdate', () => {
  it('adds an interim line', () => {
    const next = applyTranscriptUpdate([], {
      id: 'p1', speaker: 'Them', text: 'hello', side: 'them', interim: true,
    })
    expect(next).toEqual([
      { id: 'p1', speaker: 'Them', text: 'hello', side: 'them', interim: true },
    ])
  })

  it('replaces the previous interim line of the same side', () => {
    const first = applyTranscriptUpdate([], {
      id: 'p1', speaker: 'Them', text: 'hel', side: 'them', interim: true,
    })
    const next = applyTranscriptUpdate(first, {
      id: 'p2', speaker: 'Them', text: 'hello there', side: 'them', interim: true,
    })
    expect(next).toHaveLength(1)
    expect(next[0].text).toBe('hello there')
  })

  it('replaces the interim line with its final', () => {
    const interim = applyTranscriptUpdate([], {
      id: 'p1', speaker: 'Them', text: 'hello ther', side: 'them', interim: true,
    })
    const next = applyTranscriptUpdate(interim, {
      id: 'f1', speaker: 'Them', text: 'Hello there.', side: 'them',
    })
    expect(next).toEqual([{ id: 'f1', speaker: 'Them', text: 'Hello there.', side: 'them' }])
  })

  it("keeps the other side's interim line when one side finalises", () => {
    let entries: TranscriptEntry[] = []
    entries = applyTranscriptUpdate(entries, {
      id: 'pm', speaker: 'You', text: 'I think', side: 'me', interim: true,
    })
    entries = applyTranscriptUpdate(entries, {
      id: 'pt', speaker: 'Them', text: 'we should', side: 'them', interim: true,
    })
    entries = applyTranscriptUpdate(entries, {
      id: 'ft', speaker: 'Them', text: 'We should ship.', side: 'them',
    })
    expect(entries.map((e) => [e.id, e.interim === true])).toEqual([
      ['ft', false],
      ['pm', true],
    ])
  })

  it('keeps interim lines after the finals, me before them', () => {
    let entries: TranscriptEntry[] = [{ id: 'f0', speaker: 'Them', text: 'Hi.', side: 'them' }]
    entries = applyTranscriptUpdate(entries, {
      id: 'pt', speaker: 'Them', text: 'and', side: 'them', interim: true,
    })
    entries = applyTranscriptUpdate(entries, {
      id: 'pm', speaker: 'You', text: 'yes', side: 'me', interim: true,
    })
    entries = applyTranscriptUpdate(entries, {
      id: 'f1', speaker: 'You', text: 'Hello.', side: 'me', startMs: 100,
    })
    expect(entries.map((e) => e.id)).toEqual(['f0', 'f1', 'pt'])

    entries = applyTranscriptUpdate(entries, {
      id: 'pm2', speaker: 'You', text: 'so', side: 'me', interim: true,
    })
    expect(entries.map((e) => e.id)).toEqual(['f0', 'f1', 'pm2', 'pt'])
  })

  it('interleaves finals by start time whatever order they arrive in', () => {
    let entries: TranscriptEntry[] = []
    entries = applyTranscriptUpdate(entries, {
      id: 'b', speaker: 'Them', text: 'Second.', side: 'them', startMs: 2000,
    })
    entries = applyTranscriptUpdate(entries, {
      id: 'c', speaker: 'Them', text: 'Third.', side: 'them', startMs: 3000,
    })
    entries = applyTranscriptUpdate(entries, {
      id: 'a', speaker: 'You', text: 'First.', side: 'me', startMs: 1000,
    })
    expect(texts(entries)).toEqual(['First.', 'Second.', 'Third.'])
  })

  it('appends a final without a start time in arrival order', () => {
    let entries: TranscriptEntry[] = [
      { id: 'a', speaker: 'Them', text: 'Timed.', side: 'them', startMs: 5000 },
    ]
    entries = applyTranscriptUpdate(entries, {
      id: 'b', speaker: 'You', text: 'Untimed.', side: 'me',
    })
    entries = applyTranscriptUpdate(entries, {
      id: 'c', speaker: 'Them', text: 'Earlier.', side: 'them', startMs: 1000,
    })
    expect(texts(entries)).toEqual(['Earlier.', 'Timed.', 'Untimed.'])
  })

  it('trims the text of a result', () => {
    const next = applyTranscriptUpdate([], { id: 'a', speaker: 'You', text: '  Hi.  ', side: 'me' })
    expect(next[0].text).toBe('Hi.')
  })

  it('a blank result only clears its side’s interim line', () => {
    const interim = applyTranscriptUpdate([], {
      id: 'p', speaker: 'Them', text: 'um', side: 'them', interim: true,
    })
    expect(applyTranscriptUpdate(interim, { id: 'f', speaker: 'Them', text: '   ', side: 'them' })).toEqual([])
  })

  it('treats unsided entries as one stream with at most one interim line', () => {
    let entries: TranscriptEntry[] = []
    entries = applyTranscriptUpdate(entries, { id: 'p1', speaker: 'Alice', text: 'a', interim: true })
    entries = applyTranscriptUpdate(entries, { id: 'p2', speaker: 'Bob', text: 'b', interim: true })
    expect(entries.map((e) => e.id)).toEqual(['p2'])
  })

  it('does not mutate the transcript it is given', () => {
    const entries: TranscriptEntry[] = [
      { id: 'p', speaker: 'Them', text: 'x', side: 'them', interim: true },
    ]
    const copy = structuredClone(entries)
    applyTranscriptUpdate(entries, { id: 'f', speaker: 'Them', text: 'X.', side: 'them' })
    expect(entries).toEqual(copy)
  })
})

describe('isAtLiveEdge', () => {
  it('is true at the very bottom', () => {
    expect(isAtLiveEdge({ scrollTop: 600, scrollHeight: 1000, clientHeight: 400 })).toBe(true)
  })

  it('is true within the tolerance of the bottom', () => {
    expect(
      isAtLiveEdge({ scrollTop: 600 - LIVE_EDGE_TOLERANCE_PX, scrollHeight: 1000, clientHeight: 400 }),
    ).toBe(true)
  })

  it('is false further up than the tolerance', () => {
    expect(
      isAtLiveEdge({ scrollTop: 599 - LIVE_EDGE_TOLERANCE_PX, scrollHeight: 1000, clientHeight: 400 }),
    ).toBe(false)
  })

  it('is true when the content does not overflow', () => {
    expect(isAtLiveEdge({ scrollTop: 0, scrollHeight: 200, clientHeight: 400 })).toBe(true)
  })

  it('accepts a custom tolerance', () => {
    expect(isAtLiveEdge({ scrollTop: 500, scrollHeight: 1000, clientHeight: 400 }, 100)).toBe(true)
    expect(isAtLiveEdge({ scrollTop: 499, scrollHeight: 1000, clientHeight: 400 }, 100)).toBe(false)
  })
})

describe('followAfterScroll', () => {
  const at = (scrollTop: number) => ({ scrollTop, scrollHeight: 1000, clientHeight: 400 })

  it('pauses when the reader scrolls up away from the live edge', () => {
    expect(followAfterScroll(true, 600, at(300))).toBe(false)
  })

  it('resumes when the reader reaches the live edge', () => {
    expect(followAfterScroll(false, 300, at(600))).toBe(true)
  })

  it('stays paused while the reader scrolls down short of the live edge', () => {
    expect(followAfterScroll(false, 100, at(300))).toBe(false)
  })

  it('keeps following while a jump to live scrolls down towards the edge', () => {
    expect(followAfterScroll(true, 100, at(300))).toBe(true)
  })

  it('keeps following when content shrinks and clamps the scroll position at the edge', () => {
    expect(followAfterScroll(true, 700, at(600))).toBe(true)
  })

  it('keeps following when the position did not move', () => {
    expect(followAfterScroll(true, 300, at(300))).toBe(true)
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

describe('interim lines', () => {
  it('are kept out of the log announcements', () => {
    expect(interimLineAriaProps['aria-live']).toBe('off')
  })

  it('are styled apart from final lines by more than colour', () => {
    expect(transcriptTextLineVariants({ interim: 'true' })).toContain('decoration-dotted')
    expect(transcriptTextLineVariants({ interim: 'false' })).not.toContain('underline')
  })
})

describe('transcriptBlockVariants', () => {
  it('places me at the end edge and them at the start edge', () => {
    expect(transcriptBlockVariants({ side: 'me' })).toContain('self-end')
    expect(transcriptBlockVariants({ side: 'them' })).toContain('self-start')
  })

  it('adds no side styling to a single-sided transcript', () => {
    expect(transcriptBlockVariants({})).not.toContain('self-')
  })
})
